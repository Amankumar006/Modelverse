"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  triggerOffset?: string;
  stagger?: number;
  noInvisible?: boolean;
}

export default function Reveal({
  children,
  delay = 0,
  duration = 0.8,
  y = 30,
  className = "",
  triggerOffset = "top 85%",
  noInvisible = false,
}: RevealProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.fromTo(
        container.current,
        {
          autoAlpha: 0,
          y: y,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: duration,
          delay: delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container.current,
            start: triggerOffset,
            toggleActions: "play none none none", // only play once
          },
        }
      );
    },
    { scope: container }
  );

  return (
    <div ref={container} className={`${noInvisible ? "" : "invisible "} ${className}`}>
      {children}
    </div>
  );
}
