"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { ModelEntry } from "@/lib/models";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function FrontierShowcase({ models }: { models: ModelEntry[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const row = rowRef.current;
    if (!section || !row) return;

    // Use a matchMedia to only enable pinning on non-touch or wider screens,
    // but the GSAP logic itself handles resize. Let's just apply it broadly.
    const getScrollAmount = () => {
      const rowWidth = row.scrollWidth;
      return -(rowWidth - window.innerWidth);
    };

    const tween = gsap.to(row, {
      x: getScrollAmount,
      ease: "none",
    });

    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: () => `+=${Math.abs(getScrollAmount())}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true,
    });
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="relative h-screen flex items-center overflow-hidden bg-[var(--bg)]"
    >
      {/* Side Fade Overlays */}
      <div className="absolute top-0 left-0 w-[5vw] h-full bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[5vw] h-full bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />

      {/* Row containing cards */}
      <div 
        ref={rowRef} 
        className="flex gap-8 pl-[10vw] pr-[20vw] w-max will-change-transform items-center h-full"
      >
        {/* Intro Slide */}
        <div className="w-[85vw] sm:w-[500px] shrink-0 pl-6 sm:pl-10 md:pl-20 pr-4 sm:pr-10 z-20 sticky left-0 antialiased">
          <h2 className="text-[clamp(2.25rem,6vw,3rem)] font-normal text-[var(--text)] mb-4" style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)", letterSpacing: "-1px" }}>
            Frontier <br />
            <span className="italic text-[var(--muted)]">Intelligence.</span>
          </h2>
          <p className="text-[var(--muted)] text-sm md:text-[15px] leading-relaxed">
            The most capable foundation models shaping the future of AI. Track their capabilities, context windows, and parameters as the frontier expands.
          </p>
        </div>

        {/* Model Cards */}
        {models.map((model) => (
          <Link
            href={`/models/${model.slug}`}
            key={model.id}
            className="group relative w-[320px] sm:w-[400px] md:w-[500px] h-[350px] rounded-3xl overflow-hidden bg-[var(--card-bg)] border border-[var(--accent-soft)] shrink-0 transition-transform duration-500 hover:scale-[0.97] flex flex-col justify-between"
          >
            {/* Background Hover Effect */}
            <div className="absolute inset-0 bg-[var(--bg)] opacity-0 group-hover:opacity-30 transition-opacity duration-700 z-0 pointer-events-none" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-[var(--accent-soft)] to-transparent z-0 pointer-events-none" />

            {/* Top Row: Developer & Task */}
            <div className="relative z-10 flex justify-between items-start p-6 md:p-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[var(--muted)] mb-2">
                  {model.developer}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tag-bg)] border border-[var(--accent-soft)] text-[var(--muted)] text-[10px] font-semibold tracking-wide">
                  <Sparkles size={12} className="text-[var(--accent)]" />
                  {model.primaryTask}
                </div>
              </div>
              <ArrowUpRight size={24} className="text-[var(--accent-soft)] group-hover:text-[var(--accent)] transition-colors" />
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 p-6 md:p-8 pt-0">
              <h3 
                className="text-[clamp(1.875rem,5vw,3rem)] font-normal text-[var(--text)] mb-6 group-hover:text-[var(--accent)] transition-colors truncate"
                style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)", letterSpacing: "-1px" }}
              >
                {model.name}
              </h3>
              
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 border-t border-[var(--accent-soft)] pt-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-1">Parameters</p>
                  <p className="text-sm font-mono text-[var(--text)] truncate">
                    {model.parameters === "undisclosed" ? "Undisclosed" : (typeof model.parameters === "object" && model.parameters !== null ? Object.values(model.parameters).join(" / ") : model.parameters)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-semibold mb-1">Context</p>
                  <p className="text-sm font-mono text-[var(--text)] truncate">
                    {typeof model.contextWindow === "object" && model.contextWindow !== null ? (model.contextWindow as any).native : model.contextWindow}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
