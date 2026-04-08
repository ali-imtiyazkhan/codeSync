"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Github } from "lucide-react";

interface NavbarProps {
    scrolled: boolean;
    scrollTo: (id: string) => void;
    createRoom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled, scrollTo, createRoom }) => {
    const { data: session } = useSession();
    const user = session?.user;

    const initials = user?.name 
        ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : "??";

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
                {["features", "how-it-works", "pricing"].map((id) => (
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

                {user ? (
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "4px 12px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                            {user.image ? (
                                <img 
                                    src={user.image} 
                                    alt={user.name || "User"} 
                                    style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid rgba(233, 69, 96, 0.3)" }} 
                                />
                            ) : (
                                <div style={{ 
                                    width: "24px", height: "24px", borderRadius: "50%", 
                                    background: "rgba(233, 69, 96, 0.1)", border: "1px solid rgba(233, 69, 96, 0.3)",
                                    display: "flex", alignItems: "center", justifyContent: "center", 
                                    fontSize: "10px", fontWeight: 700, color: "#e94560" 
                                }}>
                                    {initials}
                                </div>
                            )}
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "#d4d4cc" }}>{user.name}</span>
                        </div>
                        
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            title="Sign Out"
                            style={{
                                background: "none", border: "none", cursor: "pointer", 
                                color: "#888880", transition: "color 0.2s",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#e94560")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#888880")}
                        >
                            <LogOut size={16} />
                        </button>

                        <button
                            onClick={createRoom}
                            style={{
                                padding: "8px 18px",
                                borderRadius: "6px",
                                background: "#e94560",
                                color: "#fff",
                                border: "none",
                                fontSize: "13px",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                letterSpacing: "0.06em",
                                transition: "all 0.2s",
                                marginLeft: "8px"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                            onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                        >
                            GO TO EDITOR
                        </button>
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <a 
                            href="https://github.com/mainkhan/codeSync" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                                display: "flex", alignItems: "center", gap: "8px", 
                                color: "#888880", textDecoration: "none", fontSize: "13px",
                                fontWeight: 700, transition: "color 0.2s", marginRight: "8px"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#e94560")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#888880")}
                        >
                            <Github size={16} />
                            <span>GITHUB</span>
                        </a>
                        <button
                            onClick={() => window.location.href = "/auth/signin"}
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
                            SIGN IN
                        </button>
                    </div>
                )}
            </nav>
        </header>
    );
};
