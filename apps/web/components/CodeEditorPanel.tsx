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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Editor header */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b border-border flex-shrink-0"
        style={{ background: "#0d0d14" }}
      >
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>

        {/* File name */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded text-xs font-mono text-slate-300">
          <span className="text-slate-500">📄</span>
          {fileName}
        </div>

        {/* Language selector */}
        <select
          value={language}
          onChange={(e) => {
            // Language change is cosmetic for now; VS Code extension controls language
          }}
          className="ml-auto bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono px-2 py-1 rounded outline-none cursor-pointer"
        >
          {LANGUAGE_OPTIONS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        {/* Pending indicator */}
        {pendingChanges.length > 0 && (
          <div className="flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-1 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {pendingChanges.length} pending
          </div>
        )}

        {/* Read-only badge */}
        <span className="text-xs font-mono text-slate-600 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
          {readOnly ? "read-only" : "editable"}
        </span>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
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
            lineDecorationsWidth: 8,
            lineNumbersMinChars: 3,
            renderLineHighlight: "gutter",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            wordWrap: "on",
            automaticLayout: true,
            readOnly,
            padding: { top: 16, bottom: 16 },
            bracketPairColorization: { enabled: true },
          }}
        />
      </div>

      {/* Footer: keyboard shortcut hint */}
      <div
        className="px-4 py-1.5 border-t border-border flex items-center gap-4 flex-shrink-0"
        style={{ background: "#0a0a12" }}
      >
        <span className="text-xs font-mono text-slate-600">
          Changes are sent to VS Code owner for review
        </span>
        <span className="ml-auto text-xs font-mono text-slate-700">
          Ctrl+Z to undo
        </span>
      </div>
    </div>
  );
}
