"use client";

import { useRef, useCallback, useEffect } from "react";
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
  loading: () => <EditorLoading />,
});

const DiffEditor = dynamic(() => import("@monaco-editor/react").then(mod => mod.DiffEditor), {
  ssr: false,
  loading: () => <EditorLoading />,
});

// Wrapper to prevent "TextModel got disposed before DiffEditorWidget model got reset"
function SafeDiffEditor(props: any) {
  const diffRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (diffRef.current) {
        try {
          // Manually reset models before unmount
          diffRef.current.setModel({ original: null, modified: null });
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  return (
    <DiffEditor
      {...props}
      onMount={(editor: any, monaco: any) => {
        diffRef.current = editor;
        props.onMount?.(editor, monaco);
      }}
    />
  );
}

function EditorLoading() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#262624]">
      <span className="text-[#8b949e] font-mono text-sm animate-pulse">Loading editor...</span>
    </div>
  );
}

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
  onAccept?: (change: PendingChange) => void;
  onReject?: (change: PendingChange) => void;
  onAIScan?: () => void;
  hideHeader?: boolean;
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
  onAccept,
  onReject,
  onAIScan,
}: CodeEditorPanelProps) {
  const editorRef = useRef<any>(null);

  const isReviewMode = pendingChanges.length > 0 && !!onAccept && pendingChanges[0]?.newCode !== code;
  const currentPending = pendingChanges[0];

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (isReviewMode) return;
      onChange(value || "");
    },
    [onChange, isReviewMode]
  );

  const handleEditorMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const editorOptions = {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: "on" as const,
    renderingIndentGuides: true,
    cursorBlinking: "smooth" as const,
    smoothScrolling: true,
    wordWrap: "on" as const,
    automaticLayout: true,
    readOnly: readOnly || isReviewMode,
    padding: { top: 20, bottom: 20 },
    bracketPairColorization: { enabled: true },
    scrollbar: {
      vertical: 'visible' as const,
      horizontal: 'visible' as const,
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10
    }
  };

  return (
    <div className={`cs-editor-panel shadow-2xl ${isReviewMode ? 'ring-1 ring-[var(--blue)]' : ''}`}>
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

        {/* Center Section: Review Tools (only in review mode) */}
        {isReviewMode && currentPending && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--blue-soft)] p-0.5 rounded-xl shadow-2xl animate-slide-down">
            <div className="px-3 py-1.5 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--blue)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--blue)]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--blue)]">
                Reviewing Suggestion
              </span>
            </div>
            <div className="h-6 w-px bg-[var(--border)] mx-1" />
            <button
              onClick={() => onReject?.(currentPending)}
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--red)] hover:bg-[var(--red)]/10 rounded-lg transition-all"
            >
              Reject
            </button>
            <button
              onClick={() => onAccept?.(currentPending)}
              className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[var(--blue)] text-white hover:bg-[var(--blue)]/80 rounded-lg transition-all shadow-[0_0_15px_var(--blue-soft)]"
            >
              Accept Change
            </button>
          </div>
        )}

        {/* Right Section: Status & Meta */}
        <div className="flex items-center gap-3">
          {/* Pending indicator (if not in direct review mode) */}
          {!isReviewMode && pendingChanges.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[hsla(var(--blue-h),100%,68%,0.1)] border border-[hsla(var(--blue-h),100%,68%,0.2)] text-[var(--blue)] animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)]" />
              <span className="text-[10px] font-bold tracking-tight">{pendingChanges.length} PENDING</span>
            </div>
          )}

          {/* AI Scan button */}
          <button
            onClick={() => onAIScan?.()}
            className="relative px-4 py-1.5 rounded-full bg-black/40 border border-[var(--ai-cyan)]/40 text-[var(--ai-cyan)] font-black text-[10px] uppercase tracking-[0.2em] overflow-hidden group hover:bg-[var(--ai-cyan)] hover:text-black transition-all duration-500 shadow-[0_0_10px_var(--ai-glow)] hover:shadow-[0_0_25px_var(--ai-glow)] scale-100 hover:scale-105 active:scale-95"
            style={{ textShadow: '0 0 8px var(--ai-glow)' }}
          >
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-ai-shimmer pointer-events-none" />

            <span className="relative flex items-center gap-2">
              <span className="text-[12px] animate-pulse">✨</span>
              AI SCAN
            </span>
          </button>

          {/* Visibility badge */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-light)] hidden sm:flex">
            <div className={`w-1 h-1 rounded-full ${readOnly ? "bg-[var(--text-dim)]" : "bg-[var(--green)]"}`} />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
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
          {isReviewMode && currentPending ? (
            <SafeDiffEditor
              height="100%"
              language={language}
              original={code}
              modified={currentPending.newCode}
              theme="vs-dark"
              options={{
                ...editorOptions,
                renderSideBySide: false,
                readOnly: true,
                originalEditable: false,
              }}
            />
          ) : (
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={editorOptions}
            />
          )}
        </div>
      </div>
    </div >
  );
}
