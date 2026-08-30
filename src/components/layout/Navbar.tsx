"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, X, Command } from "lucide-react";
import ModelverseLogo from "@/components/ui/ModelverseLogo";
import ThemeToggle from "./ThemeToggle";
import { NavLinks, NAV_ITEMS } from "./NavLinks";
import { useCommandPalette } from "@/components/search/CommandPaletteContext";

export default function Navbar() {
  const { open } = useCommandPalette();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--muted)]/10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-14 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <ModelverseLogo height={32} />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLinks />
        </div>

        {/* Desktop Right Controls (Global Cmd+K Trigger + Theme toggle) */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={open}
            className="flex items-center justify-between gap-3 bg-[var(--card-bg)] text-xs rounded-[var(--radius-pill)] pl-3 pr-2 py-1.5 border border-[var(--muted)]/20 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)] transition-all w-48 lg:w-60 shadow-sm group cursor-pointer"
            aria-label="Open Command Palette"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search size={14} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
              <span className="truncate">Search catalog...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--muted)]/20 font-mono text-[var(--muted)] shrink-0">
              <Command size={10} />K
            </kbd>
          </button>

          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={open}
            className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--card-bg)] transition-colors"
            aria-label="Quick Search"
          >
            <Search size={18} />
          </button>
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--card-bg)] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[var(--bg)] border-b border-[var(--muted)]/10 px-4 py-4 space-y-3">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              open();
            }}
            className="w-full flex items-center justify-between bg-[var(--card-bg)] text-xs rounded-lg px-3 py-2.5 border border-[var(--muted)]/20 text-[var(--muted)]"
          >
            <div className="flex items-center gap-2">
              <Search size={15} />
              <span>Search 370+ foundation models...</span>
            </div>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--muted)]/20 font-mono">
              ⌘K
            </kbd>
          </button>

          <div className="flex flex-col gap-1 pt-2 border-t border-[var(--muted)]/10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium px-3 py-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
