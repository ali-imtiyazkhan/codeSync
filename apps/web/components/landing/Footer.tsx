"use client";

import React from "react";

export const Footer: React.FC = () => {
    return (
        <footer
            style={{
                background: "#060604",
                borderTop: "1px solid #1a1a18",
                padding: "48px 32px 32px",
            }}
        >
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr repeat(3, 1fr)",
                        gap: "40px",
                        marginBottom: "48px",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontWeight: 900,
                                fontSize: "18px",
                                color: "#e94560",
                                letterSpacing: "0.04em",
                                marginBottom: "12px",
                            }}
                        >
                            {"<CodeSync />"}
                        </div>
                        <p
                            style={{
                                fontSize: "13px",
                                color: "#33332c",
                                lineHeight: 1.7,
                                maxWidth: "240px",
                            }}
                        >
                            Real-time collaborative code editing for engineers who move fast.
                        </p>
                    </div>
                    {([
                        ["Product", ["Features", "Pricing", "Changelog"]],
                        ["Developer", ["GitHub", "Discord"]],
                        ["Support", ["Security", "Status"]],
                    ] as const).map(([title, links]) => (
                        <div key={title}>
                            <div
                                style={{
                                    fontSize: "11px",
                                    color: "#44443c",
                                    letterSpacing: "0.15em",
                                    textTransform: "uppercase",
                                    fontWeight: 700,
                                    marginBottom: "14px",
                                }}
                            >
                                {title}
                            </div>
                            <ul
                                style={{
                                    listStyle: "none",
                                    padding: 0,
                                    margin: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                {links.map((l) => (
                                    <li key={l}>
                                        <a
                                            href={l === "GitHub" ? "https://github.com/ali-imtiyazkhan/codeSync" : "#"}
                                            target={l === "GitHub" ? "_blank" : "_self"}
                                            rel={l === "GitHub" ? "noopener noreferrer" : ""}
                                            style={{
                                                color: "#44443c",
                                                fontSize: "13px",
                                                textDecoration: "none",
                                                transition: "color 0.2s",
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#e94560")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#44443c")}
                                        >
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div
                    style={{
                        borderTop: "1px solid #1a1a18",
                        paddingTop: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    <span style={{ fontSize: "12px", color: "#2a2a28" }}>
                        © 2025 CodeSync. All rights reserved.
                    </span>
                    <div style={{ display: "flex", gap: "16px" }}>
                        {["Twitter", "GitHub", "Discord"].map((s) => (
                            <a
                                key={s}
                                href={s === "GitHub" ? "https://github.com/ali-imtiyazkhan/codeSync" : "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: "12px",
                                    color: "#2a2a28",
                                    textDecoration: "none",
                                    transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#e94560")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#2a2a28")}
                            >
                                {s}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};
