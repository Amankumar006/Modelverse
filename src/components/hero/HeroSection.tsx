"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

/* ------------------------------------------------------------------ */
/*  Aethera Cinematic Hero Section                                     */
/* ------------------------------------------------------------------ */

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);

  // Monitor currentTime & duration to apply 0.5s fade-in/fade-out manual loop transitions
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;

    const updateOpacity = () => {
      if (video.duration && !video.paused) {
        const currentTime = video.currentTime;
        const duration = video.duration;
        const fadeTime = 0.5;

        let targetOpacity = 1;
        if (currentTime < fadeTime) {
          // Fade in at the start
          targetOpacity = currentTime / fadeTime;
        } else if (currentTime > duration - fadeTime) {
          // Fade out before the end
          targetOpacity = Math.max(0, (duration - currentTime) / fadeTime);
        }

        setVideoOpacity(targetOpacity);
      }
      rafId = requestAnimationFrame(updateOpacity);
    };

    const handleEnded = () => {
      setVideoOpacity(0);
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play().catch((err) => {
            console.log("Video loop playback interrupted:", err);
          });
        }
      }, 100);
    };

    video.addEventListener("ended", handleEnded);
    // Explicitly play video once metadata is loaded to guarantee autoplay starts
    const startPlay = () => {
      video.play().catch((err) => {
        console.log("Video autoplay blocked or interrupted:", err);
      });
    };
    video.addEventListener("loadedmetadata", startPlay);

    // If metadata is already loaded, kick off play
    if (video.readyState >= 1) {
      startPlay();
    }

    rafId = requestAnimationFrame(updateOpacity);

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadedmetadata", startPlay);
    };
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#FFFFFF]">
      {/* ── Background Video Layer (z-0) ────────────────────── */}
      <div
        className="absolute w-full z-0 overflow-hidden pointer-events-none transition-opacity duration-300"
        style={{
          inset: "auto 0 0 0",
          top: "300px",
          opacity: videoOpacity,
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ minHeight: "calc(100vh - 300px)" }}
        />
      </div>

      {/* ── Gradient Overlay on Video ───────────────────────── */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FFFFFF] via-transparent to-[#FFFFFF] z-0 pointer-events-none"
        style={{ top: "300px" }}
      />

      {/* ── Navigation Bar (z-10) ───────────────────────────── */}
      <header className="relative z-10 w-full">
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl tracking-tight text-[#000000] font-normal hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg"
            style={{
              fontFamily: "var(--font-display, 'Instrument Serif', serif)",
            }}
          >
            Aethera<sup className="text-sm font-sans select-none">®</sup>
          </Link>

          {/* Menu Items */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-[#000000] hover:opacity-80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md px-1"
            >
              Home
            </Link>
            {["Studio", "About", "Journal", "Reach Us"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase().replace(" ", "-")}`}
                className="text-sm font-medium text-[#6F6F6F] hover:text-[#000000] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md px-1"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <button className="bg-[#000000] text-[#FFFFFF] text-sm font-medium px-6 py-2.5 rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            Begin Journey
          </button>
        </nav>
      </header>

      {/* ── Hero Content (z-10) ─────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-7xl mx-auto">
        <div
          className="w-full flex flex-col items-center"
          style={{ paddingTop: "calc(8rem - 75px)", paddingBottom: "10rem" }}
        >
          {/* Headline */}
          <h1
            className="text-5xl sm:text-7xl md:text-8xl font-normal leading-[0.95] text-[#000000] max-w-7xl animate-fade-rise"
            style={{
              fontFamily: "var(--font-display, 'Instrument Serif', serif)",
              letterSpacing: "-2.46px",
            }}
          >
            Beyond{" "}
            <span className="italic text-[#6F6F6F]">
              silence,
            </span>{" "}
            we build{" "}
            <span className="italic text-[#6F6F6F]">
              the eternal.
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#6F6F6F] max-w-2xl mt-8 leading-relaxed animate-fade-rise-delay">
            Building platforms for brilliant minds, fearless makers, and thoughtful souls.
            Through the noise, we craft digital havens for deep work and pure flows.
          </p>

          {/* Hero CTA */}
          <button className="rounded-full bg-[#000000] text-[#FFFFFF] text-base font-medium px-14 py-5 mt-12 hover:scale-[1.03] active:scale-[0.98] transition-all hover:bg-black/90 animate-fade-rise-delay-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
            Begin Journey
          </button>
        </div>
      </div>
    </section>
  );
}
