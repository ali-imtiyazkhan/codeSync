"use client";

import { useState } from "react";

interface TopBarProps {
    roomId: string;
    connected: boolean;
    user: { id: string; name: string };
}

export function TopBar({ roomId, connected, user }: TopBarProps) {
    const [copied, setCopied] = useState(false);

    const copyInvite = () => {
        const url = `${window.location.origin}/room/${roomId}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] select-none">
            {/* Logo */}
            <div className="flex items-center gap-2 mr-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[#58a6ff] to-[#3fb950] flex items-center justify-center text-xs font-bold text-[#0d1117]">
                    C
                </div>
                <span className="font-mono font-bold text-sm text-white tracking-tight">
                    ColabCode
                </span>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-[#30363d]" />

            {/* Room ID */}
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#8b949e] font-mono">Room:</span>
                <span className="text-xs text-[#58a6ff] font-mono font-semibold tracking-wide">
                    {roomId.slice(0, 8)}...
                </span>
            </div>

            {/* Connection status */}
            <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono ${connected
                        ? "bg-[#3fb95022] text-[#3fb950]"
                        : "bg-[#f8514922] text-[#f85149]"
                    }`}
            >
                <div
                    className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#3fb950] animate-pulse" : "bg-[#f85149]"
                        }`}
                />
                {connected ? "Live" : "Offline"}
            </div>

            <div className="flex-1" />

            {/* Invite button */}
            <button
                onClick={copyInvite}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded border border-[#30363d] text-[#8b949e] hover:border-[#58a6ff] hover:text-[#58a6ff] transition-all"
            >
                {copied ? "✓ Copied!" : "⎘ Copy Invite Link"}
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#58a6ff22] rounded border border-[#58a6ff33]">
                <div className="w-5 h-5 rounded-full bg-[#58a6ff] flex items-center justify-center text-xs font-bold text-[#0d1117]">
                    {user.name[0]}
                </div>
                <span className="text-xs font-mono text-[#58a6ff]">{user.name}</span>
            </div>
        </div>
    );
}