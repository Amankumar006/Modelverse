"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowUp,
  Sparkles,
  Cpu,
  BrainCircuit,
  BarChart3,
  DollarSign,
  Terminal,
  Link2,
  Scale,
  Server,
  GitCompare,
  GitBranch,
  HelpCircle,
} from "lucide-react";

interface TocItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ModelDetailTableOfContentsProps {
  hasBenchmarks: boolean;
}

export default function ModelDetailTableOfContents({
  hasBenchmarks,
}: ModelDetailTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("overview");
  const [scrollProgress, setScrollProgress] = useState(0);

  const navItems: TocItem[] = useMemo(() => [
    { id: "overview", label: "Overview & Identity", icon: <Sparkles size={13} /> },
    { id: "specifications", label: "Architecture & Specs", icon: <Cpu size={13} /> },
    { id: "lineage", label: "Lineage & Heritage", icon: <GitBranch size={13} /> },
    { id: "analysis", label: "Architectural Analysis", icon: <BrainCircuit size={13} /> },
    { id: "tradeoffs", label: "Strengths & Trade-Offs", icon: <Scale size={13} /> },
    { id: "compatibility", label: "Hardware & Runtimes", icon: <Server size={13} /> },
    ...(hasBenchmarks
      ? [{ id: "benchmarks", label: "Verified Benchmarks", icon: <BarChart3 size={13} /> }]
      : []),
    { id: "pricing", label: "Pricing & Budget Estimator", icon: <DollarSign size={13} /> },
    { id: "alternatives", label: "Alternative Models", icon: <GitCompare size={13} /> },
    { id: "quickstart", label: "API Quickstart", icon: <Terminal size={13} /> },
    { id: "faq", label: "Frequently Asked Questions", icon: <HelpCircle size={13} /> },
    { id: "sources", label: "Sources & Provenance", icon: <Link2 size={13} /> },
  ], [hasBenchmarks]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress(Math.min(100, Math.max(0, Math.round((window.scrollY / totalScroll) * 100))));
      }

      const sectionElements = navItems
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      const scrollPosition = window.scrollY + 180;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      const topOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveId(id);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Table of contents" className="space-y-4">
      {/* Header with Reading Progress */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--muted)]/10">
        <div className="flex items-center gap-2 text-[var(--text)] font-bold uppercase tracking-wider text-[11px]">
          <span className="w-1.5 h-3 bg-[var(--accent)] rounded-full animate-pulse" />
          <span>On This Page</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--muted)] font-semibold tabular-nums">
          {scrollProgress}%
        </span>
      </div>

      {/* Navigation Links with Active Spy State */}
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-control)] text-xs transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                }`}
              >
                <span
                  className={`transition-colors ${
                    isActive ? "text-[var(--accent)]" : "text-[var(--muted)] group-hover:text-[var(--text)]"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>

      {/* Back to top helper button */}
      <div className="pt-2 border-t border-[var(--muted)]/10">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--accent)] font-medium transition-colors cursor-pointer w-full"
        >
          <ArrowUp size={12} />
          <span>Back to Top</span>
        </button>
      </div>
    </nav>
  );
}
