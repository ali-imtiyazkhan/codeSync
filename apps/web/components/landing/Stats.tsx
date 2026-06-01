"use client";

import React from "react";

export const Stats: React.FC = () => {
    return (
        <section
            style={{
                borderTop: "1px solid #1a1a1a",
                borderBottom: "1px solid #1a1a1a",
                padding: "40px 32px",
                background: "#050505",
                display: "flex",
                justifyContent: "center",
                gap: "clamp(32px, 8vw, 100px)",
                flexWrap: "wrap",
            }}
        >
            {[
                ["<100ms", "Sync Latency"],
                ["E2EE", "Security"],
                ["Real-time", "Multi-cursor"],
                ["WebRTC", "P2P Core"],
            ].map(([num, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: "clamp(24px, 4vw, 36px)",
                            fontWeight: 900,
                            color: "#ffffff",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {num}
                    </div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#525252",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginTop: "4px",
                        }}
                    >
                        {label}
                    </div>
                </div>
            ))}
        </section>
    );
};
