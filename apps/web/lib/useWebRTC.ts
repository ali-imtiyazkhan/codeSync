"use client";

import { useEffect, useRef, useState } from "react";
import SimplePeer from "simple-peer";
import { Socket } from "socket.io-client";

export function useWebRTC(socket: Socket | null, userId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);

  const startCall = async () => {
    if (!socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 160, facingMode: "user" },
        audio: true,
      });
      setLocalStream(stream);

      // Create peer as initiator
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
      });

      peerRef.current = peer;

      // Send signaling data to other peer via socket
      peer.on("signal", (data) => {
        socket.emit("webrtc-signal", { signal: data, userId });
      });

      peer.on("stream", (remoteStr) => {
        setRemoteStream(remoteStr);
      });

      peer.on("error", (err) => {
        console.warn("WebRTC error:", err);
      });

      // Receive signal from other peer
      socket.on("webrtc-signal", (data: { signal: SimplePeer.SignalData }) => {
        if (peer.destroyed) return;
        peer.signal(data.signal);
      });
    } catch (err) {
      console.warn("Camera/mic access denied or unavailable:", err);
      // App still works without video
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      peerRef.current?.destroy();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { localStream, remoteStream, startCall };
}
