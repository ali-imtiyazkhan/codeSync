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
    <header className="cs-topbar">
      {/* Animated accent line */}
      <div className="cs-topbar-accent" />

      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 border-r border-[var(--border)] h-full">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--blue)] to-[var(--green)] flex items-center justify-center text-[#0d1117] shadow-lg shadow-[var(--blue-glow)]">
          <span className="font-black text-sm tracking-tighter">CS</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--text)] uppercase">CodeSync</span>
          <span className="text-[8px] font-mono text-[var(--text-dim)] tracking-widest mt-0.5">EST. 2024 v2.0</span>
        </div>
      </div>

      {/* Room Selection / Info */}
      <div className="flex items-center gap-2 px-2">
        <button
          onClick={onCopyRoomId}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--blue-soft)] transition-all duration-300"
        >
          <span className="text-[10px] font-mono text-[var(--text-dim)] group-hover:text-[var(--blue)] transition-colors">ROOM://</span>
          <span className="text-[11px] font-mono font-bold text-[var(--blue)] tracking-wider">
            {roomId.slice(0, 8)}...
          </span>
          <span className="text-[10px] text-[var(--text-muted)] opacity-50">
            {copySuccess ? "✓" : "⎘"}
          </span>
        </button>
      </div>

      {/* Network / Nodes */}
      <div className="flex items-center gap-4 px-4 border-l border-[var(--border)] h-full">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-[var(--green)] shadow-[0_0_8px_var(--green-glow)] animate-pulse" : "bg-[var(--red)] shadow-[0_0_8px_var(--red)]"}`}
          />
          <span className={`text-[10px] font-bold tracking-tight ${connected ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
            {connected ? "LIVE" : "DISCONNECTED"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-dim)]">PING:</span>
            <span className="text-[var(--green)] font-bold">{ping}ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-dim)]">UP:</span>
            <span className="text-[var(--blue)] font-bold">{fmtUptime(uptime)}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 mx-2 rounded-lg bg-[hsla(var(--red-h),92%,63%,0.1)] border border-[hsla(var(--red-h),92%,63%,0.2)] text-[var(--red)] animate-pulse">
          <span className="text-[10px] font-bold tracking-tight uppercase">
            ⚠️ {pendingCount} PENDING CHANGES
          </span>
        </div>
      )}

      {/* Main Controls - Right Side */}
      <div className="ml-auto flex items-center gap-2 pr-4">
        <div className="flex items-center gap-1 bg-[var(--bg-surface)] p-1 rounded-xl border border-[var(--border)]">
          <TopBarActionBtn
            onClick={onToggleCamera}
            active={cameraOn}
            icon={cameraOn ? "📷" : "📵"}
            label="CAM"
          />
          <TopBarActionBtn
            onClick={onToggleMic}
            active={micOn}
            icon={micOn ? "🎤" : "🔇"}
            label="MIC"
          />
          <TopBarActionBtn
            onClick={onToggleScreen}
            active={screenSharing}
            icon="🖥️"
            label="SHARE"
            highlight={screenSharing}
          />
        </div>

        <div className="w-px h-6 bg-[var(--border)] mx-1" />

        {/* User Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[var(--bg-surface)] to-transparent border border-[var(--border)] group hover:border-[var(--blue-glow)] transition-all">
          <div className="w-6 h-6 rounded-lg bg-[var(--blue)] flex items-center justify-center text-[10px] font-bold text-[var(--bg)] shadow-md group-hover:scale-110 transition-transform">
            {userName[0]?.toUpperCase()}
          </div>
          <span className="text-[11px] font-bold text-[var(--text)] tracking-tight">
            {userName}
          </span>
        </div>

        {/* Clock */}
        <div className="pl-4 ml-2 border-l border-[var(--border)] h-full flex items-center">
          <span className="text-[11px] font-mono font-medium text-[var(--purple)] tabular-nums tracking-wider opacity-80">
            {time}
          </span>
        </div>
      </div>
    </header>
  );
}

function TopBarActionBtn({
  onClick, active, icon, label, highlight = false,
}: {
  onClick: () => void;
  active: boolean;
  icon: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200
        ${active ? "bg-[var(--bg-elevated)] border border-[var(--border-light)]" : "bg-transparent border border-transparent"}
        ${highlight ? "text-[var(--orange)] border-[hsla(var(--orange-h),88%,59%,0.3)] shadow-[0_0_10px_var(--orange-glow)]" : "text-[var(--text-muted)]"}
        hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]
      `}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-[9px] font-bold tracking-wider">{label}</span>
    </button>
  );
}
