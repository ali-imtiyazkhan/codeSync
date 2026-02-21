"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { AppSocket } from "./useSocket";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Add TURN servers here for production:
    // { urls: "turn:your-turn-server.com", username: "user", credential: "pass" }
  ],
};

export interface PeerStreams {
  camera?: MediaStream;
  screen?: MediaStream;
}

export function useWebRTC(
  socket: AppSocket | null,
  roomId: string,
  localStream: MediaStream | null,
  localScreenStream: MediaStream | null,
) {
  // Map of peerId → { camera pc, screen pc }
  const cameraPCs = useRef<Map<string, RTCPeerConnection>>(new Map());
  const screenPCs = useRef<Map<string, RTCPeerConnection>>(new Map());

  const [peerStreams, setPeerStreams] = useState<Map<string, PeerStreams>>(
    new Map(),
  );

  const updatePeerStream = useCallback(
    (
      peerId: string,
      type: "camera" | "screen",
      stream: MediaStream | undefined,
    ) => {
      setPeerStreams((prev) => {
        const next = new Map(prev);
        const existing = next.get(peerId) || {};
        if (stream) {
          next.set(peerId, { ...existing, [type]: stream });
        } else {
          const updated = { ...existing };
          delete updated[type as keyof PeerStreams];
          if (Object.keys(updated).length === 0) next.delete(peerId);
          else next.set(peerId, updated);
        }
        return next;
      });
    },
    [],
  );

  const createPeerConnection = useCallback(
    (peerId: string, type: "camera" | "screen"): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("webrtc:ice-candidate", {
            to: peerId,
            candidate: event.candidate.toJSON(),
            streamType: type,
          });
        }
      };

      pc.ontrack = (event) => {
        if (event.streams[0]) {
          updatePeerStream(peerId, type, event.streams[0]);
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          updatePeerStream(peerId, type, undefined);
        }
      };

      if (type === "camera") cameraPCs.current.set(peerId, pc);
      else screenPCs.current.set(peerId, pc);

      return pc;
    },
    [socket, updatePeerStream],
  );

  // Initiate call to a new peer
  const callPeer = useCallback(
    async (peerId: string, peerName: string) => {
      if (!socket || !localStream) return;

      const pc = createPeerConnection(peerId, "camera");

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc:offer", {
        to: peerId,
        offer,
        fromName: peerName,
        streamType: "camera",
      });
    },
    [socket, localStream, createPeerConnection],
  );

  // Start screen share to peer
  const shareScreenToPeer = useCallback(
    async (peerId: string, screenStream: MediaStream) => {
      if (!socket) return;

      const existing = screenPCs.current.get(peerId);
      if (existing) {
        existing.close();
        screenPCs.current.delete(peerId);
      }

      const pc = createPeerConnection(peerId, "screen");
      screenStream
        .getTracks()
        .forEach((track) => pc.addTrack(track, screenStream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("webrtc:offer", {
        to: peerId,
        offer,
        fromName: "",
        streamType: "screen",
      });
    },
    [socket, createPeerConnection],
  );

  // Handle incoming WebRTC events
  useEffect(() => {
    if (!socket) return;

    const onOffer = async ({
      from,
      fromName,
      offer,
      streamType,
    }: {
      from: string;
      fromName: string;
      offer: RTCSessionDescriptionInit;
      streamType: "camera" | "screen";
    }) => {
      const pc = createPeerConnection(from, streamType);

      if (streamType === "camera" && localStream) {
        localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc:answer", { to: from, answer, streamType });
    };

    const onAnswer = async ({
      from,
      answer,
      streamType,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
      streamType: "camera" | "screen";
    }) => {
      const pc =
        streamType === "camera"
          ? cameraPCs.current.get(from)
          : screenPCs.current.get(from);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const onIceCandidate = async ({
      from,
      candidate,
      streamType,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
      streamType: "camera" | "screen";
    }) => {
      const pc =
        streamType === "camera"
          ? cameraPCs.current.get(from)
          : screenPCs.current.get(from);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const onUserLeft = ({ socketId }: { socketId: string }) => {
      cameraPCs.current.get(socketId)?.close();
      cameraPCs.current.delete(socketId);
      screenPCs.current.get(socketId)?.close();
      screenPCs.current.delete(socketId);
      updatePeerStream(socketId, "camera", undefined);
      updatePeerStream(socketId, "screen", undefined);
    };

    socket.on("webrtc:offer", onOffer);
    socket.on("webrtc:answer", onAnswer);
    socket.on("webrtc:ice-candidate", onIceCandidate);
    socket.on("room:user-left", onUserLeft);

    return () => {
      socket.off("webrtc:offer", onOffer);
      socket.off("webrtc:answer", onAnswer);
      socket.off("webrtc:ice-candidate", onIceCandidate);
      socket.off("room:user-left", onUserLeft);
    };
  }, [socket, localStream, createPeerConnection, updatePeerStream]);

  // When screen share starts, push to all existing peers
  useEffect(() => {
    if (!localScreenStream || !socket) return;

    cameraPCs.current.forEach((_, peerId) => {
      shareScreenToPeer(peerId, localScreenStream);
    });

    socket.emit("webrtc:screen-started", { roomId });

    return () => {
      socket.emit("webrtc:screen-stopped", { roomId });
    };
  }, [localScreenStream, socket, roomId, shareScreenToPeer]);

  return { peerStreams, callPeer, shareScreenToPeer };
}
