"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

function generateRoomId() {
  return (
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}

export default function CodeSyncLanding() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const createRoom = () => {
    router.push(`/room/${generateRoomId()}`);
  };

  const joinRoom = () => {
    if (joinId.trim()) router.push(`/room/${joinId.trim()}`);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="landing">
      <Navbar scrolled={scrolled} scrollTo={scrollTo} createRoom={createRoom} />

      <main>
        <Hero
          createRoom={createRoom}
          joinRoom={joinRoom}
          joinId={joinId}
          setJoinId={setJoinId}
        />
        <Features />
        <HowItWorks />
        <CTA createRoom={createRoom} />
      </main>

      <Footer />
    </div>
  );
}
