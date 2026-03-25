"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Excalidraw, getSceneVersion } from "@excalidraw/excalidraw";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types/types";
import { Socket } from "socket.io-client";

interface ExcalidrawWrapperProps {
  socket: Socket | null;
  roomId: string;
}

export default function ExcalidrawWrapper({ socket, roomId }: ExcalidrawWrapperProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const lastVersionRef = useRef<number>(0);
  const lastEmitTimeRef = useRef<number>(0);
  const DEBOUNCE_MS = 100;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync incoming updates
  useEffect(() => {
    if (!socket || !excalidrawAPI) return;

    const handleCanvasUpdate = (data: { elements: ExcalidrawElement[]; appState: AppState }) => {
      const remoteVersion = getSceneVersion(data.elements);
      if (remoteVersion > lastVersionRef.current) {
        console.log("[Canvas] Syncing remote update, version:", remoteVersion);
        lastVersionRef.current = remoteVersion;
        excalidrawAPI.updateScene({
          elements: data.elements,
          appState: { ...data.appState },
          commitToHistory: false,
        });
      }
    };

    socket.on("canvas-update", handleCanvasUpdate);
    return () => {
      socket.off("canvas-update", handleCanvasUpdate);
    };
  }, [socket, excalidrawAPI]);

  const onChange = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      if (!socket || !roomId || !excalidrawAPI) {
        return;
      }

      const version = getSceneVersion(elements);
      if (version > lastVersionRef.current) {
        const now = Date.now();
        if (now - lastEmitTimeRef.current < DEBOUNCE_MS) return;
        lastEmitTimeRef.current = now;

        console.log("[Canvas] Emitting local update, version:", version);
        lastVersionRef.current = version;
        socket.emit("canvas-update", {
          roomId,
          elements,
          appState: {
            viewBackgroundColor: appState.viewBackgroundColor,
            currentItemFontFamily: appState.currentItemFontFamily,
            theme: appState.theme,
          },
        });
      }
    },
    [socket, roomId, excalidrawAPI]
  );

  if (!isMounted) return null;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        onChange={onChange}
        theme="dark"
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveAsImage: true,
            toggleTheme: true,
          },
        }}
      />
    </div>
  );
}
