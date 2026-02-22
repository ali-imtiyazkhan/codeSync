"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@codesync/socket-types";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface PeerStreams {
  camera?: MediaStream;
  screen?: MediaStream;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC(
  socket: AppSocket | null,
  roomId: string,
  localStream: MediaStream | null,
  localScreenStream: MediaStream | null,
) {
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
        const existing = next.get(peerId) ?? {};
        if (stream) {
          next.set(peerId, { ...existing, [type]: stream });
        } else {
          const updated = { ...existing };
          delete updated[type];
          Object.keys(updated).length === 0
            ? next.delete(peerId)
            : next.set(peerId, updated);
        }
        return next;
      });
    },
    [],
  );

  const createPC = useCallback(
    (peerId: string, type: "camera" | "screen"): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit("webrtc:ice-candidate", {
            to: peerId,
            candidate: e.candidate.toJSON(),
            streamType: type,
          });
        }
      };

      pc.ontrack = (e) => {
        if (e.streams[0]) updatePeerStream(peerId, type, e.streams[0]);
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          updatePeerStream(peerId, type, undefined);
        }
      };

      (type === "camera" ? cameraPCs : screenPCs).current.set(peerId, pc);
      return pc;
    },
    [socket, updatePeerStream],
  );

  const callPeer = useCallback(
    async (peerId: string, fromName: string) => {
      if (!socket || !localStream) return;
      const pc = createPC(peerId, "camera");
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", {
        to: peerId,
        offer,
        fromName,
        streamType: "camera",
      });
    },
    [socket, localStream, createPC],
  );

  const shareScreenToPeer = useCallback(
    async (peerId: string, stream: MediaStream) => {
      if (!socket) return;
      screenPCs.current.get(peerId)?.close();
      screenPCs.current.delete(peerId);
      const pc = createPC(peerId, "screen");
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", {
        to: peerId,
        offer,
        fromName: "",
        streamType: "screen",
      });
    },
    [socket, createPC],
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
      const pc = createPC(from, streamType);
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
      const pc = (streamType === "camera" ? cameraPCs : screenPCs).current.get(
        from,
      );
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const onIce = async ({
      from,
      candidate,
      streamType,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
      streamType: "camera" | "screen";
    }) => {
      const pc = (streamType === "camera" ? cameraPCs : screenPCs).current.get(
        from,
      );
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
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
    socket.on("webrtc:ice-candidate", onIce);
    socket.on("room:user-left", onUserLeft);

    return () => {
      socket.off("webrtc:offer", onOffer);
      socket.off("webrtc:answer", onAnswer);
      socket.off("webrtc:ice-candidate", onIce);
      socket.off("room:user-left", onUserLeft);
    };
  }, [socket, localStream, createPC, updatePeerStream]);

  // Push screen share to all existing peers
  useEffect(() => {
    if (!localScreenStream || !socket) return;
    cameraPCs.current.forEach((_, peerId) =>
      shareScreenToPeer(peerId, localScreenStream),
    );
    socket.emit("webrtc:screen-started", { roomId });
    return () => {
      socket.emit("webrtc:screen-stopped", { roomId });
    };
  }, [localScreenStream, socket, roomId, shareScreenToPeer]);

  return { peerStreams, callPeer, shareScreenToPeer };
}
