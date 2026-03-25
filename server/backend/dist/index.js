"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from the root .env file
const envPath = path_1.default.resolve(__dirname, "../../.env");
const result = dotenv_1.default.config({ path: envPath });
console.log(`[Server] Loading .env from: ${envPath}`);
if (result.error) {
    console.error(`[Server] Error loading .env:`, result.error);
}
else {
    console.log(`[Server] .env loaded successfully`);
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const JWT_SECRET = process.env.JWT_SECRET || "codesync_jwt_secret_change_in_production";
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "https://codesync-inky.vercel.app",
].filter(Boolean);
// Express App
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
io.use((socket, next) => {
    const token = socket.handshake.auth?.token ||
        socket.handshake.query?.token;
    if (token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            socket.userId = payload.sub;
            socket.userEmail = payload.email;
        }
        catch {
            console.warn(`[socket] Invalid JWT token from ${socket.id} — proceeding as guest`);
        }
    }
    next();
});
// State
const rooms = new Map();
const OWNER_COLOR = "#58a6ff";
const EDITOR_COLOR = "#3fb950";
// Helpers
function getOrCreateRoom(roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            users: new Map(),
            ownerCode: '// Start coding here...\nconsole.log("Hello, ColabCode!");',
        });
    }
    return rooms.get(roomId);
}
// getRoomUserList function
function getRoomUserList(room) {
    return Array.from(room.users.values());
}
// broadcastRoomUsers function
function broadcastRoomUsers(roomId, room) {
    const users = getRoomUserList(room).map(({ socketId: _s, ...rest }) => rest);
    io.to(roomId).emit("room-users", { users });
}
//Connection handler
io.on("connection", (socket) => {
    const { roomId, userId, userName } = socket.handshake.query;
    console.log(`[connect] ${userName} (${userId}) socket=${socket.id}`);
    // Join Room
    socket.on("join-room", (data) => {
        const room = getOrCreateRoom(data.roomId);
        // If user is already in room (reconnect), reuse their role
        const existing = room.users.get(data.userId);
        let role;
        let color;
        if (existing) {
            role = existing.role;
            color = existing.color;
            // Update socketId for reconnect
            existing.socketId = socket.id;
        }
        else {
            // First person in the room → owner; second → editor; extras → editor
            const hasOwner = Array.from(room.users.values()).some((u) => u.role === "owner");
            role = hasOwner ? "editor" : "owner";
            color = role === "owner" ? OWNER_COLOR : EDITOR_COLOR;
            const user = {
                id: data.userId,
                name: data.userName,
                color,
                role,
                socketId: socket.id,
            };
            room.users.set(data.userId, user);
        }
        socket.join(data.roomId);
        const user = room.users.get(data.userId);
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
        //  Send current owner code to new joiner
        socket.emit("owner-code-update", { code: room.ownerCode });
        //Notify everyone else a user joined (triggers WebRTC re-initiation)
        socket.to(data.roomId).emit("user-joined", {
            user: {
                id: user.id,
                name: user.name,
                color: user.color,
                role: user.role,
            },
        });
        //Broadcast updated user list
        broadcastRoomUsers(data.roomId, room);
        console.log(`[join] ${data.userName} joined ${data.roomId} as ${role}. Total: ${room.users.size}`);
    });
    //Owner code change (live sync)
    socket.on("owner-code-change", (data) => {
        const room = rooms.get(data.roomId);
        if (!room)
            return;
        room.ownerCode = data.code;
        // Broadcast to everyone else in room
        socket.to(data.roomId).emit("owner-code-update", { code: data.code });
    });
    //Editor proposes a change
    socket.on("propose-change", (data) => {
        const room = rooms.get(data.roomId);
        if (!room)
            return;
        // Find proposing user using socket.id (server-trusted)
        const proposer = Array.from(room.users.values()).find((u) => u.socketId === socket.id);
        if (!proposer || proposer.role !== "editor")
            return;
        // Find owner
        const owner = Array.from(room.users.values()).find((u) => u.role === "owner");
        // GUARD: If proposed code is same as current owner code, skip it
        if (data.newCode === room.ownerCode) {
            console.log(`[propose-change] Ignoring identical proposal from ${proposer.id}`);
            return;
        }
        if (owner) {
            io.to(owner.socketId).emit("change-proposed", {
                original: data.original,
                newCode: data.newCode,
                authorId: proposer.id, // SERVER GENERATED
            });
        }
    });
    // Owner accepts change
    socket.on("accept-change", (data) => {
        const room = rooms.get(data.roomId);
        if (!room)
            return;
        room.ownerCode = data.newCode;
        // Tell everyone the new canonical code
        io.to(data.roomId).emit("change-accepted", { newCode: data.newCode });
    });
    // Owner rejects change
    socket.on("reject-change", (data) => {
        socket.to(data.roomId).emit("change-rejected", {});
    });
    // VS Code push
    socket.on("vscode-push", (data) => {
        const room = rooms.get(data.roomId);
        if (!room)
            return;
        // Find the user who pushed
        const user = Array.from(room.users.values()).find((u) => u.socketId === socket.id);
        if (!user)
            return;
        if (user.role === "owner") {
            // IGNORE if the code is identical to current owner code
            if (room.ownerCode === data.code) {
                console.log(`[VSCodePush] Ignoring redundant push from owner ${user.id}`);
                return;
            }
            room.ownerCode = data.code;
            io.to(data.roomId).emit("vscode-push", { code: data.code });
        }
        else {
            // Editor pushed from VS Code → treat as a proposal
            // IGNORE if the code is identical to current owner code
            if (room.ownerCode === data.code) {
                console.log(`[VSCodePush] Ignoring redundant push from editor ${user.id}`);
                return;
            }
            const owner = Array.from(room.users.values()).find((u) => u.role === "owner");
            if (owner) {
                io.to(owner.socketId).emit("change-proposed", {
                    original: room.ownerCode,
                    newCode: data.code,
                    authorId: user.id,
                });
            }
        }
    });
    // AI analysis request
    socket.on("ai-request-analysis", async (data) => {
        console.log(`[AI] Requesting analysis for ${data.fileName} in room ${data.roomId}`);
        const { analyzeCode } = await Promise.resolve().then(() => __importStar(require("./aiService")));
        const results = await analyzeCode(data.code, data.fileName);
        socket.emit("ai-analysis-result", { results });
    });
    // Canvas update (Excalidraw)
    socket.on("canvas-update", (data) => {
        socket.to(data.roomId).emit("canvas-update", {
            elements: data.elements,
            appState: data.appState
        });
    });
    // WebRTC signaling passthrough (camera + screen, identified by kind)
    socket.on("webrtc-signal", (data) => {
        console.log(`[webrtc-signal] ${data.kind} from ${data.userId} in ${data.roomId}`);
        socket.to(data.roomId).emit("webrtc-signal", {
            signal: data.signal,
            userId: data.userId,
            kind: data.kind,
        });
    });
    // Screen share events 
    socket.on("screen-share-start", (data) => {
        console.log(`[screen-share-start] ${data.userId} in ${data.roomId}`);
        // Notify everyone else that this user started sharing
        socket.to(data.roomId).emit("screen-share-started", { userId: data.userId });
    });
    socket.on("screen-share-stop", (data) => {
        console.log(`[screen-share-stop] ${data.userId} in ${data.roomId}`);
        socket.to(data.roomId).emit("screen-share-stopped", { userId: data.userId });
    });
    // Disconnect
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
