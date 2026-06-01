"use client";

import React, { useState, useEffect } from "react";

type Part = [string, string];

const LINES: Part[][] = [
  [["kw", "async "], ["kw", "function "], ["fn", "syncRoom"], ["op", "(roomId, socket) {"]],
  [["cm", "  // broadcast changes to all peers"]],
  [["kw", "  const "], ["fn", "delta"], ["op", " = "], ["fn", "computeDiff"], ["op", "(prev, next);"]],
  [["kw", "  if "], ["op", "(!"], ["fn", "delta"], ["op", ".length) "], ["kw", "return"]],
  [["fn", "  socket"], ["op", ".emit("], ["str", '"sync"'], ["op", ", { roomId, changes: delta });"]],
  [["op", "}"]],
];

const AVATARS = [
  { label: "AK", bg: "#fff" },
  { label: "SR", bg: "#888" },
  { label: "MJ", bg: "#555" },
];

export const HeroPreview: React.FC = () => {
  const [lineCount, setLineCount] = useState(0);
  const [latency, setLatency] = useState(14);

  useEffect(() => {
    const t = setInterval(() => {
      setLineCount((c) => (c >= LINES.length ? 0 : c + 1));
    }, 900);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setLatency(8 + Math.floor(Math.random() * 20)), 2500);
    return () => clearInterval(t);
  }, []);

  const renderParts = (parts: Part[]) =>
    parts.map(([cls, text], i) => (
      <span key={i} className={`lp-${cls}`}>
        {text}
      </span>
    ));

  return (
    <div className="lp-preview">
      <div className="lp-preview-bar">
        <div className="lp-preview-dots">
          <span /><span /><span />
        </div>
        <span className="lp-preview-title">room-sync.ts</span>
        <div className="lp-preview-live">
          <span className="lp-hero-badge-dot" style={{ width: 5, height: 5 }} />
          3 online
        </div>
      </div>

      <div className="lp-preview-body">
        {LINES.slice(0, lineCount).map((parts, i) => (
          <div key={i} className="lp-preview-line">
            <span className="lp-preview-ln">{i + 1}</span>
            <code className="lp-preview-code">{renderParts(parts)}</code>
          </div>
        ))}
        {lineCount < LINES.length && lineCount > 0 && (
          <div className="lp-preview-line">
            <span className="lp-preview-ln">{lineCount + 1}</span>
            <span className="lp-preview-cursor" />
          </div>
        )}
      </div>

      <div className="lp-preview-footer">
        <span>WebSocket · {latency}ms</span>
        <span>synced</span>
        <div className="lp-preview-avatars">
          {AVATARS.map((a) => (
            <span key={a.label} style={{ background: a.bg }}>
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
