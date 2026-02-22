"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRoomStore } from "../store/roomStore";

export function useWebSocket(roomId: string, userId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { setPendingChange, setMyCode } = useRoomStore();

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

    const socket = io(WS_URL, {
      query: { roomId, userId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", { roomId, userId });
    });

    socket.on("disconnect", () => setConnected(false));

    // Friend proposed a change → show diff panel to owner
    socket.on(
      "change-proposed",
      (data: { original: string; newCode: string; authorId: string }) => {
        setPendingChange(data);
      },
    );

    // Owner accepted → update owner's code
    socket.on("change-accepted", (data: { newCode: string }) => {
      setMyCode(data.newCode);
    });

    // VS Code pushed code → update owner editor
    socket.on("vscode-push", (data: { code: string }) => {
      setMyCode(data.code);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId]);

  return { socket: socketRef.current, connected };
}
