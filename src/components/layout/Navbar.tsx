"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import ModelverseLogo from "@/components/ui/ModelverseLogo";
import { NavLinks, NAV_ITEMS } from "./NavLinks";

export default function Navbar() {
  const router = useRouter();
  const { mode, toggleMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/models?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--muted)]/10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-14 h-16">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <ModelverseLogo height={32} />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLinks />
        </div>

        {/* Desktop Right Controls (Search + Theme toggle) */}
        <div className="hidden md:flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--card-bg)] text-xs rounded-[var(--radius-pill)] pl-8 pr-3 py-1.5 border border-[var(--muted)]/20 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-all w-44 lg:w-56"
            />
          </form>

          <button
            onClick={toggleMode}
            className="p-2 rounded-[var(--radius-pill)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-[var(--muted)] hover:text-[var(--text)] transition-all flex items-center justify-center cursor-pointer border border-[var(--muted)]/10"
            title={`Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`}
            aria-label="Toggle theme mode"
          >
            {mode === "dark" ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleMode}
            className="p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--card-bg)] transition-colors"
            aria-label="Toggle theme mode"
          >
            {mode === "dark" ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
          </button>
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
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-[var(--muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card-bg)] text-sm rounded-lg pl-9 pr-3 py-2 border border-[var(--muted)]/20 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
            />
          </form>

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
