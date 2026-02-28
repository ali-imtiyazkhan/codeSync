"use client";

import { useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PendingChange,
} from "@codesync/socket-types";

// Monaco must be loaded client-side only
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-slate-950">
      <span className="text-slate-500 font-mono text-sm animate-pulse">Loading editor...</span>
    </div>
  ),
});

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JS" },
  { value: "typescript", label: "TS" },
  { value: "python", label: "Python" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

interface CodeEditorPanelProps {
  code: string;
  language: string;
  fileName: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  socket: AppSocket | null;
  roomId: string;
  pendingChanges: PendingChange[];
}

export default function CodeEditorPanel({
  code,
  language,
  fileName,
  onChange,
  readOnly = false,
  socket,
  roomId,
  pendingChanges,
}: CodeEditorPanelProps) {
  const editorRef = useRef<unknown>(null);
  const isRemoteUpdate = useRef(false);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (isRemoteUpdate.current) return;
      onChange(value || "");
    },
    [onChange]
  );

  const handleEditorMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  return (
    <div className="cs-editor-panel shadow-2xl">
      {/* Editor header */}
      <div className="cs-editor-header">
        {/* Left Section: File & Control */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 p-1 rounded-lg bg-black/20 border border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--red)] opacity-70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--orange)] opacity-70" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--green)] opacity-70" />
          </div>

          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-light)] flex items-center justify-center text-xs group-hover:border-[var(--blue-soft)] transition-all shadow-lg">
              📄
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[var(--text)] tracking-tight">{fileName}</span>
              <span className="text-[9px] font-mono text-[var(--text-dim)] uppercase tracking-widest">{language} active</span>
            </div>
          </div>
        </div>

        {/* Right Section: Status & Meta */}
        <div className="flex items-center gap-3">
          {/* Pending indicator */}
          {pendingChanges.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[hsla(var(--blue-h),100%,68%,0.1)] border border-[hsla(var(--blue-h),100%,68%,0.2)] text-[var(--blue)] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
              <span className="text-[10px] font-bold tracking-tight">{pendingChanges.length} PENDING</span>
            </div>
          )}

          {/* Visibility badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-light)]">
            <div className={`w-1 h-1 rounded-full ${readOnly ? "bg-[var(--text-dim)]" : "bg-[var(--green)]"}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {readOnly ? "ReadOnly" : "Editable"}
            </span>
          </div>

          <select
            value={language}
            onChange={() => { }}
            className="bg-[var(--bg-elevated)] border border-[var(--border-light)] text-[var(--text-muted)] text-[10px] font-bold px-3 py-1 rounded-lg outline-none cursor-pointer hover:border-[var(--blue-soft)] transition-all appearance-none text-center min-w-[60px]"
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <MonacoEditor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlight: "gutter",
              cursorBlinking: "smooth",
              smoothScrolling: true,
              wordWrap: "on",
              automaticLayout: true,
              readOnly,
              suggestOnTriggerCharacters: true,
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true
              },
              parameterHints: {
                enabled: true
              },
              formatOnType: true,
              formatOnPaste: true,
              padding: { top: 20, bottom: 20 },
              bracketPairColorization: { enabled: true },
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10
              }
            }}
          />
        </div>
      </div>

      {/* Footer: keyboard shortcut hint */}
      <div className="cs-editor-footer">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[var(--blue)] opacity-60 animate-pulse shadow-[0_0_8px_var(--blue-glow)]" />
          <span className="text-[10px] font-bold text-[var(--text-dim)] tracking-widest uppercase">
            {readOnly ? "Live Monitoring" : "Sync Active ↔ Streaming"}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-[var(--text-dim)]">
          <div className="flex gap-2">
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">CTRL+Z</span>
            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 uppercase">CMD+S</span>
          </div>
          <span className="text-[var(--blue-soft)] font-bold">LN {code.split('\n').length}</span>
        </div>
      </div>
    </div>
  );
}
