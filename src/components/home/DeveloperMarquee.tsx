"use client";

import React from "react";

// Render the exact five high-premium abstract line-art SVG logos requested by the user
function getAbstractLogo(developer: string) {
  const name = developer.toLowerCase();

  // 1. Anthropic: Triangle with a horizontal bar
  if (name.includes("anthropic")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        <path d="M12 4L4 20h16z" strokeLinejoin="round" />
        <path d="M8 15h8" />
      </svg>
    );
  }

  // 2. ChatGPT / OpenAI: Double ring/loop
  if (name.includes("openai") || name.includes("chatgpt")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        <circle cx="9" cy="12" r="3.5" />
        <circle cx="15" cy="12" r="3.5" />
      </svg>
    );
  }

  // 3. Gemini / Google: Four-pointed star with a center dot
  if (name.includes("google") || name.includes("gemini")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        <path d="M12 4c0 4 4 8 8 8-4 0-8 4-8 8 0-4-4-8-8-8 4 0 8-4 8-8z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  // 4. DeepSeek / Meta: Infinity symbol
  if (name.includes("meta") || name.includes("llama") || name.includes("deepseek")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-white/80 group-hover/tile:text-brand-orange transition-colors">
        <path d="M8 9a3 3 0 1 0 0 6c1.8 0 3-1.2 4-3 1 1.8 2.2 3 4 3a3 3 0 1 0 0-6c-1.8 0-3 1.2-4 3-1-1.8-2.2-3-4-3z" />
      </svg>
    );
  }

  // 5. Mistral / others: Diamond with a center dot
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-white/80 group-hover/tile:text-brand-orange transition-colors">
      <path d="M12 4l7 8-7 8-7-8z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
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
  // Use the exact five companies shown in the reference image
  const displayDevs = [
    "Anthropic",
    "OpenAI",
    "Google",
    "Meta",
    "Mistral",
  ];

  // Duplicate to ensure smooth scrolling loop
  const duplicatedDevs = [...displayDevs, ...displayDevs, ...displayDevs, ...displayDevs];

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
