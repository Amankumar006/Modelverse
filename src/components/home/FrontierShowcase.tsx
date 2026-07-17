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
      className="relative h-screen flex items-center overflow-hidden bg-[#0C120F]"
    >
      {/* Side Fade Overlays */}
      <div className="absolute top-0 left-0 w-[5vw] h-full bg-gradient-to-r from-[#0C120F] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[5vw] h-full bg-gradient-to-l from-[#0C120F] to-transparent z-10 pointer-events-none" />

      {/* Row containing cards */}
      <div 
        ref={rowRef} 
        className="flex gap-8 pl-[10vw] pr-[20vw] w-max will-change-transform items-center h-full"
      >
        {/* Intro Slide */}
        <div className="w-[85vw] sm:w-[500px] shrink-0 pl-6 sm:pl-10 md:pl-20 pr-4 sm:pr-10 z-20 sticky left-0 antialiased">
          <h2 className="text-4xl md:text-5xl font-normal text-[#E2E8E4] mb-4" style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)", letterSpacing: "-1px" }}>
            Frontier <br />
            <span className="italic text-[#5A6E60]">Intelligence.</span>
          </h2>
          <p className="text-[#8C9E91] text-sm md:text-[15px] leading-relaxed">
            The most capable foundation models shaping the future of AI. Track their capabilities, context windows, and parameters as the frontier expands.
          </p>
        </div>

        {/* Model Cards */}
        {models.map((model) => (
          <Link
            href={`/models/${model.slug}`}
            key={model.id}
            className="group relative w-[320px] sm:w-[400px] md:w-[500px] h-[350px] rounded-3xl overflow-hidden bg-[#121A15] border border-[#243629] shrink-0 transition-transform duration-500 hover:scale-[0.97] flex flex-col justify-between"
          >
            {/* Background Hover Effect */}
            <div className="absolute inset-0 bg-[#0C120F] opacity-0 group-hover:opacity-30 transition-opacity duration-700 z-0 pointer-events-none" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-[#4ADE80]/10 to-transparent z-0 pointer-events-none" />

            {/* Top Row: Developer & Task */}
            <div className="relative z-10 flex justify-between items-start p-6 md:p-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[#5A6E60] mb-2">
                  {model.developer}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A261D] border border-[#243629] text-[#8C9E91] text-[10px] font-semibold tracking-wide">
                  <Sparkles size={12} className="text-[#4ADE80]" />
                  {model.primaryTask}
                </div>
              </div>
              <ArrowUpRight size={24} className="text-[#243629] group-hover:text-[#4ADE80] transition-colors" />
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 p-6 md:p-8 pt-0">
              <h3 
                className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#E2E8E4] mb-6 group-hover:text-[#4ADE80] transition-colors truncate"
                style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)", letterSpacing: "-1px" }}
              >
                {model.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 border-t border-[#243629] pt-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#5A6E60] font-semibold mb-1">Parameters</p>
                  <p className="text-sm font-mono text-[#E2E8E4] truncate">{model.parameters === "undisclosed" ? "Undisclosed" : model.parameters}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#5A6E60] font-semibold mb-1">Context</p>
                  <p className="text-sm font-mono text-[#E2E8E4] truncate">{model.contextWindow}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
