"use client";

import { useState, useEffect } from "react";

interface TopBarProps {
  roomId: string;
  userName: string;
  connected: boolean;
  peerCount: number;
  cameraOn: boolean;
  micOn: boolean;
  screenSharing: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onToggleScreen: () => void;
  onCopyRoomId: () => void;
  copySuccess: boolean;
  pendingCount: number;
}

export default function TopBar({
  roomId, userName, connected, peerCount,
  cameraOn, micOn, screenSharing,
  onToggleCamera, onToggleMic, onToggleScreen,
  onCopyRoomId, copySuccess, pendingCount,
}: TopBarProps) {
  const [time, setTime] = useState("");
  const [uptime, setUptime] = useState(0);
  const [ping] = useState(() => Math.floor(Math.random() * 30) + 8);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toTimeString().slice(0, 8));
      setUptime((u) => u + 1);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const fmtUptime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <header
      className="flex items-center flex-shrink-0"
      style={{
        height: 52,
        background: "linear-gradient(to right, #030c12, #040e16, #030c12)",
        borderBottom: "1px solid var(--border2)",
        boxShadow: "0 1px 20px rgba(0,255,225,0.06)",
        position: "relative",
        zIndex: 50,
      }}
    >
      {/* Left edge accent */}
      <div style={{ width: 3, height: "100%", background: "linear-gradient(to bottom, var(--neon), var(--neon2))", boxShadow: "var(--glow-neon)", flexShrink: 0 }} />

      {/* Logo */}
      <div className="px-4 flex items-center gap-3" style={{ borderRight: "1px solid var(--border)", paddingRight: 16 }}>
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: "1rem",
            letterSpacing: "0.12em",
            color: "var(--neon)",
            textShadow: "var(--glow-neon)",
          }}
        >
          CS
        </span>
        <div>
          <div style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.1em" }}>CODESYNC</div>
          <div style={{ fontSize: "0.55rem", color: "var(--dim)", letterSpacing: "0.08em" }}>v2.077</div>
        </div>
      </div>

      {/* Room ID */}
      <button
        onClick={onCopyRoomId}
        className="flex items-center gap-2 px-3 mx-2 py-1 transition-all"
        style={{
          background: "rgba(0,255,225,0.03)",
          border: "1px solid var(--border)",
          color: "var(--muted)",
          fontSize: "0.7rem",
          letterSpacing: "0.1em",
          cursor: "pointer",
          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--neon)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; }}
      >
        <span style={{ color: "var(--dim)" }}>SESSION://</span>
        <span style={{ color: "var(--neon2)", textShadow: "var(--glow-blue)" }}>{roomId}</span>
        <span style={{ color: "var(--dim)", fontSize: "0.6rem" }}>{copySuccess ? "✓ COPIED" : "⎘"}</span>
      </button>

      {/* Connection status */}
      <div className="flex items-center gap-2 px-3" style={{ borderRight: "1px solid var(--border)" }}>
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: connected ? "var(--neon4)" : "var(--neon3)",
            boxShadow: connected ? "var(--glow-lime)" : "var(--glow-red)",
            animation: "neon-pulse 2s infinite",
          }}
        />
        <span style={{ fontSize: "0.65rem", color: connected ? "var(--neon4)" : "var(--neon3)", letterSpacing: "0.08em" }}>
          {connected ? `NET:OK` : "NET:ERR"}
        </span>
        <span style={{ fontSize: "0.6rem", color: "var(--dim)" }}>
          {peerCount + 1} NODE{peerCount !== 0 ? "S" : ""}
        </span>
      </div>

      {/* Ping / uptime */}
      <div className="flex items-center gap-3 px-3" style={{ borderRight: "1px solid var(--border)" }}>
        <div style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.08em" }}>
          <span style={{ color: "var(--dim)" }}>PING:</span>
          <span style={{ color: "var(--neon4)", textShadow: "var(--glow-lime)", marginLeft: 4 }}>{ping}ms</span>
        </div>
        <div style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.08em" }}>
          <span style={{ color: "var(--dim)" }}>UP:</span>
          <span style={{ color: "var(--neon)", marginLeft: 4 }}>{fmtUptime(uptime)}</span>
        </div>
      </div>

      {/* Pending badge */}
      {pendingCount > 0 && (
        <div
          className="flex items-center gap-2 px-3 mx-2 pending-pulse"
          style={{
            border: "1px solid var(--neon3)",
            background: "rgba(255,45,107,0.08)",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            color: "var(--neon3)",
            textShadow: "var(--glow-red)",
            clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
            padding: "5px 12px",
          }}
        >
          <span style={{ animation: "neon-pulse 0.8s infinite", display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "var(--neon3)", boxShadow: "var(--glow-red)" }} />
          ⚠ {pendingCount} PENDING CHANGE{pendingCount > 1 ? "S" : ""}
        </div>
      )}

      {/* Controls — right side */}
      <div className="ml-auto flex items-center gap-1 pr-3">
        {/* Camera */}
        <CyberCtrlBtn
          onClick={onToggleCamera}
          active={cameraOn}
          activeClass="active-neon"
          label={cameraOn ? "CAM:ON" : "CAM:OFF"}
          icon="◈"
        />
        {/* Mic */}
        <CyberCtrlBtn
          onClick={onToggleMic}
          active={micOn}
          activeClass="active-neon"
          label={micOn ? "MIC:ON" : "MIC:OFF"}
          icon="◉"
        />
        {/* Screen */}
        <CyberCtrlBtn
          onClick={onToggleScreen}
          active={screenSharing}
          activeClass="active-lime"
          label={screenSharing ? "SHARING" : "SCREEN"}
          icon="◆"
        />

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "var(--border)", margin: "0 6px" }} />

        {/* User badge */}
        <div
          className="flex items-center gap-2 px-3 py-1"
          style={{
            background: "rgba(0,255,225,0.04)",
            border: "1px solid var(--border)",
            clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
          }}
        >
          <div
            style={{
              width: 22, height: 22,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "0.6rem",
              fontWeight: 700,
              color: "var(--bg)",
              background: "linear-gradient(135deg, var(--neon), var(--neon2))",
              boxShadow: "var(--glow-neon)",
              clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
            }}
          >
            {userName[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: "0.65rem", color: "var(--neon)", letterSpacing: "0.08em" }}>
            {userName.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Clock */}
      <div
        className="flex items-center px-3"
        style={{ borderLeft: "1px solid var(--border)", height: "100%" }}
      >
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            color: "var(--amber)",
            textShadow: "var(--glow-amber)",
          }}
        >
          {time}
        </span>
      </div>
    </header>
  );
}

function CyberCtrlBtn({
  onClick, active, activeClass, label, icon,
}: {
  onClick: () => void;
  active: boolean;
  activeClass: string;
  label: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`cyber-btn ${active ? activeClass : ""}`}
      style={{ fontSize: "0.65rem", padding: "5px 10px" }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
