import type { Monaco } from "@monaco-editor/react";

let configured = false;

export function configureMonaco(monaco: Monaco) {
  if (configured) return;
  configured = true;

  const { typescript } = monaco.languages;

  typescript.typescriptDefaults.setCompilerOptions({
    target: typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    allowJs: true,
    jsx: typescript.JsxEmit.React,
    jsxFactory: "React.createElement",
    reactNamespace: "React",
    module: typescript.ModuleKind.ESNext,
    moduleResolution: typescript.ModuleResolutionKind.NodeJs,
    esModuleInterop: true,
    noEmit: true,
    strict: false,
  });

  typescript.javascriptDefaults.setCompilerOptions({
    target: typescript.ScriptTarget.ESNext,
    allowNonTsExtensions: true,
    jsx: typescript.JsxEmit.React,
    module: typescript.ModuleKind.ESNext,
    noEmit: true,
  });

  monaco.editor.defineTheme("codesync-dark", {
    base: "hc-black",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6b7280", fontStyle: "italic" },
      { token: "keyword", foreground: "c084fc" },
      { token: "string", foreground: "86efac" },
      { token: "number", foreground: "fdba74" },
      { token: "type", foreground: "67e8f9" },
    ],
    colors: {
      "editor.background": "#000000",
      "editor.foreground": "#e5e5e5",
      "editorLineNumber.foreground": "#404040",
      "editorLineNumber.activeForeground": "#a3a3a3",
      "editor.selectionBackground": "#ffffff22",
      "editor.lineHighlightBackground": "#0a0a0a",
      "editorCursor.foreground": "#34d399",
      "editorIndentGuide.background": "#1a1a1a",
      "editorIndentGuide.activeBackground": "#333333",
      "editorError.foreground": "#fca5a5",
      "editorError.border": "#ef4444",
      "editorWarning.foreground": "#fde68a",
      "editorWarning.border": "#f59e0b",
      "editorInfo.foreground": "#93c5fd",
      "editorInfo.border": "#3b82f6",
      "editorGutter.background": "#000000",
      "editorOverviewRuler.border": "#1a1a1a",
      "editorOverviewRuler.errorForeground": "#ef4444",
      "editorOverviewRuler.warningForeground": "#f59e0b",
    },
  });
}

export function resolveMonacoLanguage(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "tsx":
    case "ts":
      return "typescript";
    case "jsx":
    case "js":
    case "mjs":
      return "javascript";
    case "py":
      return "python";
    case "rs":
      return "rust";
    case "go":
      return "go";
    case "cpp":
    case "cc":
    case "c":
      return "cpp";
    case "java":
      return "java";
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
      return "html";
    default:
      return "typescript";
  }
}

export type EditorMarker = {
  severity: number;
  message: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
};

export function getSeverityLabel(severity: number): "error" | "warning" | "info" {
  if (severity === 8) return "error";
  if (severity === 4) return "warning";
  return "info";
}
