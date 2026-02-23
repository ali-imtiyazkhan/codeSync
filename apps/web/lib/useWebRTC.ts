"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SimplePeer from "simple-peer";
import { Socket } from "socket.io-client";

export type CallStatus = "idle" | "calling" | "connected" | "failed";
export type ScreenShareState = "inactive" | "sharing" | "viewing";

export function useWebRTC(
  socket: Socket | null,
  userId: string,
  isOwner: boolean,
) {
  // ── Camera state ───────────────────────────────────────────────────────
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // ── Screen share state ─────────────────────────────────────────────────
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [remoteScreenStream, setRemoteScreenStream] =
    useState<MediaStream | null>(null);
  const [screenShareState, setScreenShareState] =
    useState<ScreenShareState>("inactive");

  // ── Refs ───────────────────────────────────────────────────────────────
  const cameraPeerRef = useRef<SimplePeer.Instance | null>(null);
  const screenPeerRef = useRef<SimplePeer.Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localScreenRef = useRef<MediaStream | null>(null);

  const ICE = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const destroyPeer = useCallback(
    (ref: React.MutableRefObject<SimplePeer.Instance | null>) => {
      if (ref.current && !ref.current.destroyed) {
        ref.current.destroy();
      }
      ref.current = null;
    },
    [],
  );

  // ── Camera peer ────────────────────────────────────────────────────────
  const createCameraPeer = useCallback(
    (stream: MediaStream, initiator: boolean) => {
      if (!socket) return;
      destroyPeer(cameraPeerRef);

      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream,
        config: ICE,
      });
      cameraPeerRef.current = peer;

      peer.on("signal", (data) =>
        socket.emit("webrtc-signal", { signal: data, userId, kind: "camera" }),
      );
      peer.on("stream", (remote) => {
        setRemoteStream(remote);
        setCallStatus("connected");
      });
      peer.on("connect", () => setCallStatus("connected"));
      peer.on("error", (err) => {
        console.warn("Camera peer error:", err);
        setCallStatus("failed");
      });
      peer.on("close", () => {
        setRemoteStream(null);
        setCallStatus("idle");
      });
    },
    [socket, userId, destroyPeer],
  );

  // ── Screen share peer (sender) ─────────────────────────────────────────
  const createScreenSenderPeer = useCallback(
    (stream: MediaStream) => {
      if (!socket) return;
      destroyPeer(screenPeerRef);

      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream,
        config: ICE,
      });
      screenPeerRef.current = peer;

      peer.on("signal", (data) =>
        socket.emit("webrtc-signal", { signal: data, userId, kind: "screen" }),
      );
      peer.on("error", (err) => console.warn("Screen sender error:", err));
      peer.on("close", () => {
        setLocalScreenStream(null);
        setScreenShareState("inactive");
      });
    },
    [socket, userId, destroyPeer],
  );

  // ── Screen share peer (receiver) ───────────────────────────────────────
  const createScreenReceiverPeer = useCallback(() => {
    if (!socket) return;
    destroyPeer(screenPeerRef);

    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      config: ICE,
    });
    screenPeerRef.current = peer;

    peer.on("signal", (data) =>
      socket.emit("webrtc-signal", { signal: data, userId, kind: "screen" }),
    );
    peer.on("stream", (remote) => {
      setRemoteScreenStream(remote);
      setScreenShareState("viewing");
    });
    peer.on("error", (err) => console.warn("Screen receiver error:", err));
    peer.on("close", () => {
      setRemoteScreenStream(null);
      setScreenShareState("inactive");
    });

    return peer;
  }, [socket, userId, destroyPeer]);

  // ── Start camera call ──────────────────────────────────────────────────
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
      createCameraPeer(stream, isOwner);
    } catch (err) {
      console.warn("Camera/mic unavailable:", err);
      setCallStatus("failed");
    }
  }, [socket, isOwner, createCameraPeer]);

  // ── Start screen share ─────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    if (!socket || screenShareState === "viewing") return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 } as MediaTrackConstraints,
        audio: false,
      });

      localScreenRef.current = stream;
      setLocalScreenStream(stream);
      setScreenShareState("sharing");

      // Notify other peer that we're about to send a screen stream
      socket.emit("screen-share-start", { userId });

      // Create sender peer
      createScreenSenderPeer(stream);

      // Browser stop-sharing button handler
      stream.getVideoTracks()[0]!.onended = () => stopScreenShare();
    } catch (err) {
      console.warn("Screen share denied:", err);
    }
  }, [socket, userId, screenShareState, createScreenSenderPeer]);

  // ── Stop screen share ──────────────────────────────────────────────────
  const stopScreenShare = useCallback(() => {
    localScreenRef.current?.getTracks().forEach((t) => t.stop());
    localScreenRef.current = null;
    setLocalScreenStream(null);
    setScreenShareState("inactive");
    destroyPeer(screenPeerRef);
    socket?.emit("screen-share-stop", { userId });
  }, [socket, userId, destroyPeer]);

  // ── Toggle camera / mic ────────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
    }
  }, []);

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    }
  }, []);

  // ── Incoming WebRTC signals ────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleSignal = (data: {
      signal: SimplePeer.SignalData;
      userId: string;
      kind: "camera" | "screen";
    }) => {
      if (data.kind === "camera") {
        // Editor creates peer on first signal
        if (!cameraPeerRef.current && localStreamRef.current) {
          createCameraPeer(localStreamRef.current, false);
        }
        if (cameraPeerRef.current && !cameraPeerRef.current.destroyed) {
          try {
            cameraPeerRef.current.signal(data.signal);
          } catch (e) {
            console.warn(e);
          }
        }
      }

      if (data.kind === "screen") {
        // First signal for screen → we're the receiver, create peer
        if (!screenPeerRef.current) {
          createScreenReceiverPeer();
        }
        if (screenPeerRef.current && !screenPeerRef.current.destroyed) {
          try {
            screenPeerRef.current.signal(data.signal);
          } catch (e) {
            console.warn(e);
          }
        }
      }
    };

    socket.on("webrtc-signal", handleSignal);
    return () => {
      socket.off("webrtc-signal", handleSignal);
    };
  }, [socket, createCameraPeer, createScreenReceiverPeer]);

  // ── Friend screen share events ─────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    // Friend started sharing → we'll receive a screen stream via WebRTC
    socket.on("screen-share-started", () => {
      setScreenShareState("viewing"); // optimistic
    });

    // Friend stopped sharing
    socket.on("screen-share-stopped", () => {
      setRemoteScreenStream(null);
      setScreenShareState("inactive");
      destroyPeer(screenPeerRef);
    });

    return () => {
      socket.off("screen-share-started");
      socket.off("screen-share-stopped");
    };
  }, [socket, destroyPeer]);

  // ── Owner re-initiates camera call when editor joins ───────────────────
  useEffect(() => {
    if (!socket) return;
    const handleUserJoined = () => {
      if (isOwner && localStreamRef.current) {
        createCameraPeer(localStreamRef.current, true);
      }
    };
    socket.on("user-joined", handleUserJoined);
    return () => {
      socket.off("user-joined", handleUserJoined);
    };
  }, [socket, isOwner, createCameraPeer]);

  // ── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      destroyPeer(cameraPeerRef);
      destroyPeer(screenPeerRef);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localScreenRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [destroyPeer]);

  return {
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
  };
}
