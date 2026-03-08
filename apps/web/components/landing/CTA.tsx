"use client";

import React from "react";

interface CTAProps {
    createRoom: () => void;
}

export const CTA: React.FC<CTAProps> = ({ createRoom }) => {
    return (
        <section
            style={{
                padding: "120px 32px",
                background:
                    "radial-gradient(ellipse at 50% 50%, rgba(233,69,96,0.06) 0%, transparent 70%)",
                borderTop: "1px solid #1e1e1c",
                textAlign: "center",
            }}
        >
            <div
                style={{
                    fontSize: "11px",
                    color: "#e94560",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                }}
            >
        // GET STARTED FREE
            </div>
            <h2
                style={{
                    fontSize: "clamp(32px, 5vw, 60px)",
                    fontWeight: 900,
                    color: "#f0f0ec",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    marginBottom: "20px",
                }}
            >
                Start coding together
                <br />
                right now.
            </h2>
            <p
                style={{
                    fontSize: "15px",
                    color: "#55554e",
                    maxWidth: "440px",
                    margin: "0 auto 40px",
                    lineHeight: 1.7,
                }}
            >
                No account. No credit card. No install.
                <br />
                Just hit Create Room and start collaborating.
            </p>
            <button
                onClick={createRoom}
                style={{
                    padding: "16px 36px",
                    borderRadius: "10px",
                    border: "none",
                    background: "linear-gradient(135deg, #e94560 0%, #c7253e 100%)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "15px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    letterSpacing: "0.08em",
                    boxShadow: "0 16px 40px rgba(233,69,96,0.35)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 24px 56px rgba(233,69,96,0.5)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 16px 40px rgba(233,69,96,0.35)";
                }}
            >
                + CREATE YOUR ROOM
            </button>
        </section>
    );
};
