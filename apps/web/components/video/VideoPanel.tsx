"use client";

import { useEffect, useRef } from "react";
import type { CallStatus, ScreenShareState } from "../../lib/useWebRTC";

interface VideoPanelProps {
  // Camera
  stream: MediaStream | null;
  label: string;
  color: string;
  muted?: boolean;
  callStatus?: CallStatus;
  // Screen share
  screenStream?: MediaStream | null;
  screenShareState?: ScreenShareState;
  // Controls (only shown when it's YOUR panel)
  isLocalPanel?: boolean;
  isCameraOn?: boolean;
  isMicOn?: boolean;
  onToggleCamera?: () => void;
  onToggleMic?: () => void;
  onStartScreenShare?: () => void;
  onStopScreenShare?: () => void;
}

export function VideoPanel({
  stream,
  label,
  color,
  muted = false,
  callStatus,
  screenStream,
  screenShareState = "inactive",
  isLocalPanel = false,
  isCameraOn = true,
  isMicOn = true,
  onToggleCamera,
  onToggleMic,
  onStartScreenShare,
  onStopScreenShare,
}: VideoPanelProps) {
  const cameraRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (cameraRef.current && stream) {
      cameraRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (screenRef.current && screenStream) {
      screenRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Are we currently showing a screen share (either our own or friend's)?
  const showingScreen =
    (screenShareState === "sharing" && !!screenStream) ||
    (screenShareState === "viewing" && !!screenStream);

  return (
    <div
      className="relative w-full bg-[#0d1117] border-b border-[#30363d] overflow-hidden flex-shrink-0"
      style={{ height: showingScreen ? "220px" : "160px", transition: "height 0.3s ease" }}
    >
      {/* ── Screen share takes full area ── */}
      {showingScreen && screenStream ? (
        <video
          ref={screenRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain bg-black"
        />
      ) : stream ? (
        /* ── Camera feed ── */
        <video
          ref={cameraRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
          style={{ transform: isLocalPanel ? "scaleX(-1)" : "none" }}
        />
      ) : (
        /* ── No feed placeholder ── */
        <NoFeedPlaceholder label={label} color={color} callStatus={callStatus} />
      )}

      {/* ── Picture-in-picture camera while screen sharing ── */}
      {showingScreen && stream && (
        <div className="absolute bottom-8 right-2 w-20 h-14 rounded border border-[#30363d] overflow-hidden shadow-lg">
          <video
            ref={cameraRef}
            autoPlay
            playsInline
            muted={muted}
            className="w-full h-full object-cover"
            style={{ transform: isLocalPanel ? "scaleX(-1)" : "none" }}
          />
        </div>
      )}

      {/* ── Screen share badge ── */}
      {screenShareState === "sharing" && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f8514922] border border-[#f85149] text-[#f85149] text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f85149] animate-pulse" />
          Sharing screen
        </div>
      )}
      {screenShareState === "viewing" && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#58a6ff18] border border-[#58a6ff44] text-[#58a6ff] text-xs font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse" />
          {label}&apos;s screen
        </div>
      )}

      {/* ── Bottom bar: label + controls ── */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 py-1 bg-gradient-to-t from-black/80 to-transparent">
        {/* Name */}
        <div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-mono font-semibold flex-1" style={{ color }}>
          {label}
        </span>

        {/* Controls — only for your own panel */}
        {isLocalPanel && (
          <div className="flex items-center gap-1">
            {/* Mic toggle */}
            <ControlBtn
              active={isMicOn}
              onClick={onToggleMic}
              activeIcon="🎤"
              inactiveIcon="🔇"
              activeTitle="Mute mic"
              inactiveTitle="Unmute mic"
              inactiveColor="#f85149"
            />

            {/* Camera toggle */}
            <ControlBtn
              active={isCameraOn}
              onClick={onToggleCamera}
              activeIcon="📷"
              inactiveIcon="🚫"
              activeTitle="Turn off camera"
              inactiveTitle="Turn on camera"
              inactiveColor="#f85149"
            />

            {/* Screen share toggle */}
            {screenShareState === "sharing" ? (
              <ControlBtn
                active={true}
                onClick={onStopScreenShare}
                activeIcon="🖥️"
                inactiveIcon="🖥️"
                activeTitle="Stop sharing"
                inactiveTitle="Stop sharing"
                activeColor="#f85149"
              />
            ) : screenShareState !== "viewing" ? (
              <ControlBtn
                active={false}
                onClick={onStartScreenShare}
                activeIcon="🖥️"
                inactiveIcon="🖥️"
                activeTitle="Share screen"
                inactiveTitle="Share screen"
                inactiveColor="#58a6ff"
              />
            ) : null}
          </div>
        )}

        {/* Friend's mute indicator */}
        {!isLocalPanel && !isMicOn && (
          <span className="text-xs">🔇</span>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function NoFeedPlaceholder({
  label,
  color,
  callStatus,
}: {
  label: string;
  color: string;
  callStatus?: CallStatus;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      {callStatus === "calling" ? (
        <>
          <div
            className="w-7 h-7 rounded-full border-2 animate-spin"
            style={{ borderColor: color, borderTopColor: "transparent" }}
          />
          <span className="text-xs font-mono text-[#8b949e]">Connecting camera...</span>
        </>
      ) : callStatus === "failed" ? (
        <>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
          >
            <span className="text-lg">📷</span>
          </div>
          <span className="text-xs font-mono text-[#8b949e]">Camera unavailable</span>
        </>
      ) : (
        <>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
            style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}44` }}
          >
            {label[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-xs font-mono text-[#8b949e]">No camera</span>
        </>
      )}
    </div>
  );
}

function ControlBtn({
  active,
  onClick,
  activeIcon,
  inactiveIcon,
  activeTitle,
  inactiveTitle,
  activeColor = "#3fb950",
  inactiveColor = "#8b949e",
}: {
  active: boolean;
  onClick?: () => void;
  activeIcon: string;
  inactiveIcon: string;
  activeTitle: string;
  inactiveTitle: string;
  activeColor?: string;
  inactiveColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={active ? activeTitle : inactiveTitle}
      className="w-6 h-6 flex items-center justify-center rounded text-xs transition-all hover:scale-110"
      style={{
        backgroundColor: `${active ? activeColor : inactiveColor}22`,
        border: `1px solid ${active ? activeColor : inactiveColor}44`,
      }}
    >
      {active ? activeIcon : inactiveIcon}
    </button>
  );
}