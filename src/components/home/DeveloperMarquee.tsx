"use client";
import React from "react";

// Render the exact five high-premium abstract line-art SVG logos requested by the user
function getAbstractLogo(developer: string) {
  const name = developer.toLowerCase();

  // 1. Anthropic: Triangle with a horizontal bar
  if (name.includes("anthropic")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[var(--muted)] group-hover/tile:text-[var(--accent)] transition-colors">
        <path d="M12 4L4 20h16z" strokeLinejoin="round" />
        <path d="M8 15h8" />
      </svg>
    );
  }

  // 2. ChatGPT / OpenAI: Double ring/loop
  if (name.includes("openai") || name.includes("chatgpt")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[var(--muted)] group-hover/tile:text-[var(--accent)] transition-colors">
        <circle cx="9" cy="12" r="3.5" />
        <circle cx="15" cy="12" r="3.5" />
      </svg>
    );
  }

  // 3. Gemini / Google: Four-pointed star with a center dot
  if (name.includes("google") || name.includes("gemini")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[var(--muted)] group-hover/tile:text-[var(--accent)] transition-colors">
        <path d="M12 4c0 4 4 8 8 8-4 0-8 4-8 8 0-4-4-8-8-8 4 0 8-4 8-8z" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  // 4. DeepSeek / Meta: Infinity symbol
  if (name.includes("meta") || name.includes("llama") || name.includes("deepseek")) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[var(--muted)] group-hover/tile:text-[var(--accent)] transition-colors">
        <path d="M8 9a3 3 0 1 0 0 6c1.8 0 3-1.2 4-3 1 1.8 2.2 3 4 3a3 3 0 1 0 0-6c-1.8 0-3 1.2-4 3-1-1.8-2.2-3-4-3z" />
      </svg>
    );
  }

  // 5. Mistral / others: Diamond with a center dot
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-[var(--muted)] group-hover/tile:text-[var(--accent)] transition-colors">
      <path d="M12 4l7 8-7 8-7-8z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
  );
}

function DeveloperTile({ developer }: { developer: string }) {
  return (
    <div
      className="liquid-glass h-14 w-14 md:h-16 md:w-16 rounded-xl flex items-center justify-center shrink-0 border border-[var(--accent-soft)] relative group/tile transition-all duration-300 hover:scale-105 active:scale-95"
      title={developer}
    >
      {getAbstractLogo(developer)}
    </div>
  );
}

export default function DeveloperMarquee({ developers }: { developers: string[] }) {
  // Use the exact five companies shown in the reference image (plus some fallbacks)
  const displayDevs = [
    "Anthropic",
    "OpenAI",
    "Google",
    "Meta",
    "Mistral",
    "Cohere",
    "Stability AI",
    "DeepSeek",
    "Microsoft",
  ];

  return (
    <div className="space-y-4 overflow-hidden py-1 relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] mt-auto z-10 w-full">
      {/* Inline styles to guarantee keyframes and animation load correctly in all Next.js environments */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-marquee-left {
          animation: marquee-left 22s linear infinite !important;
        }
        .animate-marquee-right {
          animation: marquee-right 26s linear infinite !important;
        }
      ` }} />

      {/* Row 1: Right-to-Left (Scrolls Left) */}
      <div className="flex w-max animate-marquee-left">
        <div className="flex gap-4 pr-4 shrink-0">
          {displayDevs.map((dev, idx) => (
            <DeveloperTile key={`row1-a-${dev}-${idx}`} developer={dev} />
          ))}
        </div>
        <div className="flex gap-4 pr-4 shrink-0">
          {displayDevs.map((dev, idx) => (
            <DeveloperTile key={`row1-b-${dev}-${idx}`} developer={dev} />
          ))}
        </div>
      </div>
      
      {/* Row 2: Left-to-Right (Scrolls Right) */}
      <div className="flex w-max animate-marquee-right">
        <div className="flex gap-4 pr-4 shrink-0">
          {displayDevs.map((dev, idx) => (
            <DeveloperTile key={`row2-a-${dev}-${idx}`} developer={dev} />
          ))}
        </div>
        <div className="flex gap-4 pr-4 shrink-0">
          {displayDevs.map((dev, idx) => (
            <DeveloperTile key={`row2-b-${dev}-${idx}`} developer={dev} />
          ))}
        </div>
      </div>
    </div>
  );
}

