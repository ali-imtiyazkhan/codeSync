"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useRoomStore } from "../store/roomStore";
import type { RoomUser } from "../store/roomStore";
import type { PendingChange } from "@codesync/socket-types";

export function useWebSocket(roomId: string, userId: string, userName: string, token?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const {
    setPendingChange,
    setMyCode,
    setFriendCode,
    setMyRole,
    setMyUser,
    setFriendUser,
    setUsers,
  } = useRoomStore();

  useEffect(() => {
    if (!roomId || !userId) return;

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

    const sock = io(WS_URL, {
      query: { roomId, userId, userName, token },
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = sock;
    setSocket(sock);

    sock.on("connect", () => {
      setConnected(true);
      sock.emit("join-room", { roomId, userId, userName });
    });

    sock.on("disconnect", () => {
      setConnected(false);
    });

    sock.on("reconnect", () => {
      setConnected(true);
      sock.emit("join-room", { roomId, userId, userName });
    });

    sock.on(
      "role-assigned",
      (data: { role: "owner" | "editor"; user: RoomUser }) => {
        setMyRole(data.role);
        setMyUser(data.user);
      },
    );

    sock.on("room-users", (data: { users: RoomUser[] }) => {
      setUsers(data.users);

      const friend = data.users.find((u) => u.id !== userId) ?? null;
      setFriendUser(friend);
    });
    sock.on("change-proposed", (data: PendingChange) => {
      setPendingChange(data);
    });

    // Owner accepted → sync code everywhere
    sock.on("change-accepted", (data: { newCode: string }) => {
      setMyCode(data.newCode);
      setFriendCode(""); // Clear local editor proposal
      setPendingChange(null); // Clear banner if it was showing
    });

    // Owner rejected → clear local proposal
    sock.on("change-rejected", () => {
      setFriendCode("");
      setPendingChange(null); // Clear banner if it was showing
    });

    // Owner's code changed (VS Code push or owner typed) → update owner editor
    sock.on("owner-code-update", (data: { code: string }) => {
      setMyCode(data.code);
    });

    // Friend/editor's code changed (for read-only view in owner panel)
    sock.on("editor-code-update", (data: { code: string }) => {
      setFriendCode(data.code);
    });

    // VS Code pushed code to owner
    sock.on("vscode-push", (data: { code: string }) => {
      setMyCode(data.code);
    });

    return () => {
      sock.disconnect();
      socketRef.current = null;
    };
  }, [roomId, userId, userName]);

  return { socket, connected };
}
