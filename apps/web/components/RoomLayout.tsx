"use client";

import { useState, useEffect } from "react";
import { VideoPanel } from "../components/video/VideoPanel";
import { EditorPanel } from "../components/editor/EditorPanel";
import { DiffPanel } from "../components/diff/DiffPanel";
import { TopBar } from "../components/ui/TopBar";
import { useRoomStore } from "../store/roomStore";
import { useWebSocket } from "../lib/useSocket";
import { useWebRTC } from "../lib/useWebRTC";

interface RoomLayoutProps {
    roomId: string;
}

// Simulated current user — replace with NextAuth session later
const ME = { id: "user-1", name: "You", color: "#58a6ff" };
const FRIEND = { id: "user-2", name: "Friend", color: "#3fb950" };

export function RoomLayout({ roomId }: RoomLayoutProps) {
    const [activeTab, setActiveTab] = useState<"me" | "friend">("me");
    const { pendingChange, myCode, setMyCode } = useRoomStore();
    const { socket, connected } = useWebSocket(roomId, ME.id);
    const { localStream, remoteStream, startCall } = useWebRTC(socket, ME.id);

    useEffect(() => {
        if (socket) startCall();
    }, [socket]);

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-white overflow-hidden">
            {/* Top Bar */}
            <TopBar roomId={roomId} connected={connected} user={ME} />

            {/* Pending Diff Banner */}
            {pendingChange && (
                <DiffPanel
                    original={pendingChange.original}
                    modified={pendingChange.newCode}
                    authorName={FRIEND.name}
                    onAccept={() => {
                        setMyCode(pendingChange.newCode);
                        useRoomStore.getState().clearPendingChange();
                    }}
                    onReject={() => useRoomStore.getState().clearPendingChange()}
                />
            )}

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: MY PANEL */}
                <div className="flex flex-col w-1/2 border-r border-[#30363d]">
                    {/* Tab Header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                        <div className="w-2 h-2 rounded-full bg-[#58a6ff]" />
                        <span className="text-sm font-mono font-semibold text-[#58a6ff]">
                            {ME.name}
                        </span>
                        <span className="ml-auto text-xs text-[#8b949e]">Owner</span>
                    </div>

                    {/* Video */}
                    <VideoPanel
                        stream={localStream}
                        label={ME.name}
                        color={ME.color}
                        muted={true}
                    />

                    {/* Editor */}
                    <div className="flex-1 overflow-hidden">
                        <EditorPanel
                            roomId={roomId}
                            userId={ME.id}
                            role="owner"
                            value={myCode}
                            onChange={setMyCode}
                            socket={socket}
                        />
                    </div>
                </div>

                {/* Right: FRIEND PANEL */}
                <div className="flex flex-col w-1/2">
                    {/* Tab Header */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                        <div className="w-2 h-2 rounded-full bg-[#3fb950]" />
                        <span className="text-sm font-mono font-semibold text-[#3fb950]">
                            {FRIEND.name}
                        </span>
                        <span className="ml-auto text-xs text-[#8b949e]">Editor</span>
                    </div>

                    {/* Video */}
                    <VideoPanel
                        stream={remoteStream}
                        label={FRIEND.name}
                        color={FRIEND.color}
                        muted={false}
                    />

                    {/* Editor */}
                    <div className="flex-1 overflow-hidden">
                        <EditorPanel
                            roomId={roomId}
                            userId={FRIEND.id}
                            role="editor"
                            value={myCode}
                            onChange={() => { }}
                            socket={socket}
                            readOnly={false}
                            isFriendPanel={true}
                        />
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center gap-4 px-4 py-1 bg-[#1f2937] border-t border-[#30363d] text-xs text-[#8b949e] font-mono">
                <span className={connected ? "text-[#3fb950]" : "text-[#f85149]"}>
                    ● {connected ? "Connected" : "Disconnected"}
                </span>
                <span>Room: {roomId}</span>
                <span className="ml-auto">ColabCode v1.0</span>
            </div>
        </div>
    );
}