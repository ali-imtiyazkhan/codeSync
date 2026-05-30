"use client";

import React from "react";

const STEPS = [
    {
        num: "01",
        title: "Create a Room",
        desc: "Click 'Create New Room' to instantly generate a unique collaborative workspace with a shareable ID.",
    },
    {
        num: "02",
        title: "Share the Link",
        desc: "Copy your Room ID and send it to teammates via Slack, email, or any messaging app.",
    },
    {
        num: "03",
        title: "Code Together",
        desc: "Everyone joins the same session and edits in real time. Watch changes appear live as your team types.",
    },
];

export const HowItWorks: React.FC = () => {
    return (
        <section
            id="how-it-works"
            style={{ padding: "100px 32px", background: "#0a0a08", borderTop: "1px solid #1e1e1c" }}
        >
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "64px" }}>
                    <div
                        style={{
                            fontSize: "11px",
                            color: "#e94560",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            marginBottom: "12px",
                        }}
                    >
                        HOW IT WORKS
                    </div>
                    <h2
                        style={{
                            fontSize: "clamp(28px, 4vw, 44px)",
                            fontWeight: 900,
                            color: "#f0f0ec",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Up and running in
                        <br />
                        under 60 seconds.
                    </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {STEPS.map((s, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                gap: "32px",
                                alignItems: "flex-start",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "12px",
                                        border: "1px solid #e94560",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "13px",
                                        fontWeight: 900,
                                        color: "#e94560",
                                        letterSpacing: "0.05em",
                                        background: "rgba(233,69,96,0.05)",
                                    }}
                                >
                                    {s.num}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div
                                        style={{
                                            width: "1px",
                                            height: "60px",
                                            background: "linear-gradient(to bottom, #e94560, #2a2a28)",
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                            </div>
                            <div
                                style={{
                                    paddingTop: "12px",
                                    paddingBottom: i < STEPS.length - 1 ? "48px" : "0",
                                }}
                            >
                                <h3
                                    style={{ fontSize: "18px", fontWeight: 800, color: "#f0f0ec", marginBottom: "8px" }}
                                >
                                    {s.title}
                                </h3>
                                <p style={{ fontSize: "14px", color: "#55554e", lineHeight: 1.7 }}>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
