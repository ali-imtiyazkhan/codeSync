"use client";

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
  roomId,
  userName,
  connected,
  peerCount,
  cameraOn,
  micOn,
  screenSharing,
  onToggleCamera,
  onToggleMic,
  onToggleScreen,
  onCopyRoomId,
  copySuccess,
  pendingCount,
}: TopBarProps) {
  return (
    <header
      className="h-13 flex items-center px-4 gap-3 border-b border-border flex-shrink-0"
      style={{ background: "#0f0f17", height: "52px" }}
    >
      {/* Logo */}
      <span className="font-display font-black text-lg bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mr-2">
        CodeSync
      </span>

      {/* Room ID */}
      <button
        onClick={onCopyRoomId}
        className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono hover:border-violet-500 transition-colors"
      >
        <span className="text-slate-500">Room:</span>
        <span className="text-violet-400">{roomId}</span>
        <span className="text-slate-600">{copySuccess ? "✓ Copied!" : "⎘"}</span>
      </button>

      {/* Connection status */}
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"}`}
          style={connected ? { boxShadow: "0 0 6px #10b981" } : {}}
        />
        <span className="text-xs font-mono text-slate-500">
          {connected ? `${peerCount + 1} connected` : "Disconnected"}
        </span>
      </div>

      {/* Pending changes badge */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 bg-red-950/50 border border-red-800 px-2.5 py-1 rounded-lg notification-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-xs font-mono text-red-400">
            {pendingCount} pending change{pendingCount > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="ml-auto flex items-center gap-2">
        {/* Camera */}
        <ControlButton
          onClick={onToggleCamera}
          active={cameraOn}
          activeColor="violet"
          icon={
            cameraOn ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.828v6.344a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )
          }
          label={cameraOn ? "Cam On" : "Camera"}
        />

        {/* Mic */}
        <ControlButton
          onClick={onToggleMic}
          active={micOn}
          activeColor="violet"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={micOn ? "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" : "M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"} />
            </svg>
          }
          label={micOn ? "Mic On" : "Muted"}
        />

        {/* Screen share */}
        <ControlButton
          onClick={onToggleScreen}
          active={screenSharing}
          activeColor="emerald"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          label={screenSharing ? "Sharing" : "Share Screen"}
        />

        {/* User badge */}
        <div className="ml-2 flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
            {userName[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-mono text-slate-300">{userName}</span>
        </div>
      </div>
    </header>
  );
}

function ControlButton({
  onClick,
  active,
  activeColor,
  icon,
  label,
}: {
  onClick: () => void;
  active: boolean;
  activeColor: "violet" | "emerald" | "cyan";
  icon: React.ReactNode;
  label: string;
}) {
  const activeStyles = {
    violet: "bg-violet-600 border-violet-600 text-white",
    emerald: "bg-emerald-600 border-emerald-600 text-white",
    cyan: "bg-cyan-600 border-cyan-600 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
        active
          ? activeStyles[activeColor]
          : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
