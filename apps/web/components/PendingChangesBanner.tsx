"use client";

import type { PendingChange } from "@codesync/socket-types";
import { AlertTriangle, Layers, X, Zap, Check } from "lucide-react";

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
        background: "linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.02), rgba(255,255,255,0.06))",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.4)",
        padding: "8px 16px",
        display: "flex", alignItems: "center", gap: 12,
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Animated accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, height: 2, width: "100%",
        background: "linear-gradient(to right, transparent, rgba(255,255,255,0.4), rgba(245,158,11,0.5), rgba(255,255,255,0.4), transparent)",
        animation: "border-march 3s linear infinite",
        boxShadow: "var(--glow-red)",
      }} />

      {/* Left accent bar */}
      <div style={{
        width: 3, height: 28, flexShrink: 0,
        background: "linear-gradient(to bottom, #ffffff, var(--warning))",
        boxShadow: "var(--glow-red)",
      }} />

      {/* Warning icon */}
      <div style={{
        width: 28, height: 28, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "var(--glow-neon)",
        background: "rgba(255,255,255,0.06)",
        fontSize: "0.75rem",
        color: "var(--accent)", textShadow: "none",
        animation: "neon-pulse 1s infinite",
        clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
      }}>
        <AlertTriangle size={14} />
      </div>

      {/* Message */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--accent)" }}>
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
            style={{ fontSize: "0.6rem", padding: "5px 10px", opacity: 0.7, display: "flex", alignItems: "center", gap: 4 }}
          >
            <Layers size={12} /> ACCEPT ALL
          </button>
        )}

          <button
            onClick={() => onReject(first)}
            className="cyber-btn danger-btn"
            style={{ fontSize: "0.6rem", padding: "5px 12px", display: "flex", alignItems: "center", gap: 4 }}
          >
            <X size={12} /> REJECT
          </button>

        <button
          onClick={() => onAccept(first)}
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem", letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "6px 16px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "var(--accent)",
            cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 6,
            clipPath: "polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))",
          }}
        >
          <Zap size={14} /> AUTHORIZE &amp; APPLY TO VS CODE
        </button>
      </div>

      {/* Right accent bar */}
      <div style={{
        width: 3, height: 28, flexShrink: 0,
        background: "linear-gradient(to bottom, var(--warning), rgba(255,255,255,0.5))",
        boxShadow: "var(--glow-neon)",
      }} />
    </div>
  );
}
