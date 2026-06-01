"use client";

import React, { useState, useEffect, useRef } from "react";

const COLORS = { 
  AK: '#ffffff', 
  SR: '#a3a3a3', 
  MJ: '#525252' 
};

type CodePart = [string, string]; // [className, text]

const FINAL_LINES: CodePart[][] = [
  [['kw','async '],['kw','function '],['fn','syncRoom'],['op','('],['pl','roomId'],['op',', '],['pl','socket'],['op',') {']],
  [['cm','  // broadcast delta to all peers']],
  [['kw','  const '],['fn','delta '],['op','= '],['fn','computeDiff'],['op','('],['pl','prev'],['op',', '],['pl','next'],['op',');']],
  [['kw','  if '],['op','('],['fn','delta'],['op','.'],['pl','length '],['op','=== '],['num','0'],['op',') '],['kw','return'],['op',';']],
  [['kw','']],
  [['kw','  const '],['fn','payload '],['op','= '],['op','{']],
  [['pl','    room'],['op',': '],['fn','roomId'],['op',',']],
  [['pl','    changes'],['op',': '],['fn','delta'],['op',',']],
  [['pl','    ts'],['op',': '],['fn','Date'],['op','.'],['fn','now'],['op','(),']],
  [['op','  };']],
  [['kw','']],
  [['fn','  socket'],['op','.'],['fn','emit'],['op','('],['str','"sync"'],['op',', '],['fn','payload'],['op',');']],
  [['op','}']],
];

