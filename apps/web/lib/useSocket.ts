"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@codesync/socket-types";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const socketRef = useRef<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: AppSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
      { transports: ["websocket"] },
    );
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, connected };
}
