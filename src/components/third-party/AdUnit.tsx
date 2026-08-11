"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface AdUnitProps {
  slot?: string;
  className?: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: boolean;
}

export default function AdUnit({
  slot = "1234567890", // fallback slot for testing
  className = "",
  format = "auto",
  responsive = true,
}: AdUnitProps) {
  const pathname = usePathname();
  const loaded = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset loaded ref on path change so SPA navigation re-triggers ads
    loaded.current = false;
  }, [pathname]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pushAd = () => {
      if (loaded.current) return;
      
      // Wait for layout and ensure the container has a non-zero width
      if (containerRef.current && containerRef.current.offsetWidth > 0) {
        try {
          const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
          if (typeof adsbygoogle.push === "function") {
            adsbygoogle.push({});
          }
          loaded.current = true;
        } catch (err) {
          console.error("AdSense error:", err);
        }
      } else {
        // If width is still 0 (e.g. hidden), check again shortly
        timeoutId = setTimeout(pushAd, 200);
      }
    };

    if (typeof window !== "undefined") {
      // Give React a moment to paint the DOM
      timeoutId = setTimeout(pushAd, 100);
    }

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden w-full ${className}`}>
      <ins
        className="adsbygoogle block"
        data-ad-client="ca-pub-5666739187500051"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
