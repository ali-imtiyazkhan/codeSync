"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const VideoRoomPage = dynamic(
  () => import("../../../components/videoRoomPage").then((m) => m.VideoRoomPage),
  { ssr: false }
);

interface PageProps {
  params: { roomId: string };
}

function getOrCreate(key: string, factory: () => string): string {
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const val = factory();
  sessionStorage.setItem(key, val);
  return val;
}

export default function RoomPage({ params }: PageProps) {
  const { roomId } = params;
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getOrCreate("codesync-user-id", () => `user-${Math.random().toString(36).slice(2, 10)}`));
    setUserName(
      getOrCreate("codesync-user-name", () => {
        const adj = ["Swift", "Bright", "Calm", "Cool", "Bold", "Sharp", "Quick"];
        const noun = ["Coder", "Hacker", "Dev", "Builder", "Wizard"];
        return adj[Math.floor(Math.random() * adj.length)]! + noun[Math.floor(Math.random() * noun.length)]!;
      })
    );
  }, []);

  if (!userId || !userName) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#070a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#30363d] border-t-[#58a6ff] animate-spin" />
          <span className="text-[#8b949e] font-mono text-sm">Joining room...</span>
        </div>
      </div>
    );
  }

  return <VideoRoomPage roomId={roomId} userId={userId} userName={userName} />;
}