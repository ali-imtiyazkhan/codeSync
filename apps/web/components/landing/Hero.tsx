"use client";

import React from "react";
import { ArrowRight, Download, Plus } from "lucide-react";
import { HeroPreview } from "./HeroPreview";
import {
  VSCODE_EXTENSION_DOWNLOAD_PATH,
  VSCODE_EXTENSION_VSIX,
} from "@/lib/vscodeExtension";

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
  const downloadVsix = async () => {
    try {
      const res = await fetch(VSCODE_EXTENSION_DOWNLOAD_PATH);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const hint =
          body && typeof body.hint === "string"
            ? body.hint
            : "Build the extension first (see apps/vscode-extension).";
        window.alert(`Extension package not available.\n\n${hint}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = VSCODE_EXTENSION_VSIX;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Download failed. Check your connection and try again.");
    }
  };

  return (
    <section className="lp-hero">
      <div className="lp-hero-lights" aria-hidden>
        <div className="lp-hero-beam lp-hero-beam-left" />
        <div className="lp-hero-beam lp-hero-beam-right" />
      </div>
      <div className="landing-container">
        <div className="lp-hero-grid">
          <div>
            <div className="lp-hero-extension">
              <button
                type="button"
                className="lp-hero-extension-download"
                onClick={downloadVsix}
              >
                <Download size={15} aria-hidden />
                Download VS Code extension
              </button>
              <p className="lp-hero-extension-hint">
                Saves the .vsix file — in VS Code open Extensions, click ⋯, then
                Install from VSIX…
              </p>
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
