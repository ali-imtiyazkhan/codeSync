"use client";

import React from "react";

export const Stats: React.FC = () => {
    return (
        <section
            style={{
                borderTop: "1px solid #1e1e1c",
                borderBottom: "1px solid #1e1e1c",
                padding: "40px 32px",
                background: "#0a0a08",
                display: "flex",
                justifyContent: "center",
                gap: "clamp(32px, 8vw, 100px)",
                flexWrap: "wrap",
            }}
        >
            {[
                ["50K+", "Rooms Created"],
                ["200ms", "Avg Sync Latency"],
                ["99.9%", "Uptime SLA"],
                ["50+", "Languages Supported"],
            ].map(([num, label]) => (
                <div key={label} style={{ textAlign: "center" }}>
                    <div
                        style={{
                            fontSize: "clamp(24px, 4vw, 36px)",
                            fontWeight: 900,
                            color: "#e94560",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        {num}
                    </div>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#44443c",
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
