"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Compass, Scale, Clock, TrendingUp, BookOpen, Send, Check } from "lucide-react";
import { useCommandPalette } from "./CommandPaletteContext";
import CommandPaletteItem, { ActionItem } from "./CommandPaletteItem";
import type { ModelRow, ArticleRow } from "@/types/database";

const QUICK_ACTIONS: ActionItem[] = [
  { id: "models", title: "Browse Model Catalog", subtitle: "Explore indexed frontier & open models", icon: <Compass size={16} />, href: "/models" },
  { id: "compare", title: "Compare Models Matrix", subtitle: "Side-by-side technical specification diff", icon: <Scale size={16} />, href: "/compare" },
  { id: "timeline", title: "Releases Timeline", subtitle: "Chronological model release history", icon: <Clock size={16} />, href: "/timeline" },
  { id: "trending", title: "Trending Leaderboard", subtitle: "Top ranked models and community benchmarks", icon: <TrendingUp size={16} />, href: "/trending" },
  { id: "articles", title: "Technical Deep Dives", subtitle: "Architecture analyses and lab evaluations", icon: <BookOpen size={16} />, href: "/articles" },
  { id: "submit", title: "Submit Foundation Model", subtitle: "Submit new model parameters for audit", icon: <Send size={16} />, href: "/submit" },
];

function CommandPaletteContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "models" | "articles" | "actions">("all");
  const [models, setModels] = useState<ModelRow[]>([]);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [totalModels, setTotalModels] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawSelectedIndex, setRawSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setModels(data.models || []);
          setArticles(data.articles || []);
          if (typeof data.totalModels === "number") {
            setTotalModels(data.totalModels);
          }
        }
      } catch {
        // Ignored aborted fetches
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 80);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const filteredActions = QUICK_ACTIONS.filter(
    (a) => !query || a.title.toLowerCase().includes(query.toLowerCase()) || a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const selectableItems = [
    ...(activeTab === "all" || activeTab === "actions" ? filteredActions.map((item) => ({ type: "action" as const, item, href: item.href })) : []),
    ...(activeTab === "all" || activeTab === "models" ? models.map((item) => ({ type: "model" as const, item, href: `/models/${item.slug}` })) : []),
    ...(activeTab === "all" || activeTab === "articles" ? articles.map((item) => ({ type: "article" as const, item, href: `/articles/${item.slug}` })) : []),
  ];

  const selectedIndex = selectableItems.length > 0 ? Math.min(rawSelectedIndex, selectableItems.length - 1) : 0;

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setRawSelectedIndex((prev) => (prev + 1) % (selectableItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setRawSelectedIndex((prev) => (prev - 1 + selectableItems.length) % (selectableItems.length || 1));
    } else if (e.key === "Enter" && selectableItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(selectableItems[selectedIndex].href);
    }
  };

  return (
    <div
      className="w-full max-w-2xl rounded-2xl bg-[var(--bg)] border border-[var(--muted)]/20 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center px-4 py-3.5 border-b border-[var(--muted)]/10 bg-[var(--card-bg)]/50">
        <Search size={18} className="text-[var(--accent)] shrink-0 mr-3" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search foundation models, labs, articles, or actions..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setRawSelectedIndex(0);
          }}
          className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="p-1 text-[var(--muted)] hover:text-[var(--text)]">
            <X size={15} />
          </button>
        )}
        <kbd className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--muted)]/20 text-[var(--muted)] font-mono ml-2">
          ESC
        </kbd>
      </div>

      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--muted)]/10 bg-[var(--bg)] text-xs">
        {(["all", "models", "articles", "actions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setRawSelectedIndex(0);
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {tab === "all" ? "All Results" : tab}
          </button>
        ))}
        {loading && <span className="ml-auto text-[11px] text-[var(--muted)] animate-pulse">Searching...</span>}
      </div>

      <div className="overflow-y-auto p-2 space-y-1 flex-1">
        {selectableItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--muted)] space-y-1">
            <p className="font-semibold text-[var(--text)]">No matches found for &ldquo;{query}&rdquo;</p>
            <p>Try searching by provider (OpenAI, Anthropic, Meta), modality, or model family.</p>
          </div>
        ) : (
          selectableItems.map((entry, idx) => (
            <CommandPaletteItem
              key={`${entry.type}-${idx}`}
              type={entry.type}
              item={entry.item}
              isSelected={idx === selectedIndex}
              onSelect={() => handleSelect(entry.href)}
            />
          ))
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-[var(--muted)]/10 bg-[var(--card-bg)]/30 flex items-center justify-between text-[11px] text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--muted)]/20 font-mono text-[10px]">↑↓</kbd> Navigate</span>
          <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--muted)]/20 font-mono text-[10px]">↵</kbd> Open</span>
          <span className="inline-flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--muted)]/20 font-mono text-[10px]">ESC</kbd> Close</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--accent)] font-semibold flex items-center gap-1">
          <Check size={11} /> {totalModels ? `${totalModels} Live Models` : "Live Catalog"}
        </span>
      </div>
    </div>
  );
}

export default function CommandPaletteModal() {
  const { isOpen, close } = useCommandPalette();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150" onClick={close}>
      <CommandPaletteContent onClose={close} />
    </div>
  );
}
