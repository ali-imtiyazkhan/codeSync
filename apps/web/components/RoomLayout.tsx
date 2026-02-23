"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "../components/ui/TopBar";
import { DiffPanel } from "../components/diff/DiffPanel";
import { VideoPanel } from "../components/video/VideoPanel";
import { useRoomStore } from "../store/roomStore";
import { useWebSocket } from "../lib/useSocket";
import { useWebRTC } from "../lib/useWebRTC";

// ⚠️  Update this path to match wherever your CodeEditorPanel lives
const CodeEditorPanel = dynamic(() => import("../components/CodeEditorPanel"), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
            <span className="text-[#8b949e] font-mono text-sm animate-pulse">
                Loading editor...
            </span>
        </div>
    ),
});

interface RoomLayoutProps {
    roomId: string;
    userId: string;
    userName: string;
}

export function RoomLayout({ roomId, userId, userName }: RoomLayoutProps) {
    const [language] = useState("javascript");

    const {
        myCode,
        friendCode,
        pendingChange,
        myRole,
        myUser,
        friendUser,
        setMyCode,
        setFriendCode,
        clearPendingChange,
    } = useRoomStore();

    const { socket, connected } = useWebSocket(roomId, userId, userName);
    const isOwner = myRole === "owner";

    const {
        // Camera / mic
        localStream,
        remoteStream,
        callStatus,
        startCall,
        toggleCamera,
        toggleMic,
        isCameraOn,
        isMicOn,
        // Screen share
        localScreenStream,
        remoteScreenStream,
        screenShareState,
        startScreenShare,
        stopScreenShare,
    } = useWebRTC(socket, userId, isOwner);

    // Start WebRTC once socket is ready and role is assigned
    useEffect(() => {
        if (socket && myRole !== null) {
            startCall();
        }
    }, [socket, myRole]);

    // ── Code sync ──────────────────────────────────────────────────────────

    // Owner typing → broadcast live to friend's read-only editor
    const handleOwnerCodeChange = useCallback(
        (code: string) => {
            setMyCode(code);
            if (socket && isOwner) {
                socket.emit("owner-code-change", { roomId, code });
            }
        },
        [socket, roomId, isOwner, setMyCode]
    );

    // Editor typing → propose a change (owner sees diff banner)
    const handleEditorCodeChange = useCallback(
        (code: string) => {
            setFriendCode(code);
            if (socket && !isOwner) {
                socket.emit("propose-change", {
                    roomId,
                    newCode: code,
                });
            }
        },
        [socket, roomId, isOwner, setFriendCode]
    );

    // Owner accepts the proposed diff
    const handleAcceptChange = useCallback(() => {
        if (!pendingChange || !socket) return;
        setMyCode(pendingChange.code);
        socket.emit("accept-change", { roomId, newCode: pendingChange.code });
        clearPendingChange();
    }, [pendingChange, socket, roomId, setMyCode, clearPendingChange]);

    // Owner rejects the proposed diff
    const handleRejectChange = useCallback(() => {
        socket?.emit("reject-change", { roomId });
        clearPendingChange();
    }, [socket, roomId, clearPendingChange]);

    // ── Derived display values ─────────────────────────────────────────────

    const ownerUser = isOwner ? myUser : friendUser;
    const editorUser = isOwner ? friendUser : myUser;

    const ownerLabel = ownerUser?.name ?? "Owner";
    const editorLabel = editorUser?.name ?? "Waiting...";
    const ownerColor = ownerUser?.color ?? "#58a6ff";
    const editorColor = editorUser?.color ?? "#3fb950";

    const friendConnected = !!friendUser;

    // ── Screen share stream routing ────────────────────────────────────────
    // "sharing" = I am sending my screen  → show localScreenStream in MY panel
    // "viewing" = friend is sending       → show remoteScreenStream in FRIEND panel
    const myScreenStream = screenShareState === "sharing" ? localScreenStream : null;
    const friendScreenStream = screenShareState === "viewing" ? remoteScreenStream : null;
    const friendScreenState = screenShareState === "viewing" ? "viewing" : ("inactive" as const);

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-white overflow-hidden">

            {/* ── Top Bar ── */}
            <TopBar
                roomId={roomId}
                connected={connected}
                user={myUser ?? { id: userId, name: userName }}
            />

            {/* Diff Banner only owner sees this */}
            {pendingChange && isOwner && (
                <DiffPanel
                    original={myCode}
                    modified={pendingChange.code}
                    authorName={editorLabel}
                    onAccept={handleAcceptChange}
                    onReject={handleRejectChange}
                />
            )}

            {/* ── Main split layout ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ════ LEFT: OWNER PANEL ════ */}
                <div className="flex flex-col w-1/2 border-r border-[#30363d] min-h-0">

                    <PanelHeader
                        label={ownerLabel}
                        color={ownerColor}
                        badge="Owner"
                        badgeColor="#58a6ff"
                        isYou={isOwner}
                    />

                    <VideoPanel
                        // Camera
                        stream={isOwner ? localStream : remoteStream}
                        label={ownerLabel}
                        color={ownerColor}
                        muted={isOwner}
                        callStatus={isOwner ? callStatus : undefined}
                        // Screen share
                        screenStream={isOwner ? myScreenStream : friendScreenStream}
                        screenShareState={isOwner ? screenShareState : friendScreenState}
                        // Controls: only shown on YOUR panel
                        isLocalPanel={isOwner}
                        isCameraOn={isCameraOn}
                        isMicOn={isMicOn}
                        onToggleCamera={toggleCamera}
                        onToggleMic={toggleMic}
                        onStartScreenShare={startScreenShare}
                        onStopScreenShare={stopScreenShare}
                    />

                    <div className="flex-1 min-h-0 overflow-hidden">
                        <CodeEditorPanel
                            code={myCode}
                            language={language}
                            fileName="main.js"
                            onChange={isOwner ? handleOwnerCodeChange : () => { }}
                            readOnly={!isOwner}
                            socket={socket}
                            roomId={roomId}
                            pendingChanges={pendingChange ? [pendingChange] : []}
                        />
                    </div>
                </div>

                {/* ════ RIGHT: EDITOR / FRIEND PANEL ════ */}
                <div className="flex flex-col w-1/2 min-h-0">

                    <PanelHeader
                        label={editorLabel}
                        color={friendConnected ? editorColor : "#8b949e"}
                        badge="Editor"
                        badgeColor="#3fb950"
                        isYou={!isOwner}
                        dimmed={!friendConnected}
                    />

                    {friendConnected ? (
                        <>
                            <VideoPanel
                                // Camera
                                stream={isOwner ? remoteStream : localStream}
                                label={editorLabel}
                                color={editorColor}
                                muted={!isOwner}
                                callStatus={!isOwner ? callStatus : undefined}
                                // Screen share (flipped from owner's perspective)
                                screenStream={!isOwner ? myScreenStream : friendScreenStream}
                                screenShareState={!isOwner ? screenShareState : friendScreenState}
                                // Controls: only when YOU are the editor
                                isLocalPanel={!isOwner}
                                isCameraOn={isCameraOn}
                                isMicOn={isMicOn}
                                onToggleCamera={toggleCamera}
                                onToggleMic={toggleMic}
                                onStartScreenShare={startScreenShare}
                                onStopScreenShare={stopScreenShare}
                            />

                            <div className="flex-1 min-h-0 overflow-hidden">
                                <CodeEditorPanel
                                    code={isOwner ? friendCode : myCode}
                                    language={language}
                                    fileName="main.js"
                                    onChange={!isOwner ? handleEditorCodeChange : () => { }}
                                    readOnly={isOwner}
                                    socket={socket}
                                    roomId={roomId}
                                    pendingChanges={[]}
                                />
                            </div>
                        </>
                    ) : (
                        <WaitingForFriend />
                    )}
                </div>
            </div>

            {/* ── Status Bar ── */}
            <div className="flex items-center gap-4 px-4 py-1 bg-[#161b22] border-t border-[#30363d] text-xs font-mono flex-shrink-0">
                <span className={connected ? "text-[#3fb950]" : "text-[#f85149]"}>
                    ● {connected ? "Connected" : "Disconnected"}
                </span>
                <span className="text-[#8b949e]">Room: {(roomId ?? "").slice(0, 12)}...</span>
                <span>
                    Role:{" "}
                    <span className={isOwner ? "text-[#58a6ff]" : "text-[#3fb950]"}>
                        {myRole ?? "assigning..."}
                    </span>
                </span>
                {callStatus === "connected" && (
                    <span className="text-[#3fb950]">🎥 Video live</span>
                )}
                {screenShareState === "sharing" && (
                    <span className="text-[#f85149]">🖥️ You are sharing</span>
                )}
                {screenShareState === "viewing" && (
                    <span className="text-[#58a6ff]">🖥️ Viewing screen</span>
                )}
                <span className="ml-auto text-[#8b949e]">ColabCode v1.0</span>
            </div>
        </div>
    );
}

