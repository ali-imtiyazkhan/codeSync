"use client";

import React from "react";
import { ArrowRight, Plus } from "lucide-react";
import { HeroPreview } from "./HeroPreview";

interface HeroProps {
  createRoom: () => void;
  joinRoom: () => void;
  joinId: string;
  setJoinId: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  createRoom,
  joinRoom,
  joinId,
  setJoinId,
}) => {
  return (
    <section className="lp-hero">
      <div className="lp-hero-lights" aria-hidden>
        <div className="lp-hero-beam lp-hero-beam-left" />
        <div className="lp-hero-beam lp-hero-beam-right" />
      </div>
      <div className="landing-container">
        <div className="lp-hero-grid">
          <div>
            <div className="lp-hero-badge">
              <span className="lp-hero-badge-dot" />
              Live collaboration · no install required
            </div>

            <h1>
              Pair program from anywhere,{" "}
              <em>in the same editor.</em>
            </h1>

            <p className="lp-hero-desc">
              Share a room link, sync code in real time, hop on video, and push
              changes back to VS Code — all in one place.
            </p>

            <div className="lp-hero-actions">
              <button type="button" className="lp-btn lp-btn-primary" onClick={createRoom}>
                <Plus size={16} />
                Create room
              </button>
              <button
                type="button"
                className="lp-btn lp-btn-outline"
                onClick={() => document.getElementById("join-input")?.focus()}
              >
                Join with ID
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="lp-join-row">
              <input
                id="join-input"
                className="lp-input"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                placeholder="Paste room ID to join…"
              />
              <button type="button" className="lp-btn lp-btn-ghost" onClick={joinRoom}>
                Join
              </button>
            </div>

            {/* <div className="lp-metrics" style={{ marginTop: 40 }}>
              {[
                ["<100ms", "Sync latency"],
                ["WebRTC", "Video & screen"],
                ["VS Code", "Extension sync"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="lp-metric-value">{value}</div>
                  <div className="lp-metric-label">{label}</div>
                </div>
              ))}
            </div> */}
          </div>

          <HeroPreview />
        </div>
      </div>
    </section>
  );
};
