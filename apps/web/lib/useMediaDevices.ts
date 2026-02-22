"use client";

import { useState, useCallback } from "react";

export function useMediaDevices() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      setLocalStream(stream);
      setCameraOn(true);
      setMicOn(true);
      return stream;
    } catch (err) {
      console.error("Camera access denied:", err);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setCameraOn(false);
    setMicOn(false);
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    const track = localStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    const track = localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, [localStream]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 } as MediaTrackConstraints,
        audio: false,
      });
      stream.getVideoTracks()[0]!.onended = () => {
        setLocalScreenStream(null);
        setScreenSharing(false);
      };
      setLocalScreenStream(stream);
      setScreenSharing(true);
      return stream;
    } catch (err) {
      console.error("Screen share denied:", err);
      return null;
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    localScreenStream?.getTracks().forEach((t) => t.stop());
    setLocalScreenStream(null);
    setScreenSharing(false);
  }, [localScreenStream]);

  return {
    localStream,
    localScreenStream,
    cameraOn,
    micOn,
    screenSharing,
    startCamera,
    stopCamera,
    toggleCamera,
    toggleMic,
    startScreenShare,
    stopScreenShare,
  };
}
