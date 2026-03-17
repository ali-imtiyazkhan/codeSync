"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [backendToken, setBackendToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      setUserId((session.user as any).id || `user-${Math.random().toString(36).slice(2, 10)}`);
      setUserName(session.user.name || "SwiftCoder");
      setBackendToken((session.user as any).backendToken);
    } else {
      setUserId(getOrCreate("codesync-user-id", () => `user-${Math.random().toString(36).slice(2, 10)}`));
      setUserName(
        getOrCreate("codesync-user-name", () => {
          const adj = ["Swift", "Bright", "Calm", "Cool", "Bold", "Sharp", "Quick"];
          const noun = ["Coder", "Hacker", "Dev", "Builder", "Wizard"];
          return adj[Math.floor(Math.random() * adj.length)]! + noun[Math.floor(Math.random() * noun.length)]!;
        })
      );
    }
  }, [session, status]);

  if (status === "loading" || !userId || !userName) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: '#262624' }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: '#333330', borderTopColor: '#58a6ff' }}
          />
          <span className="font-mono text-sm" style={{ color: '#6b6b68' }}>{status === "loading" ? "Checking session..." : "Joining room..."}</span>
        </div>
      </div>
    );
  }

  return <VideoRoomPage roomId={roomId} userId={userId} userName={userName} backendToken={backendToken} />;
}