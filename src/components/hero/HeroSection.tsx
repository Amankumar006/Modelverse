"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import modelIndexData from "../../../data/models/_index.json";
import { Search, X, Menu } from "lucide-react";

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

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof modelIndexData>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize Fuse.js for fuzzy client search
  const fuse = useMemo(() => {
    return new Fuse(modelIndexData, {
      keys: ["name", "developer"],
      threshold: 0.3,
    });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
    } else {
      const results = fuse.search(query).map((r) => r.item);
      setSearchResults(results.slice(0, 5));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

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
    const startPlay = () => {
      video.play().catch((err) => {
        console.log("Video autoplay blocked or interrupted:", err);
      });
    };
    video.addEventListener("loadedmetadata", startPlay);

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
      <header className="relative z-50 w-full">
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl tracking-tight text-[#000000] font-normal hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg shrink-0"
            style={{
              fontFamily: "var(--font-display, 'Instrument Serif', serif)",
            }}
          >
            Aethera<sup className="text-sm font-sans select-none">®</sup>
          </Link>

          {/* Menu Items (desktop) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
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

          {/* Desktop Search Input */}
          <div className="hidden md:block relative shrink-0">
            <div className="relative flex items-center bg-black/[0.04] border border-black/[0.08] hover:border-black/20 focus-within:border-black/25 rounded-full px-3 py-1.5 transition-all w-48 focus-within:w-60 duration-300">
              <Search size={14} className="text-black/40 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="bg-transparent text-xs text-black placeholder:text-black/35 focus:outline-none w-full font-medium"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-0.5 hover:bg-black/10 rounded-full text-black/40 hover:text-black/80 transition-colors shrink-0"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {searchFocused && searchQuery && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-black/[0.08] rounded-2xl p-2 shadow-2xl z-50 text-left flex flex-col">
                {searchResults.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.slug}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-black/[0.04] transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-black truncate">{model.name}</p>
                      <p className="text-[10px] text-black/45 truncate">{model.developer}</p>
                    </div>
                    <span className="text-[9px] font-semibold bg-black/5 text-black/50 px-2 py-0.5 rounded-full shrink-0">
                      {model.type === "open-weights" ? "Open" : "Closed"}
                    </span>
                  </Link>
                ))}

                {/* Empty State */}
                {searchResults.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs text-black/50">No models match this query — try another search</p>
                    <button
                      onClick={clearSearch}
                      className="mt-2 text-[10px] font-semibold text-[#FF6B35] hover:text-[#e85a28] underline"
                    >
                      Clear Search
                    </button>
                  </div>
                )}

                {/* Footer link */}
                {searchResults.length > 0 && (
                  <Link
                    href={`/models?q=${encodeURIComponent(searchQuery)}`}
                    className="border-t border-black/[0.06] mt-1.5 pt-2 pb-1 text-center text-[10px] font-semibold text-[#FF6B35] hover:text-[#e85a28] hover:underline"
                  >
                    See all results for &apos;{searchQuery}&apos;
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* CTA & Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="bg-[#000000] text-[#FFFFFF] text-sm font-medium px-6 py-2.5 rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
              Begin Journey
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-black hover:bg-black/5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-black/[0.08] p-4 flex flex-col gap-4 shadow-xl z-50">
            {/* Full-width Search Input */}
            <div className="relative flex items-center bg-black/[0.04] border border-black/[0.08] rounded-full px-3.5 py-2">
              <Search size={16} className="text-black/40 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="bg-transparent text-sm text-black placeholder:text-black/35 focus:outline-none w-full font-medium"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-black/10 rounded-full text-black/40 transition-colors shrink-0"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Mobile Search Results */}
            {searchQuery && (
              <div className="flex flex-col gap-1 max-h-60 overflow-y-auto border-b border-black/[0.06] pb-2">
                {searchResults.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-black/[0.04] transition-colors"
                  >
                    <div className="min-w-0 pr-2 text-left">
                      <p className="text-xs font-semibold text-black truncate">{model.name}</p>
                      <p className="text-[10px] text-black/45 truncate">{model.developer}</p>
                    </div>
                    <span className="text-[9px] font-semibold bg-black/5 text-black/50 px-2 py-0.5 rounded-full shrink-0">
                      {model.type === "open-weights" ? "Open" : "Closed"}
                    </span>
                  </Link>
                ))}

                {searchResults.length === 0 && (
                  <p className="text-xs text-black/50 text-center py-4">No models match this query</p>
                )}

                {searchResults.length > 0 && (
                  <Link
                    href={`/models?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-[10px] font-semibold text-[#FF6B35] py-2 hover:underline"
                  >
                    See all results for &apos;{searchQuery}&apos;
                  </Link>
                )}
              </div>
            )}

            {/* Mobile navigation links */}
            <div className="flex flex-col gap-1 text-left">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#000000] px-3 py-2 rounded-xl hover:bg-black/5"
              >
                Home
              </Link>
              {["Studio", "About", "Journal", "Reach Us"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#6F6F6F] hover:text-[#000000] px-3 py-2 rounded-xl hover:bg-black/5"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        )}
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
