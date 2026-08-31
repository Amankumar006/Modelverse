"use client";

import React, { useEffect, useRef } from "react";

interface AdSenseUnitProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
  minHeight?: number | string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function AdSenseUnit({
  slotId = "default-slot",
  format = "auto",
  responsive = true,
  className = "",
  minHeight = 90,
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-5666739187500051";

  useEffect(() => {
    if (isLoaded.current) return;
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
        isLoaded.current = true;
      }
    } catch {
      // Gracefully handle ad-blocker environments or dev mode
    }
  }, []);

  return (
    <div
      className={`w-full my-6 flex flex-col items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight }}
    >
      <div className="w-full flex items-center justify-center gap-2 mb-1.5">
        <span className="text-[9px] uppercase tracking-widest text-[var(--muted)]/60 font-mono">
          Advertisement
        </span>
      </div>

      <div className="w-full flex items-center justify-center rounded-[var(--radius-card)] bg-[var(--card-bg)]/50 border border-[var(--muted)]/10 p-2 overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full text-center"
          style={{ display: "block" }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}
