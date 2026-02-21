import * as vscode from "vscode";
import { io, Socket } from "socket.io-client";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@codesync/socket-types";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;
let statusBarItem: vscode.StatusBarItem;
let isSharing = false;
let currentRoomId = "";
let fileWatcher: vscode.Disposable | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function activate(context: vscode.ExtensionContext) {
  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100,
  );
  statusBarItem.text = "$(broadcast) CodeSync";
  statusBarItem.tooltip = "Click to connect to a CodeSync room";
  statusBarItem.command = "codesync.connect";
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand("codesync.connect", connectToRoom),
    vscode.commands.registerCommand("codesync.disconnect", disconnect),
    vscode.commands.registerCommand("codesync.startSharing", startSharing),
    vscode.commands.registerCommand("codesync.stopSharing", stopSharing),
  );
}

async function connectToRoom() {
  const config = vscode.workspace.getConfiguration("codesync");
  const serverUrl = config.get<string>("serverUrl") || "http://localhost:3001";
  let userName = config.get<string>("userName") || "";

  if (!userName) {
    userName =
      (await vscode.window.showInputBox({
        prompt: "Enter your display name for CodeSync",
        placeHolder: "e.g. Alex",
      })) || "VSCode User";
    config.update("userName", userName, vscode.ConfigurationTarget.Global);
  }

  const roomId = await vscode.window.showInputBox({
    prompt: "Enter the CodeSync Room ID",
    placeHolder: "e.g. a1b2c3d4",
  });

  if (!roomId) return;

  currentRoomId = roomId;
  connectSocket(serverUrl, roomId, userName);
}

function connectSocket(serverUrl: string, roomId: string, userName: string) {
  if (socket) socket.disconnect();

  socket = io(serverUrl, { transports: ["websocket"] });

  socket.on("connect", () => {
    socket!.emit("room:join", { roomId, userName });
    statusBarItem.text = `$(broadcast) CodeSync: ${roomId}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground",
    );
    vscode.window.showInformationMessage(
      `✅ Connected to CodeSync room: ${roomId}`,
    );
    setupListeners(roomId);
  });

  socket.on("disconnect", () => {
    statusBarItem.text = "$(broadcast) CodeSync (disconnected)";
    statusBarItem.backgroundColor = undefined;
  });

  socket.on("connect_error", (err) => {
    vscode.window.showErrorMessage(
      `CodeSync: Connection failed — ${err.message}`,
    );
  });
}

function setupListeners(roomId: string) {
  if (!socket) return;

  // ── Browser user made changes → apply to VS Code ─────────────────────────
  socket.on("code:pending-change", async (change) => {
    const choice = await vscode.window.showInformationMessage(
      `💡 ${change.fromName} wants to make changes to the code`,
      { modal: false },
      "✅ Accept",
      "❌ Reject",
      "👁 Preview",
    );

    if (choice === "✅ Accept") {
      await applyCodeToEditor(change.code);
      socket!.emit("code:accept-change", {
        roomId,
        changeId: change.id,
        code: change.code,
      });
      vscode.window.showInformationMessage("✅ Changes applied to VS Code!");
    } else if (choice === "❌ Reject") {
      socket!.emit("code:reject-change", { roomId, changeId: change.id });
      vscode.window.showInformationMessage("❌ Changes rejected");
    } else if (choice === "👁 Preview") {
      await showDiff(change.code, change.fromName);
    }
  });

  socket.on("code:change-accepted", ({ code }) => {
    // Already accepted by this instance - no-op
  });
}

async function applyCodeToEditor(code: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("No active editor to apply changes to");
    return;
  }

  const doc = editor.document;
  const fullRange = new vscode.Range(
    doc.positionAt(0),
    doc.positionAt(doc.getText().length),
  );

  await editor.edit((editBuilder) => {
    editBuilder.replace(fullRange, code);
  });
}

async function showDiff(newCode: string, fromName: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // Create a temp document with the proposed code
  const proposedDoc = await vscode.workspace.openTextDocument({
    content: newCode,
    language: editor.document.languageId,
  });

  await vscode.commands.executeCommand(
    "vscode.diff",
    editor.document.uri,
    proposedDoc.uri,
    `Current ↔ ${fromName}'s Proposal`,
  );
}

async function startSharing() {
  if (!socket || !socket.connected) {
    vscode.window.showWarningMessage("Connect to a CodeSync room first!");
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage("Open a file to share");
    return;
  }

  isSharing = true;
  statusBarItem.text = `$(broadcast) CodeSync: Sharing 🔴`;

  // Send current file immediately
  sendCurrentFile(editor);

  // Watch for changes
  fileWatcher = vscode.workspace.onDidChangeTextDocument((event) => {
    if (
      !isSharing ||
      event.document !== vscode.window.activeTextEditor?.document
    )
      return;

    // Debounce to avoid spamming
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sendCurrentFile(vscode.window.activeTextEditor!);
    }, 300);
  });

  // Also watch when user switches files
  vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (editor && isSharing) sendCurrentFile(editor);
  });

  vscode.window.showInformationMessage(
    "🔴 Now sharing your VS Code file in real-time",
  );
}

function sendCurrentFile(editor: vscode.TextEditor) {
  if (!socket || !isSharing) return;

  const code = editor.document.getText();
  const fileName = editor.document.fileName.split("/").pop() || "file";
  const language = editor.document.languageId;

  socket.emit("code:vscode-update", {
    roomId: currentRoomId,
    code,
    fileName,
    language,
  });
}

function stopSharing() {
  isSharing = false;
  fileWatcher?.dispose();
  fileWatcher = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  statusBarItem.text = `$(broadcast) CodeSync: ${currentRoomId}`;
  vscode.window.showInformationMessage("⏹ Stopped sharing");
}

function disconnect() {
  stopSharing();
  socket?.disconnect();
  socket = null;
  currentRoomId = "";
  statusBarItem.text = "$(broadcast) CodeSync";
  statusBarItem.backgroundColor = undefined;
  vscode.window.showInformationMessage("Disconnected from CodeSync");
}

export function deactivate() {
  disconnect();
  statusBarItem.dispose();
}
