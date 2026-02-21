"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = mode === "create" ? uuidv4().slice(0, 8) : roomId.trim();
    if (!id) return;
    router.push(`/room/${id}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/5 w-96 h-96 rounded-full bg-violet-900/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-900/15 blur-3xl" />
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(124,58,237,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-black mb-2">
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Code
            </span>
            <span className="text-white">Sync</span>
          </h1>
          <p className="text-slate-500 text-sm font-mono">
            Real-time collaborative coding · Video · VS Code sync
          </p>
        </div>

        <div
          className="rounded-2xl p-8 border border-slate-800"
          style={{ background: "rgba(17,17,24,0.95)", backdropFilter: "blur(20px)" }}
        >
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-6">
            {(["create", "join"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-mono transition-all ${
                  mode === m
                    ? "bg-violet-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "create" ? "Create Room" : "Join Room"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2 font-mono">
                Your Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg font-mono text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
                required
              />
            </div>

            {mode === "join" && (
              <div>
                <label className="block text-xs text-slate-500 uppercase tracking-widest mb-2 font-mono">
                  Room ID
                </label>
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. a1b2c3d4"
                  className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg font-mono text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg font-display font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
            >
              {mode === "create" ? "Create & Enter Room →" : "Join Room →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-mono">
              Features
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["📹", "Video Calls"],
                ["🖥️", "Screen Share"],
                ["💻", "VS Code Sync"],
                ["✏️", "Live Editor"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs text-slate-400 font-mono"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
