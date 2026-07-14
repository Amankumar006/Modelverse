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
      className="relative h-screen flex items-center overflow-hidden bg-[#FFFFFF] border-t border-black/[0.04]"
    >
      {/* Gradient Fade Edges */}
      <div className="absolute top-0 left-0 w-[5vw] h-full bg-gradient-to-r from-[#FFFFFF] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[5vw] h-full bg-gradient-to-l from-[#FFFFFF] to-transparent z-10 pointer-events-none" />

      {/* Row containing cards */}
      <div 
        ref={rowRef} 
        className="flex gap-8 pl-[10vw] pr-[20vw] w-max will-change-transform items-center h-full"
      >
        {/* Intro Slide */}
        <div className="w-[320px] sm:w-[400px] h-[350px] flex flex-col justify-center shrink-0 pr-8">
          <h2 className="text-4xl md:text-5xl font-normal text-black mb-4" style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)", letterSpacing: "-1px" }}>
            Frontier <br />
            <span className="italic text-black/50">Intelligence.</span>
          </h2>
          <p className="text-black/60 text-sm md:text-[15px] leading-relaxed">
            A curated look at the most advanced models pushing the boundaries of artificial intelligence. Scroll to explore the cutting edge.
          </p>
        </div>

        {/* Model Cards */}
        {models.map((model) => (
          <Link
            href={`/models/${model.slug}`}
            key={model.id}
            className="group relative w-[320px] sm:w-[400px] md:w-[500px] h-[350px] rounded-3xl overflow-hidden bg-[#F7F7F7] border border-black/5 shrink-0 transition-transform duration-500 hover:scale-[0.97] flex flex-col justify-between"
          >
            {/* Background Image/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F7F7F7] to-white z-0 pointer-events-none" />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-brand-orange/5 to-transparent z-0 pointer-events-none" />

            {/* Top Row: Developer & Task */}
            <div className="relative z-10 flex justify-between items-start p-6 md:p-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-black/50 mb-2">
                  {model.developer}
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 border border-black/10 text-black/70 text-[10px] font-semibold tracking-wide">
                  <Sparkles size={12} className="text-brand-orange" />
                  {model.primaryTask}
                </div>
              </div>
              <ArrowUpRight size={24} className="text-black/20 group-hover:text-black transition-colors" />
            </div>

            {/* Bottom Row: Name & Stats */}
            <div className="relative z-10 p-6 md:p-8 pt-0">
              <h3 
                className="text-3xl sm:text-4xl md:text-5xl font-normal text-black mb-6 group-hover:text-brand-orange transition-colors truncate"
                style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)" }}
              >
                {model.name}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-5">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-black/40 font-semibold mb-1">Parameters</p>
                  <p className="text-sm font-mono text-black/90 truncate">{model.parameters === "undisclosed" ? "Undisclosed" : model.parameters}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-black/40 font-semibold mb-1">Context</p>
                  <p className="text-sm font-mono text-black/90 truncate">{model.contextWindow}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
