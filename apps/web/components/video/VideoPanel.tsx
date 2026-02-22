"use client";

import { useEffect, useRef, useState } from "react";

interface VideoPanelProps {
    stream: MediaStream | null;
    label: string;
    color: string;
    muted: boolean;
}

export function VideoPanel({ stream, label, color, muted }: VideoPanelProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const toggleCam = () => {
        if (stream) {
            stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
            setIsCamOn((prev) => !prev);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
            setIsMicOn((prev) => !prev);
        }
    };

    return (
        <div className="relative h-40 bg-[#161b22] border-b border-[#30363d] overflow-hidden group">
            {/* Video element */}
            {stream && isCamOn ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={muted}
                    className="w-full h-full object-cover"
                />
            ) : (
                /* Camera off placeholder */
                <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold font-mono"
                        style={{ backgroundColor: color + "33", color: color, border: `2px solid ${color}44` }}
                    >
                        {label[0].toUpperCase()}
                    </div>
                </div>
            )}

            {/* Label badge */}
            <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-mono font-semibold"
                style={{ backgroundColor: color + "22", color: color, border: `1px solid ${color}44` }}
            >
                {label}
            </div>

            {/* Controls — show on hover (only for local/muted stream) */}
            {muted && (
                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={toggleMic}
                        title={isMicOn ? "Mute mic" : "Unmute mic"}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${isMicOn
                                ? "bg-[#30363d] hover:bg-[#3d444d] text-white"
                                : "bg-[#f85149] text-white"
                            }`}
                    >
                        {isMicOn ? "🎤" : "🔇"}
                    </button>
                    <button
                        onClick={toggleCam}
                        title={isCamOn ? "Turn off camera" : "Turn on camera"}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${isCamOn
                                ? "bg-[#30363d] hover:bg-[#3d444d] text-white"
                                : "bg-[#f85149] text-white"
                            }`}
                    >
                        {isCamOn ? "📷" : "🚫"}
                    </button>
                </div>
            )}

            {/* No stream indicator */}
            {!stream && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-1"
                            style={{ backgroundColor: color + "22", color, border: `2px solid ${color}33` }}
                        >
                            {label[0]}
                        </div>
                        <p className="text-xs text-[#8b949e] font-mono">Waiting for camera...</p>
                    </div>
                </div>
            )}
        </div>
    );
}