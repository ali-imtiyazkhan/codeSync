"use client";

import React from "react";
import {
  Zap,
  Video,
  Terminal,
  GitPullRequest,
  Pencil,
  Monitor,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time sync",
    desc: "Every keystroke streams instantly via WebSockets. See your teammate's cursor and edits as they happen.",
  },
  {
    icon: Video,
    title: "Video & screen share",
    desc: "Built-in WebRTC calls and screen sharing — no Zoom tab needed.",
  },
  {
    icon: Terminal,
    title: "Monaco editor",
    desc: "Full syntax highlighting for 50+ languages in a familiar IDE experience.",
  },
  {
    icon: GitPullRequest,
    title: "Propose → review → apply",
    desc: "Collaborators propose edits, owners review a side-by-side diff, and accepted changes sync to local VS Code automatically.",
  },
  {
    icon: Pencil,
    title: "Shared canvas",
    desc: "Sketch architecture diagrams on an Excalidraw board alongside your code.",
  },
  {
    icon: Monitor,
    title: "VS Code extension",
    desc: "Connect your local editor to a room and keep your themes, keybindings, and setup.",
  },
];

function FeatureColumn({ items }: { items: typeof FEATURES }) {
  return (
    <ul className="lp-features-col">
      {items.map((f) => {
        const Icon = f.icon;
        return (
          <li key={f.title} className="lp-feature">
            <Icon size={18} strokeWidth={1.75} className="lp-feature-icon" aria-hidden />
            <div className="lp-feature-body">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export const Features: React.FC = () => {
  const mid = Math.ceil(FEATURES.length / 2);
  const left = FEATURES.slice(0, mid);
  const right = FEATURES.slice(mid);

  return (
    <section id="features" className="lp-section lp-section-features">
      <div className="landing-container">
        <div className="lp-section-header">
          <p className="lp-section-label">Features</p>
          <h2 className="lp-section-title">Built for how teams actually debug</h2>
          <p className="lp-section-desc">
            Stop screen-sharing line numbers. Code, talk, and ship fixes together.
          </p>
        </div>

        <div className="lp-features-grid">
          <FeatureColumn items={left} />
          <FeatureColumn items={right} />
        </div>
      </div>
    </section>
  );
};
