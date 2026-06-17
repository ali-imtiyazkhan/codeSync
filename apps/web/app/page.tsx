"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ArrowRight, Globe, Instagram, Twitter, LogOut } from "lucide-react";
import AboutSection from "../components/landing-liquid/AboutSection";
import FeaturedVideoSection from "../components/landing-liquid/FeaturedVideoSection";
import PhilosophySection from "../components/landing-liquid/PhilosophySection";
import ServicesSection from "../components/landing-liquid/ServicesSection";
import {
  VSCODE_EXTENSION_DOWNLOAD_PATH,
  VSCODE_EXTENSION_VSIX,
} from "../lib/vscodeExtension";

const HERO_VIDEO_URL =
	"/assets/hf_20260405_074625_a81f018a-956b-43fb-9aee-4d1508e30e6a.mp4";

const FADE_MS = 500;
const FADE_OUT_LEAD_S = 0.55;
const RESTART_DELAY_MS = 100;

const NAV_LINKS = [
	{ id: "features", label: "Features" },
	{ id: "pricing", label: "Pricing" },
	{ id: "about", label: "About" }
];

function generateRoomId() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

export default function CodeSyncLanding() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const [joinId, setJoinId] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const isFadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const animateOpacity = (from: number, to: number, onDone?: () => void) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / FADE_MS, 1);
        video.style.opacity = String(from + (to - from) * t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
          onDone?.();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const handleCanPlay = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      void video.play().catch(() => {
        /* Autoplay can be blocked; the poster-less black frame is acceptable. */
      });
      animateOpacity(0, 1);
    };

    const handleTimeUpdate = () => {
      if (isFadingOutRef.current || !Number.isFinite(video.duration)) return;
      const remaining = video.duration - video.currentTime;
      if (remaining <= FADE_OUT_LEAD_S) {
        isFadingOutRef.current = true;
        const current = Number.parseFloat(video.style.opacity || "1");
        animateOpacity(current, 0);
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      restartTimerRef.current = window.setTimeout(() => {
        video.currentTime = 0;
        void video.play().catch(() => {});
        isFadingOutRef.current = false;
        animateOpacity(0, 1);
      }, RESTART_DELAY_MS);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (restartTimerRef.current !== null)
        window.clearTimeout(restartTimerRef.current);
    };
  }, []);

  const createRoom = () => {
    router.push(`/room/${generateRoomId()}`);
  };

  const joinRoom = () => {
    if (joinId.trim()) router.push(`/room/${joinId.trim()}`);
  };

  const downloadVsix = async () => {
    try {
      const res = await fetch(VSCODE_EXTENSION_DOWNLOAD_PATH);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const hint =
          body && typeof body.hint === "string"
            ? body.hint
            : "Build the extension first (see apps/vscode-extension).";
        window.alert(`Extension package not available.\n\n${hint}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = VSCODE_EXTENSION_VSIX;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert("Download failed. Check your connection and try again.");
    }
  };

  return (
    <main className="bg-black min-h-screen text-white">
      <section className="min-h-screen overflow-hidden relative flex flex-col">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-bottom"
          src={HERO_VIDEO_URL}
          muted
          autoPlay
          playsInline
          preload="auto"
          style={{ opacity: 0 }}
          aria-hidden="true"
          tabIndex={-1}
        />

        <header className="relative z-20 px-6 py-6">
          <nav className="liquid-glass rounded-full max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <a
                href="#"
                className="flex items-center gap-2.5"
                aria-label="CodeSync home"
                onClick={(e) => e.preventDefault()}
              >
                <Globe size={24} className="text-white" aria-hidden="true" />
                <span className="text-white font-semibold text-lg">CodeSync</span>
              </a>
              <div className="hidden md:flex items-center gap-8 ml-8">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.id}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 border border-white/10">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="w-5 h-5 rounded-full" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white/10 text-[10px] font-bold flex items-center justify-center">{initials}</div>
                    )}
                    <span className="text-white/80 text-xs">{user.name}</span>
                  </div>
                  <button
                    type="button"
                    className="text-white/80 hover:text-white"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                  <button
                    type="button"
                    className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                    onClick={createRoom}
                  >
                    Open Editor
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="text-white text-sm font-medium hover:text-white/80 transition-colors"
                    onClick={() => { window.location.href = "/auth/signin"; }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={createRoom}
                    className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors"
                  >
                    Start Coding
                  </button>
                </>
              )}
            </div>
          </nav>
        </header>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
          <h1
            className="text-7xl md:text-8xl lg:text-9xl text-white tracking-tight whitespace-nowrap mb-10"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Sync & <em className="italic">code</em>.
          </h1>

          <form
            className="liquid-glass rounded-full max-w-xl w-full pl-6 pr-2 py-2 flex items-center gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              joinRoom();
            }}
          >
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Paste room ID to join..."
              aria-label="Room ID"
              className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Join Room"
              className="bg-white rounded-full p-3 text-black shrink-0 hover:bg-white/90 transition-colors"
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>

          <p className="text-white text-sm leading-relaxed px-4 mt-6 max-w-md">
            Share a room link, sync code in real time, hop on video, and push changes back to VS Code — all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button
              type="button"
              onClick={createRoom}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Create room
            </button>
            <button
              type="button"
              onClick={downloadVsix}
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Download Extension
            </button>
          </div>
        </div>

        <footer className="relative z-10 flex justify-center gap-4 pb-12">
          {[
            { label: "Instagram", Icon: Instagram },
            { label: "Twitter", Icon: Twitter },
            { label: "Website", Icon: Globe },
          ].map(({ label, Icon }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              onClick={(e) => e.preventDefault()}
              className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          ))}
        </footer>
      </section>

      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
    </main>
  );
}
