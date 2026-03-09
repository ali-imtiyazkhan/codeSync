"use client";

import type { AIAnalysisResult } from "@codesync/socket-types";

interface Props {
    results: AIAnalysisResult[];
    isOpen: boolean;
    onClose: () => void;
    isScanning: boolean;
}

export default function AIAssistantPanel({ results, isOpen, onClose, isScanning }: Props) {
    if (!isOpen) return null;

    return (
        <div
            className="animate-slide-left"
            style={{
                position: "absolute", top: 0, right: 0, bottom: 0, width: 320,
                background: "rgba(13,17,23,0.95)", backdropFilter: "blur(20px)",
                borderLeft: "1px solid rgba(0,255,225,0.2)",
                display: "flex", flexDirection: "column", zIndex: 100,
                boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
            }}
        >
            {/* Header */}
            <div style={{
                padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: "50%", background: "var(--neon)",
                        boxShadow: "var(--glow-neon)",
                        animation: isScanning ? "neon-pulse 1s infinite" : "none"
                    }} />
                    <span style={{
                        fontSize: "12px", fontWeight: 800, color: "var(--neon)",
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        textShadow: "var(--glow-neon)"
                    }}>
                        AI Insights
                    </span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "transparent", border: "none", color: "var(--muted)",
                        cursor: "pointer", fontSize: "18px", transition: "0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--muted)"}
                >✕</button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                {isScanning ? (
                    <div style={{
                        height: "100%", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 20
                    }}>
                        <div className="scanning-loader" />
                        <span style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.2em" }}>
                            ANALYZING CODE STRUCTURE...
                        </span>
                    </div>
                ) : results.length === 0 ? (
                    <div style={{
                        height: "100%", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center",
                        opacity: 0.5
                    }}>
                        <span style={{ fontSize: "24px" }}>✨</span>
                        <span style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.6 }}>
                            No critical issues found.<br />Your code looks clean!
                        </span>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {results.map((res, i) => (
                            <div key={i} className="animate-fade-in" style={{
                                background: "rgba(255,255,255,0.03)", borderRadius: 12,
                                border: `1px solid ${res.type === 'critical' ? 'rgba(255,45,107,0.3)' : res.type === 'warning' ? 'rgba(255,179,0,0.3)' : 'rgba(0,255,225,0.2)'}`,
                                padding: 12, transition: "0.2s",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <span style={{
                                        fontSize: "9px", fontWeight: 900, textTransform: "uppercase",
                                        color: res.type === 'critical' ? 'var(--neon3)' : res.type === 'warning' ? 'var(--amber)' : 'var(--neon)',
                                    }}>
                                        {res.type}
                                    </span>
                                    <span style={{ fontSize: "9px", color: "var(--muted)" }}>Line {res.line}</span>
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text)", marginBottom: 8, lineHeight: 1.5 }}>
                                    {res.message}
                                </div>
                                <div style={{
                                    fontSize: "10px", color: "var(--muted)", fontStyle: "italic",
                                    background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: 6,
                                    borderLeft: `2px solid ${res.type === 'critical' ? 'var(--neon3)' : res.type === 'warning' ? 'var(--amber)' : 'var(--neon)'}`
                                }}>
                                    {res.suggestion}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .scanning-loader {
          width: 40px;
          height: 40px;
          border: 2px solid rgba(0,255,225,0.1);
          border-top: 2px solid var(--neon);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: var(--glow-neon);
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-slide-left { animation: slideLeft 0.3s ease-out; }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out backwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
        </div>
    );
}
