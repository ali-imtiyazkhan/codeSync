"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "../lib/useSocket";
import { useWebRTC } from "../lib/useWebRTC";
import { useRoomStore } from "../store/roomStore";
import dynamic from "next/dynamic";
import type { PendingChange } from "@codesync/socket-types";

// Dynamically import the real Monaco editor
const CodeEditorPanel = dynamic(() => import("./CodeEditorPanel"), {
  ssr: false,
  loading: () => (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117" }}>
      <span style={{ fontSize: "14px", color: "#8b949e", fontFamily: "monospace" }}>Loading editor...</span>
    </div>
  ),
});

function VideoEl({ stream, muted, mirror, style = {} }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream ?? null; }, [stream]);
  return (
    <video ref={ref} autoPlay playsInline muted={muted}
      style={{ transform: mirror ? "scaleX(-1)" : "none", ...style }} />
  );
}

// Removed the internal CodeEditorPanel as we now use the real one imported above.

// ─── Tile thumbnail component ─────────────────────────────────────────────────
function TileThumbnail({ tile, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: "10px", overflow: "hidden",
        cursor: "pointer", flexShrink: 0,
        border: isActive ? `2px solid ${tile.color}` : "2px solid #21262d",
        transition: "border-color 0.2s, transform 0.15s, box-shadow 0.2s",
        transform: hovered && !isActive ? "scale(1.02)" : "scale(1)",
        boxShadow: isActive ? `0 0 16px ${tile.color}44` : hovered ? "0 4px 16px rgba(0,0,0,0.4)" : "none",
        aspectRatio: "16/9",
        background: "#161b22",
      }}
    >
      {tile.stream ? (
        <VideoEl stream={tile.stream} muted={tile.muted} mirror={tile.mirror}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : tile.id === "editor" ? (
        // Mini editor preview
        <div style={{ width: "100%", height: "100%", background: "#0d1117", padding: "8px", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: "3px", marginBottom: "6px" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map(c => <div key={c} style={{ width: "5px", height: "5px", borderRadius: "50%", background: c }} />)}
          </div>
          {["// code...", "console.log(", "  'Hello'", ");", "", "function fn() {", "  return 42;", "}"].map((l, i) => (
            <div key={i} style={{ height: "8px", marginBottom: "2px", borderRadius: "2px", background: l ? `${tile.color}22` : "transparent", width: l ? `${40 + (i * 17) % 45}%` : "0" }} />
          ))}
        </div>
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", background: `linear-gradient(135deg, #161b22 0%, #0d1117 100%)` }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: `${tile.color}15`, border: `1px solid ${tile.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px",
          }}>{tile.icon}</div>
          <span style={{ fontSize: "9px", color: "#8b949e", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{tile.sublabel}</span>
          {tile.onAction && (
            <button
              onClick={e => { e.stopPropagation(); tile.onAction(); }}
              style={{
                fontSize: "8px", padding: "3px 8px", borderRadius: "4px",
                background: `${tile.color}20`, border: `1px solid ${tile.color}40`,
                color: tile.color, cursor: "pointer", fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >SHARE</button>
          )}
        </div>
      )}

      {/* Bottom label */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "16px 8px 6px",
        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
        display: "flex", alignItems: "center", gap: "5px",
      }}>
        <div style={{
          width: "5px", height: "5px", borderRadius: "50%",
          background: tile.stream ? tile.color : "#3d444d",
          boxShadow: tile.stream ? `0 0 6px ${tile.color}` : "none",
          flexShrink: 0,
        }} />
        <span style={{ fontSize: "10px", color: "#c9d1d9", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tile.label}
        </span>
        {isActive && (
          <span style={{
            marginLeft: "auto", fontSize: "8px", color: tile.color,
            padding: "1px 5px", border: `1px solid ${tile.color}50`, borderRadius: "3px",
            fontFamily: "monospace", flexShrink: 0,
          }}>LIVE</span>
        )}
      </div>

      {/* Hover overlay */}
      {hovered && !isActive && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            padding: "4px 10px", borderRadius: "4px",
            background: "rgba(0,0,0,0.7)", border: "1px solid #30363d",
            fontSize: "9px", color: "#c9d1d9", fontFamily: "monospace", letterSpacing: "0.1em",
          }}>FOCUS →</div>
        </div>
      )}
    </div>
  );
}

