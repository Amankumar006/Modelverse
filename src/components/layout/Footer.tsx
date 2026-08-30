"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ModelverseLogo from "@/components/ui/ModelverseLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Catalog",
      links: [
        { label: "All Models", href: "/models" },
        { label: "LLMs", href: "/models?category=LLM" },
        { label: "Multimodal", href: "/models?category=Multimodal" },
        { label: "Code Models", href: "/models?category=Code" },
      ],
    },
    {
      title: "Providers",
      links: [
        { label: "Anthropic", href: "/models?provider=Anthropic" },
        { label: "OpenAI", href: "/models?provider=OpenAI" },
        { label: "Google", href: "/models?provider=Google" },
        { label: "Meta", href: "/models?provider=Meta" },
        { label: "DeepSeek", href: "/models?provider=DeepSeek" },
      ],
    },
    {
      title: "Intelligence",
      links: [
        { label: "Latest Articles", href: "/articles" },
        { label: "Model Comparisons", href: "/compare" },
        { label: "About Modelverse", href: "/about" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Discord", href: "https://discord.gg/fF3fHGWnd" },
        { label: "Reddit", href: "https://www.reddit.com/r/themodelversebot_dev/" },
        { label: "GitHub", href: "https://github.com/Amankumar006/Modelverse" },
      ],
    },
  ];

  return (
    <footer className="relative w-full bg-[var(--bg)] text-[var(--text)] border-t border-[var(--muted)]/10 pt-16 pb-10 px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20">
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 pb-12">
        {/* Brand Summary */}
        <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-4">
          <ModelverseLogo height={28} />
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            The open intelligence catalog for foundation models, benchmarks, specs, and breaking AI research.
          </p>
        </div>

        {/* Footer Navigation Columns */}
        {footerLinks.map((column, colIdx) => (
          <div key={`col-${colIdx}`} className="space-y-3">
            <h4 className="text-[var(--text)] text-xs font-bold tracking-wider uppercase">
              {column.title}
            </h4>
            <ul className="space-y-2">
              {column.links.map((link, linkIdx) => (
                <li key={`link-${colIdx}-${linkIdx}`}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors text-xs inline-flex items-center gap-1 font-medium"
                  >
                    {link.label}
                    {link.href.startsWith("http") && <ArrowUpRight size={10} className="opacity-60" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto border-t border-[var(--muted)]/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)] font-mono">
        <p>&copy; {currentYear} Modelverse. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/about" className="hover:text-[var(--text)] transition-colors">
            About
          </Link>
          <Link href="/terms" className="hover:text-[var(--text)] transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
