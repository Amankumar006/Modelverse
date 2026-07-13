"use client";

import React from "react";

// Helper to render high-premium, custom abstract line-art SVG logos for AI developers
function getAbstractLogo(developer: string) {
  const name = developer.toLowerCase();

  if (name.includes("openai") || name.includes("chatgpt")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* OpenAI-like spiral flower geometry */}
        <path d="M12 2v20M2 12h20M5.75 5.75l12.5 12.5M18.25 5.75L5.75 18.25" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth={1.2} fill="currentColor" fillOpacity="0.1" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (name.includes("anthropic")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* Anthropic-like structural tri-pillar symbol */}
        <path d="M4 20L12 4l8 16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 14h8" strokeLinecap="round" />
        <circle cx="12" cy="14" r="2.5" stroke="currentColor" strokeWidth={1} fill="currentColor" fillOpacity="0.1" />
      </svg>
    );
  }

  if (name.includes("google") || name.includes("gemini") || name.includes("deepmind")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* Gemini sparkling starburst */}
        <path d="M12 3c0 4.5 1.5 6 6 6-4.5 0-6 1.5-6 6 0-4.5-1.5-6-6-6 4.5 0 6-1.5 6-6z" fill="currentColor" fillOpacity="0.15" />
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth={0.8} />
      </svg>
    );
  }

  if (name.includes("meta") || name.includes("llama")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* Meta infinity ribbon loop */}
        <path d="M8 16c-2.21 0-4-1.79-4-4s1.79-4 4-4c2.5 0 5.5 8 8 8 2.21 0 4-1.79 4-4s-1.79-4-4-4c-2.5 0-5.5 8-8 8z" strokeLinejoin="round" fill="currentColor" fillOpacity="0.05" />
      </svg>
    );
  }

  if (name.includes("mistral")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* Mistral abstract faceted polygon / windswept diamond */}
        <path d="M12 3l7 7-7 7-7-7z" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 3v14M5 10h14" strokeWidth={1} strokeDasharray="2 2" />
        <circle cx="12" cy="10" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (name.includes("cohere")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* Cohere intersecting organic cells / rings */}
        <circle cx="8" cy="12" r="4" stroke="currentColor" fill="currentColor" fillOpacity="0.05" />
        <circle cx="16" cy="12" r="4" stroke="currentColor" fill="currentColor" fillOpacity="0.05" />
        <path d="M12 6v12" strokeDasharray="1.5 1.5" />
      </svg>
    );
  }

  if (name.includes("stability")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* Stability AI multi-block/grid symbol */}
        <rect x="4" y="4" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="14" y="4" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="4" y="14" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.1" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M10 7h4M10 17h4M7 10v4M17 10v4" strokeWidth={1} strokeDasharray="1 1" />
      </svg>
    );
  }

  if (name.includes("deepseek")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        {/* DeepSeek search loop + focal core */}
        <path d="M21 21l-5.2-5.2" strokeLinecap="round" />
        <circle cx="10" cy="10" r="6" fill="currentColor" fillOpacity="0.1" />
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth={1} />
      </svg>
    );
  }

  if (name.includes("microsoft")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" fill="currentColor" fillOpacity="0.1" />
      </svg>
    );
  }

  // General fallback: elegant scientific/node representation
  const initials = developer
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-white/40 group-hover/tile:text-brand-orange transition-colors">
        <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      </svg>
      <span className="text-[8px] font-bold text-white/40 group-hover/tile:text-white/80 transition-colors font-mono mt-0.5 select-none uppercase">
        {initials}
      </span>
    </div>
  );
}

function DeveloperTile({ developer }: { developer: string }) {
  return (
    <div
      className="liquid-glass h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.08] relative group/tile transition-all duration-300 hover:scale-105 active:scale-95"
      title={developer}
    >
      {getAbstractLogo(developer)}
    </div>
  );
}

export default function DeveloperMarquee({ developers }: { developers: string[] }) {
  // We want to make sure standard major names appear in the marquee even if they aren't seeded yet
  const displayDevs = Array.from(new Set([
    ...developers,
    "OpenAI",
    "Anthropic",
    "Google",
    "DeepSeek",
    "Meta",
    "Mistral",
    "Cohere",
    "Stability AI",
  ]));

  // Duplicate list to ensure wide scrolling track is fully populated
  const duplicatedDevs = [...displayDevs, ...displayDevs, ...displayDevs];

  return (
    <div className="space-y-3.5 overflow-hidden py-1 relative [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      {/* Row 1: Left */}
      <div className="flex gap-3.5 w-max animate-marquee-left">
        {duplicatedDevs.map((dev, idx) => (
          <DeveloperTile key={`left-${dev}-${idx}`} developer={dev} />
        ))}
      </div>
      {/* Row 2: Right */}
      <div className="flex gap-3.5 w-max animate-marquee-right">
        {duplicatedDevs.map((dev, idx) => (
          <DeveloperTile key={`right-${dev}-${idx}`} developer={dev} />
        ))}
      </div>
    </div>
  );
}
