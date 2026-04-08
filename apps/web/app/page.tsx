"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Stats } from "../components/landing/Stats";
import { Features } from "../components/landing/Features";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Pricing } from "../components/landing/Pricing";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

function generateRoomId() {
  return (
    // rendom room id 
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10)
  );
}


export default function CodeSyncLanding() {
  const router = useRouter();
  const [joinId, setJoinId] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const createRoom = () => {
    const id = generateRoomId();
    router.push(`/room/${id}`);
  };

  const joinRoom = () => {
    if (joinId.trim())
      router.push(`/room/${joinId.trim()}`);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      style={{
        background: "#0e0e0c",
        color: "#d4d4cc",
        overflowX: "hidden",
      }}
    >
      <Navbar scrolled={scrolled} scrollTo={scrollTo} createRoom={createRoom} />

      <main>
        <Hero
          createRoom={createRoom}
          joinRoom={joinRoom}
          joinId={joinId}
          setJoinId={setJoinId}
        />

        <Stats />

        <Features />

        <HowItWorks />
        
        <Pricing />

        <CTA createRoom={createRoom} />
      </main>

      <Footer />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
        @keyframes scrollCue { 0%,100%{opacity:0;transform:scaleY(0.3)} 50%{opacity:1;transform:scaleY(1)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}