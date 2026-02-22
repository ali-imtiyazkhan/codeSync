"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { Socket } from "socket.io-client";
import { useRoomStore } from "../../store/roomStore";

interface EditorPanelProps {
    roomId: string;
    userId: string;
    role: "owner" | "editor";
    value: string;
    onChange: (val: string) => void;
    socket: Socket | null;
    readOnly?: boolean;
    isFriendPanel?: boolean;
}

const LANGUAGES = ["javascript", "typescript", "python", "rust", "go", "css", "html"];

export function EditorPanel({
    roomId,
    userId,
    role,
    value,
    onChange,
    socket,
    readOnly = false,
    isFriendPanel = false,
}: EditorPanelProps) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const [language, setLanguage] = useState("javascript");
    const { setPendingChange, myCode } = useRoomStore();

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Setup Yjs document
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

        // Each panel connects to its own Yjs room channel
        const channelName = isFriendPanel
            ? `colabcode-${roomId}-friend`
            : `colabcode-${roomId}-owner`;

        const provider = new WebsocketProvider(wsUrl, channelName, ydoc);
        providerRef.current = provider;

        const yText = ydoc.getText("monaco");

        // Bind Monaco editor to Yjs text
        const binding = new MonacoBinding(
            yText,
            editor.getModel()!,
            new Set([editor]),
            provider.awareness
        );
        bindingRef.current = binding;

        // Awareness: show cursor colors
        provider.awareness.setLocalStateField("user", {
            name: isFriendPanel ? "Friend" : "You",
            color: isFriendPanel ? "#3fb950" : "#58a6ff",
        });

        // If friend panel, listen for propose-change events
        if (isFriendPanel && socket) {
            editor.onDidChangeModelContent(() => {
                const currentCode = editor.getValue();
                // Emit friend's changes live to socket
                socket.emit("friend-typing", { roomId, code: currentCode });
            });
        }
    };

    // When owner clicks "Send to Friend" — push code to friend panel
    useEffect(() => {
        if (!socket) return;

        // Owner receives accepted changes back from friend
        socket.on("change-proposed", (data: { original: string; newCode: string }) => {
            if (!isFriendPanel) {
                setPendingChange(data);
            }
        });

        return () => {
            socket.off("change-proposed");
        };
    }, [socket, isFriendPanel]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            bindingRef.current?.destroy();
            providerRef.current?.destroy();
            ydocRef.current?.destroy();
        };
    }, []);

    const handleProposeChange = () => {
        if (!socket || !editorRef.current) return;
        const newCode = editorRef.current.getValue();
        socket.emit("propose-change", {
            roomId,
            original: myCode,
            newCode,
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Editor Toolbar */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#161b22] border-b border-[#30363d]">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#0d1117] border border-[#30363d] text-[#8b949e] text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-[#58a6ff]"
                >
                    {LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                            {l}
                        </option>
                    ))}
                </select>

                <div className="flex-1" />

                {/* Friend panel: propose change button */}
                {isFriendPanel && (
                    <button
                        onClick={handleProposeChange}
                        className="px-3 py-1 text-xs font-semibold bg-[#3fb950] text-[#0d1117] rounded hover:bg-[#2ea043] transition-colors font-mono"
                    >
                        ✓ Propose Change
                    </button>
                )}

                {/* Owner panel: send to friend */}
                {!isFriendPanel && socket && (
                    <button
                        onClick={() => {
                            if (!editorRef.current) return;
                            socket.emit("sync-to-friend", {
                                roomId,
                                code: editorRef.current.getValue(),
                            });
                        }}
                        className="px-3 py-1 text-xs font-semibold bg-[#58a6ff22] text-[#58a6ff] border border-[#58a6ff44] rounded hover:bg-[#58a6ff33] transition-colors font-mono"
                    >
                        → Send to Friend
                    </button>
                )}
            </div>

            {/* Monaco Editor */}
            <div className="flex-1">
                <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    defaultValue={value || "// Start coding here...\n"}
                    onMount={handleEditorMount}
                    onChange={(val) => {
                        if (!isFriendPanel && val !== undefined) onChange(val);
                    }}
                    options={{
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontLigatures: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        glyphMargin: true,
                        folding: true,
                        lineDecorationsWidth: 10,
                        renderLineHighlight: "line",
                        cursorBlinking: "smooth",
                        cursorSmoothCaretAnimation: "on",
                        smoothScrolling: true,
                        readOnly: readOnly,
                        padding: { top: 12 },
                        bracketPairColorization: { enabled: true },
                        guides: {
                            bracketPairs: true,
                            indentation: true,
                        },
                    }}
                />
            </div>
        </div>
    );
}