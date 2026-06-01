"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { Github, LogOut } from "lucide-react";

interface NavbarProps {
  scrolled: boolean;
  scrollTo: (id: string) => void;
  createRoom: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ scrolled, scrollTo, createRoom }) => {
  const { data: session } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <header className={`lp-nav${scrolled ? " scrolled" : ""}`}>
      <div className="lp-nav-inner">
        <a href="#" className="lp-logo" onClick={(e) => e.preventDefault()}>
          <div className="lp-logo-mark">CS</div>
          <span className="lp-logo-name">CodeSync</span>
        </a>

        <nav className="lp-nav-links">
          {[
            { id: "features", label: "Features" },
            { id: "how-it-works", label: "How it works" },
          ].map(({ id, label }) => (
            <button key={id} type="button" className="lp-nav-link" onClick={() => scrollTo(id)}>
              {label}
            </button>
          ))}

          <a
            href="https://github.com/ali-imtiyazkhan/codeSync"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-nav-link lp-nav-github"
          >
            <Github size={16} />
            GitHub
          </a>

          <div className="lp-nav-actions">
            {user ? (
              <>
                <div className="lp-user-chip">
                  {user.image ? (
                    <img src={user.image} alt={user.name || "User"} />
                  ) : (
                    <div className="lp-user-avatar">{initials}</div>
                  )}
                  <span>{user.name}</span>
                </div>
                <button
                  type="button"
                  className="lp-nav-link"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
                <button type="button" className="lp-btn lp-btn-primary" onClick={createRoom}>
                  Open editor
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="lp-btn lp-btn-ghost"
                  onClick={() => { window.location.href = "/auth/signin"; }}
                >
                  Sign in
                </button>
                <button type="button" className="lp-btn lp-btn-primary" onClick={createRoom}>
                  Start coding
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
