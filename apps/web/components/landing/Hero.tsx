"use client";

import React from "react";

const CODE_LINES = [
    { indent: 0, text: "function mergeSort(arr) {", color: "#e06c75" },
    { indent: 1, text: "if (arr.length <= 1) return arr;", color: "#abb2bf" },
    { indent: 1, text: "const mid = Math.floor(arr.length / 2);", color: "#61afef" },
    { indent: 1, text: "const left  = mergeSort(arr.slice(0, mid));", color: "#98c379" },
    { indent: 1, text: "const right = mergeSort(arr.slice(mid));", color: "#98c379" },
    { indent: 1, text: "return merge(left, right);", color: "#c678dd" },
    { indent: 0, text: "}", color: "#e06c75" },
    { indent: 0, text: "", color: "transparent" },
    { indent: 0, text: "function merge(a, b) {", color: "#e06c75" },
    { indent: 1, text: "const result = [];", color: "#61afef" },
    { indent: 1, text: "while (a.length && b.length) {", color: "#abb2bf" },
    { indent: 2, text: "result.push(a[0] < b[0] ? a.shift() : b.shift());", color: "#d19a66" },
    { indent: 1, text: "}", color: "#abb2bf" },
    { indent: 1, text: "return [...result, ...a, ...b];", color: "#98c379" },
    { indent: 0, text: "}", color: "#e06c75" },
];

interface HeroProps {
    createRoom: () => void;
    joinRoom: () => void;
    joinId: string;
    setJoinId: (id: string) => void;
    visibleLines: number;
}

