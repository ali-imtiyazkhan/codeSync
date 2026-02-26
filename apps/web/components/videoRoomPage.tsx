"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWebSocket } from "../lib/useSocket";
import { useWebRTC } from "../lib/useWebRTC";
import { useRoomStore } from "../store/roomStore";
import { DiffPanel } from "./diff/DiffPanel";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-[#0a0c10]">
      <span className="text-[#8b949e] font-mono text-sm animate-pulse">
        Loading editor...
      </span>
    </div>
  ),
});

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

// ─── Single video tile ────────────────────────────────────────────────────────

interface TileData {
  id: string;
  label: string;
  sublabel: string;
  stream: MediaStream | null;
  muted: boolean;
  mirror: boolean;
  color: string;
  icon: string;
}

function VideoTile({
  tile,
  expanded,
  onToggleExpand,
}: {
  tile: TileData;
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`video-tile ${expanded ? "video-tile-expanded" : ""}`}
      onDoubleClick={onToggleExpand}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: expanded ? "1 / 3" : undefined,
        gridRow: expanded ? "1 / 3" : undefined,
      }}
    >
      {/* Main content */}
      {tile.stream ? (
        <VideoEl
          stream={tile.stream}
          muted={tile.muted}
          mirror={tile.mirror}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          {/* Avatar */}
          <div
            className="tile-avatar"
            style={{
              background: `${tile.color}18`,
              border: `1px solid ${tile.color}40`,
              color: tile.color,
            }}
          >
            <span className="text-xl">{tile.icon}</span>
          </div>
          <span className="text-xs font-mono text-[#484f58]">
            {tile.sublabel}
          </span>
        </div>
      )}

      {/* Bottom gradient overlay with label */}
      <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor: tile.stream ? tile.color : "#484f58",
              boxShadow: tile.stream
                ? `0 0 8px ${tile.color}80`
                : "none",
            }}
          />
          <span
            className="text-xs font-mono font-semibold truncate"
            style={{ color: tile.stream ? tile.color : "#8b949e" }}
          >
            {tile.label}
          </span>
          {tile.stream && tile.id.includes("screen") && (
            <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
      </div>

      {/* Expand hint — only visible on hover */}
      <div
        className="absolute top-2 right-2 transition-opacity"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <span className="text-[10px] font-mono text-white/60 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
          {expanded ? "dbl-click: restore" : "dbl-click: expand"}
        </span>
      </div>

      {/* Top-left icon badge */}
      <div className="absolute top-2 left-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs backdrop-blur-sm"
          style={{
            background: `${tile.color}18`,
            border: `1px solid ${tile.color}30`,
          }}
        >
          {tile.id.includes("cam") ? "📷" : "🖥️"}
        </div>
      </div>
    </div>
  );
}

// ─── Control button ───────────────────────────────────────────────────────────

