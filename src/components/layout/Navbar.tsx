"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Fuse from "fuse.js";
import modelIndexData from "@/lib/search-index.json";
import ModelverseLogo from "@/components/ui/ModelverseLogo";
import { Search, X, Menu } from "lucide-react";

export default function Navbar({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; slug: string; developer: string; type: string }>>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  // Register global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      } else if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setSearchFocused(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <nav className="flex justify-between items-center px-4 sm:px-6 lg:px-10 2xl:px-12 py-3 max-w-[1600px] mx-auto gap-4">
        {/* Custom Neural Constellation Modelverse SVG Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-medium tracking-tight text-white hover:opacity-90 transition-opacity shrink-0"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
        >
          <ModelverseLogo size={34} />
          <span className="text-xl sm:text-2xl font-normal">Modelverse</span>
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
              ref={searchInputRef}
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
