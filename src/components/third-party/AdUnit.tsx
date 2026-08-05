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

  useEffect(() => {
    // Reset loaded ref on path change so SPA navigation re-triggers ads
    loaded.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!loaded.current && typeof window !== "undefined") {
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        loaded.current = true;
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [pathname]);

  return (
    <div className={`relative overflow-hidden w-full ${className}`}>
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
