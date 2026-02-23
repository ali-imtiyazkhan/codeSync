"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "../components/ui/TopBar";
import { DiffPanel } from "../components/diff/DiffPanel";
import { VideoPanel } from "../components/video/VideoPanel";
import { useRoomStore } from "../store/roomStore";
import { useWebSocket } from "../lib/useSocket";
import { useWebRTC } from "../lib/useWebRTC";

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

    const [language, setLanguage] = useState("javascript");

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

    const { localStream, remoteStream, callStatus, startCall } =
        useWebRTC(socket, userId, isOwner);

    useEffect(() => {
        if (socket && myRole !== null) {
            startCall();
        }
    }, [socket, myRole]);

    // OWNER typing → broadcast
    const handleOwnerCodeChange = useCallback((code: string) => {
        setMyCode(code);
        if (socket && isOwner) {
            socket.emit("owner-code-change", { roomId, code });
        }
    }, [socket, roomId, isOwner, setMyCode]);

    // EDITOR typing → propose change
    const handleEditorCodeChange = useCallback((code: string) => {
        setFriendCode(code);
        if (socket && !isOwner) {
            socket.emit("propose-change", {
                roomId,
                newCode: code,   // ✅ NEW FLOW
            });
        }
    }, [socket, roomId, isOwner, setFriendCode]);

    // OWNER accepts proposal
    const handleAcceptChange = useCallback(() => {
        if (!pendingChange || !socket) return;

        setMyCode(pendingChange.code);

        socket.emit("accept-change", {
            roomId,
            newCode: pendingChange.code,
        });

        clearPendingChange();
    }, [pendingChange, socket, roomId, setMyCode, clearPendingChange]);

    const handleRejectChange = useCallback(() => {
        if (!socket) return;
        socket.emit("reject-change", { roomId });
        clearPendingChange();
    }, [socket, roomId, clearPendingChange]);

    const ownerUser = isOwner ? myUser : friendUser;
    const editorUser = isOwner ? friendUser : myUser;

    const ownerLabel = ownerUser?.name ?? "Owner";
    const editorLabel = editorUser?.name ?? "Waiting...";
    const ownerColor = ownerUser?.color ?? "#58a6ff";
    const editorColor = editorUser?.color ?? "#3fb950";

    const friendConnected = !!friendUser;

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-white overflow-hidden">

            <TopBar
                roomId={roomId}
                connected={connected}
                user={myUser ?? { id: userId, name: userName }}
            />

            {/* Pending Proposal */}
            {pendingChange && isOwner && (
                <DiffPanel
                    original={myCode}
                    modified={pendingChange.code}
                    authorName={pendingChange.fromName}
                    onAccept={handleAcceptChange}
                    onReject={handleRejectChange}
                />
            )}

            <div className="flex flex-1 overflow-hidden">

                {/* OWNER PANEL */}
                <div className="flex flex-col w-1/2 border-r border-[#30363d] min-h-0">

                    <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ownerColor }} />
                        <span className="text-sm font-mono font-semibold" style={{ color: ownerColor }}>
                            {ownerLabel}
                        </span>
                    </div>

                    <VideoPanel
                        stream={isOwner ? localStream : remoteStream}
                        label={ownerLabel}
                        color={ownerColor}
                        muted={isOwner}
                        callStatus={isOwner ? callStatus : undefined}
                    />

                    <div className="flex-1 overflow-hidden">
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

                {/* EDITOR PANEL */}
                <div className="flex flex-col w-1/2 min-h-0">

                    <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: editorColor }} />
                        <span className="text-sm font-mono font-semibold" style={{ color: editorColor }}>
                            {editorLabel}
                        </span>
                    </div>

                    {friendConnected ? (
                        <>
                            <VideoPanel
                                stream={isOwner ? remoteStream : localStream}
                                label={editorLabel}
                                color={editorColor}
                                muted={!isOwner}
                                callStatus={!isOwner ? callStatus : undefined}
                            />

                            <div className="flex-1 overflow-hidden">
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
                        <div className="flex-1 flex items-center justify-center">
                            Waiting for friend...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}