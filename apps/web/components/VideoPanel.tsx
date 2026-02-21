"use client";

import { useEffect, useRef } from "react";

interface VideoPanelProps {
  label: string;
  subLabel?: string;
  stream: MediaStream | null;
  muted?: boolean;
  cameraOn?: boolean;
  className?: string;
  badge?: "camera" | "screen";
  badgeColor?: "violet" | "cyan" | "emerald" | "orange";
  placeholder?: React.ReactNode;
}

const badgeColors = {
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function VideoPanel({
  label,
  subLabel,
  stream,
  muted = false,
  cameraOn = true,
  className = "",
  badge,
  badgeColor = "violet",
  placeholder,
}: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [stream]);

  const hasVideo = stream && stream.getVideoTracks().length > 0;

  return (
    <div className={`relative flex flex-col overflow-hidden panel-glow ${className}`}>
      {/* Panel header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          {badge && (
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full border ${badgeColors[badgeColor]}`}
            >
              {badge === "camera" ? "📹" : "🖥"} {label}
            </span>
          )}
        </div>

        {/* Live indicator */}
        {hasVideo && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">LIVE</span>
          </div>
        )}
      </div>

      {/* Video */}
      {hasVideo ? (
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/50">
          {placeholder || (
            <div className="flex flex-col items-center gap-3">
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-mono text-slate-400">{label}</p>
                {subLabel && (
                  <p className="text-xs font-mono text-slate-600 mt-0.5">{subLabel}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
