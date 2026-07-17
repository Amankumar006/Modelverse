"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { motion, useInView } from "framer-motion";

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260619_191346_9d19d66e-86a4-47f7-8dc6-712c1788c3b2.mp4";

// Staggered Fade Component
const StaggeredFade = ({ text }: { text: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const letters = Array.from(text);

  return (
    <span ref={ref} className="inline-block">
      {letters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: index * 0.07, ease: "easeOut" }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Video autoplay blocked:", err);
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0C120F] flex flex-col">
      {/* ── Background Video Layer (z-0) ────────────────────── */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover object-center opacity-100"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />
        {/* Seamless blend into the next section */}
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-b from-transparent to-[#0C120F] z-0 pointer-events-none" />
      </div>

      {/* ── Navigation Bar (z-20) ── */}
      <div className="relative z-20">
        <Navbar theme="dark" />
      </div>

      {/* ── Hero Content (z-10) ─────────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start text-center px-5 sm:px-8 pt-4 sm:pt-8 md:pt-12 w-full">
        <div className="w-full flex flex-col items-center">
          
          {/* Headings */}
          <h1 className="flex flex-col items-center justify-center text-[#E2E8E4] mb-6 sm:mb-8 tracking-tight font-normal" style={{ fontFamily: "var(--font-serif)", lineHeight: "1.08" }}>
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase block">
              <StaggeredFade text="BEYOND THE" />
            </span>
            <span className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl uppercase block">
              <StaggeredFade text="NOISE" />
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="text-[#8C9E91] font-light leading-relaxed max-w-xs sm:max-w-md md:max-w-xl text-sm sm:text-base md:text-lg mb-8 sm:mb-10"
          >
            We track the frontier. A living, fact-checked archive of every notable AI model release. Tracking parameters, context sizes, and benchmarks straight from primary documentation.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.0 }}
          >
            <Link
              href="/models"
              className="liquid-glass rounded-full text-[#E2E8E4] uppercase tracking-[0.18em] sm:tracking-[0.2em] px-7 sm:px-10 py-3.5 sm:py-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C120F] inline-flex items-center justify-center transition-all"
            >
              Explore Catalog
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
