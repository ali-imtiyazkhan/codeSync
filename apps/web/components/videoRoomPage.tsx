"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "../lib/useSocket";
import { useWebRTC } from "../lib/useWebRTC";
import { useRoomStore } from "../store/roomStore";

type TileId = "my-cam" | "friend-cam" | "my-screen" | "friend-screen";

interface Tile {
  id: TileId;
  label: string;
  stream: MediaStream | null;
  muted: boolean;
  mirror: boolean;
  color: string;
}

// ─── Single video element ─────────────────────────────────────────────────────

function VideoEl({
  stream,
  muted,
  mirror,
  className = "",
}: {
  stream: MediaStream | null;
  muted: boolean;
  mirror: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream ?? null;
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
      style={{ transform: mirror ? "scaleX(-1)" : "none" }}
    />
  );
}

// ─── Main focused tile (fills all remaining space) ────────────────────────────

function MainTile({ tile }: { tile: Tile }) {
  return (
    <div className="relative w-full h-full bg-[#0a0c10] overflow-hidden">
      {tile.stream ? (
        <VideoEl
          stream={tile.stream}
          muted={tile.muted}
          mirror={tile.mirror}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-[#0d1117]"
            style={{ background: tile.color }}
          >
            {tile.label[0]?.toUpperCase()}
          </div>
          <span className="text-[#8b949e] font-mono text-sm">
            {tile.label.includes("Screen") ? "No screen share" : "No camera"}
          </span>
        </div>
      )}

      {/* Name overlay — bottom left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tile.color }} />
        <span
          className="font-mono text-sm font-bold drop-shadow-lg"
          style={{ color: tile.color }}
        >
          {tile.label}
        </span>
      </div>

      {/* Screen share badge */}
      {tile.id.includes("screen") && tile.stream && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono text-white backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f85149] animate-pulse" />
          {tile.id === "my-screen" ? "You are sharing" : "Friend's screen"}
        </div>
      )}
    </div>
  );
}

// ─── Small sidebar tile ────────────────────────────────────────────────────────

