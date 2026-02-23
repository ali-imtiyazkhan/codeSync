"use client";

import { useState, useCallback, useRef } from "react";

export function useMediaDevices() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] =
    useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 180, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      setLocalStream(stream);
      setCameraOn(true);
      setMicOn(true);
      return stream;
    } catch (err) {
      console.warn("Camera access denied:", err);
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLocalStream(null);
    setCameraOn(false);
    setMicOn(false);
  }, []);

  const toggleCamera = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }, []);

  const toggleMic = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, []);

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
      console.warn("Screen share denied:", err);
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
