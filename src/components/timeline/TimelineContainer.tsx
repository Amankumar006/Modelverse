"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight } from "lucide-react";
import { ModelEntry } from "@/lib/models";
import Navbar from "@/components/layout/Navbar";

interface TimelineContainerProps {
  initialModels: ModelEntry[];
}

export default function TimelineContainer({ initialModels }: TimelineContainerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [jiggle, setJiggle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for physics animation loop
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const activeIndexRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  const wheelRef = useRef<HTMLDivElement>(null);

  const dragStartY = useRef(0);
  const dragStartAngle = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const angleStep = 15; // 15 degrees spacing between models
  const friction = 0.94; // Metallic weight damping

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // ── Pleasing Zen Bowl Chime Synthesizer (Web Audio API) ──
  const playCalmingSound = () => {
    try {
      if (typeof window === "undefined") return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Primary tone (calming E4 frequency, 329.63Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine"; // Pure sine wave for zero harmonic distortion/irritation
      osc1.frequency.setValueAtTime(329.63, now);

      // Secondary octave chime harmonic (E5 frequency, 659.25Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, now);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      // Volume envelope for primary tone (gentle rise, slow therapeutic fade)
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.02, now + 0.015); // Smooth attack
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35); // Soothing ring tail

      // Volume envelope for secondary octave (soft support, decays faster)
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.006, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc1.start(now);
      osc1.stop(now + 0.4);
      osc2.start(now);
      osc2.stop(now + 0.22);
    } catch (e) {
      // Safe fallback for autoplay browser restrictions
    }
  };

  // ── Physics Animation Loop ──
  useEffect(() => {
    const animate = () => {
      if (!isDragging) {
        // Apply friction
        velocityRef.current *= friction;

        // Update angle
        angleRef.current += velocityRef.current;

        // Boundary constraints
        const maxAngle = (initialModels.length - 1) * angleStep;
        if (angleRef.current < 0) {
          angleRef.current = 0;
          velocityRef.current = 0;
        } else if (angleRef.current > maxAngle) {
          angleRef.current = maxAngle;
          velocityRef.current = 0;
        }

        // Heavy snap spring when velocity drops
        if (Math.abs(velocityRef.current) < 0.12) {
          const targetAngle = activeIndexRef.current * angleStep;
          const snapDiff = targetAngle - angleRef.current;

          angleRef.current += snapDiff * 0.24;

          if (Math.abs(snapDiff) < 0.02 && Math.abs(velocityRef.current) < 0.01) {
            angleRef.current = targetAngle;
            velocityRef.current = 0;
          }
        }
      }

      // Calculate model index
      const currIndex = Math.max(0, Math.min(initialModels.length - 1, Math.round(angleRef.current / angleStep)));

      // Crossing a mechanical step notch
      if (currIndex !== activeIndexRef.current) {
        setActiveIndex(currIndex);

        // Play relaxing chime sound
        playCalmingSound();

        // Trigger taptic haptics for touch screens/trackpads
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(12);
        }

        // Trigger mechanical jiggle feedback
        setJiggle(true);
        setTimeout(() => setVibrateFalse(), 75);
      }

      // Update rotating dial wheel
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translate(-50%, -50%) rotate(${-angleRef.current}deg)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    const setVibrateFalse = () => setJiggle(false);

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [initialModels.length, isDragging]);

  // ── Scroll Wheel Momentum Injection ──
  useEffect(() => {
    const container = document.getElementById("timeline-dial-page");
    if (!container) return;

    const handleWheelRaw = (e: WheelEvent) => {
      e.preventDefault();
      // Inject velocity capped to prevent flying out of control (weighted feel)
      const inputSpeed = e.deltaY * 0.014;
      const targetSpeed = velocityRef.current + inputSpeed;
      velocityRef.current = Math.max(-12, Math.min(12, targetSpeed));
    };

    container.addEventListener("wheel", handleWheelRaw, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelRaw);
    };
  }, [initialModels.length]);

  // ── Touch Swipe Momentum Injection ──
  useEffect(() => {
    const container = document.getElementById("timeline-dial-page");
    if (!container) return;

    let touchStartY = 0;

    const handleTouchStartRaw = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMoveRaw = (e: TouchEvent) => {
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      e.preventDefault();
      // Add velocity capped for weight
      const targetSpeed = velocityRef.current + deltaY * 0.025;
      velocityRef.current = Math.max(-12, Math.min(12, targetSpeed));
      touchStartY = touchEndY;
    };

    container.addEventListener("touchstart", handleTouchStartRaw, { passive: true });
    container.addEventListener("touchmove", handleTouchMoveRaw, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStartRaw);
      container.removeEventListener("touchmove", handleTouchMoveRaw);
    };
  }, [initialModels.length]);

  // ── Mouse Drag Mechanics ──
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartAngle.current = angleRef.current;
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    const stepSize = 45; // 45px drag = 1 step (15 degrees)
    const angleDiff = (deltaY / stepSize) * angleStep;

    const targetAngle = dragStartAngle.current - angleDiff;
    const maxAngle = (initialModels.length - 1) * angleStep;

    angleRef.current = Math.max(0, Math.min(maxAngle, targetAngle));
    velocityRef.current = 0;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        velocityRef.current = Math.min(12, velocityRef.current + 5);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        velocityRef.current = Math.max(-12, velocityRef.current - 5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Format index as Ø1, Ø2, ..., 10, 11
  const getSlashIndex = (idx: number) => {
    const numStr = String(idx + 1).padStart(2, "0");
    if (numStr.startsWith("0")) {
      return `Ø${numStr.slice(1)}`;
    }
    return numStr;
  };

  const activeModel = initialModels[activeIndex];

  const formattedDate = useMemo(() => {
    if (!activeModel) return "";
    return new Date(activeModel.releaseDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [activeModel]);

  // Filter visible items on the wheel to prevent overlaps
  const visibleItemsRange = useMemo(() => {
    const range = [];
    const min = Math.max(0, activeIndex - 6);
    const max = Math.min(initialModels.length - 1, activeIndex + 6);
    for (let i = min; i <= max; i++) {
      range.push(i);
    }
    return range;
  }, [activeIndex, initialModels.length]);

  return (
    <div
      id="timeline-dial-page"
      className="fixed inset-0 bg-[#d7d7d7] text-[#1f1f21] z-[40] overflow-hidden select-none font-sans"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* CSS Configurations for Responsive Radii, Snaps & Blur Transitions */}
      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --wheel-radius: 40vw;
          --wheel-left: -25vw;
          --wheel-top: 50%;
          --content-left: calc(15vw + 5vw);
        }
        @media (min-width: 768px) {
          :root {
            --wheel-radius: 42vw;
            --wheel-left: -15vw;
            --content-left: calc(27.3vw + 20vw);
          }
        }
        @media (min-width: 1200px) {
          :root {
            --wheel-radius: 500px;
            --content-left: calc(27.3vw + 30px);
          }
        }
        
        @keyframes premiumFadeIn {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.97);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        .animate-premium-fade {
          animation: premiumFadeIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* ── Full Page Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
        <div
          className="absolute inset-0 bg-[url('/images/timeline-dial-bg.jpg')] bg-cover opacity-[0.85] mix-blend-darken"
          style={{ backgroundPosition: '27.3% 55.1%' }}
        />
        {/* Horizontal fade gradient to ensure text remains highly readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d7d7d7]/60 to-[#d7d7d7]/95 z-[2]" />
      </div>

      {/* ── Global Navigation Bar ── */}
      <div className="absolute top-0 left-0 w-full z-50">
        {/* Top gradient for nav text visibility */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#d7d7d7]/95 via-[#d7d7d7]/60 to-transparent pointer-events-none -z-10" />
        <Navbar />
      </div>

      {/* ── Spinning Wheel Dial System (Left side) ── */}
      <div className="absolute inset-y-0 left-0 w-[60vw] md:w-[50vw] overflow-hidden pointer-events-none z-10">
        {/* Curved Track Line */}
        <div className="timeline-dial-circle border-black/[0.04] z-10" />

        {/* Static Indicator Bullet (Highlight point) */}
        <div
          className="absolute rounded-full bg-black z-20 pointer-events-none transition-all duration-300 shadow-md shadow-black/20"
          style={{
            top: "var(--wheel-top)",
            left: "calc(var(--wheel-left) + var(--wheel-radius))",
            width: "8px",
            height: "8px",
            transform: "translate(-50%, -50%) scale(1.2)",
          }}
        />

        {/* Rotating Wheel Container */}
        <div
          ref={wheelRef}
          style={{
            position: "absolute",
            left: "var(--wheel-left)",
            top: "var(--wheel-top)",
            width: "calc(var(--wheel-radius) * 2)",
            height: "calc(var(--wheel-radius) * 2)",
            borderRadius: "50%",
            cursor: isDragging ? "grabbing" : "grab",
            pointerEvents: "auto",
            zIndex: 15,
          }}
          onMouseDown={handleMouseDown}
        >
          {visibleItemsRange.map((i) => {
            const angle = i * angleStep;
            const isSelected = i === activeIndex;
            const diff = Math.abs(i - activeIndex);

            const opacity = Math.max(0, 1 - diff * 0.22);
            const scale = isSelected ? 1.15 : 0.85;

            return (
              <div
                key={initialModels[i].id}
                onClick={() => {
                  if (!isDragging && activeIndex !== i) {
                    setActiveIndex(i);
                    angleRef.current = i * angleStep;
                    velocityRef.current = 0;
                    playCalmingSound();
                  }
                }}
                className="absolute left-1/2 top-1/2 w-20 h-16 flex items-center justify-center select-none cursor-pointer"
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(var(--wheel-radius))`,
                  opacity: opacity,
                  pointerEvents: opacity > 0.15 ? "auto" : "none",
                }}
              >
                {/* Node Line Marker */}
                <span
                  className={`w-1.5 h-1.5 rounded-full absolute left-0 top-1/2 -translate-y-1/2 transition-colors ${isSelected ? "bg-transparent" : "bg-black/25"
                    }`}
                />

                {/* Index text */}
                <span
                  className={`absolute left-5 font-mono font-bold tracking-tighter text-lg md:text-2xl transition-all duration-300 ${isSelected ? "text-[#1f1f21] scale-110" : "text-[#1f1f21]/30"
                    }`}
                  style={{
                    transform: `scale(${scale})`,
                  }}
                >
                  {getSlashIndex(i)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Active Info Content Panel (Right side) ── */}
      <div
        className="absolute inset-y-0 right-0 flex items-center px-6 md:px-12 z-30 pointer-events-none"
        style={{
          left: "var(--content-left)",
          transform: jiggle ? "translate3d(3px, -1px, 0)" : "translate3d(0, 0, 0)",
          transition: jiggle ? "none" : "transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <div className="max-w-xl pointer-events-auto bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 sm:p-8 rounded-[var(--radius-card)] border border-[var(--muted)]/10">
          {activeModel && (
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 text-left select-text animate-premium-fade"
              key={activeModel.id}
            >
              {/* Giant Index Number */}
              <div
                className="text-5xl sm:text-7xl md:text-8xl font-black text-[var(--accent)] leading-none select-none tracking-tight shrink-0 font-sans tabular-nums"
              >
                {getSlashIndex(activeIndex)}
              </div>

              {/* Text Block content */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
                    {activeModel.name}
                  </h2>
                  <div className="flex flex-wrap gap-2 items-center text-xs font-bold uppercase tracking-wider text-[var(--muted)] font-mono tabular-nums">
                    <span>{activeModel.developer}</span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span className="text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[10px] font-bold">
                      {activeModel.type.replace("-", " ")}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-normal line-clamp-3">
                  {activeModel.description}
                </p>

                {/* Micro tags row */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--tag-text)] bg-[var(--tag-bg)] px-2.5 py-1 rounded-[var(--radius-pill)] font-mono tabular-nums">
                    Size: {activeModel.parameters === "undisclosed" ? "Undisclosed" : activeModel.parameters}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--tag-text)] bg-[var(--tag-bg)] px-2.5 py-1 rounded-[var(--radius-pill)]">
                    Task: {activeModel.primaryTask.replace("-", " ")}
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/models/${activeModel.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent-contrast)] bg-[var(--accent)] hover:opacity-90 px-5 py-2.5 rounded-[var(--radius-pill)] transition-all shadow-sm"
                  >
                    View Specs
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Swipe/Scroll Instructions overlay (Bottom right corner) ── */}
      <div className="absolute bottom-6 right-6 md:right-12 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1f1f21]/30 z-30 pointer-events-none">
        Scroll / Drag / Swipe up or down to spin wheel
      </div>
    </div>
  );
}
