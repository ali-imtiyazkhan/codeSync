"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  const handleCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) setError("Invalid email or password.");
    else router.replace("/");
  };

  return (
    <div className="auth-page">
      {/* Ambient blobs */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      {status === "loading" || status === "authenticated" ? (
        <div className="auth-spinner" />
      ) : (
        <div className="auth-card">
          {/* Logo */}
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="url(#logoGrad)" />
              <path d="M8 11l8-5 8 5v10l-8 5-8-5V11z" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
              <path d="M16 6v20M8 11l8 5 8-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#58a6ff"/>
                  <stop offset="1" stopColor="#bf91f3"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="auth-logo-text">CodeSync</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your workspace</p>

          {/* OAuth */}
          <div className="auth-oauth-group">
            <button className="auth-oauth-btn" onClick={() => signIn("google", { callbackUrl: "/" })}>
              <svg className="oauth-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button className="auth-oauth-btn auth-oauth-github" onClick={() => signIn("github", { callbackUrl: "/" })}>
              <svg className="oauth-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="auth-divider"><span>or</span></div>

          {/* Form */}
          <form onSubmit={handleCredentials} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner-sm" /> : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <a href="/auth/signup">Sign up</a>
          </p>
        </div>
      )}

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          background-image:
            radial-gradient(at 0% 0%, hsla(213, 30%, 15%, 0.2) 0px, transparent 55%),
            radial-gradient(at 100% 100%, hsla(265, 30%, 15%, 0.15) 0px, transparent 55%);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.12;
        }
        .auth-blob-1 {
          width: 500px; height: 500px;
          background: var(--blue);
          top: -150px; left: -150px;
          animation: blobFloat 8s ease-in-out infinite;
        }
        .auth-blob-2 {
          width: 400px; height: 400px;
          background: var(--purple);
          bottom: -100px; right: -100px;
          animation: blobFloat 10s ease-in-out infinite reverse;
        }

        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.97); }
        }

        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: var(--glass);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 40px;
          box-shadow:
            0 0 0 1px rgba(88, 166, 255, 0.05),
            0 24px 64px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          animation: cardIn 0.4s cubic-bezier(0.34, 1.4, 0.64, 1);
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .auth-logo-text {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--blue), var(--purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 6px;
          letter-spacing: -0.5px;
        }
        .auth-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0 0 28px;
        }

        .auth-oauth-group { display: flex; flex-direction: column; gap: 10px; }

        .auth-oauth-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 11px 16px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid var(--border-light);
          background: rgba(255,255,255,0.04);
          color: var(--text);
        }
        .auth-oauth-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: var(--blue-soft);
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(88,166,255,0.12);
        }
        .auth-oauth-github { color: var(--text); }

        .oauth-icon { width: 18px; height: 18px; flex-shrink: 0; }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
          color: var(--text-dim);
          font-size: 12px;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .auth-form { display: flex; flex-direction: column; gap: 16px; }

        .auth-error {
          background: hsla(2, 92%, 63%, 0.1);
          border: 1px solid hsla(2, 92%, 63%, 0.3);
          color: var(--red);
          font-size: 13px;
          border-radius: 10px;
          padding: 10px 14px;
          animation: shake 0.3s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .auth-field { display: flex; flex-direction: column; gap: 6px; }
        .auth-field label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
        }
        .auth-field input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--text);
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .auth-field input::placeholder { color: var(--text-dim); }
        .auth-field input:focus {
          border-color: var(--blue);
          background: rgba(88,166,255,0.05);
          box-shadow: 0 0 0 3px rgba(88,166,255,0.12);
        }

        .auth-submit {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--blue), hsl(213,100%,55%));
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 4px;
          box-shadow: 0 4px 20px var(--blue-glow);
        }
        .auth-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px var(--blue-glow);
          filter: brightness(1.1);
        }
        .auth-submit:active:not(:disabled) { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-spinner {
          width: 32px; height: 32px;
          border: 2px solid var(--border-light);
          border-top-color: var(--blue);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        .auth-spinner-sm {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: var(--text-muted);
          margin: 20px 0 0;
        }
        .auth-switch a {
          color: var(--blue);
          text-decoration: none;
          font-weight: 500;
        }
        .auth-switch a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
