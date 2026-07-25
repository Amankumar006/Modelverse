"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Fuse from "fuse.js";
import modelIndexData from "@/lib/search-index.json";
import { Search, X, Menu } from "lucide-react";

export default function Navbar({ theme = "light" }: { theme?: "light" | "dark" }) {
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; slug: string; developer: string; type: string }>>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname?.startsWith(path);
    if (isActive) {
      return theme === 'dark' ? 'text-[#F0FDF4] hover:text-[#4ADE80]' : 'text-[#000000] hover:opacity-80';
    }
    return theme === 'dark' ? 'text-[#8C9E91] hover:text-[#E2E8E4]' : 'text-[#6F6F6F] hover:text-[#000000]';
  };

  const getMobileLinkClasses = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname?.startsWith(path);
    if (isActive) {
      return theme === 'dark' ? 'text-[#F0FDF4] hover:bg-[#121A15]' : 'text-[#000000] hover:bg-black/5';
    }
    return theme === 'dark' ? 'text-[#8C9E91] hover:text-[#E2E8E4] hover:bg-[#121A15]' : 'text-[#6F6F6F] hover:text-[#000000] hover:bg-black/5';
  };

  // Initialize Fuse.js for fuzzy client search
  const fuse = useMemo(() => {
    return new Fuse(modelIndexData, {
      keys: ["name", "developer"],
      threshold: 0.3,
    });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
    } else {
      const results = fuse.search(query).map((r) => r.item);
      setSearchResults(results.slice(0, 5));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header className="relative z-50 w-full">
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto gap-4">
        {/* Logo */}
        <Link
          href="/"
          className={`flex items-center gap-3 text-3xl tracking-tight font-normal hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-lg shrink-0 ${theme === 'dark' ? 'text-[#F0FDF4]' : 'text-[#000000]'}`}
          style={{
            fontFamily: "var(--font-display, 'Instrument Serif', serif)",
          }}
        >
          <Image src="/logo.jpg" alt="Modelverse Logo" width={40} height={40} className="rounded-full object-cover" />
          <span>Modelverse<sup className="text-sm font-sans select-none">®</sup></span>
        </Link>

        {/* Menu Items (desktop) */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md px-1 ${getLinkClasses('/')}`}
          >
            Home
          </Link>
          <Link
            href="/models"
            className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md px-1 ${getLinkClasses('/models')}`}
          >
            Models
          </Link>
          <Link
            href="/timeline"
            className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md px-1 ${getLinkClasses('/timeline')}`}
          >
            Timeline
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md px-1 ${getLinkClasses('/about')}`}
          >
            About
          </Link>
          <Link
            href="/news"
            className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 rounded-md px-1 ${getLinkClasses('/news')}`}
          >
            News
          </Link>
        </div>

        {/* Desktop Search Input */}
        <div className="hidden md:block relative shrink-0">
          <div className={`relative flex items-center rounded-full px-3 py-1.5 transition-all w-48 focus-within:w-60 duration-300 border ${theme === 'dark' ? 'bg-[#121A15] border-[#243629] hover:border-[#334D3A] focus-within:border-[#4ADE80]/30' : 'bg-black/[0.04] border-black/[0.08] hover:border-black/20 focus-within:border-black/25'}`}>
            <Search size={14} className={`mr-1.5 shrink-0 ${theme === 'dark' ? 'text-[#5A6E60]' : 'text-black/40'}`} />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className={`bg-transparent text-xs focus:outline-none w-full font-medium ${theme === 'dark' ? 'text-[#E2E8E4] placeholder:text-[#5A6E60]' : 'text-black placeholder:text-black/35'}`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className={`p-0.5 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'hover:bg-[#1A261D] text-[#8C9E91] hover:text-[#E2E8E4]' : 'hover:bg-black/10 text-black/40 hover:text-black/80'}`}
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* Dropdown Results */}
          {searchFocused && searchQuery && (
            <div className={`absolute top-full right-0 mt-2 w-72 backdrop-blur-xl border rounded-2xl p-2 shadow-2xl z-50 text-left flex flex-col ${theme === 'dark' ? 'bg-[#0C120F]/95 border-[#243629]' : 'bg-white/95 border-black/[0.08]'}`}>
              {searchResults.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-[#121A15]' : 'hover:bg-black/[0.04]'}`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-[#F0FDF4]' : 'text-black'}`}>{model.name}</p>
                    <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-[#8C9E91]' : 'text-black/45'}`}>{model.developer}</p>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${theme === 'dark' ? 'bg-[#1A261D] text-[#8C9E91]' : 'bg-black/5 text-black/50'}`}>
                    {model.type === "open-weights" ? "Open" : "Closed"}
                  </span>
                </Link>
              ))}

              {/* Empty State */}
              {searchResults.length === 0 && (
                <div className="p-4 text-center">
                  <p className={`text-xs ${theme === 'dark' ? 'text-[#8C9E91]' : 'text-black/50'}`}>No models match this query — try another search</p>
                  <button
                    onClick={clearSearch}
                    className="mt-2 text-[10px] font-semibold text-[#4ADE80] hover:text-[#22c55e] underline"
                  >
                    Clear Search
                  </button>
                </div>
              )}

              {/* Footer link */}
              {searchResults.length > 0 && (
                <Link
                  href={`/models?q=${encodeURIComponent(searchQuery)}`}
                  className={`border-t mt-1.5 pt-2 pb-1 text-center text-[10px] font-semibold text-[#4ADE80] hover:text-[#22c55e] hover:underline ${theme === 'dark' ? 'border-[#243629]' : 'border-black/[0.06]'}`}
                >
                  See all results for &apos;{searchQuery}&apos;
                </Link>
              )}
            </div>
          )}
        </div>

        {/* CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          {pathname !== "/models" && (
            <Link
              href="/models"
              className={`text-sm font-medium px-6 py-2.5 rounded-full hover:scale-[1.03] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 flex items-center justify-center ${theme === 'dark' ? 'bg-[#4ADE80] text-[#0C120F] hover:bg-[#22c55e]' : 'bg-[#000000] text-[#FFFFFF] hover:bg-black/90'}`}
            >
              Explore Models
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${theme === 'dark' ? 'text-[#E2E8E4] hover:bg-[#121A15]' : 'text-black hover:bg-black/5'}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden absolute top-full left-0 right-0 backdrop-blur-xl border-b p-4 flex flex-col gap-4 shadow-xl z-50 ${theme === 'dark' ? 'bg-[#0C120F]/95 border-[#243629]' : 'bg-white/95 border-black/[0.08]'}`}>
          {/* Full-width Search Input */}
          <div className={`relative flex items-center border rounded-full px-3.5 py-2 ${theme === 'dark' ? 'bg-[#121A15] border-[#243629]' : 'bg-black/[0.04] border-black/[0.08]'}`}>
            <Search size={16} className={`mr-2 shrink-0 ${theme === 'dark' ? 'text-[#5A6E60]' : 'text-black/40'}`} />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className={`bg-transparent text-sm focus:outline-none w-full font-medium ${theme === 'dark' ? 'text-[#E2E8E4] placeholder:text-[#5A6E60]' : 'text-black placeholder:text-black/35'}`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className={`p-1 rounded-full transition-colors shrink-0 ${theme === 'dark' ? 'hover:bg-[#1A261D] text-[#8C9E91] hover:text-[#E2E8E4]' : 'hover:bg-black/10 text-black/40'}`}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Mobile Search Results */}
          {searchQuery && (
            <div className={`flex flex-col gap-1 max-h-60 overflow-y-auto border-b pb-2 ${theme === 'dark' ? 'border-[#243629]' : 'border-black/[0.06]'}`}>
              {searchResults.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-[#121A15]' : 'hover:bg-black/[0.04]'}`}
                >
                  <div className="min-w-0 pr-2 text-left">
                    <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-[#F0FDF4]' : 'text-black'}`}>{model.name}</p>
                    <p className={`text-[10px] truncate ${theme === 'dark' ? 'text-[#8C9E91]' : 'text-black/45'}`}>{model.developer}</p>
                  </div>
                  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${theme === 'dark' ? 'bg-[#1A261D] text-[#8C9E91]' : 'bg-black/5 text-black/50'}`}>
                    {model.type === "open-weights" ? "Open" : "Closed"}
                  </span>
                </Link>
              ))}

              {searchResults.length === 0 && (
                <p className={`text-xs text-center py-4 ${theme === 'dark' ? 'text-[#8C9E91]' : 'text-black/50'}`}>No models match this query</p>
              )}

              {searchResults.length > 0 && (
                <Link
                  href={`/models?q=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center text-[10px] font-semibold text-[#4ADE80] py-2 hover:underline hover:text-[#22c55e]"
                >
                  See all results for &apos;{searchQuery}&apos;
                </Link>
              )}
            </div>
          )}

          {/* Mobile navigation links */}
          <div className="flex flex-col gap-1 text-left">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${getMobileLinkClasses('/')}`}
            >
              Home
            </Link>

            <Link
              href="/models"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${getMobileLinkClasses('/models')}`}
            >
              Models
            </Link>
            <Link
              href="/timeline"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${getMobileLinkClasses('/timeline')}`}
            >
              Timeline
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${getMobileLinkClasses('/about')}`}
            >
              About
            </Link>
            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-colors ${getMobileLinkClasses('/news')}`}
            >
              News
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
