"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";

// Claude Logo (8-spoke asterism)
function ClaudeLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" strokeLinecap="round" />
    </svg>
  );
}

// OpenAI Logo (whirlpool shape)
function OpenAILogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M21.2 9.9c.3-1.6-.2-3.2-1.3-4.3-1-1.1-2.6-1.7-4.1-1.5-.7-1.4-2.1-2.3-3.6-2.4-1.6-.1-3.1.6-3.9 1.9-1.2-.5-2.6-.4-3.7.3-1.1.7-1.8 1.9-2 3.2-1.4.3-2.5 1.2-3 2.5s-.3 2.8.5 3.9c-.3 1.6.2 3.2 1.3 4.3 1 1.1 2.6 1.7 4.1 1.5.7 1.4 2.1 2.3 3.6 2.4.4 0 .9 0 1.3-.1 1.1-.3 2-.9 2.6-1.8.8.8 1.9 1.4 3.1 1.5.4 0 .8 0 1.2-.1 1.6-.3 2.9-1.4 3.4-3 1.3-.3 2.4-1.2 2.9-2.5s.3-2.8-.5-3.9zm-11.4 9.1c-.8.1-1.6-.2-2.2-.8-.7-.6-1-1.5-.9-2.4l.1-.9 1 .5c1.4.7 3 .7 4.4 0l1-.5v1c0 .9-.3 1.8-.9 2.4-.7.6-1.5.8-2.5.7zm-4.7-4.1c-.4-.7-.5-1.5-.3-2.3.2-.8.8-1.5 1.5-1.9l.8-.4.5.9c.7 1.4 2 2.4 3.5 2.8l1 .3-.8.6c-.8.6-1.8.9-2.8.9-.9 0-1.7-.3-2.4-.9zm-.7-6.2c0-.8.4-1.6 1-2.2.7-.6 1.5-.8 2.4-.7l.9.1-.5 1c-.7 1.4-.7 3 0 4.4l.5 1-.9-.5c-.8-.5-1.5-1.2-1.9-2.1l-.5-1zm6.9-3.2c.8-.1 1.6.2 2.2.8.7.6 1 1.5.9 2.4l-.1.9-1-.5c-1.4-.7-3-.7-4.4 0l-1 .5v-1c0-.9.3-1.8.9-2.4.6-.6 1.5-.8 2.5-.7zm4.7 4.1c.4.7.5 1.5.3 2.3-.2.8-.8 1.5-1.5 1.9l-.8.4-.5-.9c-.7-1.4-2-2.4-3.5-2.8l-1-.3.8-.6c.8-.6 1.8-.9 2.8-.9.9 0 1.7.3 2.4.9zm.7 6.2c0 .8-.4 1.6-1 2.2-.7.6-1.5.8-2.4.7l-.9-.1.5-1c.7-1.4.7-3 0-4.4l-.5-1 .9.5c.8.5 1.5 1.2 1.9 2.1l.5 1z" />
    </svg>
  );
}

// Gemini Logo (4-pointed sparkle)
function GeminiLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
      <path d="M12 3c0 4.5 4.5 9 9 9-4.5 0-9 4.5-9 9 0-4.5-4.5-9-9-9 4.5 0 9-4.5 9-9z" strokeLinejoin="round" />
    </svg>
  );
}

