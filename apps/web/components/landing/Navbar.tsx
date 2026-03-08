"use client";

import React from "react";

interface NavbarProps {
    scrolled: boolean;
    scrollTo: (id: string) => void;
    createRoom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled, scrollTo, createRoom }) => {
    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                background: scrolled ? "rgba(14,14,12,0.97)" : "transparent",
                borderBottom: scrolled ? "1px solid #2a2a28" : "1px solid transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                transition: "all 0.3s ease",
                padding: "0 32px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <span
                style={{
                    fontWeight: 800,
                    fontSize: "18px",
                    color: "#e94560",
                    letterSpacing: "0.04em",
                }}
            >
                {"<CodeSync />"}
            </span>

            {/* Desktop Nav */}
            <nav style={{ display: "flex", gap: "28px", alignItems: "center" }}>
                {["features", "how-it-works", "pricing", "testimonials"].map((id) => (
                    <button
                        key={id}
                        onClick={() => scrollTo(id)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#888880",
                            fontSize: "13px",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            transition: "color 0.2s",
                            fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#e94560")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#888880")}
                    >
                        {id.replace(/-/g, " ")}
                    </button>
                ))}
                <button
                    onClick={createRoom}
                    style={{
                        padding: "8px 18px",
                        borderRadius: "6px",
                        border: "1px solid #e94560",
                        background: "transparent",
                        color: "#e94560",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        letterSpacing: "0.06em",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e94560";
                        e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#e94560";
                    }}
                >
                    LAUNCH EDITOR
                </button>
            </nav>
        </header>
    );
};
