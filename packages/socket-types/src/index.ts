// packages/socket-types/src/index.ts
// Shared TypeScript types for all Socket.io events

export interface User {
  id: string;
  name: string;
  color: string;
  role: "owner" | "editor";
}

export interface Room {
  users: User[];
  ownerCode: string;
}

export interface PendingChange {
  original?: string;
  newCode: string;
  authorId: string;
}

// ── Server → Client Events ────────────────────────────────────────────────────
export interface ServerToClientEvents {
  "room-users": (data: { users: User[] }) => void;
  "role-assigned": (data: { role: "owner" | "editor"; user: User }) => void;
  "owner-code-update": (data: { code: string }) => void;
  "user-joined": (data: { user: User }) => void;
  "user-left": (data: { userId: string }) => void;
  "change-proposed": (data: PendingChange) => void;
  "change-accepted": (data: { newCode: string }) => void;
  "change-rejected": (data: {}) => void;
  "vscode-push": (data: { code: string }) => void;
  "editor-code-update": (data: { code: string }) => void;

  // WebRTC
  "webrtc-signal": (data: { signal: any; userId: string; kind: "camera" | "screen" }) => void;
  "screen-share-started": (data: { userId: string }) => void;
  "screen-share-stopped": (data: { userId: string }) => void;
}

// ── Client → Server Events ────────────────────────────────────────────────────
export interface ClientToServerEvents {
  "join-room": (data: { roomId: string; userId: string; userName: string }) => void;
  "owner-code-change": (data: { roomId: string; code: string }) => void;
  "propose-change": (data: { roomId: string; original: string; newCode: string }) => void;
  "accept-change": (data: { roomId: string; newCode: string }) => void;
  "reject-change": (data: { roomId: string }) => void;
  "vscode-push": (data: { roomId: string; code: string }) => void;

  // WebRTC
  "webrtc-signal": (data: { signal: any; userId: string; kind: "camera" | "screen" }) => void;
  "screen-share-start": (data: { userId: string }) => void;
  "screen-share-stop": (data: { userId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  roomId: string;
  userName: string;
  userId: string;
}

