"use client";

import React from "react";
import { Zap, Globe, Palette, Users, Lock, Clipboard, Pencil } from "lucide-react";

interface Feature {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

const FEATURES: Feature[] = [
    {
        icon: <Zap size={24} />,
        title: "Real-Time Sync",
        desc: "Every keystroke is broadcast instantly to all collaborators. No lag, no conflicts — just seamless live editing powered by WebSockets.",
    },
    {
        icon: <Pencil size={24} />,
        title: "Collaborative Canvas",
        desc: "Brainstorm workflows or solve DSA problems together on a real-time shared drawing board. Built-in Excalidraw integration.",
    },
    {
        icon: <Globe size={24} />,
        title: "Shareable Rooms",
        desc: "Generate a unique room link in one click and share it with your team. No account required to join a session.",
    },
    {
        icon: <Palette size={24} />,
        title: "Syntax Highlighting",
        desc: "Full language support with rich syntax highlighting for 50+ languages including JS, Python, Go, Rust, and more.",
    },
    {
        icon: <Users size={24} />,
        title: "Presence Indicators",
        desc: "See live cursors and avatar badges for every collaborator in the room. Always know who's editing what.",
    },
    {
        icon: <Lock size={24} />,
        title: "Secure by Default",
        desc: "All sessions are end-to-end encrypted. Your code never touches our servers — it's peer-to-peer when possible.",
    },
];

export const Features: React.FC = () => {
    return (
        <section id="features" style={{ padding: "100px 32px", maxWidth: "1100px", margin: "0 auto" }}>
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
          // CAPABILITIES
                </div>
                <h2
                    style={{
                        fontSize: "clamp(28px, 4vw, 44px)",
                        fontWeight: 900,
                        color: "#f0f0ec",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.1,
                    }}
                >
                    Everything you need to
                    <br />
                    code together.
                </h2>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "20px",
                }}
            >
                {FEATURES.map((f, i) => (
                    <div
                        key={i}
                        style={{
                            background: "#0e0e0c",
                            border: "1px solid #1e1e1c",
                            borderRadius: "12px",
                            padding: "28px",
                            transition: "border-color 0.2s, transform 0.2s",
                            cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#e94560";
                            e.currentTarget.style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#1e1e1c";
                            e.currentTarget.style.transform = "none";
                        }}
                    >
                        <div style={{ color: "#e94560", marginBottom: "14px" }}>{f.icon}</div>
                        <h3
                            style={{
                                fontSize: "16px",
                                fontWeight: 800,
                                color: "#f0f0ec",
                                marginBottom: "10px",
                                letterSpacing: "0.02em",
                            }}
                        >
                            {f.title}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#55554e", lineHeight: 1.7 }}>{f.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
