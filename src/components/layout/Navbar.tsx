"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ModelverseLogo from "@/components/ui/ModelverseLogo";
import { Search, X, Menu } from "lucide-react";

export default function Navbar({ theme = "dark" }: { theme?: "light" | "dark" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; slug: string; developer: string; type: string }>>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

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
        initSearch(); // pre-load
      } else if (e.key === "Escape") {
        searchInputRef.current?.blur();
        setSearchFocused(false);
        setSelectedIndex(-1);
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

  // Lazy load Fuse.js and search index
  const [fuseModels, setFuseModels] = useState<any>(null);
  const [fuseNews, setFuseNews] = useState<any>(null);

  const initSearch = async () => {
    const isNewsRoute = pathname?.startsWith("/news");
    if (isNewsRoute) {
      if (fuseNews) return fuseNews;
      try {
        const [FuseJS, searchData] = await Promise.all([
          import("fuse.js").then((m) => m.default),
          import("@/lib/news-index.json").then((m) => m.default),
        ]);
        const newFuse = new FuseJS(searchData, {
          keys: ["title", "excerpt"],
          threshold: 0.3,
        });
        setFuseNews(newFuse);
        return newFuse;
      } catch (e) {
        console.error("Failed to load news search index", e);
        return null;
      }
    } else {
      if (fuseModels) return fuseModels;
      try {
        const [FuseJS, searchData] = await Promise.all([
          import("fuse.js").then((m) => m.default),
          import("@/lib/search-index.json").then((m) => m.default),
        ]);
        const newFuse = new FuseJS(searchData, {
          keys: ["name", "developer"],
          threshold: 0.3,
        });
        setFuseModels(newFuse);
        return newFuse;
      } catch (e) {
        console.error("Failed to load model search index", e);
        return null;
      }
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const activeFuse = await initSearch();
    if (activeFuse) {
      const results = activeFuse.search(query).map((r: any) => r.item);
      setSearchResults(results.slice(0, 6));
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
  };

  // Input Keyboard Navigation Handlers (Enter, ArrowUp, ArrowDown, Escape)
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isNewsRoute = pathname?.startsWith("/news");
    const basePath = isNewsRoute ? "/news" : "/models";
    const detailPrefix = isNewsRoute ? "/news" : "/models";

    if (!searchFocused || searchResults.length === 0) {
      if (e.key === "Enter" && searchQuery.trim()) {
        e.preventDefault();
        router.push(`${basePath}?q=${encodeURIComponent(searchQuery)}`);
        setSearchFocused(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < searchResults.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        router.push(`${detailPrefix}/${searchResults[selectedIndex].slug}`);
      } else if (searchResults.length > 0) {
        router.push(`${detailPrefix}/${searchResults[0].slug}`);
      } else {
        router.push(`${basePath}?q=${encodeURIComponent(searchQuery)}`);
      }
      setSearchFocused(false);
      setSelectedIndex(-1);
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      setSelectedIndex(-1);
      searchInputRef.current?.blur();
    }
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
          <span className="text-[11px] font-sans text-emerald-400 font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            LLM Database
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

        {/* Desktop Search Input & Community Links */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="relative">
            <div className="flex items-center rounded-lg px-3 py-1.5 w-52 focus-within:w-60 transition-all duration-200 border bg-[#1C1C1E] border-[#2E2E2E] focus-within:border-emerald-500">
              <Search size={14} className="mr-2 text-gray-500 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={pathname?.startsWith("/news") ? "Search news..." : "Search docs & models..."}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleInputKeyDown}
                onFocus={() => {
                  setSearchFocused(true);
                  initSearch();
                }}
                onMouseEnter={() => initSearch()}
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
                {searchResults.map((item: any, index) => {
                  const isNewsRoute = pathname?.startsWith("/news");
                  return (
                    <Link
                      key={item.id}
                      href={isNewsRoute ? `/news/${item.slug}` : `/models/${item.slug}`}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                        index === selectedIndex
                          ? "bg-[#28282A] text-white border-l-2 border-emerald-400"
                          : "hover:bg-[#28282A]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-medium text-white truncate">
                          {isNewsRoute ? item.title : item.name}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {isNewsRoute ? item.excerpt : item.developer}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#242426] text-gray-300 border border-white/5 shrink-0">
                        {isNewsRoute ? "News" : (item.type === "open-weights" ? "Open" : "API")}
                      </span>
                    </Link>
                  );
                })}

                {searchResults.length === 0 && (
                  <p className="p-4 text-xs text-gray-400 text-center">
                    {pathname?.startsWith("/news") ? "No articles found" : "No models found"}
                  </p>
                )}

                {searchResults.length > 0 && (
                  <Link
                    href={pathname?.startsWith("/news") ? `/news?q=${encodeURIComponent(searchQuery)}` : `/models?q=${encodeURIComponent(searchQuery)}`}
                    className="border-t border-[#2E2E2E] mt-1 pt-2 pb-1 text-center text-xs font-semibold text-emerald-400 hover:underline"
                  >
                    See all results &rarr;
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Social & Community External Links */}
          <a
            href="https://github.com/Amankumar006/Modelverse"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#1C1C1E] hover:bg-[#28282A] border border-[#2E2E2E] text-gray-400 hover:text-white transition-colors flex items-center justify-center"
            title="GitHub Repository"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          <a
            href="https://www.reddit.com/r/Modelverse"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#1C1C1E] hover:bg-[#28282A] border border-[#2E2E2E] text-gray-400 hover:text-amber-500 transition-colors flex items-center justify-center"
            title="Reddit Community"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-4.566 3.875c-.12 0-.236.049-.318.135a.44.44 0 0 0 .004.623c.87.87 2.274.87 3.144 0a.44.44 0 0 0 .004-.623.447.447 0 0 0-.318-.135z" />
            </svg>
          </a>
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  const isNewsRoute = pathname?.startsWith("/news");
                  const basePath = isNewsRoute ? "/news" : "/models";
                  router.push(`${basePath}?q=${encodeURIComponent(searchQuery)}`);
                  setMobileMenuOpen(false);
                }
              }}
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