function SideTile({
  tile,
  onClick,
}: {
  tile: Tile;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="relative w-full rounded-xl overflow-hidden cursor-pointer bg-[#0a0c10] border border-white/5 hover:border-white/20 transition-all group"
      style={{ height: "calc(33.333% - 8px)" }}
    >
      {tile.stream ? (
        <VideoEl
          stream={tile.stream}
          muted={tile.muted}
          mirror={tile.mirror}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-[#0d1117]"
            style={{ background: tile.color }}
          >
            {tile.label[0]?.toUpperCase()}
          </div>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/90 to-transparent">
        <span className="font-mono text-[10px] font-semibold" style={{ color: tile.color }}>
          {tile.label}
        </span>
      </div>

      {/* Expand hint */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-mono bg-black/70 px-2 py-0.5 rounded-md">
          expand
        </span>
      </div>
    </div>
  );
}

// ─── Controls ─────────────────────────────────────────────────────────────────

function ControlBtn({
  emoji,
  label,
  onClick,
  active = true,
  danger = false,
  pulse = false,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  pulse?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all
        hover:scale-105 active:scale-95 min-w-[56px]
        ${danger ? "bg-[#f8514922] border border-[#f8514944]" : "bg-white/5 border border-white/10 hover:bg-white/10"}
        ${pulse ? "animate-pulse" : ""}
      `}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span
        className="text-[9px] font-mono leading-none"
        style={{ color: danger ? "#f85149" : active ? "#8b949e" : "#484f58" }}
      >
        {label}
      </span>
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface VideoRoomPageProps {
  roomId: string;
  userId: string;
  userName: string;
}

export function VideoRoomPage({ roomId, userId, userName }: VideoRoomPageProps) {
  const [focused, setFocused] = useState<TileId>("my-cam");
  const [copied, setCopied] = useState(false);

  const { myRole, myUser, friendUser } = useRoomStore();
  const { socket, connected } = useWebSocket(roomId, userId, userName);
  const isOwner = myRole === "owner";

  const {
    localStream,
    remoteStream,
    callStatus,
    startCall,
    toggleCamera,
    toggleMic,
    isCameraOn,
    isMicOn,
    localScreenStream,
    remoteScreenStream,
    screenShareState,
    startScreenShare,
    stopScreenShare,
  } = useWebRTC(socket, userId, isOwner);

  useEffect(() => {
    if (socket && myRole !== null) startCall();
  }, [socket, myRole]);

  // Auto-focus friend screen share when they start
  useEffect(() => {
    if (screenShareState === "viewing") setFocused("friend-screen");
  }, [screenShareState]);

  // Auto-focus my screen when I start sharing
  useEffect(() => {
    if (screenShareState === "sharing") setFocused("my-screen");
  }, [screenShareState]);

  const myName    = myUser?.name     ?? userName;
  const friendName = friendUser?.name ?? "Friend";

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // All 4 possible tiles
  const ALL_TILES: Tile[] = [
    {
      id: "my-cam",
      label: `${myName} (You)`,
      stream: localStream,
      muted: true,
      mirror: true,
      color: "#58a6ff",
    },
    {
      id: "friend-cam",
      label: friendUser ? friendName : "Waiting...",
      stream: remoteStream,
      muted: false,
      mirror: false,
      color: "#3fb950",
    },
    {
      id: "my-screen",
      label: "My Screen",
      stream: localScreenStream,
      muted: true,
      mirror: false,
      color: "#f0883e",
    },
    {
      id: "friend-screen",
      label: `${friendName}'s Screen`,
      stream: remoteScreenStream,
      muted: true,
      mirror: false,
      color: "#d2a8ff",
    },
  ];

  const mainTile = ALL_TILES.find((t) => t.id === focused) ?? ALL_TILES[0]!;
  const sideTiles = ALL_TILES.filter((t) => t.id !== focused);

  const isSharing = screenShareState === "sharing";

  return (
    <div
      className="flex flex-col bg-[#070a0f] text-white overflow-hidden"
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#0d1117] border-b border-white/5 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#58a6ff] to-[#3fb950] flex items-center justify-center text-[10px] font-black text-[#0d1117]">
            C
          </div>
          <span className="font-mono font-bold text-sm text-white">ColabCode</span>
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Status */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono border ${
            connected
              ? "bg-[#3fb95015] text-[#3fb950] border-[#3fb95030]"
              : "bg-[#f8514915] text-[#f85149] border-[#f8514930]"
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#3fb950] animate-pulse" : "bg-[#f85149]"}`} />
          {connected ? "Live" : "Offline"}
        </div>

        {/* Role */}
        {myRole && (
          <span
            className="text-xs font-mono px-2 py-0.5 rounded border"
            style={{
              color: isOwner ? "#58a6ff" : "#3fb950",
              backgroundColor: isOwner ? "#58a6ff12" : "#3fb95012",
              borderColor: isOwner ? "#58a6ff30" : "#3fb95030",
            }}
          >
            {myRole}
          </span>
        )}

        <div className="flex-1" />

        {/* Room ID */}
        <span className="text-xs font-mono text-[#484f58]">
          {(roomId ?? "").slice(0, 10)}...
        </span>

        {/* Invite */}
        <button
          onClick={copyInvite}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border border-white/10 text-[#8b949e] hover:border-[#58a6ff] hover:text-[#58a6ff] transition-all"
        >
          {copied ? "✓ Copied!" : "⎘ Invite"}
        </button>
      </div>

      {/* ── Main area: big tile + sidebar ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Big main tile */}
        <div className="flex-1 min-w-0 min-h-0">
          <MainTile tile={mainTile} />
        </div>

        {/* Sidebar: 3 small tiles stacked */}
        <div
          className="flex flex-col gap-2 p-2 bg-[#0d1117] border-l border-white/5 flex-shrink-0 overflow-hidden"
          style={{ width: "200px" }}
        >
          {sideTiles.map((tile) => (
            <SideTile key={tile.id} tile={tile} onClick={() => setFocused(tile.id)} />
          ))}
        </div>
      </div>

      {/* ── Bottom controls ─────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 px-6 py-3 bg-[#0d1117] border-t border-white/5 flex-shrink-0">
        <ControlBtn
          emoji={isMicOn ? "🎤" : "🔇"}
          label={isMicOn ? "Mute" : "Unmuted"}
          onClick={toggleMic}
          danger={!isMicOn}
        />
        <ControlBtn
          emoji={isCameraOn ? "📷" : "📵"}
          label={isCameraOn ? "Cam off" : "Cam on"}
          onClick={toggleCamera}
          danger={!isCameraOn}
        />
        <ControlBtn
          emoji="🖥️"
          label={isSharing ? "Stop share" : "Share screen"}
          onClick={isSharing ? stopScreenShare : startScreenShare}
          danger={isSharing}
          pulse={isSharing}
        />

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Quick focus shortcuts */}
        {ALL_TILES.map((tile) => (
          <button
            key={tile.id}
            onClick={() => setFocused(tile.id)}
            className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg transition-all hover:bg-white/5"
            style={{ opacity: focused === tile.id ? 1 : 0.4 }}
            title={tile.label}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: tile.color }}
            />
            <span className="text-[8px] font-mono text-[#8b949e] leading-none max-w-[40px] truncate">
              {tile.id === "my-cam"
                ? "Me"
                : tile.id === "friend-cam"
                ? "Friend"
                : tile.id === "my-screen"
                ? "My Screen"
                : "Their Screen"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}