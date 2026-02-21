"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PendingChange,
  User,
} from "@codesync/socket-types";
import VideoPanel from "../../../components/VideoPanel";
import CodeEditorPanel from "../../../components/CodeEditorPanel";
import PendingChangesBanner from "../../../components/PendingChangesBanner";
import TopBar from "../../../components/TopBar";
import { useMediaDevices } from "../../../lib/useMediaDevices";
import { useWebRTC } from "../../../lib/useWebRTC";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.roomId as string;
  const userName = searchParams.get("name") || "Anonymous";

  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [peers, setPeers] = useState<User[]>([]);
  const [code, setCode] = useState("// Start coding together!\n");
  const [language, setLanguage] = useState("javascript");
  const [fileName, setFileName] = useState("index.js");
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isVsCodeOwner, setIsVsCodeOwner] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const media = useMediaDevices();

  // Initialize socket
  useEffect(() => {
    const sock: AppSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      { transports: ["websocket"] }
    );

    sock.on("connect", () => {
      setConnected(true);
      sock.emit("room:join", { roomId, userName });
    });

    sock.on("disconnect", () => setConnected(false));

    sock.on("room:joined", ({ users }) => {
      setPeers(users);
    });

    sock.on("room:user-joined", (user) => {
      setPeers((prev) => [...prev.filter((p) => p.socketId !== user.socketId), user]);
    });

    sock.on("room:user-left", ({ socketId }) => {
      setPeers((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    sock.on("code:init", ({ code, language, fileName }) => {
      setCode(code);
      setLanguage(language);
      setFileName(fileName);
    });

    sock.on("code:vscode-update", ({ code, language, fileName }) => {
      setCode(code);
      if (language) setLanguage(language);
      if (fileName) setFileName(fileName);
    });

    sock.on("code:pending-change", (change) => {
      setPendingChanges((prev) => [...prev, change]);
    });

    sock.on("code:change-accepted", ({ code }) => {
      setCode(code);
      setPendingChanges([]);
    });

    sock.on("code:change-rejected", ({ code }) => {
      setCode(code);
      setPendingChanges([]);
    });

    // VS Code editor-change sync (non-pending, just updates)
    sock.on("code:editor-change", ({ code }) => {
      setCode(code);
    });

    setSocket(sock);
    return () => { sock.disconnect(); };
  }, [roomId, userName]);

  // WebRTC
  const { peerStreams, callPeer } = useWebRTC(
    socket,
    roomId,
    media.localStream,
    media.localScreenStream
  );

  // Auto-call new peers when camera is on
  useEffect(() => {
    if (!socket || !media.localStream) return;
    socket.on("room:user-joined", (user) => {
      callPeer(user.socketId, userName);
    });
  }, [socket, media.localStream, callPeer, userName]);

  const handleCodeChange = useCallback(
    (newCode: string) => {
      setCode(newCode);
      if (!socket || !roomId) return;
      socket.emit("code:editor-change", {
        roomId,
        code: newCode,
      });
    },
    [socket, roomId]
  );

  const handleAcceptChange = useCallback(
    (change: PendingChange) => {
      if (!socket) return;
      setCode(change.code);
      socket.emit("code:accept-change", {
        roomId,
        changeId: change.id,
        code: change.code,
      });
      setPendingChanges((prev) => prev.filter((c) => c.id !== change.id));
    },
    [socket, roomId]
  );

  const handleRejectChange = useCallback(
    (change: PendingChange) => {
      if (!socket) return;
      socket.emit("code:reject-change", { roomId, changeId: change.id });
      setPendingChanges((prev) => prev.filter((c) => c.id !== change.id));
    },
    [socket, roomId]
  );

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const startCamera = async () => {
    const stream = await media.startCamera();
    if (stream && socket) {
      peers.forEach((peer) => callPeer(peer.socketId, userName));
    }
  };

  // Get first peer's streams
  const firstPeer = peers[0];
  const firstPeerStreams = firstPeer ? peerStreams.get(firstPeer.socketId) : undefined;

  return (
    <div className="h-screen flex flex-col bg-bg overflow-hidden">
      <TopBar
        roomId={roomId}
        userName={userName}
        connected={connected}
        peerCount={peers.length}
        cameraOn={media.cameraOn}
        micOn={media.micOn}
        screenSharing={media.screenSharing}
        onToggleCamera={media.cameraOn ? media.toggleCamera : startCamera}
        onToggleMic={media.toggleMic}
        onToggleScreen={media.screenSharing ? media.stopScreenShare : media.startScreenShare}
        onCopyRoomId={copyRoomId}
        copySuccess={copySuccess}
        pendingCount={pendingChanges.length}
      />

      {/* Pending Changes Banner */}
      {pendingChanges.length > 0 && (
        <PendingChangesBanner
          changes={pendingChanges}
          onAccept={handleAcceptChange}
          onReject={handleRejectChange}
        />
      )}

      {/* Main 5-Panel Grid */}
      <div className="flex-1 overflow-hidden grid grid-cols-3 grid-rows-2 gap-px bg-border">
        {/* Panel 1: My Camera */}
        <VideoPanel
          label="You"
          subLabel={userName}
          stream={media.localStream}
          muted
          cameraOn={media.cameraOn}
          className="bg-panel"
          badge="camera"
          badgeColor="violet"
        />

        {/* Panel 2: Friend's Camera */}
        <VideoPanel
          label={firstPeer?.name || "Waiting for peer..."}
          subLabel="Remote"
          stream={firstPeerStreams?.camera || null}
          className="bg-panel"
          badge="camera"
          badgeColor="cyan"
        />

        {/* Panel 3+4: Code Editor spans 2 rows */}
        <div className="row-span-2 bg-panel flex flex-col overflow-hidden">
          <CodeEditorPanel
            code={code}
            language={language}
            fileName={fileName}
            onChange={handleCodeChange}
            readOnly={false}
            socket={socket}
            roomId={roomId}
            pendingChanges={pendingChanges}
          />
        </div>

        {/* Panel 4: My Screen Share */}
        <VideoPanel
          label="Your Screen"
          subLabel="VS Code / Desktop"
          stream={media.localScreenStream}
          muted
          className="bg-panel"
          badge="screen"
          badgeColor="emerald"
          placeholder={
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-mono">Click "Share Screen" to start</span>
            </div>
          }
        />

        {/* Panel 5: Friend's Screen Share */}
        <VideoPanel
          label={`${firstPeer?.name || "Peer"}'s Screen`}
          subLabel="VS Code / Desktop"
          stream={firstPeerStreams?.screen || null}
          className="bg-panel"
          badge="screen"
          badgeColor="orange"
          placeholder={
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-mono">Waiting for peer screen share...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
