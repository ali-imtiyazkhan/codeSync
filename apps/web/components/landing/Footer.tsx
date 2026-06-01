"use client";

import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="lp-footer">
      <div className="landing-container">
        <div className="lp-footer-grid">
          <div className="lp-footer-brand">
            <a href="#" className="lp-logo" onClick={(e) => e.preventDefault()}>
              <div className="lp-logo-mark">CS</div>
              <span className="lp-logo-name">CodeSync</span>
            </a>
            <p>
              Real-time collaborative development with video, whiteboarding, and
              VS Code sync.
            </p>
          </div>

          {(
            [
              ["Product", ["Features", "How it works"]],
              ["Developers", ["GitHub", "Documentation"]],
              ["Legal", ["Privacy", "Terms"]],
            ] as const
          ).map(([title, links]) => (
            <div key={title} className="lp-footer-col">
              <h4>{title}</h4>
              {links.map((l) => (
                <a
                  key={l}
                  href={l === "GitHub" ? "https://github.com/ali-imtiyazkhan/codeSync" : "#"}
                  target={l === "GitHub" ? "_blank" : undefined}
                  rel={l === "GitHub" ? "noopener noreferrer" : undefined}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="lp-footer-bottom">
          <span>© {new Date().getFullYear()} CodeSync</span>
          <span>Built with Next.js · Socket.io · WebRTC</span>
        </div>
      </div>
    </footer>
  );
};
