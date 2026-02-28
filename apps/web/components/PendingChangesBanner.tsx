"use client";

import type { PendingChange } from "@codesync/socket-types";

interface Props {
  changes: PendingChange[];
  onAccept: (change: PendingChange) => void;
  onReject: (change: PendingChange) => void;
}

export default function PendingChangesBanner({ changes, onAccept, onReject }: Props) {
  if (changes.length === 0) return null;
  const first = changes[0]!;

  return (
    <div
      className="animate-slide-up"
      style={{
        flexShrink: 0,
        background: "linear-gradient(to right, rgba(255,45,107,0.12), rgba(255,45,107,0.06), rgba(255,45,107,0.12))",
        borderBottom: "1px solid rgba(255,45,107,0.4)",
        boxShadow: "0 2px 20px rgba(255,45,107,0.15)",
        padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 12,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Animated accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, height: 2, width: "100%",
        background: "linear-gradient(to right, transparent, var(--neon3), var(--amber), var(--neon3), transparent)",
        animation: "border-march 3s linear infinite",
        boxShadow: "var(--glow-red)",
      }} />

      {/* Left accent bar */}
      <div style={{
        width: 3, height: 28, flexShrink: 0,
        background: "linear-gradient(to bottom, var(--neon3), var(--amber))",
        boxShadow: "var(--glow-red)",
      }} />

      {/* Warning icon */}
      <div style={{
        width: 28, height: 28, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid var(--neon3)",
        boxShadow: "var(--glow-red)",
        background: "rgba(255,45,107,0.1)",
        fontSize: "0.75rem",
        color: "var(--neon3)", textShadow: "var(--glow-red)",
        animation: "neon-pulse 1s infinite",
        clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
      }}>
        ⚠
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--neon3)", textShadow: "var(--glow-red)" }}>
            INCOMING PATCH REQUEST
          </span>
          <span style={{
            fontSize: "0.55rem", letterSpacing: "0.08em",
            color: "var(--amber)", textShadow: "var(--glow-amber)",
            border: "1px solid rgba(255,179,0,0.3)",
            padding: "1px 6px",
            background: "rgba(255,179,0,0.06)",
          }}>
            FROM: {first.authorId.toUpperCase()}
          </span>
          {changes.length > 1 && (
            <span style={{
              fontSize: "0.55rem", letterSpacing: "0.08em",
              color: "var(--neon3)",
              border: "1px solid rgba(255,45,107,0.4)",
              padding: "1px 6px",
              background: "rgba(255,45,107,0.08)",
            }}>
              +{changes.length - 1} MORE
            </span>
          )}
        </div>
        <div style={{ fontSize: "0.55rem", color: "var(--muted)", letterSpacing: "0.08em", marginTop: 2 }}>
          DIFF SIZE: {first.newCode?.length ?? 0} CHARS • AWAITING AUTHORIZATION
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {changes.length > 1 && (
          <button
            onClick={() => changes.forEach(onAccept)}
            className="cyber-btn success-btn"
            style={{ fontSize: "0.6rem", padding: "5px 10px", opacity: 0.7 }}
          >
            ◈ ACCEPT ALL
          </button>
        )}

        <button
          onClick={() => onReject(first)}
          className="cyber-btn danger-btn"
          style={{ fontSize: "0.6rem", padding: "5px 12px" }}
        >
          ✕ REJECT
        </button>

        <button
          onClick={() => onAccept(first)}
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem", letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 16px",
            background: "rgba(0,255,225,0.1)",
            border: "1px solid var(--neon)",
            color: "var(--neon)", textShadow: "var(--glow-neon)",
            boxShadow: "var(--glow-neon), inset 0 0 15px rgba(0,255,225,0.05)",
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))",
            animation: "neon-pulse 2s infinite",
          }}
        >
          ▶ AUTHORIZE &amp; APPLY TO VS CODE
        </button>
      </div>

      {/* Right accent bar */}
      <div style={{
        width: 3, height: 28, flexShrink: 0,
        background: "linear-gradient(to bottom, var(--amber), var(--neon3))",
        boxShadow: "var(--glow-amber)",
      }} />
    </div>
  );
}