export const AnimatedHeroPreview: React.FC = () => {
  const [visibleLines, setVisibleLines] = useState<{ parts: CodePart[], partial: string, done: boolean }[]>([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [latency, setLatency] = useState(12);
  const [syncMsg, setSyncMsg] = useState("synced");
  const [srCursor, setSrCursor] = useState({ top: 20, left: 120, line: 1 });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Latency Flicker
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(8 + Math.floor(Math.random() * 18));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Remote Cursor Animation (SR)
  useEffect(() => {
    const moveCursor = () => {
      setSrCursor(prev => {
        const nextLine = Math.min(prev.line + 1, visibleLines.length > 0 ? visibleLines.length - 1 : 1);
        return {
          line: nextLine,
          top: 20 + nextLine * 24,
          left: 100 + Math.random() * 100
        };
      });
      timerRef.current = setTimeout(moveCursor, 1800 + Math.random() * 1000);
    };
    moveCursor();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visibleLines.length]);

  // Typing Animation
  useEffect(() => {
    if (lineIdx >= FINAL_LINES.length) {
      const reset = setTimeout(() => {
        setVisibleLines([]);
        setLineIdx(0);
        setCharIdx(0);
      }, 5000);
      return () => clearTimeout(reset);
    }

    const currentLineParts = FINAL_LINES[lineIdx];
    const fullText = currentLineParts.map(([, t]) => t || "").join("");

    if (charIdx <= fullText.length) {
      const typingTimer = setTimeout(() => {
        setSyncMsg("syncing...");
        
        // Build Partial
        let out = "";
        let count = 0;
        for (const [cls, txt] of currentLineParts) {
          if (!txt) continue;
          if (count + txt.length <= charIdx) {
            out += `<span class="${cls}">${txt}</span>`;
            count += txt.length;
          } else {
            const slice = txt.slice(0, charIdx - count);
            out += `<span class="${cls}">${slice}</span>`;
            break;
          }
        }

        setVisibleLines(prev => {
          const newLines = [...prev];
          if (!newLines[lineIdx]) {
            newLines[lineIdx] = { parts: currentLineParts, partial: out, done: false };
          } else {
            newLines[lineIdx] = { ...newLines[lineIdx], partial: out };
          }
          return newLines;
        });

        setCharIdx(prev => prev + 1);
      }, 30 + Math.random() * 40);
      return () => clearTimeout(typingTimer);
    } else {
      setSyncMsg("synced");
      const nextLineTimer = setTimeout(() => {
        setVisibleLines(prev => {
          const newLines = [...prev];
          newLines[lineIdx].done = true;
          return newLines;
        });
        setLineIdx(prev => prev + 1);
        setCharIdx(0);
      }, lineIdx % 3 === 0 ? 300 : 80);
      return () => clearTimeout(nextLineTimer);
    }
  }, [lineIdx, charIdx]);

  return (
    <div style={{ padding: "2rem 1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", width: "100%" }}>
      <div style={{ 
        width: "100%", maxWidth: "680px", borderRadius: "12px", 
        border: "1px solid #1f1f1f", overflow: "hidden", background: "#000000",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)"
      }}>
        {/* Titlebar */}
        <div style={{ background: "#0a0a0a", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#28c840" }} />
          </div>
          <span style={{ fontSize: "11px", color: "#737373", marginLeft: "6px", fontFamily: "monospace" }}>room-sync.ts — CodeSync</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
            {['AK', 'SR', 'MJ'].map((name, i) => (
              <div key={name} style={{ 
                width: "22px", height: "22px", borderRadius: "50%", 
                background: Object.values(COLORS)[i], color: "#fff", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: "9px", fontWeight: 800
              }}>{name}</div>
            ))}
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#28c840" }} />
            <span style={{ fontSize: "10px", color: "#737373", fontWeight: 600 }}>3 online</span>
          </div>
        </div>

        {/* Code Area */}
        <div style={{ padding: "20px 0", minHeight: "280px", position: "relative", fontFamily: "'JetBrains Mono', monospace" }}>
          {visibleLines.map((line, i) => (
            <div key={i} style={{ display: "flex", height: "24px" }}>
              <span style={{ width: "44px", textAlign: "right", paddingRight: "16px", fontSize: "12px", color: "#404040", userSelect: "none", flexShrink: 0 }}>{i + 1}</span>
              <div 
                style={{ fontSize: "13px", color: "#e5e5e5", whiteSpace: "pre" }}
                dangerouslySetInnerHTML={{ __html: line.done ? line.parts.map(([cls, txt]) => `<span class="${cls}">${txt}</span>`).join('') : line.partial }}
              />
              {!line.done && <span style={{ width: "2px", height: "15px", background: COLORS.AK, marginLeft: "1px", marginTop: "4px", animation: "blink 1s step-end infinite" }} />}
            </div>
          ))}
          
          {/* Remote Cursor SR */}
          <div style={{ 
            position: "absolute", top: srCursor.top, left: srCursor.left, 
            transition: "all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)",
            pointerEvents: "none", display: "flex", flexDirection: "column"
          }}>
            <div style={{ width: "2px", height: "18px", background: COLORS.SR }} />
            <div style={{ 
              fontSize: "9px", padding: "1px 5px", borderRadius: "3px", 
              background: COLORS.SR, color: "#fff", whiteSpace: "nowrap", 
              fontWeight: 800, marginTop: "1px"
            }}>SR</div>
          </div>
        </div>

        {/* Status Bar */}
        <div style={{ background: "#0a0a0a", borderTop: "1px solid #111111", padding: "5px 16px", display: "flex", gap: "16px", fontSize: "11px", color: "#444", fontWeight: 700 }}>
          <span style={{ color: "#28c840" }}>● connected</span>
          <span>WebSocket</span>
          <span style={{ width: "40px" }}>~{latency}ms</span>
          <span style={{ marginLeft: "auto" }}>{syncMsg}</span>
        </div>
      </div>

      {/* Badge Row */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { color: COLORS.AK, text: "AK is typing", indicator: true },
          { color: COLORS.SR, text: "SR viewing line " + (srCursor.line + 1) },
          { color: COLORS.MJ, text: "MJ on canvas" },
        ].map((badge, i) => (
          <div key={i} style={{ 
            background: "#0a0a0a", border: "1px solid #1a1a1a", 
            borderRadius: "8px", padding: "8px 16px", 
            fontSize: "12px", color: "#888", fontWeight: 800,
            display: "flex", alignItems: "center", gap: "10px"
          }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: badge.color }} />
            {badge.text}
            {badge.indicator && (
              <div style={{ display: "flex", gap: "3px" }}>
                {[0, 1, 2].map(d => (
                  <div key={d} style={{ 
                    width: "5px", height: "5px", borderRadius: "50%", background: badge.color, 
                    animation: `bounce 1.2s infinite ${d * 0.2}s` 
                  }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .kw { color: #c792ea; font-weight: 800; }
        .fn { color: #82aaff; font-weight: 800; }
        .str { color: #c3e88d; font-weight: 800; }
        .num { color: #f78c6c; font-weight: 800; }
        .op { color: #89ddff; }
        .cm { color: #444; font-style: italic; }
        .pl { color: #ffcb6b; }
        .ty { color: #80cbc4; }
        @keyframes bounce { 
          0%, 80%, 100% { transform: translateY(0); opacity: 0.3; } 
          40% { transform: translateY(-4px); opacity: 1; } 
        }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};
