// packages/socket-types/src/index.ts
// Shared TypeScript types for all Socket.io events

export interface User {
  id: string;
  name: string;
  socketId: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  language: string;
  fileName: string;
}

export interface CodeChange {
  code: string;
  delta?: string;
  fileName?: string;
  language?: string;
  from: string;
  fromName: string;
}

export interface PendingChange {
  id: string;
  code: string;
  delta?: string;
  fromSocketId: string;
  fromName: string;
  timestamp: number;
}

// ── WebRTC ────────────────────────────────────────────────────────────────────
export interface WebRTCOffer {
  to: string;
  offer: RTCSessionDescriptionInit;
  fromName: string;
  streamType: "camera" | "screen";
}

export interface WebRTCAnswer {
  to: string;
  answer: RTCSessionDescriptionInit;
  streamType: "camera" | "screen";
}

export interface WebRTCIceCandidate {
  to: string;
  candidate: RTCIceCandidateInit;
  streamType: "camera" | "screen";
}

// ── Server → Client Events ────────────────────────────────────────────────────
export interface ServerToClientEvents {
  // Room
  "room:joined": (data: { room: Room; users: User[] }) => void;
  "room:user-joined": (user: User) => void;
  "room:user-left": (data: { socketId: string }) => void;

  // Code sync
  "code:init": (data: { code: string; language: string; fileName: string }) => void;
  "code:vscode-update": (change: CodeChange) => void;
  "code:editor-change": (change: CodeChange) => void;
  "code:pending-change": (change: PendingChange) => void;
  "code:change-accepted": (data: { changeId: string; code: string }) => void;
  "code:change-rejected": (data: { changeId: string; code: string }) => void;

  // WebRTC
  "webrtc:offer": (data: { from: string; fromName: string; offer: RTCSessionDescriptionInit; streamType: "camera" | "screen" }) => void;
  "webrtc:answer": (data: { from: string; answer: RTCSessionDescriptionInit; streamType: "camera" | "screen" }) => void;
  "webrtc:ice-candidate": (data: { from: string; candidate: RTCIceCandidateInit; streamType: "camera" | "screen" }) => void;
  "webrtc:peer-screen-started": (data: { socketId: string }) => void;
  "webrtc:peer-screen-stopped": (data: { socketId: string }) => void;
}

// ── Client → Server Events ────────────────────────────────────────────────────
export interface ClientToServerEvents {
  // Room
  "room:join": (data: { roomId: string; userName: string }) => void;

  // Code sync
  "code:vscode-update": (data: { roomId: string; code: string; fileName: string; language: string }) => void;
  "code:editor-change": (data: { roomId: string; code: string; delta?: string }) => void;
  "code:accept-change": (data: { roomId: string; changeId: string; code: string }) => void;
  "code:reject-change": (data: { roomId: string; changeId: string }) => void;

  // WebRTC
  "webrtc:offer": (data: WebRTCOffer) => void;
  "webrtc:answer": (data: WebRTCAnswer) => void;
  "webrtc:ice-candidate": (data: WebRTCIceCandidate) => void;
  "webrtc:screen-started": (data: { roomId: string }) => void;
  "webrtc:screen-stopped": (data: { roomId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  roomId: string;
  userName: string;
  userId?: string;
}
