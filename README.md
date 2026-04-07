# <p align="center">🛰️ CodeSync</p>
<p align="center"><b>Real-time collaborative development for the modern engineering team.</b></p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=webrtc&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
</p>

---

## 🌟 The Vision

CodeSync isn't just another shared code editor; it's a comprehensive collaborative environment designed to bridge the gap between local development and remote pair programming. We believe that distance shouldn't compromise the speed of logic or the quality of code. By synchronizing your local VS Code environment directly with a powerful web-based IDE, CodeSync enables seamless interaction where every teammate can contribute, review, and debug in real-time.

Whether you're debugging a complex production issue, conducting a deep-dive technical interview, or just hacking on a new idea with a friend, CodeSync provides the high-fidelity tools you need without the friction of context switching or "live share" lag.

---

## 📖 The CodeSync Story: Why We Built This

Imagine this: It’s 11:00 PM, and you’re staring at a piece of logic that just won’t behave. You know the fix is simple, but you need a second pair of eyes. In the "old world" manually debugging, you have two choices, both of them frustrating. First, you could hop on a standard video call. You share your screen, and your friend sits there squinting at a blurry compression while trying to dictate line numbers—*"No, go up... higher... wait, line 42!"* It’s clunky, passive, and creates a massive cognitive load just to communicate a simple fix.

The second option? The **"GitHub Dance."** You commit your messy debug code, push it to a temporary branch, and then your friend has to clone the repo, pull the changes, install dependencies, and finally find the typo. By the time they push the fix and you pull it back into your local environment, thirty minutes have vanished for what was essentially a three-second change. It’s overkill for a small problem and completely breaks your development flow.

This is exactly why we built **CodeSync**. We wanted to eliminate the "cloning tax" and the "screen-share dictation" nightmare once and for all. With CodeSync, you don't just share your screen; you share your environment. You spin up a room, send a link, and suddenly your friend is right there in the code with you. They see what you see, but they can actually touch it. They can jump straight to the logic, sketch a quick diagram on the integrated canvas to explain the data flow, and propose a fix that applies directly to your local VS Code. No more waiting, no more blurry screens—just pure, uninterrupted collaborative flow.

---

## 🚀 Key Features

### 🛰️ Bi-directional VS Code Synchronization
Our flagship feature allows you to link your local VS Code instance to a CodeSync room. Using our dedicated VS Code extension, local file changes are streamed instantly to the browser-based Monaco editor. This means your teammates can follow your logic in the browser while you use your specialized local setup, complete with your favorite themes and keybindings.

### 📹 Integrated Collaboration Suite
Communication is at the heart of collaboration. CodeSync features high-definition, low-latency video calls and screen sharing powered by WebRTC. Share your entire desktop or a specific window to demonstrate complex UI behaviors or walk through infrastructure logs, all while maintaining a persistent view of the shared codebase.

### 🎭 Sophisticated Change Review System
Inspired by Git workflows, CodeSync introduces a "Propose → Review → Apply" flow. Collaborators in the browser can make edits in the Monaco editor and "propose" them to the room owner. The owner receives a side-by-side diff view of the changes and can choose to Accept or Reject them. Upon acceptance, the changes are automatically applied to the owner's local VS Code file.

### 🎨 Collaborative Whiteboarding
Sometimes code isn't enough to explain a concept. CodeSync integrates an Excalidraw-powered canvas for real-time sketching and architectural planning. Draw diagrams, map out database relationships, or sketch UI wireframes alongside your code, ensuring everyone is on the same page visually and technically.

### 🤖 AI-Powered Code Insights
Leverage integrated large language models to analyze your shared code on the fly. Request explanations for legacy functions, generate unit tests, or identify potential performance bottlenecks. The AI acts as a silent partner in your session, providing context-aware suggestions when you need them most.

---

## 🏗️ Technical Architecture

CodeSync is built as a highly scalable Monorepo, ensuring type-safety and shared logic across the entire stack.

```mermaid
graph TD
    A[VS Code Extension] <-->|Socket.io| B[Node.js Backend]
    C[Next.js Web App] <-->|Socket.io| B
    C <-->|WebRTC| D[Peers]
    B -->|Prisma| E[PostgreSQL]
    C -->|Monaco| F[Browser Editor]
    C -->|Excalidraw| G[Shared Canvas]
```

### Stack Detail
- **Frontend**: Next.js 14 (App Router) with Tailwind CSS for high-performance, responsive UI components.
- **Backend**: A dedicated Node.js server using Socket.io for real-time signaling and state management.
- **Database**: PostgreSQL orchestrated via Prisma ORM for persistent room and user data.
- **Extension**: A native VS Code extension built with the VS Code API to handle local file system watchers.
- **Real-time**: Custom WebRTC signaling for peer-to-peer data, video, and audio streams.

---

## 🛠️ Quick Start

Follow these steps to get your local development environment up and running.

### 1. Prerequisites
- **Node.js**: version 18.x or higher
- **pnpm**: Global installation (`npm i -g pnpm`)
- **Docker**: For running the database locally

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/codesync.git
cd codesync

# Install dependencies for all apps/packages
pnpm install
```

### 3. Database Setup
```bash
# Start the PostgreSQL container
docker-compose up -d

# Initialize the database and push the schema
pnpm db:push
```

### 4. Running the Project
```bash
# Start all services in development mode (Web, Server, and Packages)
pnpm dev
```
The **Web Interface** will be available at `http://localhost:3000` and the **Socket Server** at `http://localhost:3001`.

### 5. VS Code Extension Setup
- Navigate to `apps/vscode-extension`
- Run `pnpm install`
- Open the folder in VS Code and press `F5` to start the Extension Development Host.
- Use `Ctrl+Shift+P` -> **CodeSync: Connect to Room** to begin sharing.

---

## 🔑 Environment Variables

Create a `.env` file in the root directory based on the following template:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connection string for PostgreSQL (e.g., `postgresql://user:pass@localhost:5432/db`) |
| `SOCKET_PORT` | The port the Socket.io server listens on (Default: `3001`) |
| `NEXT_PUBLIC_SOCKET_URL` | The client-side URL for connecting to the socket server |
| `JWT_SECRET` | Secret key for securing socket connections and sessions |

---

## 📜 License
CodeSync is released under the [MIT License](LICENSE). 🚀
