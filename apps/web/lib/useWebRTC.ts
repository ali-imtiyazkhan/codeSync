"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { Socket } from "socket.io-client";

export function useWebRTC(
  socket: Socket | null,
  userId: string,
  isOwner: boolean,
) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<
    "idle" | "calling" | "connected" | "failed"
  >("idle");

  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
  }, []);

  const createPeer = useCallback(
    (stream: MediaStream, initiator: boolean) => {
      if (!socket) return;

      destroyPeer();

      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        },
      });

      peerRef.current = peer;

      peer.on("signal", (data) => {
        socket.emit("webrtc-signal", { signal: data, userId });
      });

      peer.on("stream", (remoteStr) => {
        setRemoteStream(remoteStr);
        setCallStatus("connected");
      });

      peer.on("connect", () => {
        setCallStatus("connected");
      });

      peer.on("error", (err) => {
        console.warn("WebRTC peer error:", err);
        setCallStatus("failed");
      });

      peer.on("close", () => {
        setRemoteStream(null);
        setCallStatus("idle");
      });
    },
    [socket, userId, destroyPeer],
  );

  const startCall = useCallback(async () => {
    if (!socket) return;

    try {
      setCallStatus("calling");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 180, facingMode: "user" },
        audio: true,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Owner initiates, editor waits for signal then responds
      createPeer(stream, isOwner);
    } catch (err) {
      console.warn("Camera/mic unavailable:", err);
      setCallStatus("failed");
    }
  }, [socket, isOwner, createPeer]);

  // Listen for incoming WebRTC signals
  useEffect(() => {
    if (!socket) return;

    const handleSignal = (data: {
      signal: SimplePeer.SignalData;
      userId: string;
    }) => {
      if (!peerRef.current && localStreamRef.current) {
        createPeer(localStreamRef.current, false);
      }

      if (peerRef.current && !peerRef.current.destroyed) {
        try {
          peerRef.current.signal(data.signal);
        } catch (e) {
          console.warn("Signal error:", e);
        }
      }
    };

    socket.on("webrtc-signal", handleSignal);

    // ✅ FIXED CLEANUP (must return void)
    return () => {
      socket.off("webrtc-signal", handleSignal);
    };
  }, [socket, createPeer]);

  // When a new user joins the room, owner re-initiates the call
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = () => {
      if (isOwner && localStreamRef.current) {
        createPeer(localStreamRef.current, true);
      }
    };

    socket.on("user-joined", handleUserJoined);

    // ✅ FIXED CLEANUP (must return void)
    return () => {
      socket.off("user-joined", handleUserJoined);
    };
  }, [socket, isOwner, createPeer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyPeer();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [destroyPeer]);

  return { localStream, remoteStream, callStatus, startCall };
}