type SummaryModel = "claude" | "chatgpt" | "gemini";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [activeModel, setActiveModel] = useState<SummaryModel | null>(null);

  const getModelTitle = (model: SummaryModel) => {
    switch (model) {
      case "claude":
        return "How Claude might describe Modelverse";
      case "chatgpt":
        return "How ChatGPT might describe Modelverse";
      case "gemini":
        return "How Gemini might describe Modelverse";
    }
  };

  const getModelSummary = (model: SummaryModel) => {
    switch (model) {
      case "claude":
        return "Modelverse is an exceptional, human-curated repository tracking the rapid evolution of foundation AI models. By archiving release dates, licensing models, context windows, and benchmark parameters, it provides developers with a clear, unbiased timeline of both open-weight breakthroughs and frontier closed-source releases.";
      case "chatgpt":
        return "Modelverse stands as a comprehensive digital catalog designed for AI researchers and software engineers. It monitors the latest neural network deployments, detailing key performance metrics and technical specifications in a structured, accessible format, helping you stay ahead in the fast-paced AI ecosystem.";
      case "gemini":
        return "Modelverse functions as a real-time, structured index of global AI advancement. By synthesizing primary sources, developer docs, and empirical evaluations, it acts as a verified directory of large language models, vision systems, and multimodal tools, empowering creators to build with confidence.";
    }
  };

  const footerLinks = [
    {
      title: "Catalog",
      links: [
        { label: "All Models", href: "/models" },
        { label: "Open Weights", href: "/models?type=open-weights" },
        { label: "Closed Source", href: "/models?type=closed-source" },
        { label: "API Only", href: "/models?type=api-only" },
        { label: "Research Preview", href: "/models?type=research-preview" },
      ],
    },
    {
      title: "Developers",
      links: [
        { label: "OpenAI", href: "/models?developer=openai" },
        { label: "Meta", href: "/models?developer=meta" },
        { label: "Google", href: "/models?developer=google" },
        { label: "Anthropic", href: "/models?developer=anthropic" },
        { label: "Mistral", href: "/models?developer=mistral" },
        { label: "Cohere", href: "/models?developer=cohere" },
      ],
    },
    {
      title: "Curators",
      links: [
        { label: "Methodology", href: "/methodology" },
        { label: "Submit Model", href: "/submit" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Discord Server", href: "https://discord.gg" },
        { label: "Reddit Community", href: "https://www.reddit.com/r/Modelverse" },
        { label: "Models RSS", href: "/feed.xml" },
        { label: "News RSS", href: "/news/feed.xml" },
      ],
    },
  ];

  return (
    <footer className="relative w-full bg-[url('/images/footer-bg.png')] bg-cover bg-bottom bg-no-repeat text-white pt-24 pb-10 px-4 sm:px-6 md:px-10 lg:px-14 overflow-hidden z-50">
      {/* Top Gradient Blend */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-black/10 to-transparent pointer-events-none z-0" />

      {/* Footer Navigation Grid */}
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 md:gap-10 pb-20">
        {footerLinks.map((column, colIdx) => (
          <div key={`col-${colIdx}`} className="space-y-4 text-left">
            <h4 className="text-white text-[13px] font-semibold tracking-tight uppercase">
              {column.title}
            </h4>
            <ul className="space-y-2.5">
              {column.links.map((link, linkIdx) => (
                <li key={`link-${colIdx}-${linkIdx}`}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white transition-colors text-xs inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    {link.label}
                    {link.href.startsWith("mailto:") && (
                      <ArrowUpRight size={10} className="opacity-60" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 max-w-7xl mx-auto border-t border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left Side: Copyright & Legal */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-white/50 font-normal">
          <span>&copy; Modelverse {currentYear}</span>
          <Link href="/terms" className="hover:text-white transition-colors cursor-pointer">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors cursor-pointer">
            Privacy Policy
          </Link>
          <Link href="/security" className="hover:text-white transition-colors cursor-pointer">
            Security
          </Link>
        </div>

        {/* Right Side: AI Summary Widgets */}
        <div className="flex items-center gap-3 text-xs text-white/70">
          <span>Get an AI summary of Modelverse:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModel(activeModel === "claude" ? null : "claude")}
              className={`p-2 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                activeModel === "claude"
                  ? "bg-white/20 border-white text-white scale-105 shadow-lg shadow-white/5"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 text-white/75 hover:text-white"
              }`}
              title="How Claude might describe us"
            >
              <ClaudeLogo />
            </button>
            <button
              onClick={() => setActiveModel(activeModel === "chatgpt" ? null : "chatgpt")}
              className={`p-2 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                activeModel === "chatgpt"
                  ? "bg-white/20 border-white text-white scale-105 shadow-lg shadow-white/5"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 text-white/75 hover:text-white"
              }`}
              title="How ChatGPT might describe us"
            >
              <OpenAILogo />
            </button>
            <button
              onClick={() => setActiveModel(activeModel === "gemini" ? null : "gemini")}
              className={`p-2 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                activeModel === "gemini"
                  ? "bg-white/20 border-white text-white scale-105 shadow-lg shadow-white/5"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/25 text-white/75 hover:text-white"
              }`}
              title="How Gemini might describe us"
            >
              <GeminiLogo />
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary Interactive Panel */}
      {activeModel && (
        <div className="fixed bottom-24 right-4 sm:right-6 md:right-10 lg:right-14 z-50 max-w-sm sm:max-w-md bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl animate-fade-in transition-all duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-white/10 text-brand-orange flex items-center justify-center">
                {activeModel === "claude" && <ClaudeLogo />}
                {activeModel === "chatgpt" && <OpenAILogo />}
                {activeModel === "gemini" && <GeminiLogo />}
              </div>
              <span className="text-xs font-semibold text-white/90">
                {getModelTitle(activeModel)}
              </span>
            </div>
            <button
              onClick={() => setActiveModel(null)}
              className="text-white/40 hover:text-white transition-colors cursor-pointer p-0.5 hover:bg-white/5 rounded"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-xs sm:text-[13px] leading-[1.6] text-white/80 font-normal text-left">
            {getModelSummary(activeModel)}
          </p>
        </div>
      )}
    </footer>
  );
}