function CtrlBtn({
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
      className={`ctrl-btn ${danger ? "ctrl-btn-danger" : ""} ${pulse ? "animate-pulse" : ""}`}
      title={label}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-[9px] font-mono leading-none text-[#8b949e]">
        {label}
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface VideoRoomPageProps {
  roomId: string;
  userId: string;
  userName: string;
}

export function VideoRoomPage({ roomId, userId, userName }: VideoRoomPageProps) {
  const [expandedTile, setExpandedTile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [language] = useState("javascript");

  // ── Store ──
  const {
    myCode,
    friendCode,
    pendingChange,
    myRole,
    myUser,
    friendUser,
    setMyCode,
    setFriendCode,
    clearPendingChange,
  } = useRoomStore();

  // ── Socket & WebRTC ──
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

  // Start WebRTC once socket is ready
  useEffect(() => {
    if (socket && myRole !== null) startCall();
  }, [socket, myRole]);

  // Auto-expand screen share tile
  useEffect(() => {
    if (screenShareState === "viewing") setExpandedTile("friend-screen");
    else if (screenShareState === "sharing") setExpandedTile("my-screen");
  }, [screenShareState]);

  // ── Code sync handlers ──
  const handleOwnerCodeChange = useCallback(
    (code: string) => {
      setMyCode(code);
      if (socket && isOwner) {
        socket.emit("owner-code-change", { roomId, code });
      }
    },
    [socket, roomId, isOwner, setMyCode]
  );

  const handleEditorCodeChange = useCallback(
    (code: string) => {
      setFriendCode(code);
      if (socket && !isOwner) {
        socket.emit("propose-change", { roomId, newCode: code });
      }
    },
    [socket, roomId, isOwner, setFriendCode]
  );

  const handleAcceptChange = useCallback(() => {
    if (!pendingChange || !socket) return;
    setMyCode(pendingChange.code);
    socket.emit("accept-change", { roomId, newCode: pendingChange.code });
    clearPendingChange();
  }, [pendingChange, socket, roomId, setMyCode, clearPendingChange]);

  const handleRejectChange = useCallback(() => {
    socket?.emit("reject-change", { roomId });
    clearPendingChange();
  }, [socket, roomId, clearPendingChange]);

  // ── Derived values ──
  const myName = myUser?.name ?? userName;
  const friendName = friendUser?.name ?? "Friend";
  const friendConnected = !!friendUser;

  const ownerUser = isOwner ? myUser : friendUser;
  const editorUser = isOwner ? friendUser : myUser;
  const editorLabel = editorUser?.name ?? "Waiting...";

  const copyInvite = () => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSharing = screenShareState === "sharing";

  // ── 4 video tiles ──
  const tiles: TileData[] = [
    {
      id: "my-cam",
      label: `${myName} (You)`,
      sublabel: callStatus === "calling" ? "Connecting..." : "Camera off",
      stream: localStream,
      muted: true,
      mirror: true,
      color: "#58a6ff",
      icon: "📷",
    },
    {
      id: "friend-cam",
      label: friendConnected ? friendName : "Waiting for friend...",
      sublabel: friendConnected ? "Camera off" : "Share the invite link",
      stream: remoteStream,
      muted: false,
      mirror: false,
      color: "#3fb950",
      icon: friendConnected ? "📷" : "⏳",
    },
    {
      id: "my-screen",
      label: "Your Screen",
      sublabel: "Click Share Screen to start",
      stream: localScreenStream,
      muted: true,
      mirror: false,
      color: "#f0883e",
      icon: "🖥️",
    },
    {
      id: "friend-screen",
      label: `${friendName}'s Screen`,
      sublabel: "Not sharing yet",
      stream: remoteScreenStream,
      muted: true,
      mirror: false,
      color: "#d2a8ff",
      icon: "🖥️",
    },
  ];

  // Code for the editor panel
  const editorCode = isOwner ? myCode : myCode;
  const editorOnChange = isOwner ? handleOwnerCodeChange : handleEditorCodeChange;
  const editorReadOnly = false; // both can edit, owner's is authoritative

  return (
    <div className="cs-root">
      {/* ═══ TOP BAR ═══ */}
      <header className="cs-topbar">
        {/* Left accent */}
        <div className="cs-topbar-accent" />

        {/* Logo */}
        <div className="flex items-center gap-2 px-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#58a6ff] to-[#3fb950] flex items-center justify-center text-xs font-black text-[#0d1117] shadow-lg shadow-[#58a6ff]/20">
            C
          </div>
          <div>
            <span className="font-mono font-bold text-sm text-white tracking-tight">
              CodeSync
            </span>
            <span className="text-[10px] font-mono text-[#484f58] ml-1.5">
              v2.0
            </span>
          </div>
        </div>

        <div className="w-px h-5 bg-[#21262d]" />

        {/* Connection badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border ${connected
            ? "bg-[#3fb95010] text-[#3fb950] border-[#3fb95030]"
            : "bg-[#f8514910] text-[#f85149] border-[#f8514930]"
            }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#3fb950] animate-pulse" : "bg-[#f85149]"
              }`}
          />
          {connected ? "Connected" : "Offline"}
        </div>

        {/* Role badge */}
        {myRole && (
          <span
            className="text-xs font-mono px-2.5 py-1 rounded-md border"
            style={{
              color: isOwner ? "#58a6ff" : "#3fb950",
              backgroundColor: isOwner ? "#58a6ff10" : "#3fb95010",
              borderColor: isOwner ? "#58a6ff30" : "#3fb95030",
            }}
          >
            {myRole.toUpperCase()}
          </span>
        )}

        {/* Peer indicator */}
        {friendConnected && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#8b949e]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
            {friendName} online
          </div>
        )}

        <div className="flex-1" />

        {/* Room ID */}
        <span className="text-xs font-mono text-[#484f58] hidden sm:block">
          {(roomId ?? "").slice(0, 12)}...
        </span>

        {/* Invite */}
        <button
          onClick={copyInvite}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-md border border-[#21262d] text-[#8b949e] hover:border-[#58a6ff] hover:text-[#58a6ff] transition-all hover:bg-[#58a6ff08]"
        >
          {copied ? "✓ Copied!" : "⎘ Invite"}
        </button>

        {/* User badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#58a6ff10] border border-[#58a6ff25]">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#58a6ff] to-[#79b8ff] flex items-center justify-center text-[10px] font-bold text-[#0d1117]">
            {userName[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-mono text-[#58a6ff]">
            {userName}
          </span>
        </div>
      </header>

      {/* ═══ DIFF BANNER (owner only) ═══ */}
      {pendingChange && isOwner && (
        <DiffPanel
          original={myCode}
          modified={pendingChange.code}
          authorName={editorLabel}
          onAccept={handleAcceptChange}
          onReject={handleRejectChange}
        />
      )}

      {/* ═══ MAIN 5-PANEL GRID ═══ */}
      <div className="cs-main-grid">
        {/* ── Left: 2×2 video grid ── */}
        <div className="cs-video-grid">
          {tiles.map((tile) => (
            <VideoTile
              key={tile.id}
              tile={tile}
              expanded={expandedTile === tile.id}
              onToggleExpand={() =>
                setExpandedTile((prev) =>
                  prev === tile.id ? null : tile.id
                )
              }
            />
          ))}
        </div>

        {/* ── Right: Code editor (spans full height) ── */}
        <div className="cs-editor-panel">
          {/* Editor header */}
          <div className="cs-editor-header">
            <div className="flex items-center gap-2">
              <span className="text-sm">💻</span>
              <span className="text-xs font-mono font-semibold text-white">
                Code Editor
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isOwner ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#58a6ff15] text-[#58a6ff] border border-[#58a6ff30]">
                  OWNER · editable
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#3fb95015] text-[#3fb950] border border-[#3fb95030]">
                  EDITOR · your changes are proposed
                </span>
              )}
            </div>
          </div>

          {/* Monaco Editor — rendered directly for proper height chain */}
          <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <MonacoEditor
                height="100%"
                language={language}
                value={editorCode}
                onChange={(value: string | undefined) => editorOnChange(value || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 8,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: "gutter",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  wordWrap: "on",
                  automaticLayout: true,
                  readOnly: false,
                  padding: { top: 16, bottom: 16 },
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM CONTROLS BAR ═══ */}
      <div className="cs-controls-bar">
        {/* Left: status info */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-mono ${connected ? "text-[#3fb950]" : "text-[#f85149]"
              }`}
          >
            ● {connected ? "Live" : "Disconnected"}
          </span>
          {callStatus === "connected" && (
            <span className="text-xs font-mono text-[#3fb950]">
              🎥 Video active
            </span>
          )}
          {isSharing && (
            <span className="text-xs font-mono text-[#f0883e] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f0883e] animate-pulse" />
              Sharing screen
            </span>
          )}
          {screenShareState === "viewing" && (
            <span className="text-xs font-mono text-[#d2a8ff]">
              🖥️ Viewing {friendName}'s screen
            </span>
          )}
        </div>

        {/* Center: media controls */}
        <div className="flex items-center gap-2">
          <CtrlBtn
            emoji={isMicOn ? "🎤" : "🔇"}
            label={isMicOn ? "Mute" : "Unmute"}
            onClick={toggleMic}
            danger={!isMicOn}
          />
          <CtrlBtn
            emoji={isCameraOn ? "📷" : "📵"}
            label={isCameraOn ? "Cam off" : "Cam on"}
            onClick={toggleCamera}
            danger={!isCameraOn}
          />

          <div className="w-px h-7 bg-[#21262d] mx-1" />

          <CtrlBtn
            emoji="🖥️"
            label={isSharing ? "Stop" : "Share"}
            onClick={isSharing ? stopScreenShare : startScreenShare}
            danger={isSharing}
            pulse={isSharing}
          />
        </div>

        {/* Right: session info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#484f58]">
            Role:{" "}
            <span
              className={isOwner ? "text-[#58a6ff]" : "text-[#3fb950]"}
            >
              {myRole ?? "assigning..."}
            </span>
          </span>
          <span className="text-xs font-mono text-[#30363d]">
            CodeSync v2.0
          </span>
        </div>
      </div>
    </div>
  );
}