import * as vscode from "vscode";
import { io, Socket } from "socket.io-client";
import * as path from "path";
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@codesync/socket-types";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;
let statusBarItem: vscode.StatusBarItem;
let isSharing = false;
let currentRoomId = "";
let currentUserId = "";
let myRole: "owner" | "editor" | null = null;
let fileWatcher: vscode.Disposable | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isApplyingRemoteChange = false;
let lastReceivedCode = "";

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
  let userId = config.get<string>("userId") || "";

  if (!userName) {
    userName =
      (await vscode.window.showInputBox({
        prompt: "Enter your display name for CodeSync",
        placeHolder: "e.g. Alex",
      })) || "VSCode User";
    config.update("userName", userName, vscode.ConfigurationTarget.Global);
  }

  if (!userId) {
    userId = `vscode-${Math.random().toString(36).substring(2, 9)}`;
    config.update("userId", userId, vscode.ConfigurationTarget.Global);
  }

  const roomId = await vscode.window.showInputBox({
    prompt: "Enter the CodeSync Room ID",
    placeHolder: "e.g. a1b2c3d4",
  });

  if (!roomId) return;

  currentRoomId = roomId;
  currentUserId = userId;
  connectSocket(serverUrl, roomId, userId, userName);
}

function connectSocket(serverUrl: string, roomId: string, userId: string, userName: string) {
  if (socket) socket.disconnect();

  socket = io(serverUrl, {
    query: { roomId, userId, userName },
    transports: ["websocket"]
  });

  socket.on("connect", () => {
    socket!.emit("join-room", { roomId, userId, userName });
    statusBarItem.text = `$(broadcast) CodeSync: ${roomId}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground",
    );
    vscode.window.showInformationMessage(
      `✅ Connected to CodeSync room: ${roomId}`,
    );
    setupListeners(roomId);
  });

  socket.on("role-assigned", (data) => {
    myRole = data.role;
    vscode.window.showInformationMessage(`👤 You are now the ${data.role.toUpperCase()} of this room`);
  });

  socket.on("disconnect", () => {
    statusBarItem.text = "$(broadcast) CodeSync (disconnected)";
    statusBarItem.backgroundColor = undefined;
    myRole = null;
  });

  socket.on("connect_error", (err) => {
    vscode.window.showErrorMessage(
      `CodeSync: Connection failed — ${err.message}`,
    );
  });
}

function setupListeners(roomId: string) {
  if (!socket) return;

  //Browser user made changes → sync to VS Code (once accepted)
  socket.on("change-proposed", async (change) => {
    // We no longer show a prompt in VS Code to avoid double-triggers.
    // The user handles the "Accept/Reject" in the Browser UI.
    // Once they click "Accept" in the browser, the server emits "change-accepted"
    // which this extension already listens to below.
    console.log(`[CodeSync] Change proposed by ${change.authorId}. Awaiting action in browser...`);
  });

  socket.on("change-accepted", async ({ newCode }) => {
    // If we are the editor, our proposed change was accepted, or someone else's was.
    // Sync the editor content.
    await applyCodeToEditor(newCode);
  });

  socket.on("owner-code-update", async ({ code }) => {
    // Sync if we are not the owner (owner is authoritative)
    if (myRole !== "owner") {
      await applyCodeToEditor(code);
    }
  });

  socket.on("vscode-push", async ({ code }) => {
    // Sync everywhere when pushed from VS Code
    await applyCodeToEditor(code);
  });
}

async function applyCodeToEditor(code: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const doc = editor.document;
  if (doc.getText() === code) return; // Prevent infinite loops

  lastReceivedCode = code; // Update last received
  isApplyingRemoteChange = true;
  try {
    const fullRange = new vscode.Range(
      doc.positionAt(0),
      doc.positionAt(doc.getText().length),
    );

    await editor.edit((editBuilder) => {
      editBuilder.replace(fullRange, code);
    });
  } finally {
    isApplyingRemoteChange = false;
  }
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
    `Current ↔ ${fromName}`,
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
      isApplyingRemoteChange ||
      event.document !== vscode.window.activeTextEditor?.document
    )
      return;

    // Debounce to avoid spamming
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (vscode.window.activeTextEditor) {
        sendCurrentFile(vscode.window.activeTextEditor);
      }
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

// send current file
function sendCurrentFile(editor: vscode.TextEditor) {
  if (!socket || !isSharing) return;

  const code = editor.document.getText();

  if (code === lastReceivedCode) {
    return;
  }

  // Use path.basename for cross-platform filename extraction
  const fileName = path.basename(editor.document.fileName) || "file";
  const language = editor.document.languageId;

  socket.emit("vscode-push", {
    roomId: currentRoomId,
    code,
  });
}

// stop sharing
function stopSharing() {
  isSharing = false;
  fileWatcher?.dispose();
  fileWatcher = null;
  if (debounceTimer) clearTimeout(debounceTimer);
  statusBarItem.text = `$(broadcast) CodeSync: ${currentRoomId}`;
  vscode.window.showInformationMessage("⏹ Stopped sharing");
}

// disconnect from room
function disconnect() {
  stopSharing();
  socket?.disconnect();
  socket = null;
  currentRoomId = "";
  myRole = null;
  statusBarItem.text = "$(broadcast) CodeSync";
  statusBarItem.backgroundColor = undefined;
  vscode.window.showInformationMessage("Disconnected from CodeSync");
}

export function deactivate() {
  disconnect();
  statusBarItem.dispose();
}

