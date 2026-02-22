"use client";

import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

interface DiffPanelProps {
    original: string;
    modified: string;
    authorName: string;
    onAccept: () => void;
    onReject: () => void;
}

export function DiffPanel({
    original,
    modified,
    authorName,
    onAccept,
    onReject,
}: DiffPanelProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const diffEditorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
            theme: "vs-dark",
            readOnly: true,
            renderSideBySide: true,
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 8 },
        });

        const originalModel = monaco.editor.createModel(original, "javascript");
        const modifiedModel = monaco.editor.createModel(modified, "javascript");

        diffEditor.setModel({ original: originalModel, modified: modifiedModel });
        diffEditorRef.current = diffEditor;

        return () => {
            diffEditor.dispose();
            originalModel.dispose();
            modifiedModel.dispose();
        };
    }, [original, modified]);

    return (
        <div className="flex flex-col border-b border-[#d29922] bg-[#161b22] animate-slideDown">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#d2992222] border-b border-[#d2992244]">
                <div className="w-2 h-2 rounded-full bg-[#d29922] animate-pulse" />
                <span className="text-sm font-mono text-[#d29922] font-semibold">
                    Incoming Change
                </span>
                <span className="text-xs text-[#8b949e]">
                    from <span className="text-[#3fb950]">{authorName}</span> — review and decide
                </span>

                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={onReject}
                        className="px-4 py-1 text-xs font-semibold font-mono rounded border border-[#f85149] text-[#f85149] hover:bg-[#f8514922] transition-colors"
                    >
                        ✗ Reject
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-1 text-xs font-semibold font-mono rounded bg-[#3fb950] text-[#0d1117] hover:bg-[#2ea043] transition-colors"
                    >
                        ✓ Accept
                    </button>
                </div>
            </div>

            {/* Diff Editor */}
            <div ref={containerRef} className="h-52" />
        </div>
    );
}