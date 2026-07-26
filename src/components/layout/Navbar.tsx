"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Fuse from "fuse.js";
import modelIndexData from "@/lib/search-index.json";
import { Search, X, Menu } from "lucide-react";

export default function Navbar({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; slug: string; developer: string; type: string }>>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname?.startsWith(path);
    if (isActive) {
      return "text-white bg-[#242426] font-semibold px-3 py-1.5 rounded-full";
    }
    return "text-gray-400 hover:text-white hover:bg-[#1C1C1E] px-3 py-1.5 rounded-full transition-colors";
  };

  const getMobileLinkClasses = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname?.startsWith(path);
    if (isActive) {
      return "text-white bg-[#242426] font-semibold";
    }
    return "text-gray-400 hover:text-white hover:bg-[#1C1C1E]";
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
      setSearchResults(results.slice(0, 6));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#141414]/95 backdrop-blur-md border-b border-[#282828]">
      <nav className="flex justify-between items-center px-4 sm:px-8 py-3 max-w-7xl mx-auto gap-4">
        {/* Brand Logo & Terracotta Spark Icon */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-medium tracking-tight text-white hover:opacity-90 transition-opacity shrink-0"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            width="22"
            height="22"
            fill="#D97757"
            className="shrink-0"
            aria-hidden="true"
          >
            <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z" />
          </svg>
          <span className="text-xl font-normal">Modelverse</span>
          <span className="text-[11px] font-sans text-gray-400 font-medium px-2 py-0.5 rounded-full bg-[#242426] border border-[#333333]">
            Platform Docs
          </span>
        </Link>

        {/* Menu Items (desktop) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs">
          <Link href="/" className={getLinkClasses('/')}>
            Home
          </Link>
          <Link href="/models" className={getLinkClasses('/models')}>
            Models
          </Link>
          <Link href="/timeline" className={getLinkClasses('/timeline')}>
            Timeline
          </Link>
          <Link href="/compare" className={getLinkClasses('/compare')}>
            Compare
          </Link>
          <Link href="/news" className={getLinkClasses('/news')}>
            News
          </Link>
          <Link href="/about" className={getLinkClasses('/about')}>
            About
          </Link>
        </div>

        {/* Desktop Search Input with ⌘K Badge */}
        <div className="hidden md:block relative shrink-0">
          <div className="relative flex items-center rounded-lg px-3 py-1.5 w-56 focus-within:w-64 transition-all duration-200 border bg-[#1C1C1E] border-[#2E2E2E] focus-within:border-[#DA7756]">
            <Search size={14} className="mr-2 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search docs & models..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="bg-transparent text-xs focus:outline-none w-full font-sans text-white placeholder:text-gray-500"
            />
            {searchQuery ? (
              <button
                onClick={clearSearch}
                className="p-0.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
              >
                <X size={12} />
              </button>
            ) : (
              <span className="text-[10px] text-gray-500 font-mono select-none px-1.5 py-0.5 rounded bg-[#28282A] border border-white/5">
                ⌘K
              </span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchFocused && searchQuery && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-[#1C1C1E] border border-[#2E2E2E] rounded-xl p-2 shadow-2xl z-50 flex flex-col text-left">
              {searchResults.map((model) => (
                <Link
                  key={model.id}
                  href={`/models/${model.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#28282A] transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-white truncate">{model.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{model.developer}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242426] text-gray-300 border border-white/5">
                    {model.type === "open-weights" ? "Open" : "API"}
                  </span>
                </Link>
              ))}

              {searchResults.length === 0 && (
                <p className="p-4 text-xs text-gray-400 text-center">No models found</p>
              )}

              {searchResults.length > 0 && (
                <Link
                  href={`/models?q=${encodeURIComponent(searchQuery)}`}
                  className="border-t border-[#2E2E2E] mt-1 pt-2 pb-1 text-center text-xs font-semibold text-[#DA7756] hover:underline"
                >
                  See all results &rarr;
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:bg-[#28282A] transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#141414] border-b border-[#282828] p-4 flex flex-col gap-3">
          <div className="relative flex items-center border border-[#2E2E2E] rounded-lg px-3 py-2 bg-[#1C1C1E]">
            <Search size={16} className="mr-2 text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent text-sm focus:outline-none w-full text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${getMobileLinkClasses('/')}`}
            >
              Home
            </Link>
            <Link
              href="/models"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${getMobileLinkClasses('/models')}`}
            >
              Models
            </Link>
            <Link
              href="/timeline"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${getMobileLinkClasses('/timeline')}`}
            >
              Timeline
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${getMobileLinkClasses('/compare')}`}
            >
              Compare
            </Link>
            <Link
              href="/news"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${getMobileLinkClasses('/news')}`}
            >
              News
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${getMobileLinkClasses('/about')}`}
            >
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
