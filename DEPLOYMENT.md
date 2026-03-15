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
### Environment Variables: Add the following variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_WS_URL` | `https://codesync-1-wdum.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://codesync-1-wdum.onrender.com` |
| `BACKEND_URL` | `https://codesync-1-wdum.onrender.com` |
| `NEXTAUTH_URL` | `https://codesync-inky.vercel.app` |
| `NEXTAUTH_SECRET` | `your_random_secret_string` |
| `DATABASE_URL` | `your_postgresql_connection_string` |
| `GOOGLE_CLIENT_ID` | `your_google_id` |
| `GOOGLE_CLIENT_SECRET` | `your_google_secret` |
| `GITHUB_ID` | `your_github_id` |
| `GITHUB_SECRET` | `your_github_secret` |

### 4. Important: OAuth Redirect URIs
For Google and GitHub login to work, you **must** add the following callback URLs in their respective developer consoles:

#### Google Cloud Console:
- **Authorized JavaScript origins**: `https://codesync-inky.vercel.app` (and `http://localhost:3000` for local testing)
- **Authorized redirect URIs**: 
    - `https://codesync-inky.vercel.app/api/auth/callback/google`
    - `http://localhost:3000/api/auth/callback/google` (for local testing)

#### GitHub Developer Settings:
- **Homepage URL**: `https://codesync-inky.vercel.app`
- **Authorization callback URL**: 
    - `https://codesync-inky.vercel.app/api/auth/callback/github`
    - `http://localhost:3000/api/auth/callback/github` (for local testing)

## 3. Database
1.  **Connection String**: Ensure `DATABASE_URL` is set in Vercel.
2.  **Schema Push**: Run this command locally (with your production `DATABASE_URL` in your local `.env`) to synchronize the database:
    ```bash
    npx prisma db push
    ```
    *Note: If you are using Turborepo, run it from the root:*
    ```bash
    npx turbo run db:push
    ```

## 4. Troubleshooting Post-Login Redirects
If you are redirected back to the sign-in page after a successful login:

### A. Check Environment Variables
In Vercel, ensure these are exactly as follows:
- `NEXTAUTH_URL`: `https://codesync-inky.vercel.app` (No trailing slash)
- `NEXTAUTH_SECRET`: Generate a strong secret using `openssl rand -base64 32` and paste it here.

### B. Check for URL Errors
When you are redirected back to `/auth/signin`, look at the URL. Does it contain `?error=...`?
- `?error=AdapterError`: Likely a database connection issue or missing tables.
- `?error=Configuration`: Likely an issue with your `NEXTAUTH_SECRET` or OAuth Client Secret.

---