export const Hero: React.FC<HeroProps> = ({
    createRoom,
    joinRoom,
    joinId,
    setJoinId,
    visibleLines,
}) => {
    return (
        <section
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "100px 32px 60px",
                background:
                    "radial-gradient(ellipse at 50% 0%, rgba(233,69,96,0.08) 0%, transparent 70%)",
                position: "relative",
            }}
        >
            {/* Grid bg */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                        "linear-gradient(rgba(233,69,96,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(233,69,96,0.04) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                    maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
                }}
            />

            {/* Badge */}
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "1px solid rgba(233,69,96,0.3)",
                    background: "rgba(233,69,96,0.05)",
                    fontSize: "12px",
                    color: "#e94560",
                    marginBottom: "28px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    position: "relative",
                }}
            >
                <span
                    style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#e94560",
                        display: "inline-block",
                        animation: "pulse 2s infinite",
                    }}
                />
                Live collaboration — zero setup
            </div>

            <h1
                style={{
                    fontSize: "clamp(40px, 7vw, 80px)",
                    fontWeight: 900,
                    lineHeight: 1.05,
                    textAlign: "center",
                    marginBottom: "20px",
                    color: "#f0f0ec",
                    maxWidth: "800px",
                    position: "relative",
                    letterSpacing: "-0.02em",
                }}
            >
                Code together,
                <br />
                <span style={{ color: "#e94560" }}>in real time.</span>
            </h1>

            <p
                style={{
                    fontSize: "clamp(15px, 2vw, 18px)",
                    color: "#66665e",
                    textAlign: "center",
                    maxWidth: "520px",
                    lineHeight: 1.7,
                    marginBottom: "44px",
                    position: "relative",
                }}
            >
                Spin up a shared code editor in seconds. Invite your team, write together, ship
                faster — no accounts, no installs.
            </p>

            {/* CTA Card */}
            <div
                style={{
                    background: "#141412",
                    border: "1px solid #2a2a28",
                    borderRadius: "14px",
                    padding: "28px",
                    width: "100%",
                    maxWidth: "420px",
                    position: "relative",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
                }}
            >
                {/* Glow edge */}
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: "20%",
                        right: "20%",
                        height: "1px",
                        background: "linear-gradient(90deg, transparent, #e94560, transparent)",
                    }}
                />

                <button
                    onClick={createRoom}
                    style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #e94560 0%, #c7253e 100%)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "14px",
                        cursor: "pointer",
                        marginBottom: "18px",
                        letterSpacing: "0.08em",
                        fontFamily: "inherit",
                        boxShadow: "0 8px 24px rgba(233,69,96,0.3)",
                        transition: "transform 0.15s, box-shadow 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 12px 32px rgba(233,69,96,0.45)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(233,69,96,0.3)";
                    }}
                >
                    + CREATE NEW ROOM
                </button>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "18px",
                    }}
                >
                    <div style={{ flex: 1, height: "1px", background: "#2a2a28" }} />
                    <span
                        style={{ fontSize: "11px", color: "#44443c", letterSpacing: "0.1em" }}
                    >
                        OR JOIN EXISTING
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "#2a2a28" }} />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        value={joinId}
                        onChange={(e) => setJoinId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                        placeholder="Paste room ID..."
                        style={{
                            flex: 1,
                            padding: "11px 14px",
                            borderRadius: "8px",
                            border: "1px solid #2a2a28",
                            background: "#0e0e0c",
                            color: "#d4d4cc",
                            fontSize: "13px",
                            outline: "none",
                            fontFamily: "inherit",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#e94560")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#2a2a28")}
                    />
                    <button
                        onClick={joinRoom}
                        style={{
                            padding: "11px 18px",
                            borderRadius: "8px",
                            border: "1px solid #2a2a28",
                            background: "#1c1c1a",
                            color: "#d4d4cc",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#e94560";
                            e.currentTarget.style.color = "#e94560";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#2a2a28";
                            e.currentTarget.style.color = "#d4d4cc";
                        }}
                    >
                        JOIN →
                    </button>
                </div>
            </div>

            {/* Social proof micro row */}
            <div
                style={{
                    display: "flex",
                    gap: "30px",
                    marginTop: "48px",
                    alignItems: "center",
                    position: "relative",
                    flexWrap: "wrap",
                    justifyContent: "center",
                }}
            >
                <span style={{ fontSize: "11px", fontWeight: 900, color: "#44443c", letterSpacing: "0.15em", textTransform: "uppercase" }}>Built With</span>
                {[
                    { name: "Next.js", color: "#f0f0ec" },
                    { name: "WebRTC", color: "#f0883e" },
                    { name: "Socket.io", color: "#FFFFFF" },
                    { name: "Prisma", color: "#a371f7" },
                    { name: "TypeScript", color: "#3178c6" }
                ].map((tech) => (
                    <span
                        key={tech.name}
                        style={{
                            fontSize: "13px",
                            color: tech.color,
                            letterSpacing: "0.04em",
                            fontWeight: 800,
                            opacity: 0.85
                        }}
                    >
                        {tech.name}
                    </span>
                ))}
            </div>

            {/* Animated code preview */}
            <div
                style={{
                    marginTop: "70px",
                    width: "100%",
                    maxWidth: "640px",
                    background: "#141412",
                    border: "1px solid #2a2a28",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
                    position: "relative",
                }}
            >
                {/* Window chrome */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 16px",
                        background: "#1c1c1a",
                        borderBottom: "1px solid #2a2a28",
                    }}
                >
                    {["#e94560", "#f0c040", "#50c870"].map((c) => (
                        <div
                            key={c}
                            style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }}
                        />
                    ))}
                    <span
                        style={{
                            marginLeft: "10px",
                            fontSize: "11px",
                            color: "#44443c",
                            letterSpacing: "0.08em",
                        }}
                    >
                        merge-sort.js — CodeSync
                    </span>
                    <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                        <div
                            style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#e94560",
                            }}
                        />
                        <span style={{ fontSize: "10px", color: "#e94560" }}>2 online</span>
                    </div>
                </div>
                <div style={{ padding: "20px 24px", minHeight: "220px" }}>
                    {CODE_LINES.slice(0, visibleLines).map((line, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                alignItems: "baseline",
                                paddingLeft: `${line.indent * 20}px`,
                                lineHeight: "1.7",
                                fontSize: "13px",
                                animation: "fadeIn 0.2s ease",
                            }}
                        >
                            <span
                                style={{
                                    color: "#333330",
                                    minWidth: "28px",
                                    textAlign: "right",
                                    marginRight: "16px",
                                    userSelect: "none",
                                    fontSize: "11px",
                                }}
                            >
                                {i + 1}
                            </span>
                            <span style={{ color: line.color }}>{line.text || "\u00a0"}</span>
                            {i === visibleLines - 1 && (
                                <span
                                    style={{
                                        display: "inline-block",
                                        width: "2px",
                                        height: "14px",
                                        background: "#e94560",
                                        marginLeft: "1px",
                                        verticalAlign: "middle",
                                        animation: "blink 1s step-end infinite",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll cue */}
            <div
                style={{
                    position: "absolute",
                    bottom: "32px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "6px",
                }}
            >
                <span
                    style={{
                        fontSize: "10px",
                        color: "#33332c",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                    }}
                >
                    Scroll
                </span>
                <div
                    style={{
                        width: "1px",
                        height: "32px",
                        background: "linear-gradient(to bottom, #e94560, transparent)",
                        animation: "scrollCue 2s ease infinite",
                    }}
                />
            </div>
        </section>
    );
};