// ── Shared sub-components ───────────────────────────────────────────────────

function PanelHeader({
    label,
    color,
    badge,
    badgeColor,
    isYou,
    dimmed = false,
}: {
    label: string;
    color: string;
    badge: string;
    badgeColor: string;
    isYou: boolean;
    dimmed?: boolean;
}) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex-shrink-0">
            <div
                className={`w-2 h-2 rounded-full transition-opacity ${dimmed ? "opacity-30" : "animate-pulse"}`}
                style={{ backgroundColor: color }}
            />
            <span className="text-sm font-mono font-semibold" style={{ color }}>
                {label}
            </span>
            <span
                className="ml-auto text-xs font-mono px-2 py-0.5 rounded border"
                style={{
                    color: badgeColor,
                    backgroundColor: `${badgeColor}18`,
                    borderColor: `${badgeColor}30`,
                }}
            >
                {badge}
            </span>
            {isYou && (
                <span className="text-xs font-mono text-[#8b949e]">← You</span>
            )}
        </div>
    );
}

function WaitingForFriend() {
    return (
        <div className="flex-1 flex items-center justify-center bg-[#0d1117]">
            <div className="flex flex-col items-center gap-3 text-center px-8">
                <div className="w-10 h-10 rounded-full border-2 border-[#30363d] border-t-[#3fb950] animate-spin" />
                <span className="text-sm font-mono text-[#8b949e]">
                    Waiting for friend to join...
                </span>
                <span className="text-xs font-mono text-[#484f58]">
                    Share the invite link from the top bar
                </span>
            </div>
        </div>
    );
}