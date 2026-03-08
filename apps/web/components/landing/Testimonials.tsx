"use client";

import React from "react";

const TESTIMONIALS = [
    {
        text: "CodeSync replaced every other tool we were using for pair programming. It just works.",
        author: "Priya M.",
        role: "Senior Engineer, Stripe",
    },
    {
        text: "The latency is near-zero. I've used nothing else for remote code interviews since discovering this.",
        author: "James K.",
        role: "Engineering Manager, Notion",
    },
    {
        text: "We onboard new devs using CodeSync sessions. It's become a core part of our workflow.",
        author: "Sofia R.",
        role: "CTO, Tidewater Labs",
    },
];

export const Testimonials: React.FC = () => {
    return (
        <section
            id="testimonials"
            style={{ padding: "100px 32px", background: "#0a0a08", borderTop: "1px solid #1e1e1c" }}
        >
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
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
            // TESTIMONIALS
                    </div>
                    <h2
                        style={{
                            fontSize: "clamp(28px, 4vw, 44px)",
                            fontWeight: 900,
                            color: "#f0f0ec",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Loved by developers.
                    </h2>
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {TESTIMONIALS.map((t, i) => (
                        <div
                            key={i}
                            style={{
                                background: "#0e0e0c",
                                border: "1px solid #1e1e1c",
                                borderRadius: "12px",
                                padding: "28px",
                            }}
                        >
                            <div style={{ fontSize: "24px", color: "#e94560", marginBottom: "16px", lineHeight: 1 }}>
                                "
                            </div>
                            <p
                                style={{
                                    fontSize: "14px",
                                    color: "#88887e",
                                    lineHeight: 1.7,
                                    marginBottom: "20px",
                                    fontStyle: "italic",
                                }}
                            >
                                {t.text}
                            </p>
                            <div>
                                <div style={{ fontSize: "13px", fontWeight: 800, color: "#f0f0ec" }}>{t.author}</div>
                                <div style={{ fontSize: "11px", color: "#44443c", marginTop: "2px" }}>{t.role}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
