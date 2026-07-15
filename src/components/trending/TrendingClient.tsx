"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { TrendingModelEntry } from "@/lib/trending";

interface TrendingClientProps {
  initialModels: TrendingModelEntry[];
}

export default function TrendingClient({ initialModels }: TrendingClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamically import GSAP to prevent SSR issues
    import("gsap").then(({ gsap }) => {
      if (!containerRef.current) return;

      const items = containerRef.current.querySelectorAll(".list-item");
      const header = document.querySelector(".fade-in");

      // 1. Staggered entrance animation
      gsap.fromTo(
        header,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power2.out" }
      );

      gsap.fromTo(
        items,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.08,
          ease: "power3.out",
          delay: 0.1,
        }
      );

      // 2. Subtle hover indent effect using GSAP
      items.forEach((item) => {
        const title = item.querySelector(".item-title");

        const enterHandler = () => {
          gsap.to(title, {
            x: 20,
            duration: 0.5,
            ease: "power2.out",
          });
        };

        const leaveHandler = () => {
          gsap.to(title, {
            x: 0,
            duration: 0.5,
            ease: "power2.out",
          });
        };

        item.addEventListener("mouseenter", enterHandler);
        item.addEventListener("mouseleave", leaveHandler);

        // Cleanup function for this specific item
        return () => {
          item.removeEventListener("mouseenter", enterHandler);
          item.removeEventListener("mouseleave", leaveHandler);
        };
      });
    });
  }, [initialModels]);

  return (
    <div ref={containerRef} className="list-container w-full border-t border-[#DCD8D0]">
      {initialModels.map((model, index) => {
        const rankNum = String(index + 1).padStart(2, "0");
        return (
          <Link
            key={model.id}
            href={`/models/${model.slug}`}
            className="list-item relative grid grid-cols-[60px_1fr_120px] sm:grid-cols-[80px_1fr_200px] items-baseline py-8 sm:py-10 border-b border-[#DCD8D0] cursor-pointer text-decoration-none text-inherit transition-opacity duration-300"
          >
            {/* Rank Number */}
            <div className="item-num text-xs sm:text-sm text-[#8C9485] font-mono">
              {rankNum}
            </div>

            {/* Title */}
            <div className="item-title font-serif font-light text-3xl sm:text-5xl tracking-tight text-[#2E352B] italic will-change-transform pr-4">
              {model.name}
            </div>

            {/* Developer / Category */}
            <div className="item-category text-xs sm:text-sm text-[#8C9485] text-right font-light tracking-wide truncate">
              {model.developer}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
