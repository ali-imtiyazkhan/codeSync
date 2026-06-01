"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { Socket } from "socket.io-client";
import { useRoomStore } from "../../store/roomStore";

interface EditorPanelProps {
    roomId?: string;
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

    // ONLY store editor reference here (DO NOT INIT YJS HERE)
    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    // SAFE YJS INIT — WAIT FOR roomId + editor
    useEffect(() => {
        if (!roomId || !editorRef.current) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        const channelName = isFriendPanel
            ? `colabcode-${roomId}-friend`
            : `colabcode-${roomId}-owner`;

        const provider = new WebsocketProvider(wsUrl, channelName, ydoc);
        providerRef.current = provider;

        const yText = ydoc.getText("monaco");

        const binding = new MonacoBinding(
            yText,
            editorRef.current.getModel()!,
            new Set([editorRef.current]),
            provider.awareness
        );

        bindingRef.current = binding;

        provider.awareness.setLocalStateField("user", {
            name: isFriendPanel ? "Friend" : "You",
            color: isFriendPanel ? "#a3a3a3" : "#ffffff",
        });

        return () => {
            binding.destroy();
            provider.destroy();
            ydoc.destroy();
        };
    }, [roomId, isFriendPanel]);

    // change-proposed is handled centrally in useSocket.ts — do not add a duplicate listener here.

    const handleProposeChange = () => {
        if (!socket || !editorRef.current || !roomId) return;

        const newCode = editorRef.current.getValue();

        socket.emit("propose-change", {
            roomId,
            original: myCode,
            newCode,
        });
    };

    return (
        <div className="flex flex-col h-full">

            {/* Toolbar */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0a0a] border-b border-[#1f1f1f]">

                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#000000] border border-[#1f1f1f] text-[#737373] text-xs rounded px-2 py-1 font-mono focus:outline-none focus:border-white"
                >
                    {LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                            {l}
                        </option>
                    ))}
                </select>

                <div className="flex-1" />

                {/* Friend panel */}
                {isFriendPanel && (
                    <button
                        onClick={handleProposeChange}
                        className="px-3 py-1 text-xs font-semibold bg-[#22c55e] text-black rounded hover:bg-[#16a34a] transition-colors font-mono"
                    >
                        ✓ Propose Change
                    </button>
                )}

                {/* Owner panel */}
                {!isFriendPanel && socket && (
                    <button
                        onClick={() => {
                            if (!editorRef.current || !roomId) return;

                            socket.emit("sync-to-friend", {
                                roomId,
                                code: editorRef.current.getValue(),
                            });
                        }}
                        className="px-3 py-1 text-xs font-semibold bg-[#ffffff15] text-white border border-[#ffffff30] rounded hover:bg-[#ffffff25] transition-colors font-mono"
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
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        smoothScrolling: true,
                        readOnly: readOnly,
                        padding: { top: 12 },
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>
        </div>
    );
}