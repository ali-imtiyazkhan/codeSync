"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// RoomLayout uses Monaco - must be client only
const RoomLayout = dynamic(
  () => import("../../../components/RoomLayout").then((m) => m.RoomLayout),
  { ssr: false }
);

interface PageProps {
  params: { roomId: string };
}

// Generates or retrieves a stable userId for this browser session
function getOrCreateUserId(): string {
  const key = "codesync-user-id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const newId = `user-${Math.random().toString(36).slice(2, 10)}`;
  sessionStorage.setItem(key, newId);
  return newId;
}

function getOrCreateUserName(): string {
  const key = "codesync-user-name";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  // Friendly random name
  const adjectives = ["Swift", "Bright", "Calm", "Cool", "Bold"];
  const nouns = ["Coder", "Hacker", "Dev", "Builder", "Wizard"];
  const name =
    adjectives[Math.floor(Math.random() * adjectives.length)] +
    nouns[Math.floor(Math.random() * nouns.length)];
  sessionStorage.setItem(key, name);
  return name;
}

export default function RoomPage({ params }: PageProps) {
  const { roomId } = params;
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getOrCreateUserId());
    setUserName(getOrCreateUserName());
  }, []);

  if (!userId || !userName) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0d1117]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#30363d] border-t-[#58a6ff] animate-spin" />
          <span className="text-[#8b949e] font-mono text-sm">
            Joining room...
          </span>
        </div>
      </div>
    );
  }

  return <RoomLayout roomId={roomId} userId={userId} userName={userName} />;
}