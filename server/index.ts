import { createServer } from "http";
import { Server } from "socket.io";
import { prisma } from "@codesync/db";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  PendingChange,
} from "@codesync/socket-types";
import { randomUUID } from "crypto";

const httpServer = createServer();

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// In-memory state per room
interface RoomState {
  users: Map<string, { name: string; socketId: string }>;
  code: string;
  language: string;
  fileName: string;
  pendingChanges: Map<string, PendingChange>;
  vsCodeOwner?: string; // socketId of user sharing VS Code
}

const rooms = new Map<string, RoomState>();

function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      code: "// Start coding together!\n",
      language: "javascript",
      fileName: "index.js",
      pendingChanges: new Map(),
    });
  }
  return rooms.get(roomId)!;
}

io.on("connection", (socket) => {
  console.log(`[SOCKET] Connected: ${socket.id}`);

  // ── JOIN ROOM ─────────────────────────────────────────────────────────────
  socket.on("room:join", async ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.userName = userName;

    const room = getOrCreateRoom(roomId);
    room.users.set(socket.id, { name: userName, socketId: socket.id });

    // Sync Prisma: load saved code if room exists in DB
    try {
      const dbRoom = await prisma.room.findUnique({ where: { id: roomId } });
      if (dbRoom) {
        room.code = dbRoom.code;
        room.language = dbRoom.language;
        room.fileName = dbRoom.fileName;
      }
    } catch (e) {
      console.warn("DB read failed, using in-memory state");
    }

    // Tell newcomer about current state
    socket.emit("code:init", {
      code: room.code,
      language: room.language,
      fileName: room.fileName,
    });

    // Tell newcomer about other users
    const otherUsers = [...room.users.entries()]
      .filter(([id]) => id !== socket.id)
      .map(([id, u]) => ({ id, name: u.name, socketId: id }));

    socket.emit("room:joined", {
      room: {
        id: roomId,
        name: roomId,
        code: room.code,
        language: room.language,
        fileName: room.fileName,
      },
      users: otherUsers,
    });

    // Tell others a new user joined
    socket.to(roomId).emit("room:user-joined", {
      id: socket.id,
      name: userName,
      socketId: socket.id,
    });

    console.log(`[ROOM] ${userName} joined ${roomId}`);
  });

  // ── VS CODE EXTENSION → ROOM ──────────────────────────────────────────────
  // When VS Code extension sends the current file content
  socket.on(
    "code:vscode-update",
    async ({ roomId, code, fileName, language }) => {
      const room = getOrCreateRoom(roomId);
      room.code = code;
      room.language = language;
      room.fileName = fileName;
      room.vsCodeOwner = socket.id;

      const fromName = socket.data.userName || "Unknown";

      // Broadcast to all other users in room (browser clients)
      socket.to(roomId).emit("code:vscode-update", {
        code,
        fileName,
        language,
        from: socket.id,
        fromName,
      });

      // Persist to DB async
      try {
        await prisma.room.upsert({
          where: { id: roomId },
          update: { code, language, fileName },
          create: { id: roomId, name: roomId, code, language, fileName },
        });
      } catch (e) {
        console.warn("DB write failed");
      }
    },
  );

  // ── BROWSER EDITOR → ROOM ─────────────────────────────────────────────────
  // When browser user edits code, create a pending change for VS Code owner to review
  socket.on("code:editor-change", ({ roomId, code, delta }) => {
    const room = getOrCreateRoom(roomId);
    const fromName = socket.data.userName || "Unknown";

    const changeId = randomUUID();
    const pendingChange: PendingChange = {
      id: changeId,
      code,
      delta,
      fromSocketId: socket.id,
      fromName,
      timestamp: Date.now(),
    };

    room.pendingChanges.set(changeId, pendingChange);

    // Notify the VS Code owner (and everyone else) about pending change
    socket.to(roomId).emit("code:pending-change", pendingChange);

    // Also tell sender it was sent
    socket.emit("code:editor-change", {
      code,
      from: socket.id,
      fromName,
    });
  });

  // ── ACCEPT CHANGE (VS Code owner accepts browser edit) ────────────────────
  socket.on("code:accept-change", async ({ roomId, changeId, code }) => {
    const room = getOrCreateRoom(roomId);
    room.pendingChanges.delete(changeId);
    room.code = code;

    // Broadcast accepted code to everyone in room
    io.to(roomId).emit("code:change-accepted", { changeId, code });

    // Persist
    try {
      await prisma.room.update({
        where: { id: roomId },
        data: { code },
      });
      await prisma.codeChange.updateMany({
        where: { roomId },
        data: { status: "ACCEPTED" },
      });
    } catch (e) {}
  });

  // ── REJECT CHANGE ─────────────────────────────────────────────────────────
  socket.on("code:reject-change", ({ roomId, changeId }) => {
    const room = getOrCreateRoom(roomId);
    room.pendingChanges.delete(changeId);

    io.to(roomId).emit("code:change-rejected", {
      changeId,
      code: room.code,
    });
  });

  // ── WEBRTC SIGNALING ──────────────────────────────────────────────────────
  socket.on("webrtc:offer", ({ to, offer, fromName, streamType }) => {
    io.to(to).emit("webrtc:offer", {
      from: socket.id,
      fromName,
      offer,
      streamType,
    });
  });

  socket.on("webrtc:answer", ({ to, answer, streamType }) => {
    io.to(to).emit("webrtc:answer", {
      from: socket.id,
      answer,
      streamType,
    });
  });

  socket.on("webrtc:ice-candidate", ({ to, candidate, streamType }) => {
    io.to(to).emit("webrtc:ice-candidate", {
      from: socket.id,
      candidate,
      streamType,
    });
  });

  socket.on("webrtc:screen-started", ({ roomId }) => {
    socket
      .to(roomId)
      .emit("webrtc:peer-screen-started", { socketId: socket.id });
  });

  socket.on("webrtc:screen-stopped", ({ roomId }) => {
    socket
      .to(roomId)
      .emit("webrtc:peer-screen-stopped", { socketId: socket.id });
  });

  // ── DISCONNECT ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    const { roomId } = socket.data;
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId)!;
      room.users.delete(socket.id);
      if (room.users.size === 0) rooms.delete(roomId);
    }
    socket.broadcast.emit("room:user-left", { socketId: socket.id });
    console.log(`[SOCKET] Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`[SERVER] Socket.io server running on port ${PORT}`);
});
