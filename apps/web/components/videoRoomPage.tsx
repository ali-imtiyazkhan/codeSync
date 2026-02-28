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
  onAction?: () => void;
  actionLabel?: string;
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
      className={`
        video-tile group relative rounded-lg overflow-hidden border border-[var(--border)]
        ${expanded ? "video-tile-expanded" : ""}
      `}
      onDoubleClick={onToggleExpand}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: expanded ? "1 / 3" : undefined,
        gridRow: expanded ? "1 / 3" : undefined,
      }}
    >
      {/* Background Glow */}
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${tile.color}44 0%, transparent 70%)`
        }}
      />

      {/* Main content */}
      {tile.stream ? (
        <div className="relative w-full h-full">
          <VideoEl
            stream={tile.stream}
            muted={tile.muted}
            mirror={tile.mirror}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          {/* Glass overlay on hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[var(--bg-surface)]">
          {/* Avatar Container */}
          <div className="relative">
            <div
              className={`
                tile-avatar relative z-10 w-16 h-16 rounded-[22px] flex items-center justify-center text-2xl
                transition-all duration-500 group-hover:rounded-[18px]
              `}
              style={{
                background: `linear-gradient(135deg, ${tile.color}22, ${tile.color}11)`,
                border: `1px solid ${tile.color}33`,
                color: tile.color,
                boxShadow: hovered ? `0 10px 25px ${tile.color}22` : "none",
              }}
            >
              {tile.icon}
            </div>
            {/* Animated Ring */}
            <div
              className="absolute inset-0 rounded-[22px] border border-[var(--blue)] opacity-20 animate-ping"
              style={{ borderColor: tile.color, animationDuration: '3s' }}
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[var(--text-dim)] uppercase">
              {tile.sublabel}
            </span>
            {tile.onAction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  tile.onAction?.();
                }}
                className={`
                  mt-1 px-4 py-2 text-[10px] font-bold tracking-widest rounded-xl transition-all duration-300
                  bg-[var(--bg-elevated)] border border-[var(--border-light)] text-[var(--text)]
                  hover:border-[var(--blue-soft)] hover:shadow-[0_0_15px_var(--blue-glow)]
                  active:scale-95
                `}
              >
                {tile.actionLabel ?? "START SESSION"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Information Layer */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="flex items-center gap-3 p-1.5 pr-4 rounded-xl cs-glass">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-1.5"
            style={{
              backgroundColor: tile.stream ? tile.color : "var(--text-dim)",
              boxShadow: tile.stream ? `0 0 10px ${tile.color}` : "none",
            }}
          />
          <span
            className="text-[11px] font-bold tracking-tight truncate"
            style={{ color: tile.stream ? "var(--text)" : "var(--text-muted)" }}
          >
            {tile.label}
          </span>

          {tile.stream && tile.id.includes("screen") && (
            <div className="ml-auto flex items-center gap-2 px-2 py-0.5 rounded-md bg-[hsla(var(--red-h),92%,63%,0.15)] border border-[hsla(var(--red-h),92%,63%,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--red)] animate-pulse" />
              <span className="text-[9px] font-black text-[var(--red)] tracking-widest">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Badges */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div className="cs-glass w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-lg leading-none">
          {tile.id.includes("cam") ? "👤" : "🖥️"}
        </div>
      </div>

      {/* Expand/Restore Hint */}
      <div
        className={`
          absolute top-4 right-4 transition-all duration-300
          ${hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
      >
        <div className="cs-glass px-3 py-1.5 rounded-lg flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wide text-[var(--text-muted)]">
            {expanded ? "RESTORE" : "EXPAND"}
          </span>
          <div className="w-2 h-2 rounded-[2px] border border-[var(--text-dim)]" />
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
  } = useWebRTC(socket, userId, roomId, isOwner);

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
    setMyCode(pendingChange.newCode);
    socket.emit("accept-change", { roomId, newCode: pendingChange.newCode });
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
      sublabel: "Ready to share",
      stream: localScreenStream,
      muted: true,
      mirror: false,
      color: "#f0883e",
      icon: "🖥️",
      onAction: startScreenShare,
      actionLabel: "START SCREEN SHARE",
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
        <div className="cs-topbar-accent" />

        <div className="flex items-center gap-3 px-4 h-full border-r border-[var(--border)]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--green)] flex items-center justify-center text-[#0d1117] shadow-lg shadow-[var(--blue-glow)]">
            <span className="font-black text-sm tracking-tighter">CS</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--text)] uppercase">CodeSync</span>
            <span className="text-[8px] font-mono text-[var(--text-dim)] tracking-widest mt-0.5">EST. 2024 v2.0</span>
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-4 px-4 h-full">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-[var(--green)] shadow-[0_0_8px_var(--green-glow)] animate-pulse" : "bg-[var(--red)] shadow-[0_0_8px_var(--red)]"}`} />
            <span className={`text-[10px] font-bold tracking-tight ${connected ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>
          {myRole && (
            <div className="px-2.5 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-light)] shadow-sm">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${isOwner ? "text-[var(--blue)]" : "text-[var(--green)]"}`}>
                {myRole}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Room & Invite */}
        <div className="flex items-center gap-3 pr-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
            <span className="text-[10px] font-mono text-[var(--text-dim)] uppercase">Room:</span>
            <span className="text-[11px] font-mono font-bold text-[var(--blue)] tracking-wider">
              {roomId.slice(0, 12)}...
            </span>
          </div>

          <button
            onClick={copyInvite}
            className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-bold rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--blue-soft)] hover:text-[var(--text)] transition-all hover:bg-[var(--blue-glow)] active:scale-95"
          >
            {copied ? "✓ COPIED" : "⎘ INVITE"}
          </button>

          <div className="w-px h-6 bg-[var(--border)] mx-1" />

          {/* User Badge */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--bg-surface)] to-transparent border border-[var(--border)] group hover:border-[var(--blue-glow)] transition-all">
            <div className="w-6 h-6 rounded-lg bg-[var(--blue)] flex items-center justify-center text-[10px] font-bold text-[var(--bg)] shadow-md group-hover:scale-110 transition-transform">
              {userName[0]?.toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-[var(--text)] tracking-tight">
              {userName}
            </span>
          </div>
        </div>
      </header>

      {/* ═══ DIFF BANNER (owner only) ═══ */}
      {pendingChange && isOwner && (
        <DiffPanel
          original={myCode}
          modified={pendingChange.newCode}
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
      <footer className="cs-controls-bar">
        {/* Left: Status info with glows */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-[var(--green)] shadow-[0_0_10px_var(--green-glow)] animate-pulse" : "bg-[var(--red)] shadow-[0_0_10px_var(--red)]"}`} />
            <span className={`text-[11px] font-bold tracking-widest ${connected ? "text-[var(--text)]" : "text-[var(--red)]"}`}>
              {connected ? "SECURE CONNECTION" : "LINK SEVERED"}
            </span>
          </div>

          <div className="h-4 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-4">
            {callStatus === "connected" && (
              <div className="flex items-center gap-2 group">
                <div className="w-6 h-6 rounded-lg bg-[hsla(var(--blue-h),100%,68%,0.1)] flex items-center justify-center text-xs group-hover:scale-110 transition-transform">🎥</div>
                <span className="text-[10px] font-bold text-[var(--blue-soft)] tracking-tight">AV FEED ACTIVE</span>
              </div>
            )}
            {isSharing && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[hsla(var(--orange-h),88%,59%,0.1)] border border-[hsla(var(--orange-h),88%,59%,0.2)] animate-pulse">
                <span className="text-[9px] font-black text-[var(--orange)] tracking-widest uppercase">Streaming Screen</span>
              </div>
            )}
            {screenShareState === "viewing" && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--purple)] tracking-tight">
                <span className="text-sm">🖥️</span> MONITORING PEER STREAM
              </div>
            )}
          </div>
        </div>

        {/* Center: media controls */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 p-1 rounded-2xl cs-glass border border-white/5 shadow-2xl">
          <CtrlBtn
            emoji={isMicOn ? "🎤" : "🔇"}
            label={isMicOn ? "MUTE" : "UNMUTE"}
            onClick={toggleMic}
            danger={!isMicOn}
          />
          <CtrlBtn
            emoji={isCameraOn ? "📷" : "📵"}
            label={isCameraOn ? "CAM: OFF" : "CAM: ON"}
            onClick={toggleCamera}
            danger={!isCameraOn}
          />

          <div className="w-px h-8 bg-white/10 mx-1" />

          <CtrlBtn
            emoji="🖥️"
            label={isSharing ? "STOP" : "SHARE"}
            onClick={isSharing ? stopScreenShare : startScreenShare}
            danger={isSharing}
            pulse={isSharing}
          />
        </div>

        {/* Right: session info */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-[0.2em]">Session Access</span>
            <span className={`text-[11px] font-bold ${isOwner ? "text-[var(--blue)]" : "text-[var(--green)]"} tracking-tight`}>
              {isOwner ? "ROOT AUTHORIZATION" : "EDITOR PERMISSIONS"}
            </span>
          </div>
          <div className="h-8 w-px bg-[var(--border)]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[var(--text)] tracking-wider italic">CodeSync</span>
            <span className="text-[8px] font-mono text-[var(--text-dim)] uppercase tracking-widest text-right">System v2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}