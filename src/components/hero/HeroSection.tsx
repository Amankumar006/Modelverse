"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import Link from "next/link";
import { Menu } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE_IMAGE = "/images/hero-base.png";
const REVEAL_IMAGE = "/images/hero-reveal.png";
const SPOTLIGHT_R = 260;

const LERP_FACTOR = 0.1;

/* ------------------------------------------------------------------ */
/*  RevealLayer — canvas-mask spotlight                                */
/* ------------------------------------------------------------------ */

function RevealLayer({
  image,
  cursorX,
  cursorY,
}: {
  image: string;
  cursorX: number;
  cursorY: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  /* Resize canvas to match viewport */
  const syncSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    sizeRef.current = { w, h };
  }, []);

  useEffect(() => {
    syncSize();
    window.addEventListener("resize", syncSize);
    return () => window.removeEventListener("resize", syncSize);
  }, [syncSize]);

  /* Draw radial-gradient mask on every cursor update */
  useEffect(() => {
    const canvas = canvasRef.current;
    const reveal = revealRef.current;
    if (!canvas || !reveal) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = sizeRef.current;
    ctx.clearRect(0, 0, w, h);

    /* Build a soft radial gradient for the spotlight */
    const grad = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,1)");
    grad.addColorStop(0.6, "rgba(255,255,255,0.75)");
    grad.addColorStop(0.75, "rgba(255,255,255,0.4)");
    grad.addColorStop(0.88, "rgba(255,255,255,0.12)");
    grad.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    reveal.style.maskImage = `url(${dataUrl})`;
    reveal.style.webkitMaskImage = `url(${dataUrl})`;
    reveal.style.maskSize = "100% 100%";
    reveal.style.webkitMaskSize = "100% 100%";
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Hidden canvas — used only for generating the mask data URL */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: "none" }}
      />

      {/* Reveal image layer with the canvas-generated mask */}
      <div
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
          backgroundColor: "#1a0a2e",
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  TouchRevealLayer — for touch devices (no cursor tracking)          */
/* ------------------------------------------------------------------ */

function TouchRevealLayer({ image }: { image: string }) {
  return (
    <div
      className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none opacity-20"
      style={{
        backgroundImage: `url(${image})`,
        backgroundColor: "#1a0a2e",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  useSmoothCursor — mouse tracking with RAF lerp                    */
/* ------------------------------------------------------------------ */

function useSmoothCursor(): {
  cursorPos: { x: number; y: number };
  isTouchDevice: boolean;
} {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    /* Detect touch-primary devices */
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    setIsTouchDevice(isTouch);

    if (isTouch) return;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const loop = () => {
      const m = mouseRef.current;
      const s = smoothRef.current;

      s.x += (m.x - s.x) * LERP_FACTOR;
      s.y += (m.y - s.y) * LERP_FACTOR;

      setCursorPos({ x: s.x, y: s.y });
      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { cursorPos, isTouchDevice };
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { label: "Browse", href: "/models", active: true },
  { label: "Timeline", href: "/timeline" },
  { label: "Compare", href: "/compare" },
  { label: "Developers", href: "/developers" },
  { label: "About", href: "/about" },
];

function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Left: logo mark + wordmark */}
      <Link href="/" className="flex items-center gap-2.5 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black">
        {/* Minimal abstract SVG mark — two overlapping orbit rings */}
        <svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform group-hover:rotate-45 duration-500"
        >
          <circle
            cx="13"
            cy="13"
            r="10"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.9"
          />
          <ellipse
            cx="13"
            cy="13"
            rx="10"
            ry="4.5"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
            transform="rotate(45 13 13)"
          />
          <circle cx="13" cy="3" r="2" fill="#FF6B35" />
        </svg>

        <span
          className="text-white text-2xl font-bold"
          style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)" }}
        >
          Modelverse
        </span>
      </Link>

      {/* Center: pill nav (desktop only) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-2 items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
              item.active
                ? "bg-white/15 text-white"
                : "text-white/70 hover:bg-white/15 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Right: Browse Catalog button (desktop) */}
      <Link
        href="/models"
        className="hidden md:block bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        Browse Catalog
      </Link>

      {/* Right: Mobile menu button */}
      <button
        className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/models"
            className="mt-2 bg-white text-black text-sm font-semibold px-6 py-3 rounded-full text-center hover:bg-white/90 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Catalog
          </Link>
        </div>
      )}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  HeroSection — main export                                          */
/* ------------------------------------------------------------------ */

export default function HeroSection() {
  const { cursorPos, isTouchDevice } = useSmoothCursor();

  return (
    <>
      <NavBar />

      <section
        className="relative w-full overflow-hidden h-screen"
        style={{ height: "100dvh" }}
      >
        {/* ── Layer 1: Base image (z-10) ──────────────────────── */}
        <div
          className="absolute inset-0 z-10 bg-center bg-cover bg-no-repeat hero-zoom"
          style={{
            backgroundImage: `url(${BASE_IMAGE})`,
            backgroundColor: "#0a0a0a",
          }}
        />

        {/* ── Layer 2: Reveal image with spotlight mask (z-30) ── */}
        {isTouchDevice ? (
          <TouchRevealLayer image={REVEAL_IMAGE} />
        ) : (
          <RevealLayer
            image={REVEAL_IMAGE}
            cursorX={cursorPos.x}
            cursorY={cursorPos.y}
          />
        )}

        {/* ── Layer 3: Heading (z-50) ────────────────────────── */}
        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-bold text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
              style={{
                fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                letterSpacing: "-0.05em",
                animationDelay: "0.25s",
              }}
            >
              Every model.
            </span>
            <span
              className="block font-bold text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
              style={{
                fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                letterSpacing: "-0.08em",
                animationDelay: "0.42s",
              }}
            >
              Every release.
            </span>
          </h1>
        </div>

        {/* ── Layer 4: Bottom-left paragraph (z-50) ──────────── */}
        <p
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[280px] text-sm text-white/80 leading-relaxed z-50 hero-anim hero-fade"
          style={{ animationDelay: "0.7s" }}
        >
          From frontier closed-source releases to open-weight breakthroughs,
          Modelverse tracks every model as it ships — a living, always-current
          archive.
        </p>

        {/* ── Layer 5: Bottom-right block + CTA (z-50) ───────── */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: "0.85s" }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Filter by task, developer, or license. Compare frontier models side
            by side. See what&apos;s new the day it ships.
          </p>
          <Link
            href="/models"
            className="bg-[#FF6B35] hover:bg-[#e85a28] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#FF6B35]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Explore Models
          </Link>
        </div>
      </section>
    </>
  );
}
