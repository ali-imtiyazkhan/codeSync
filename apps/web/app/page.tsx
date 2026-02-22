"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10);
}

export default function HomePage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");

  const createRoom = () => {
    const id = generateRoomId();
    router.push(`/room/${id}`);
  };

  const joinRoom = () => {
    if (joinId.trim()) router.push(`/room/${joinId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#58a6ff] to-[#3fb950] mb-4 shadow-lg shadow-[#58a6ff33]">
            <span className="text-2xl font-bold text-[#0d1117] font-mono">&lt;/&gt;</span>
          </div>
          <h1 className="text-3xl font-bold font-mono text-white tracking-tight">
            ColabCode
          </h1>
          <p className="text-[#8b949e] text-sm mt-2 font-mono">
            Real-time pair programming with video
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-6">
          {/* Create Room */}
          <div>
            <button
              onClick={createRoom}
              className="w-full py-3 bg-[#58a6ff] hover:bg-[#79b8ff] text-[#0d1117] font-bold font-mono rounded-lg transition-all hover:shadow-lg hover:shadow-[#58a6ff33] text-sm tracking-wide"
            >
              + Create New Room
            </button>
            <p className="text-xs text-[#8b949e] text-center mt-2 font-mono">
              Start a session and invite your friend
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#30363d]" />
            <span className="text-xs text-[#8b949e] font-mono">or join existing</span>
            <div className="flex-1 h-px bg-[#30363d]" />
          </div>

          {/* Join Room */}
          <div className="flex gap-2">
            <input
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
              placeholder="Enter room ID..."
              className="flex-1 px-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm font-mono text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] transition-colors"
            />
            <button
              onClick={joinRoom}
              className="px-4 py-2.5 bg-[#30363d] hover:bg-[#3d444d] text-white font-mono text-sm rounded-lg transition-colors"
            >
              Join →
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "🎥", label: "Video Calls" },
            { icon: "⚡", label: "Live Sync" },
            { icon: "✓", label: "Code Review" },
          ].map((f) => (
            <div key={f.label} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <div className="text-lg mb-1">{f.icon}</div>
              <div className="text-xs text-[#8b949e] font-mono">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}