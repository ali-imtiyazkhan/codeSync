# CodeSync — Real-Time Collaborative Dev Space

A full-stack Turborepo monorepo for real-time collaborative coding with:
- 📹 **Video calls** (WebRTC)
- 🖥️ **Screen sharing** (WebRTC — your VS Code and peer's VS Code)
- 💻 **VS Code file sync** (Socket.io + VS Code Extension)
- ✏️ **Live browser code editor** (Monaco Editor)
- 🔄 **Change review flow** (Propose → Accept/Reject → Instant VS Code apply)
- 🗄️ **Prisma + PostgreSQL** persistence

---

## Architecture

```
codesync/
├── apps/
│   ├── web/                    # Next.js 14 + Tailwind + TypeScript (browser UI)
│   └── vscode-extension/       # VS Code extension (file sync agent)
├── packages/
│   ├── db/                     # Prisma client + schema
│   └── socket-types/           # Shared TypeScript types for all socket events
└── server/                     # Standalone Socket.io server (Node.js)
```

### How the 5-Panel Layout Works

```
┌─────────────┬─────────────┬───────────────────┐
│  Your Cam   │ Friend Cam  │                   │
│  (WebRTC)   │  (WebRTC)   │   Code Editor     │
├─────────────┼─────────────┤   (Monaco)        │
│  Your Screen│Friend Screen│                   │
│   Share     │   Share     │   (spans 2 rows)  │
│  (WebRTC)   │  (WebRTC)   │                   │
└─────────────┴─────────────┴───────────────────┘
```

### Code Sync Flow

```
VS Code Extension
    │ (user edits file)
    │ code:vscode-update
    ▼
Socket.io Server ──► Browser Code Editor (Monaco)
                          │ (user makes changes)
                          │ code:editor-change
                          ▼
                    Socket.io Server
                          │ code:pending-change
                          ▼
                    VS Code Extension
                     shows toast:
                   "Accept / Reject / Preview"
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       Accept (applies          Reject (revert
       to VS Code)              to original)
              │
              │ code:accept-change
              ▼
       Everyone gets updated code
```

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL (or use Docker)
- pnpm (recommended)

### 2. Install

```bash
# Install pnpm globally if needed
npm i -g pnpm turbo

# Clone and install
cd codesync
pnpm install
```

### 3. Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Copy env file
cp .env.example .env
# Edit .env and set DATABASE_URL

# Push Prisma schema
pnpm db:push
```

### 4. Run Everything

```bash
# Terminal 1: Socket.io server
cd server
npx ts-node --transpile-only index.ts

# Terminal 2: Next.js web app
cd apps/web
pnpm dev

# OR run all with turbo:
pnpm dev
```

App runs at: **http://localhost:3000**
Socket server at: **http://localhost:3001**

### 5. VS Code Extension

```bash
cd apps/vscode-extension
pnpm install
pnpm build

# In VS Code:
# Press F5 to launch Extension Development Host
# OR install .vsix package:
# vsce package && code --install-extension codesync-vscode-0.0.1.vsix
```

---

## Usage

### Browser (You or Friend)
1. Go to `http://localhost:3000`
2. Enter your name → Create or Join a room
3. Share the **Room ID** with your friend
4. Click **Camera** to start video call
5. Click **Share Screen** to share your desktop/VS Code

### VS Code Extension (Code Owner)
1. Press `Ctrl+Shift+P` → **"CodeSync: Connect to Room"**
2. Enter your name and the Room ID
3. Press `Ctrl+Shift+P` → **"CodeSync: Start Sharing Current File"**
4. Extension watches your active file and sends changes in real-time

### Collaborator (Browser)
1. Join the same room in the browser
2. See the shared code appear in the Monaco editor
3. Make edits → click **Accept → Apply to VS Code** in the banner
4. VS Code owner sees a toast → Accept/Reject
5. On Accept: code is instantly applied to their VS Code file

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `SOCKET_PORT` | `3001` | Socket.io server port |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | Socket server URL (client-side) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | App URL (for CORS) |

---

## Production Deployment

### Socket Server
Deploy `server/` to any Node.js host (Railway, Fly.io, etc.)

```bash
cd server && npm run build && node dist/index.js
```

### Next.js App
Deploy `apps/web/` to Vercel:

```bash
cd apps/web && vercel deploy
```

### TURN Server (for WebRTC over NAT)
For production, add TURN server credentials to `apps/web/lib/useWebRTC.ts`:

```ts
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:your-turn-server.com:3478",
      username: "user",
      credential: "password",
    },
  ],
};
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Real-time | Socket.io 4.x (WebSocket) |
| Video/Screen | WebRTC (RTCPeerConnection) |
| Database | PostgreSQL + Prisma ORM |
| VS Code | VS Code Extension API |
| Package Manager | pnpm workspaces |