// ─── Main stage: renders whichever tile is active in full ─────────────────────
function MainStage({ tile, myCode, onCodeChange, isOwner, socket, roomId, pendingChanges, onAccept, onReject }) {
  if (tile.id === "editor") {
    return (
      <CodeEditorPanel
        code={myCode}
        language="javascript"
        fileName="main.js"
        onChange={onCodeChange}
        readOnly={false}
        socket={socket as any}
        roomId={roomId}
        pendingChanges={pendingChanges}
        onAccept={onAccept}
        onReject={onReject}
        hideHeader={true}
      />
    );
  }
  if (tile.stream) {
    return (
      <div style={{ flex: 1, position: "relative", background: "#000", overflow: "hidden" }}>
        <VideoEl stream={tile.stream} muted={tile.muted} mirror={tile.mirror}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {/* Overlay info */}
        <div style={{
          position: "absolute", top: "16px", left: "16px",
          display: "flex", alignItems: "center", gap: "8px",
          padding: "6px 12px", borderRadius: "8px",
          background: "rgba(13,17,23,0.8)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: tile.color, boxShadow: `0 0 8px ${tile.color}` }} />
          <span style={{ fontSize: "12px", color: "#c9d1d9", fontFamily: "monospace" }}>{tile.label}</span>
          {tile.id.includes("screen") && (
            <span style={{ fontSize: "9px", color: "#ff6b6b", padding: "1px 6px", border: "1px solid rgba(255,107,107,0.3)", borderRadius: "3px", fontFamily: "monospace" }}>● REC</span>
          )}
        </div>
      </div>
    );
  }
  // No stream — placeholder
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d1117", gap: "16px" }}>
      <div style={{
        width: "80px", height: "80px", borderRadius: "20px",
        background: `${tile.color}10`, border: `2px solid ${tile.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "32px",
      }}>{tile.icon}</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#c9d1d9", fontFamily: "monospace", marginBottom: "6px" }}>{tile.label}</div>
        <div style={{ fontSize: "12px", color: "#8b949e", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{tile.sublabel}</div>
      </div>
      {tile.onAction && (
        <button onClick={tile.onAction} style={{
          padding: "10px 24px", borderRadius: "8px",
          background: `${tile.color}15`, border: `1px solid ${tile.color}40`,
          color: tile.color, cursor: "pointer", fontFamily: "monospace",
          fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em",
          transition: "all 0.2s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${tile.color}25`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${tile.color}30`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${tile.color}15`; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
        >{tile.actionLabel}</button>
      )}
    </div>
  );
}

// ─── Control button ───────────────────────────────────────────────────────────
function CtrlBtn({ emoji, label, onClick, active = true, danger = false, pulse = false }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "4px", width: "56px", height: "48px", borderRadius: "10px",
        transition: "all 0.15s", transform: hovered ? "scale(1.05)" : "scale(1)",
        background: danger
          ? hovered ? "rgba(255,107,107,0.25)" : "rgba(255,107,107,0.12)"
          : hovered ? "rgba(88,166,255,0.12)" : "rgba(33,38,45,0.8)",
        border: danger ? "1px solid rgba(255,107,107,0.35)" : hovered ? "1px solid rgba(88,166,255,0.3)" : "1px solid #30363d",
        color: danger ? "#ff6b6b" : hovered ? "#58a6ff" : "#c9d1d9",
        cursor: "pointer",
        animation: pulse ? "ctrlPulse 1.5s ease infinite" : "none",
      }}
    >
      <span style={{ fontSize: "15px", lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: "8px", fontFamily: "monospace", color: danger ? "#ff6b6b88" : "#8b949e", letterSpacing: "0.05em" }}>{label}</span>
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function VideoRoomPage({ roomId = "abc123", userId = "u1", userName = "BrightHacker" }) {
  const [activeMainId, setActiveMainId] = useState("editor");
  const [copied, setCopied] = useState(false);

  const {
    myCode, friendCode, pendingChange, myRole, myUser, friendUser,
    setMyCode, setFriendCode, clearPendingChange
  } = useRoomStore();

  const { socket, connected } = useWebSocket(roomId, userId, userName);
  const isOwner = myRole === "owner";

  const {
    localStream, remoteStream, callStatus,
    startCall, toggleCamera, toggleMic, isCameraOn, isMicOn,
    localScreenStream, remoteScreenStream, screenShareState,
    startScreenShare, stopScreenShare,
  } = useWebRTC(socket, userId, roomId, isOwner);

  // AUTO-START CAMERA
  useEffect(() => {
    if (connected) startCall();
  }, [connected, startCall]);

  const myName = myUser?.name ?? userName;
  const friendName = friendUser?.name ?? "SwiftCoder";
  const friendConnected = !!friendUser;
  const isSharing = screenShareState === "sharing";

  // When screen share activates, auto-focus it
  useEffect(() => {
    if (screenShareState === "viewing") setActiveMainId("friend-screen");
    else if (screenShareState === "sharing") setActiveMainId("my-screen");
  }, [screenShareState]);

  const copyInvite = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/room/${roomId}`).catch(() => { });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = useCallback((code) => {
    if (isOwner) {
      setMyCode(code);
      if (socket) socket.emit?.("owner-code-change", { roomId, code });
    } else {
      setFriendCode(code);
      if (socket) {
        socket.emit?.("editor-code-change", { roomId, code });
        socket.emit?.("propose-change", { roomId, original: myCode, newCode: code });
      }
    }
  }, [socket, roomId, isOwner, setMyCode, setFriendCode, myCode]);

  const handleAcceptChange = useCallback(() => {
    if (!pendingChange) return;
    setMyCode(pendingChange.newCode);
    socket?.emit("accept-change", { roomId, newCode: pendingChange.newCode });
    clearPendingChange();
  }, [socket, roomId, setMyCode, clearPendingChange, pendingChange]);

  const handleRejectChange = useCallback(() => {
    socket?.emit("reject-change", { roomId });
    clearPendingChange();
  }, [socket, roomId, clearPendingChange]);

  // All tiles definition
  const tiles = [
    {
      id: "my-cam",
      label: `${myName} (You)`,
      sublabel: callStatus === "calling" ? "Connecting..." : "Camera",
      stream: localStream,
      muted: true, mirror: true,
      color: "#58a6ff", icon: "👤",
    },
    {
      id: "friend-cam",
      label: friendConnected ? friendName : "Waiting...",
      sublabel: friendConnected ? "Remote camera" : "Share invite link",
      stream: remoteStream,
      muted: false, mirror: false,
      color: "#3fb950", icon: friendConnected ? "👤" : "⏳",
    },
    {
      id: "my-screen",
      label: "Your Screen",
      sublabel: isSharing ? "Sharing live" : "Ready to share",
      stream: localScreenStream,
      muted: true, mirror: false,
      color: "#f0883e", icon: "🖥️",
      onAction: startScreenShare,
      actionLabel: "START SCREEN SHARE",
    },
    {
      id: "friend-screen",
      label: `${friendName}'s Screen`,
      sublabel: "Not sharing yet",
      stream: remoteScreenStream,
      muted: true, mirror: false,
      color: "#d2a8ff", icon: "🖥️",
    },
    {
      id: "editor",
      label: "Code Editor",
      sublabel: isOwner ? "Authoritative" : "Collaborative",
      stream: null,
      muted: true, mirror: false,
      color: "#a371f7", icon: "💻",
    },
  ];

  const activeTile = tiles.find(t => t.id === activeMainId) || tiles[tiles.length - 1];
  const sidebarTiles = tiles.filter(t => t.id !== activeMainId);

  return (
    <div style={{
      width: "100vw", height: "100vh", display: "flex", flexDirection: "column",
      background: "#010409", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      overflow: "hidden",
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        height: "44px", flexShrink: 0,
        display: "flex", alignItems: "center",
        padding: "0 16px", gap: "12px",
        background: "#0d1117",
        borderBottom: "1px solid #21262d",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#58a6ff", letterSpacing: "0.04em" }}>Editor</span>
          <span style={{ fontSize: "12px", color: "#30363d" }}>—</span>
          <span style={{ fontSize: "12px", color: "#8b949e" }}>{myName}</span>
        </div>

        {/* Connection pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "3px 8px", borderRadius: "12px",
          background: connected ? "rgba(63,185,80,0.08)" : "rgba(255,107,107,0.08)",
          border: connected ? "1px solid rgba(63,185,80,0.25)" : "1px solid rgba(255,107,107,0.25)",
        }}>
          <div style={{
            width: "5px", height: "5px", borderRadius: "50%",
            background: connected ? "#3fb950" : "#ff6b6b",
            boxShadow: connected ? "0 0 6px #3fb950" : "none",
            animation: connected ? "connPulse 2s ease infinite" : "none",
          }} />
          <span style={{ fontSize: "9px", color: connected ? "#3fb950" : "#ff6b6b", letterSpacing: "0.1em" }}>
            {connected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>

        {/* Role badge */}
        <div style={{
          padding: "3px 8px", borderRadius: "12px",
          background: isOwner ? "rgba(88,166,255,0.08)" : "rgba(63,185,80,0.08)",
          border: isOwner ? "1px solid rgba(88,166,255,0.25)" : "1px solid rgba(63,185,80,0.25)",
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
          color: isOwner ? "#58a6ff" : "#3fb950",
        }}>
          {isOwner ? "OWNER" : "EDITOR"}
        </div>

        {/* Room ID */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "10px", color: "#8b949e" }}>Room:</span>
          <code style={{ fontSize: "11px", color: "#c9d1d9", background: "#161b22", padding: "2px 8px", borderRadius: "4px", border: "1px solid #21262d" }}>
            {roomId}
          </code>
          <button
            onClick={copyInvite}
            style={{
              padding: "4px 10px", borderRadius: "6px", cursor: "pointer",
              background: copied ? "rgba(63,185,80,0.12)" : "#161b22",
              border: copied ? "1px solid rgba(63,185,80,0.4)" : "1px solid #21262d",
              color: copied ? "#3fb950" : "#8b949e", fontSize: "10px",
              fontFamily: "monospace", transition: "all 0.2s", letterSpacing: "0.05em",
            }}
          >
            {copied ? "✓ COPIED" : "COPY INVITE"}
          </button>

          {/* Propose change button for editor - Removed as requested */}

          {/* Pending change indicator for owner - Removed manual TopBar buttons as they are in CodeEditorPanel */}
        </div>
      </div>

      {/* ── BODY: MAIN STAGE + SIDEBAR ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* MAIN STAGE */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          background: "#0d1117", minWidth: 0, overflow: "hidden",
          position: "relative",
        }}>
          <MainStage
            tile={activeTile}
            myCode={isOwner ? myCode : (friendCode || myCode)}
            onCodeChange={handleCodeChange}
            isOwner={isOwner}
            socket={socket}
            roomId={roomId}
            pendingChanges={pendingChange ? [pendingChange] : []}
            onAccept={isOwner ? handleAcceptChange : undefined}
            onReject={isOwner ? handleRejectChange : undefined}
          />

          {/* Active tile label badge (non-editor) */}
          {activeMainId !== "editor" && (
            <div style={{
              position: "absolute", bottom: "16px", left: "50%",
              transform: "translateX(-50%)",
              display: "flex", alignItems: "center", gap: "8px",
              padding: "6px 16px", borderRadius: "20px",
              background: "rgba(13,17,23,0.85)", backdropFilter: "blur(8px)",
              border: "1px solid #21262d",
            }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: activeTile.color, boxShadow: `0 0 8px ${activeTile.color}` }} />
              <span style={{ fontSize: "11px", color: "#c9d1d9", fontFamily: "monospace" }}>{activeTile.label}</span>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{
          width: "230px", flexShrink: 0,
          background: "#0d1117",
          borderLeft: "1px solid #21262d",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Sidebar header */}
          <div style={{
            padding: "12px 14px 8px",
            borderBottom: "1px solid #21262d",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", color: "#8b949e", textTransform: "uppercase" }}>Live Peeks</span>
            <span style={{ fontSize: "9px", color: "#3d444d", fontFamily: "monospace" }}>{sidebarTiles.length} panels</span>
          </div>

          {/* Thumbnails */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "10px",
            display: "flex", flexDirection: "column", gap: "8px",
          }}>
            {sidebarTiles.map(tile => (
              <TileThumbnail
                key={tile.id}
                tile={tile}
                isActive={tile.id === activeMainId}
                onClick={() => setActiveMainId(tile.id)}
              />
            ))}
          </div>

          {/* Sidebar footer: participant status */}
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid #21262d",
            display: "flex", flexDirection: "column", gap: "6px",
          }}>
            <div style={{ fontSize: "9px", color: "#3d444d", letterSpacing: "0.1em", marginBottom: "2px" }}>PARTICIPANTS</div>
            {[
              { name: myName, color: "#58a6ff", you: true },
              { name: friendName, color: "#3fb950", you: false },
            ].map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "6px",
                  background: `${p.color}15`, border: `1px solid ${p.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "10px",
                }}>👤</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "11px", color: "#c9d1d9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}{p.you ? <span style={{ color: "#3d444d", marginLeft: "4px" }}>(you)</span> : ""}
                  </div>
                </div>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: p.color, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTROL BAR ── */}
      <div style={{
        height: "64px", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "8px",
        background: "#0d1117",
        borderTop: "1px solid #21262d",
        padding: "0 20px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "8px 16px", borderRadius: "14px",
          background: "rgba(22,27,34,0.95)", backdropFilter: "blur(12px)",
          border: "1px solid #21262d",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <CtrlBtn emoji={isMicOn ? "🎤" : "🔇"} label={isMicOn ? "MUTE" : "UNMUTE"} onClick={toggleMic} danger={!isMicOn} />
          <CtrlBtn emoji={isCameraOn ? "📷" : "📵"} label={isCameraOn ? "CAM OFF" : "CAM ON"} onClick={toggleCamera} danger={!isCameraOn} />
          <div style={{ width: "1px", height: "28px", background: "#21262d", margin: "0 4px" }} />
          <CtrlBtn emoji="🖥️" label={isSharing ? "STOP" : "SHARE"} onClick={isSharing ? stopScreenShare : startScreenShare} danger={isSharing} pulse={isSharing} />
          <div style={{ width: "1px", height: "28px", background: "#21262d", margin: "0 4px" }} />
          <CtrlBtn emoji="💻" label="EDITOR" onClick={() => setActiveMainId("editor")} active={activeMainId === "editor"} />
        </div>
      </div>

      <style>{`
        @keyframes connPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes ctrlPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #21262d; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #30363d; }
      `}</style>
    </div>
  );
}

export default VideoRoomPage;