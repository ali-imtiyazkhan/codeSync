# CodeSync Deployment Guide

This guide explains how to deploy the CodeSync monorepo.

## 1. Backend Deployment (Already Done)
Your backend is currently hosted at: `https://codesync-1-wdum.onrender.com`

## 2. Frontend Deployment (Vercel)

The frontend is a Next.js app located in `apps/web`.

### Steps:
1.  **Import to Vercel**: Connect your GitHub repository to Vercel.
2.  **Project Settings**:
    - **Framework Preset**: Next.js
    - **Root Directory**: `apps/web` (Vercel usually detects this in a Turborepo)
    - **Build Command**: `cd ../.. && npx turbo run build --filter=@codesync/web...` (or just leave default if Vercel handles the monorepo)
3.  **Environment Variables**: Add the following variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_WS_URL` | `https://codesync-1-wdum.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://codesync-1-wdum.onrender.com` |
| `BACKEND_URL` | `https://codesync-1-wdum.onrender.com` |
| `NEXTAUTH_URL` | `https://your-vercel-domain.vercel.app` (Update after deployment) |
| `NEXTAUTH_SECRET` | `your_random_secret_string` |
| `DATABASE_URL` | `your_postgresql_connection_string` |
| `GOOGLE_CLIENT_ID` | `your_google_id` |
| `GOOGLE_CLIENT_SECRET` | `your_google_secret` |
| `GITHUB_ID` | `your_github_id` |
| `GITHUB_SECRET` | `your_github_secret` |

## 3. Database
Ensure your PostgreSQL database (e.g., on Supabase or Neon) is accessible from Vercel's IP range. Run `pnpm db:push` locally once with the production `DATABASE_URL` to initialize the schema.

---

## Troubleshooting
- **Build Errors**: Ensure all workspace dependencies are correctly linked. Turborepo handles this, but sometimes a clean `pnpm install` is needed.
- **Socket Connection**: If the frontend can't connect, verify that your backend has CORS enabled for your Vercel domain.
