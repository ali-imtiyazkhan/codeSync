"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useWebSocket } from "../lib/useSocket";
import { useWebRTC } from "../lib/useWebRTC";
import { useRoomStore } from "../store/roomStore";
import { DiffPanel } from "./diff/DiffPanel";

const CodeEditorPanel = dynamic(() => import("./CodeEditorPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#262624' }}>
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
      className={`video-tile group relative rounded-lg overflow-hidden ${expanded ? "video-tile-expanded" : ""}`}
      style={{
        border: '1px solid #333330',
        gridColumn: expanded ? "1 / 3" : undefined,
        gridRow: expanded ? "1 / 3" : undefined,
      }}
      onDoubleClick={onToggleExpand}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background Glow */}
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${tile.color}44 0%, transparent 70%)` }}
      />

      {tile.stream ? (
        <div className="relative w-full h-full">
          <VideoEl
            stream={tile.stream}
            muted={tile.muted}
            mirror={tile.mirror}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4" style={{ background: '#2e2e2b' }}>
          <div className="relative">
            <div
              className="relative z-10 w-16 h-16 rounded-[22px] flex items-center justify-center text-2xl transition-all duration-500 group-hover:rounded-[18px]"
              style={{
                background: `linear-gradient(135deg, ${tile.color}22, ${tile.color}11)`,
                border: `1px solid ${tile.color}33`,
                color: tile.color,
                boxShadow: hovered ? `0 10px 25px ${tile.color}22` : "none",
              }}
            >
              {tile.icon}
            </div>
            <div
              className="absolute inset-0 rounded-[22px] border opacity-20 animate-ping"
              style={{ borderColor: tile.color, animationDuration: '3s' }}
            />
          </div>

          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase" style={{ color: '#6b6b68' }}>
              {tile.sublabel}
            </span>
            {tile.onAction && (
              <button
                onClick={(e) => { e.stopPropagation(); tile.onAction?.(); }}
                className="mt-1 px-4 py-2 text-[10px] font-bold tracking-widest rounded-xl transition-all duration-300 active:scale-95"
                style={{
                  background: '#333330',
                  border: '1px solid #444441',
                  color: '#c9c9c6',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#58a6ff55';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px #58a6ff22';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#444441';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {tile.actionLabel ?? "START SESSION"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Label */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div
          className="flex items-center gap-3 p-1.5 pr-4 rounded-xl"
          style={{ background: 'rgba(38,38,36,0.85)', backdropFilter: 'blur(8px)', border: '1px solid #3a3a37' }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-1.5"
            style={{
              backgroundColor: tile.stream ? tile.color : '#6b6b68',
              boxShadow: tile.stream ? `0 0 10px ${tile.color}` : 'none',
            }}
          />
          <span
            className="text-[11px] font-bold tracking-tight truncate"
            style={{ color: tile.stream ? '#e0e0dd' : '#8b8b88' }}
          >
            {tile.label}
          </span>

          {tile.stream && tile.id.includes("screen") && (
            <div className="ml-auto flex items-center gap-2 px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[9px] font-black text-red-400 tracking-widest">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Type badge */}
      <div className="absolute top-4 left-4 flex gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-lg leading-none"
          style={{ background: 'rgba(38,38,36,0.85)', backdropFilter: 'blur(8px)', border: '1px solid #3a3a37' }}
        >
          {tile.id.includes("cam") ? "👤" : "🖥️"}
        </div>
      </div>

      {/* Expand hint */}
      <div className={`absolute top-4 right-4 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
        <div
          className="px-3 py-1.5 rounded-lg flex items-center gap-2"
          style={{ background: 'rgba(38,38,36,0.85)', backdropFilter: 'blur(8px)', border: '1px solid #3a3a37' }}
        >
          <span className="text-[10px] font-bold tracking-wide" style={{ color: '#8b8b88' }}>
            {expanded ? "RESTORE" : "EXPAND"}
          </span>
          <div className="w-2 h-2 rounded-[2px]" style={{ border: '1px solid #6b6b68' }} />
        </div>
      </div>
    </div>
  );
}

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
      title={label}
      className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all duration-200 active:scale-95 ${pulse ? "animate-pulse" : ""}`}
      style={{
        background: danger ? 'rgba(255,80,80,0.12)' : 'rgba(60,60,57,0.6)',
        border: danger ? '1px solid rgba(255,80,80,0.3)' : '1px solid #3a3a37',
        color: danger ? '#ff6b6b' : '#c9c9c6',
      }}
      onMouseEnter={e => {
        if (!danger) (e.currentTarget as HTMLElement).style.background = 'rgba(80,80,77,0.8)';
      }}
      onMouseLeave={e => {
        if (!danger) (e.currentTarget as HTMLElement).style.background = 'rgba(60,60,57,0.6)';
      }}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span className="text-[9px] font-mono leading-none" style={{ color: '#8b8b88' }}>{label}</span>
    </button>
  );
}

interface VideoRoomPageProps {
  roomId: string;
  userId: string;
  userName: string;
}

export function VideoRoomPage({ roomId, userId, userName }: VideoRoomPageProps) {
  const [activeMainId, setActiveMainId] = useState<string>("editor");
  const [expandedTile, setExpandedTile] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [language] = useState("javascript");

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

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (socket && myRole !== null) startCall();
  }, [socket, myRole]);

  useEffect(() => {
    if (screenShareState === "viewing") setActiveMainId("friend-screen");
    else if (screenShareState === "sharing") setActiveMainId("my-screen");
  }, [screenShareState]);

  const handleOwnerCodeChange = useCallback(
    (code: string) => {
      setMyCode(code);
      if (socket && isOwner) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          socket.emit("owner-code-change", { roomId, code });
        }, 100);
      }
    },
    [socket, roomId, isOwner, setMyCode]
  );

  const handleEditorCodeChange = useCallback(
    (code: string) => {
      setFriendCode(code);
      if (socket && !isOwner) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          socket.emit("propose-change", { roomId, original: friendCode, newCode: code });
        }, 100);
      }
    },
    [socket, roomId, isOwner, setFriendCode, friendCode]
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

  const editorTile: TileData = {
    id: "editor",
    label: "Code Editor",
    sublabel: isOwner ? "Authoritative" : "Collaborative",
    stream: null,
    muted: true,
    mirror: false,
    color: "#a371f7",
    icon: "💻",
  };

  const allLayoutElements = [...tiles, editorTile];
  const activeMainElement = allLayoutElements.find(e => e.id === activeMainId) || editorTile;
  const sidebarElements = allLayoutElements.filter(e => e.id !== activeMainId);

  const thumbStyle = { height: '160px', flexShrink: 0 };

  return (
    <div
      className="cs-root"
      style={{
        '--bg': '#262624',
        '--bg-surface': '#2e2e2b',
        '--bg-elevated': '#333330',
        '--border': '#333330',
        '--border-light': '#444441',
        '--text': '#e0e0dd',
        '--text-muted': '#a8a8a5',
        '--text-dim': '#6b6b68',
        '--blue': '#58a6ff',
        '--blue-soft': '#58a6ff88',
        '--blue-glow': 'rgba(88,166,255,0.12)',
        '--green': '#3fb950',
        '--green-glow': 'rgba(63,185,80,0.25)',
        '--red': '#ff6b6b',
        '--orange': '#f0883e',
        background: '#262624',
      } as React.CSSProperties}
    >


      {/* ═══ DIFF BANNER ═══ */}
      {pendingChange && isOwner && (
        <DiffPanel
          original={myCode}
          modified={pendingChange.newCode}
          authorName={editorLabel}
          onAccept={handleAcceptChange}
          onReject={handleRejectChange}
        />
      )}

      {/* ═══ MAIN STAGE + SIDEBAR ═══ */}
      <div className="cs-main-grid">
        {/* CENTRAL MAIN STAGE */}
        <main className="cs-main-stage" style={{ background: '#262624', display: 'flex', flexDirection: 'column' }}>
          {/* Role indicator */}
          <div
            className="flex items-center gap-2 px-4 py-1.5 flex-shrink-0"
            style={{ background: '#1e1e1c', borderBottom: '1px solid #333330' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: isOwner ? '#58a6ff' : '#3fb950', boxShadow: isOwner ? '0 0 6px rgba(88,166,255,0.5)' : '0 0 6px rgba(63,185,80,0.5)' }}
            />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: isOwner ? '#58a6ff' : '#3fb950' }}>
              {isOwner ? "Owner" : "Editor"}
            </span>
            <span className="text-[10px] font-mono" style={{ color: '#6b6b68' }}>
              — {myName}
            </span>
          </div>
          {activeMainId === "editor" ? (
            <CodeEditorPanel
              code={isOwner ? myCode : (friendCode || myCode)}
              language={language}
              fileName="main.js"
              onChange={isOwner ? handleOwnerCodeChange : handleEditorCodeChange}
              readOnly={false}
              socket={socket}
              roomId={roomId}
              pendingChanges={pendingChange ? [pendingChange] : []}
            />
          ) : (
            <div className="w-full h-full" style={{ background: '#262624' }}>
              {activeMainElement.stream ? (
                <VideoEl
                  stream={activeMainElement.stream}
                  muted={activeMainElement.muted}
                  mirror={activeMainElement.mirror}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                  <div
                    className="w-32 h-32 rounded-[40px] flex items-center justify-center text-4xl"
                    style={{
                      background: 'rgba(38,38,36,0.85)',
                      backdropFilter: 'blur(8px)',
                      border: `2px solid ${activeMainElement.color}44`,
                      color: activeMainElement.color,
                    }}
                  >
                    {activeMainElement.icon}
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-bold tracking-tight" style={{ color: '#e0e0dd' }}>
                      {activeMainElement.label}
                    </h2>
                    <p className="text-[11px] font-mono uppercase tracking-widest mt-2" style={{ color: '#6b6b68' }}>
                      {activeMainElement.sublabel}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* SIDEBAR */}
        <aside
          className="cs-sidebar-thumbnails"
          style={{ background: '#1e1e1c', borderLeft: '1px solid #333330' }}
        >
          <div className="px-2 mb-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#6b6b68' }}>Live Peeks</h3>
          </div>

          <div className="cs-video-grid">
            {sidebarElements.map((el) => (
              <div
                key={el.id}
                onClick={() => setActiveMainId(el.id)}
                style={thumbStyle}
              >
                <VideoTile
                  tile={el}
                  expanded={false}
                  onToggleExpand={() => { }}
                />
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ═══ BOTTOM CONTROLS BAR ═══ */}
      <footer
        className="cs-controls-bar"
        style={{ background: '#1e1e1c', borderTop: '1px solid #333330', justifyContent: 'center' }}
      >
        <div
          className="flex items-center gap-3 p-1 rounded-2xl shadow-2xl"
          style={{ background: 'rgba(30,30,28,0.95)', backdropFilter: 'blur(12px)', border: '1px solid #333330' }}
        >
          <CtrlBtn emoji={isMicOn ? "🎤" : "🔇"} label={isMicOn ? "MUTE" : "UNMUTE"} onClick={toggleMic} danger={!isMicOn} />
          <CtrlBtn emoji={isCameraOn ? "📷" : "📵"} label={isCameraOn ? "CAM: OFF" : "CAM: ON"} onClick={toggleCamera} danger={!isCameraOn} />
          <div className="w-px h-8 mx-1" style={{ background: '#333330' }} />
          <CtrlBtn emoji="🖥️" label={isSharing ? "STOP" : "SHARE"} onClick={isSharing ? stopScreenShare : startScreenShare} danger={isSharing} pulse={isSharing} />
        </div>
      </footer>
    </div>
  );
}