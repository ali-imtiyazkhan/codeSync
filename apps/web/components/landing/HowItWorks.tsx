"use client";

import React from "react";

const STEPS = [
  {
    num: "01",
    title: "Create a room",
    desc: "One click generates a unique room. No signup required to get started.",
  },
  {
    num: "02",
    title: "Share the link",
    desc: "Send the room ID to your teammate via Slack, Discord, or anywhere else.",
  },
  {
    num: "03",
    title: "Code together",
    desc: "Edit, video call, whiteboard, and sync changes — all in the same session.",
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="lp-section lp-section-flow">
      <div className="landing-container">
        <div className="lp-section-header">
          <p className="lp-section-label">How it works</p>
          <h2 className="lp-section-title">Up and running in under a minute</h2>
          <p className="lp-section-desc">
            No cloning repos, no screen-share dictation. Just a link and a shared editor.
          </p>
        </div>

        <div className="lp-flow">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <article className="lp-flow-step">
                <span className="lp-flow-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </article>
              {i < STEPS.length - 1 && (
                <div className="lp-flow-connector" aria-hidden>
                  <span className="lp-flow-line" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};
