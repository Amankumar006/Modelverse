"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ModelEntry, ModelIndex, Benchmark } from "@/lib/models";
import Image from "@/components/ui/FallbackImage";
import {
  Search,
  Plus,
  X,
  Share2,
  Check,
  Trophy,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface CompareClientProps {
  initialModels: ModelEntry[];
  allAvailableModels: ModelIndex[];
}

const PRESET_COMPARISONS = [
  {
    label: "Frontier Flagships",
    slugs: ["openai-gpt-4o", "anthropic-claude-3-5-sonnet"],
  },
  {
    label: "Reasoning Giants",
    slugs: ["deepseek-ai-deepseek-r1", "openai-o1"],
  },
  {
    label: "Open-Weights 70B+",
    slugs: ["meta-llama-3-3-70b-instruct", "qwen-qwen2-5-72b-instruct"],
  },
  {
    label: "Lightweight & Fast",
    slugs: ["google-gemini-2-0-flash", "openai-gpt-4o-mini"],
  },
];

export default function CompareClient({
  initialModels,
  allAvailableModels,
}: CompareClientProps) {
  const router = useRouter();
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(
    initialModels.map((m) => m.slug)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Map slugs to full model entries when available
  const models = useMemo(() => {
    return selectedSlugs
      .map((slug) => {
        const foundFull = initialModels.find((m) => m.slug === slug);
        if (foundFull) return foundFull;
        const foundIndex = allAvailableModels.find((m) => m.slug === slug);
        if (foundIndex) return foundIndex as unknown as ModelEntry;
        return null;
      })
      .filter((m): m is ModelEntry => m !== null);
  }, [selectedSlugs, initialModels, allAvailableModels]);

  const handleAddSlug = (slug: string) => {
    if (selectedSlugs.includes(slug) || selectedSlugs.length >= 4) return;
    const newSlugs = [...selectedSlugs, slug];
    setSelectedSlugs(newSlugs);
    setSearchQuery("");
    setSearchOpen(false);
    router.push(`/compare?models=${newSlugs.join(",")}`, { scroll: false });
  };

  const handleRemoveSlug = (slug: string) => {
    const newSlugs = selectedSlugs.filter((s) => s !== slug);
    setSelectedSlugs(newSlugs);
    router.push(`/compare?models=${newSlugs.join(",")}`, { scroll: false });
  };

  const handleSelectPreset = (presetSlugs: string[]) => {
    setSelectedSlugs(presetSlugs);
    router.push(`/compare?models=${presetSlugs.join(",")}`, { scroll: false });
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter available models for addition
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return allAvailableModels
        .filter((m) => !selectedSlugs.includes(m.slug))
        .slice(0, 8);
    }
    const q = searchQuery.toLowerCase();
    return allAvailableModels
      .filter(
        (m) =>
          !selectedSlugs.includes(m.slug) &&
          (m.name.toLowerCase().includes(q) ||
            m.developer.toLowerCase().includes(q) ||
            m.slug.toLowerCase().includes(q))
      )
      .slice(0, 10);
  }, [searchQuery, allAvailableModels, selectedSlugs]);

  // Aggregate all unique benchmark names across selected models
  const benchmarkNames = useMemo(() => {
    const names = new Set<string>();
    for (const m of models) {
      if (Array.isArray(m.benchmarks)) {
        for (const b of m.benchmarks) {
          if (b && b.name) names.add(b.name.trim());
        }
      }
    }
    return Array.from(names);
  }, [models]);

  // Find max score for a benchmark to highlight leader
  const getBenchmarkLeader = (benchName: string): number | null => {
    let maxVal = -Infinity;
    for (const m of models) {
      if (Array.isArray(m.benchmarks)) {
        const b = m.benchmarks.find((item) => item.name?.trim() === benchName);
        if (b && b.score !== undefined && b.score !== null) {
          const num = parseFloat(String(b.score).replace(/[^0-9.]/g, ""));
          if (!isNaN(num) && num > maxVal) {
            maxVal = num;
          }
        }
      }
    }
    return maxVal === -Infinity ? null : maxVal;
  };

  return (
    <div className="space-y-10">
      {/* ── Page Header & Controls Bar ──────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--muted)]/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Sparkles size={13} />
            Side-by-Side Model Evaluator
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight">
            Compare AI Models
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--muted)] max-w-2xl leading-relaxed">
            Directly evaluate specs, architecture, numeric benchmarks, and pricing across foundation and open-weights models.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/20 hover:border-[var(--accent)] text-[var(--text)] text-xs font-bold transition-all shadow-[var(--shadow-card)] cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span>Copied Link</span>
              </>
            ) : (
              <>
                <Share2 size={14} className="text-[var(--accent)]" />
                <span>Share Compare</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Preset Comparison Buttons ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono text-[var(--muted)]">Quick Presets:</span>
        {PRESET_COMPARISONS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleSelectPreset(preset.slugs)}
            className="px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--card-bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)] text-xs font-medium text-[var(--text)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-xs"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* ── Active Selected Models Columns Header ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {models.map((model) => (
          <div
            key={model.id || model.slug}
            className="relative p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-[var(--shadow-card)] flex flex-col justify-between group hover:border-[var(--accent)]/40 transition-all"
          >
            <button
              onClick={() => handleRemoveSlug(model.slug)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-[var(--muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Remove model"
            >
              <X size={14} />
            </button>

            <div>
              <div className="flex items-center gap-3 mb-3">
                {model.logo ? (
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[var(--muted)]/20">
                    <Image
                      src={model.logo}
                      alt={model.name}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)] font-bold text-xs shrink-0">
                    {model.developer.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 pr-6">
                  <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider block truncate">
                    {model.developer}
                  </span>
                  <h3 className="text-base font-bold text-[var(--text)] truncate leading-tight">
                    {model.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)] mb-4">
                <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15">
                  {model.type ? model.type.replace("-", " ") : "Model"}
                </span>
                {model.verified && (
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
                    <Shield size={11} /> Verified
                  </span>
                )}
              </div>
            </div>

            <Link
              href={`/models/${model.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline pt-2 border-t border-[var(--muted)]/10"
            >
              <span>View full model page</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        ))}

        {/* Add Model Slot Button */}
        {models.length < 4 && (
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="w-full h-full min-h-[160px] rounded-[var(--radius-card)] border-2 border-dashed border-[var(--muted)]/20 hover:border-[var(--accent)] bg-[var(--card-bg)]/40 hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--accent)] p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-[var(--accent)]">
                <Plus size={18} />
              </div>
              <span className="text-xs font-bold">Add Model to Compare</span>
              <span className="text-[11px] font-mono text-[var(--muted)]">
                Up to 4 models side-by-side
              </span>
            </button>

            {/* Search Dropdown Popover */}
            {searchOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/20 shadow-2xl space-y-2 max-w-sm">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                  />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search model name or developer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 pl-8 pr-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-[var(--muted)]/10 text-xs">
                  {searchResults.map((res) => (
                    <button
                      key={res.slug}
                      onClick={() => handleAddSlug(res.slug)}
                      className="w-full text-left p-2 hover:bg-[var(--accent-soft)] rounded-[var(--radius-control)] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-[var(--text)] truncate">{res.name}</p>
                        <p className="text-[10px] font-mono text-[var(--muted)] uppercase">
                          {res.developer}
                        </p>
                      </div>
                      <Plus size={13} className="text-[var(--accent)] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Comparison Specifications Matrix ────────────────────────── */}
      <div className="space-y-6">
        <h2 className="text-xl font-extrabold text-[var(--text)] flex items-center gap-2">
          <span>Key Specifications</span>
        </h2>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/15 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead className="bg-[var(--bg)] border-b border-[var(--muted)]/10 text-[var(--muted)] uppercase font-mono font-bold">
              <tr>
                <th className="p-3.5 w-1/5">Attribute</th>
                {models.map((m) => (
                  <th key={m.slug} className="p-3.5 font-bold text-[var(--text)]">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10 font-sans">
              <tr>
                <td className="p-3.5 font-mono text-[var(--muted)] font-medium">Developer</td>
                {models.map((m) => (
                  <td key={m.slug} className="p-3.5 font-bold text-[var(--text)]">
                    {m.developer}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-[var(--muted)] font-medium">Release Date</td>
                {models.map((m) => (
                  <td key={m.slug} className="p-3.5 font-mono text-[var(--text)]">
                    {m.releaseDate ? new Date(m.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-[var(--muted)] font-medium">Parameters</td>
                {models.map((m) => (
                  <td key={m.slug} className="p-3.5 font-mono font-bold text-[var(--accent)]">
                    {typeof m.parameters === "string" ? m.parameters : "Undisclosed"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-[var(--muted)] font-medium">Context Window</td>
                {models.map((m) => (
                  <td key={m.slug} className="p-3.5 font-mono font-bold text-emerald-400">
                    {typeof m.contextWindow === "string" ? m.contextWindow : "Undisclosed"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-[var(--muted)] font-medium">Primary Task</td>
                {models.map((m) => (
                  <td key={m.slug} className="p-3.5 text-[var(--text)] capitalize">
                    {m.primaryTask ? m.primaryTask.replace("-", " ") : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-[var(--muted)] font-medium">License</td>
                {models.map((m) => (
                  <td key={m.slug} className="p-3.5 text-[var(--text)]">
                    {typeof m.license === "string" ? m.license : m.license?.name || "Custom"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 font-mono text-[var(--muted)] font-medium">Deployment</td>
                {models.map((m) => (
                  <td key={m.slug} className="p-3.5 text-[var(--text)]">
                    {Array.isArray(m.deployment) && m.deployment.length > 0 ? m.deployment.join(", ") : "API Only"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Technical Capabilities Matrix ───────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[var(--text)] flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--accent)]" />
            <span>Technical Capabilities Comparison</span>
          </h2>
          <span className="text-xs font-mono text-[var(--muted)]">
            14 Verified Architectural &amp; System Capabilities
          </span>
        </div>

        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/15 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead className="bg-[var(--bg)] border-b border-[var(--muted)]/10 text-[var(--muted)] uppercase font-mono font-bold">
              <tr>
                <th className="p-3.5 w-1/4">Capability</th>
                {models.map((m) => (
                  <th key={m.slug} className="p-3.5 font-bold text-[var(--text)]">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10 font-sans">
              {[
                { key: "reasoning", label: "Deep Reasoning & CoT", icon: "🧠" },
                { key: "tool_calling", label: "Tool & Function Calling", icon: "🛠️" },
                { key: "vision_input", label: "Vision & Image Input", icon: "👁️" },
                { key: "structured_outputs", label: "Strict JSON Schema", icon: "📋" },
                { key: "web_search", label: "Web Grounding & Search", icon: "🌐" },
                { key: "prompt_caching", label: "Prompt Prefix Caching", icon: "⚡" },
                { key: "fine_tuning", label: "Fine-Tuning & Custom LoRA", icon: "🔧" },
                { key: "image_generation", label: "Image Generation", icon: "🎨" },
                { key: "audio_input", label: "Audio & Speech Input", icon: "🎙️" },
                { key: "audio_output", label: "Voice / TTS Output", icon: "🔊" },
                { key: "computer_use", label: "Computer & OS Control", icon: "💻" },
                { key: "video_input", label: "Video Processing", icon: "🎥" },
                { key: "batch", label: "Batch API Processing", icon: "📦" },
              ].map((cap) => (
                <tr key={cap.key} className="hover:bg-[var(--bg)]/40 transition-colors">
                  <td className="p-3.5 font-medium text-[var(--text)] flex items-center gap-2">
                    <span>{cap.icon}</span>
                    <span>{cap.label}</span>
                  </td>
                  {models.map((m) => {
                    const isSupported = Boolean(m.capabilities && m.capabilities[cap.key]);
                    return (
                      <td key={m.slug} className="p-3.5">
                        {isSupported ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check size={13} className="text-emerald-400" />
                            Supported
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-[var(--muted)]/60 bg-[var(--muted)]/5 border border-[var(--muted)]/10">
                            — No
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* Summary Row */}
              <tr className="bg-[var(--bg)]/60 font-bold border-t-2 border-[var(--muted)]/20">
                <td className="p-3.5 font-mono text-[var(--text)] uppercase tracking-wider">
                  Total Supported
                </td>
                {models.map((m) => {
                  const supportedCount = m.capabilities ? Object.values(m.capabilities).filter(Boolean).length : 0;
                  return (
                    <td key={m.slug} className="p-3.5 font-mono text-sm text-[var(--accent)] font-extrabold">
                      {supportedCount} / 14
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Verified Benchmarks Comparison Matrix ───────────────────── */}
      {benchmarkNames.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[var(--text)] flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              <span>Benchmark Matrix</span>
            </h2>
            <span className="text-xs font-mono text-[var(--muted)]">
              Green highlight indicates top score
            </span>
          </div>

          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/15 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
            <table className="w-full text-left text-xs border-collapse min-w-[640px]">
              <thead className="bg-[var(--bg)] border-b border-[var(--muted)]/10 text-[var(--muted)] uppercase font-mono font-bold">
                <tr>
                  <th className="p-3.5 w-1/5">Benchmark Name</th>
                  {models.map((m) => (
                    <th key={m.slug} className="p-3.5 font-bold text-[var(--text)]">
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--muted)]/10 font-sans">
                {benchmarkNames.map((benchName) => {
                  const leaderScore = getBenchmarkLeader(benchName);

                  return (
                    <tr key={benchName} className="hover:bg-[var(--bg)]/50 transition-colors">
                      <td className="p-3.5 font-bold text-[var(--text)] font-mono">
                        {benchName}
                      </td>
                      {models.map((m) => {
                        const benchObj: Benchmark | undefined = Array.isArray(m.benchmarks)
                          ? m.benchmarks.find((b) => b && b.name?.trim() === benchName)
                          : undefined;

                        if (!benchObj || benchObj.score === undefined || benchObj.score === null) {
                          return (
                            <td key={m.slug} className="p-3.5 text-[var(--muted)] font-mono">
                              —
                            </td>
                          );
                        }

                        const numeric = parseFloat(String(benchObj.score).replace(/[^0-9.]/g, ""));
                        const isLeader = leaderScore !== null && numeric === leaderScore;

                        return (
                          <td key={m.slug} className="p-3.5 font-mono">
                            <span
                              className={`px-2.5 py-1 rounded-[var(--radius-pill)] font-bold text-xs inline-flex items-center gap-1 ${
                                isLeader
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : "text-[var(--text)]"
                              }`}
                            >
                              {String(benchObj.score)}
                              {benchObj.subCategory && benchObj.subCategory !== "% Accuracy" && (
                                <span className="text-[10px] text-[var(--muted)] font-normal">
                                  ({benchObj.subCategory})
                                </span>
                              )}
                              {isLeader && <Trophy size={10} className="text-amber-400" />}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
