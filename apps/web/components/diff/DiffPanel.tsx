"use client";

import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { X, Check } from "lucide-react";

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
            renderSideBySide: false,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            lineNumbers: "on",
            diffWordWrap: "on",
            automaticLayout: true,
            scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8
            }
        });

        const originalModel = monaco.editor.createModel(original, "javascript");
        const modifiedModel = monaco.editor.createModel(modified, "javascript");

        diffEditor.setModel({ original: originalModel, modified: modifiedModel });
        diffEditorRef.current = diffEditor;

        return () => {
            if (diffEditorRef.current) {
                diffEditorRef.current.setModel({ original: null as any, modified: null as any });
                diffEditorRef.current.dispose();
            }
            if (originalModel && !originalModel.isDisposed()) originalModel.dispose();
            if (modifiedModel && !modifiedModel.isDisposed()) modifiedModel.dispose();
        };
    }, [original, modified]);

    return (
        <div className="flex flex-col border-b border-[#525252] bg-[#0a0a0a] animate-slideDown">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#ffffff10] border-b border-[#ffffff20]">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-mono text-white font-semibold">
                    Incoming Change
                </span>
                <span className="text-xs text-[#737373]">
                    from <span className="text-[#3fb950]">{authorName}</span> — review and decide
                </span>

                <div className="flex gap-2 ml-auto">
                    <button
                        onClick={onReject}
                        className="px-4 py-1 text-xs font-semibold font-mono rounded border border-[#f85149] text-[#f85149] hover:bg-[#f8514922] transition-colors flex items-center gap-1.5"
                    >
                        <X size={12} /> Reject
                    </button>
                    <button
                        onClick={onAccept}
                        className="px-4 py-1 text-xs font-semibold font-mono rounded bg-[#22c55e] text-black hover:bg-[#16a34a] transition-colors flex items-center gap-1.5"
                    >
                        <Check size={12} /> Accept
                    </button>
                </div>
            </div>

            {/* Diff Editor */}
            <div ref={containerRef} className="h-[400px] border-t border-[#1f1f1f]" />
        </div>
    );
}