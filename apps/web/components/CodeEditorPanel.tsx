"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import type { Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  PendingChange,
} from "@codesync/socket-types";
import { Sparkles, AlertCircle, AlertTriangle, Info, ChevronRight } from "lucide-react";
import {
  configureMonaco,
  resolveMonacoLanguage,
  getSeverityLabel,
  type EditorMarker,
} from "../lib/monacoConfig";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

const DiffEditor = dynamic(() => import("@monaco-editor/react").then((m) => m.DiffEditor), {
  ssr: false,
  loading: () => <EditorLoading />,
});

function SafeDiffEditor(props: React.ComponentProps<typeof DiffEditor>) {
  const diffRef = useRef<editor.IStandaloneDiffEditor | null>(null);

  useEffect(() => {
    return () => {
      if (diffRef.current) {
        try {
          diffRef.current.setModel({ original: null, modified: null });
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <DiffEditor
      {...props}
      onMount={(diffEditor, monaco) => {
        diffRef.current = diffEditor;
        props.onMount?.(diffEditor, monaco);
      }}
    />
  );
}

function EditorLoading() {
  return (
    <div className="cs-editor-loading">
      <span>Loading editor…</span>
    </div>
  );
}

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const LANGUAGE_OPTIONS = [
  { value: "typescript", label: "TS" },
  { value: "javascript", label: "JS" },
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
  language: languageProp,
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
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [markers, setMarkers] = useState<EditorMarker[]>([]);
  const [problemsOpen, setProblemsOpen] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => languageProp || resolveMonacoLanguage(fileName)
  );

  const monacoLanguage = selectedLanguage || resolveMonacoLanguage(fileName);

  const isReviewMode =
    pendingChanges.length > 0 && !!onAccept && pendingChanges[0]?.newCode !== code;
  const currentPending = pendingChanges[0];

  const errors = markers.filter((m) => m.severity === 8);
  const warnings = markers.filter((m) => m.severity === 4);

  const refreshMarkers = useCallback(() => {
    const monaco = monacoRef.current;
    const ed = editorRef.current;
    if (!monaco || !ed) return;
    const model = ed.getModel();
    if (!model) {
      setMarkers([]);
      return;
    }
    const raw = monaco.editor.getModelMarkers({ resource: model.uri });
    setMarkers(
      raw.map((m) => ({
        severity: m.severity,
        message: m.message,
        startLineNumber: m.startLineNumber,
        startColumn: m.startColumn,
        endLineNumber: m.endLineNumber,
        endColumn: m.endColumn,
      }))
    );
  }, []);

  const handleBeforeMount = (monaco: Monaco) => {
    monacoRef.current = monaco;
    configureMonaco(monaco);
  };

  const handleEditorMount = (ed: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = ed;
    monacoRef.current = monaco;
    refreshMarkers();
  };

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco) return;
    const sub = monaco.editor.onDidChangeMarkers(() => refreshMarkers());
    return () => sub.dispose();
  }, [refreshMarkers]);

  useEffect(() => {
    if (errors.length > 0 || warnings.length > 0) setProblemsOpen(true);
  }, [errors.length, warnings.length]);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (isReviewMode) return;
      onChange(value || "");
    },
    [onChange, isReviewMode]
  );

  const goToMarker = (marker: EditorMarker) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.setPosition({
      lineNumber: marker.startLineNumber,
      column: marker.startColumn,
    });
    ed.revealPositionInCenter({
      lineNumber: marker.startLineNumber,
      column: marker.startColumn,
    });
    ed.focus();
  };

  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontLigatures: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: "on",
    glyphMargin: true,
    folding: true,
    renderValidationDecorations: "on",
    showUnused: true,
    overviewRulerLanes: 3,
    overviewRulerBorder: false,
    cursorBlinking: "smooth",
    smoothScrolling: true,
    wordWrap: "on",
    automaticLayout: true,
    readOnly: readOnly || isReviewMode,
    padding: { top: 16, bottom: 16 },
    bracketPairColorization: { enabled: true },
    scrollbar: {
      vertical: "visible",
      horizontal: "visible",
      useShadows: false,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    fixedOverflowWidgets: true,
  };

  const displayMarkers = [...errors, ...warnings].slice(0, 8);

  return (
    <div className={`cs-editor-panel ${isReviewMode ? "cs-editor-panel--review" : ""}`}>
      <div className="cs-editor-header">
        <div className="cs-editor-header-left">
          <span className="cs-editor-file-name">{fileName}</span>
          {errors.length > 0 && (
            <span className="cs-editor-badge cs-editor-badge--error">
              {errors.length} error{errors.length !== 1 ? "s" : ""}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="cs-editor-badge cs-editor-badge--warning">
              {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
            </span>
          )}
          {errors.length === 0 && warnings.length === 0 && (
            <span className="cs-editor-badge cs-editor-badge--ok">No issues</span>
          )}
        </div>

        {isReviewMode && currentPending && (
          <div className="cs-editor-review-bar">
            <span className="cs-editor-review-label">Reviewing suggestion</span>
            <button
              type="button"
              className="cs-editor-review-btn cs-editor-review-btn--reject"
              onClick={() => onReject?.(currentPending)}
            >
              Reject
            </button>
            <button
              type="button"
              className="cs-editor-review-btn cs-editor-review-btn--accept"
              onClick={() => onAccept?.(currentPending)}
            >
              Accept
            </button>
          </div>
        )}

        <div className="cs-editor-header-right">
          {!isReviewMode && pendingChanges.length > 0 && (
            <span className="cs-editor-badge cs-editor-badge--pending">
              {pendingChanges.length} pending
            </span>
          )}

          <button type="button" className="cs-editor-ai-btn" onClick={() => onAIScan?.()}>
            <Sparkles size={14} />
            AI scan
          </button>

          <select
            value={monacoLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="cs-editor-lang-select"
            aria-label="Language"
          >
            {LANGUAGE_OPTIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <span className="cs-editor-mode">{readOnly ? "Read-only" : "Editable"}</span>
        </div>
      </div>

      <div className="cs-editor-body">
        {isReviewMode && currentPending ? (
          <SafeDiffEditor
            height="100%"
            language={monacoLanguage}
            original={code}
            modified={currentPending.newCode}
            theme="codesync-dark"
            beforeMount={handleBeforeMount}
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
            language={monacoLanguage}
            path={`inmemory://${fileName}`}
            value={code}
            onChange={handleEditorChange}
            beforeMount={handleBeforeMount}
            onMount={handleEditorMount}
            theme="codesync-dark"
            options={editorOptions}
          />
        )}
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <div className={`cs-editor-problems ${problemsOpen ? "is-open" : ""}`}>
          <button
            type="button"
            className="cs-editor-problems-toggle"
            onClick={() => setProblemsOpen((o) => !o)}
          >
            <ChevronRight
              size={14}
              className={`cs-editor-problems-chevron ${problemsOpen ? "is-open" : ""}`}
            />
            <span>Problems</span>
            <span className="cs-editor-problems-count">
              {errors.length > 0 && (
                <span className="text-red">{errors.length} error(s)</span>
              )}
              {errors.length > 0 && warnings.length > 0 && ", "}
              {warnings.length > 0 && (
                <span className="text-amber">{warnings.length} warning(s)</span>
              )}
            </span>
          </button>

          {problemsOpen && (
            <ul className="cs-editor-problems-list">
              {displayMarkers.map((m, i) => {
                const kind = getSeverityLabel(m.severity);
                return (
                  <li key={`${m.startLineNumber}-${m.startColumn}-${i}`}>
                    <button
                      type="button"
                      className={`cs-editor-problem cs-editor-problem--${kind}`}
                      onClick={() => goToMarker(m)}
                    >
                      {kind === "error" && <AlertCircle size={14} />}
                      {kind === "warning" && <AlertTriangle size={14} />}
                      {kind === "info" && <Info size={14} />}
                      <span className="cs-editor-problem-loc">
                        Line {m.startLineNumber}, col {m.startColumn}
                      </span>
                      <span className="cs-editor-problem-msg">{m.message}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
