"use client";

import { useEffect, useRef } from "react";

interface VideoPanelProps {
  stream: MediaStream | null;
  label: string;
  color: string;
  muted?: boolean;
  callStatus?: "idle" | "calling" | "connected" | "failed";
}

export function VideoPanel({
  stream,
  label,
  color,
  muted = false,
  callStatus,
}: VideoPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className="relative w-full bg-[#0d1117] border-b border-[#30363d] overflow-hidden"
      style={{ height: "160px" }}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full gap-2">
          {callStatus === "calling" ? (
            <>
              <div
                className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: color, borderTopColor: "transparent" }}
              />
              <span className="text-xs font-mono text-[#8b949e]">
                Connecting camera...
              </span>
            </>
          ) : callStatus === "failed" ? (
            <>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: `${color}22` }}
              >
                🚫
              </div>
              <span className="text-xs font-mono text-[#8b949e]">
                Camera unavailable
              </span>
            </>
          ) : (
            <>
              {/* Avatar placeholder */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
                style={{
                  backgroundColor: `${color}22`,
                  color,
                  border: `1px solid ${color}44`,
                }}
              >
                {label[0]?.toUpperCase() ?? "?"}
              </div>
              <span className="text-xs font-mono text-[#8b949e]">
                No camera
              </span>
            </>
          )}
        </div>
      )}

      {/* Label overlay */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-mono font-semibold" style={{ color }}>
          {label}
        </span>
        {muted && (
          <span className="ml-auto text-xs font-mono text-[#8b949e]">
            🔇
          </span>
        )}
      </div>
    </div>
  );
}