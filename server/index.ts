import { createServer } from "http";
import { Server, Socket } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Types
interface RoomUser {
  id: string;
  name: string;
  color: string;
  role: "owner" | "editor";
  socketId: string;
}

interface Room {
  users: Map<string, RoomUser>; // userId → RoomUser
  ownerCode: string;
}

// State

const rooms = new Map<string, Room>();

const OWNER_COLOR = "#58a6ff";
const EDITOR_COLOR = "#3fb950";

// Helpers

function getOrCreateRoom(roomId: string): Room {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      ownerCode: '// Start coding here...\nconsole.log("Hello, ColabCode!");',
    });
  }
  return rooms.get(roomId)!;
}

function getRoomUserList(room: Room): RoomUser[] {
  return Array.from(room.users.values());
}

function broadcastRoomUsers(roomId: string, room: Room) {
  const users = getRoomUserList(room).map(({ socketId: _s, ...rest }) => rest);
  io.to(roomId).emit("room-users", { users });
}

//Connection handler

io.on("connection", (socket: Socket) => {
  const { roomId, userId, userName } = socket.handshake.query as {
    roomId: string;
    userId: string;
    userName: string;
  };

  console.log(`[connect] ${userName} (${userId}) socket=${socket.id}`);

  // Join Room
  socket.on(
    "join-room",
    (data: { roomId: string; userId: string; userName: string }) => {
      const room = getOrCreateRoom(data.roomId);

      // If user is already in room (reconnect), reuse their role
      const existing = room.users.get(data.userId);
      let role: "owner" | "editor";
      let color: string;

      if (existing) {
        role = existing.role;
        color = existing.color;
        // Update socketId for reconnect
        existing.socketId = socket.id;
      } else {
        // First person in the room → owner; second → editor; extras → editor
        const hasOwner = Array.from(room.users.values()).some(
          (u) => u.role === "owner",
        );
        role = hasOwner ? "editor" : "owner";
        color = role === "owner" ? OWNER_COLOR : EDITOR_COLOR;

        const user: RoomUser = {
          id: data.userId,
          name: data.userName,
          color,
          role,
          socketId: socket.id,
        };
        room.users.set(data.userId, user);
      }

      socket.join(data.roomId);

      const user = room.users.get(data.userId)!;

      // Tell this client their assigned role
      socket.emit("role-assigned", {
        role: user.role,
        user: {
          id: user.id,
          name: user.name,
          color: user.color,
          role: user.role,
        },
      });

      // Send current owner code to new joiner
      socket.emit("owner-code-update", { code: room.ownerCode });

      // Notify everyone else a user joined (triggers WebRTC re-initiation)
      socket.to(data.roomId).emit("user-joined", {
        user: {
          id: user.id,
          name: user.name,
          color: user.color,
          role: user.role,
        },
      });

      // Broadcast updated user list
      broadcastRoomUsers(data.roomId, room);

      console.log(
        `[join] ${data.userName} joined ${data.roomId} as ${role}. Total: ${room.users.size}`,
      );
    },
  );

  // Owner code change (live sync)
  socket.on("owner-code-change", (data: { roomId: string; code: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    room.ownerCode = data.code;
    // Broadcast to everyone else in room
    socket.to(data.roomId).emit("owner-code-update", { code: data.code });
  });

  //Editor proposes a change
  socket.on(
    "propose-change",
    (data: { roomId: string; original: string; newCode: string }) => {
      const room = rooms.get(data.roomId);
      if (!room) return;

      // Find proposing user using socket.id (server-trusted)
      const proposer = Array.from(room.users.values()).find(
        (u) => u.socketId === socket.id,
      );

      if (!proposer || proposer.role !== "editor") return;

      // Find owner
      const owner = Array.from(room.users.values()).find(
        (u) => u.role === "owner",
      );

      if (owner) {
        io.to(owner.socketId).emit("change-proposed", {
          original: data.original,
          newCode: data.newCode,
          authorId: proposer.id, // ✅ SERVER GENERATED
        });
      }
    },
  );

  // ── Owner accepts change ──────────────────────────────────────────────────
  socket.on("accept-change", (data: { roomId: string; newCode: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    room.ownerCode = data.newCode;
    // Tell everyone the new canonical code
    io.to(data.roomId).emit("change-accepted", { newCode: data.newCode });
  });

  // ── Owner rejects change ─────────────────────────────────────────────────
  socket.on("reject-change", (data: { roomId: string }) => {
    socket.to(data.roomId).emit("change-rejected", {});
  });

  // ── VS Code push ──────────────────────────────────────────────────────────
  socket.on("vscode-push", (data: { roomId: string; code: string }) => {
    const room = rooms.get(data.roomId);
    if (!room) return;
    room.ownerCode = data.code;
    io.to(data.roomId).emit("vscode-push", { code: data.code });
  });

  // ── WebRTC signaling passthrough ──────────────────────────────────────────
  socket.on("webrtc-signal", (data: { signal: unknown; userId: string }) => {
    // Forward to everyone else in the room
    socket.to(roomId).emit("webrtc-signal", {
      signal: data.signal,
      userId: data.userId,
    });
  });

  // ── Disconnect ────────────────────────────────────────────────────────────
  socket.on("disconnect", () => {
    console.log(`[disconnect] socket=${socket.id}`);

    for (const [rid, room] of rooms.entries()) {
      for (const [uid, user] of room.users.entries()) {
        if (user.socketId === socket.id) {
          room.users.delete(uid);
          broadcastRoomUsers(rid, room);
          io.to(rid).emit("user-left", { userId: uid });
          console.log(`[leave] ${user.name} left ${rid}`);

          // Clean up empty rooms
          if (room.users.size === 0) {
            rooms.delete(rid);
          }
          break;
        }
      }
    }
  });
});

//Start
const PORT = parseInt(process.env.PORT || "3001", 10);
httpServer.listen(PORT, () => {
  console.log(`[server] Socket.io running on :${PORT}`);
});
