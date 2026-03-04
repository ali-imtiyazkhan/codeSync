"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function generateRoomId() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

export default function HomePage() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");

  const createRoom = () => {
    const id = generateRoomId();
    router.push(`/room/${id}`);
  };

  const joinRoom = () => {
    if (joinId.trim()) router.push(`/room/${joinId.trim()}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#262624",
        color: "#e0e0e0",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* ── HEADER ── */}
      <header
        style={{
          background: "#1e1e1c",
          borderBottom: "1px solid #333330",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "16px", color: "#e94560" }}>
          CodeSync
        </span>

        <nav style={{ display: "flex", gap: "24px" }}>
          <a href="#" style={{ color: "#a0a0b8", fontSize: "14px", textDecoration: "none" }}>
            Home
          </a>
          <a href="#" style={{ color: "#a0a0b8", fontSize: "14px", textDecoration: "none" }}>
            About
          </a>
          <a href="#" style={{ color: "#a0a0b8", fontSize: "14px", textDecoration: "none" }}>
            Contact
          </a>
        </nav>
      </header>

      {/* ── BODY ── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px", color: "#fff" }}>
            CodeSync
          </h1>
          <p style={{ fontSize: "14px", color: "#8888a0", marginBottom: "32px" }}>
            Real-time collaborative code editor
          </p>

          <div
            style={{
              background: "#1e1e1c",
              border: "1px solid #333330",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <button
              onClick={createRoom}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                background: "#e94560",
                color: "#fff",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              + Create New Room
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "#333330" }} />
              <span style={{ fontSize: "12px", color: "#555570" }}>or join</span>
              <div style={{ flex: 1, height: "1px", background: "#333330" }} />
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                placeholder="Room ID..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid #333330",
                  background: "#262624",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
              <button
                onClick={joinRoom}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "1px solid #333330",
                  background: "#333330",
                  color: "#e0e0e0",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "#1e1e1c",
          borderTop: "1px solid #333330",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "#555570" }}>
          © 2025 CodeSync
        </span>
      </footer>
    </div>
  );
}