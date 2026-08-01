"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ModelEntry, formatParameters } from "@/lib/models";
import { X, Plus, Search, ChevronDown, Activity, Calendar, Server, Tag, Shield, FileCode2, Info } from "lucide-react";
import TypeBadge from "@/components/ui/TypeBadge";
import ModalityTag from "@/components/ui/ModalityTag";
import CopyableTable from "@/components/ui/CopyableTable";
import VisionBenchmarkChart from "./VisionBenchmarkChart";
import ModelLogo from "./ModelLogo";

interface CompareClientProps {
  initialModels: ModelEntry[];
  allModels: ModelEntry[];
}

export default function CompareClient({ initialModels, allModels }: CompareClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [models, setModels] = useState<ModelEntry[]>(initialModels);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync URL when models change
    const currentSlugs = models.map((m) => m.slug).join(",");
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (currentSlugs) {
      params.set("models", currentSlugs);
    } else {
      params.delete("models");
    }
    
    // Only update if it actually changed
    const newUrl = `${pathname}?${params.toString()}`;
    if (`${pathname}?${searchParams?.toString()}` !== newUrl && newUrl !== `${pathname}?`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [models, pathname, router, searchParams]);

  // Handle click outside for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableModels = useMemo(() => {
    return allModels.filter((m) => !models.find((selected) => selected.id === m.id));
  }, [allModels, models]);

  const filteredModels = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return availableModels.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.developer.toLowerCase().includes(query)
    ).slice(0, 50); // limit to 50 for performance
  }, [availableModels, searchQuery]);

  const addModel = (model: ModelEntry) => {
    if (models.length < 4) {
      setModels([...models, model]);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  };

  const removeModel = (id: string) => {
    setModels(models.filter((m) => m.id !== id));
  };

  // Extract all unique benchmark names across selected models
  const allBenchmarkNames = useMemo(() => {
    const names = new Set<string>();
    models.forEach((m) => {
      m.benchmarks.forEach((b) => names.add(b.name));
    });
    return Array.from(names).sort();
  }, [models]);

  // Helper to parse strings like "86.1%" or "79" to a number
  const parseScore = (scoreStr: string | undefined): number | null => {
    if (!scoreStr) return null;
    const num = parseFloat(scoreStr.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? null : num;
  };

  // Helper to parse strings like "128K tokens" or "1M tokens" to a number
  const parseContext = (contextStr: string | undefined): number | null => {
    if (!contextStr) return null;
    let multiplier = 1;
    const cleaned = contextStr.toLowerCase();
    if (cleaned.includes("m")) multiplier = 1000000;
    else if (cleaned.includes("k")) multiplier = 1000;
    const num = parseFloat(cleaned.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? null : num * multiplier;
  };

  // Cost calculator per query based on pricing arrays
  const calculateCost = (model: ModelEntry, inputQty: number, outputQty: number): number => {
    if (model.type === "open-source" || model.type === "open-weights" || !model.pricing) {
      return 0;
    }
    let inputCost = 0;
    let outputCost = 0;
    
    const inputPricing = model.pricing.find(p => p.unit.toLowerCase().includes("input"));
    const outputPricing = model.pricing.find(p => p.unit.toLowerCase().includes("output"));
    
    if (inputPricing) {
      const perToken = inputPricing.unit.toLowerCase().includes("1m")
        ? inputPricing.amount / 1000000
        : inputPricing.amount;
      inputCost = inputQty * perToken;
    }
    if (outputPricing) {
      const perToken = outputPricing.unit.toLowerCase().includes("1m")
        ? outputPricing.amount / 1000000
        : outputPricing.amount;
      outputCost = outputQty * perToken;
    }
    return inputCost + outputCost;
  };

  const [chartMetric, setChartMetric] = useState<string>("swe-bench");
  const [calcInputTokens, setCalcInputTokens] = useState<number>(100000); // 100K input tokens
  const [calcOutputTokens, setCalcOutputTokens] = useState<number>(20000); // 20K output tokens

  // Extract values for highlight calculations
  const parsedSwe = models.map(m => parseScore(m.benchmarks?.find(b => b.name.toLowerCase().includes("swe-bench"))?.score));
  const parsedAider = models.map(m => parseScore(m.benchmarks?.find(b => b.name.toLowerCase() === "aider polyglot")?.score));
  const parsedGpqa = models.map(m => parseScore(m.benchmarks?.find(b => b.name.toLowerCase() === "gpqa diamond")?.score));
  const parsedContext = models.map(m => parseContext(m.contextWindow));
  const calculatedCosts = models.map(m => calculateCost(m, calcInputTokens, calcOutputTokens));

  const getWinnerIndex = (
    rowValues: (number | null)[],
    direction: "higher" | "lower"
  ): number => {
    let bestVal: number | null = null;
    let bestIdx = -1;
    
    rowValues.forEach((val, idx) => {
      if (val === null || val === undefined) return;
      if (bestVal === null) {
        bestVal = val;
        bestIdx = idx;
      } else if (direction === "higher" ? val > bestVal : val < bestVal) {
        bestVal = val;
        bestIdx = idx;
      }
    });
    
    return bestIdx;
  };

  const bestSweIdx = getWinnerIndex(parsedSwe, "higher");
  const bestAiderIdx = getWinnerIndex(parsedAider, "higher");
  const bestGpqaIdx = getWinnerIndex(parsedGpqa, "higher");
  const bestContextIdx = getWinnerIndex(parsedContext, "higher");
  const bestCostIdx = getWinnerIndex(calculatedCosts, "lower");

  return (
    <div className="space-y-8">
      {/* Search Bar / Add Model */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 p-4 border border-white/10 rounded-2xl">
        <div className="text-sm text-gray-400">
          Comparing <span className="font-semibold text-white">{models.length}</span> of 4 models
        </div>
        <div className="relative w-full sm:w-96" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder={models.length >= 4 ? "Maximum models reached" : "Add model to compare..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              disabled={models.length >= 4}
              className="w-full bg-[#121A15] border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ADE80] disabled:opacity-50"
            />
          </div>
          {isDropdownOpen && models.length < 4 && (
            <div className="absolute z-10 w-full mt-2 bg-[#1a233a] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
              {filteredModels.length > 0 ? (
                filteredModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addModel(m)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{m.name}</div>
                      <div className="text-xs text-gray-400">{m.developer}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-gray-400 text-center">No models found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Model Benchmark Comparison Chart */}
      <div className="rounded-2xl bg-[#1C1C1E] border border-[#282828] p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#282828]">
          <div>
            <h2 className="text-xl font-semibold text-white">Compare Agent & Coding Benchmarks</h2>
            <p className="text-xs text-[#90908F] mt-1 leading-relaxed">
              Visualize side-by-side relative performance differences for selected models on core coding benchmarks.
            </p>
          </div>
          <div className="flex flex-wrap items-center bg-[#141414] p-1 rounded-xl border border-[#282828] gap-1">
            {["SWE-Bench", "Aider Polyglot", "GPQA Diamond", "Context Window"].map((m) => {
              const active = chartMetric === m.toLowerCase().replace(" ", "-");
              return (
                <button
                  key={m}
                  onClick={() => setChartMetric(m.toLowerCase().replace(" ", "-"))}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    active
                      ? "bg-[#242426] text-emerald-400 border border-emerald-500/30 font-semibold"
                      : "text-[#90908F] hover:text-white"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {models.map((model, idx) => {
            let value = 0;
            let displayVal = "N/A";
            
            if (chartMetric === "context-window") {
              const parsedVal = parseContext(model.contextWindow);
              value = parsedVal ?? 0;
              displayVal = model.contextWindow || "Unknown";
            } else {
              const matchedBench = model.benchmarks?.find(b => b.name.toLowerCase().includes(chartMetric));
              const parsedVal = parseScore(matchedBench?.score);
              value = parsedVal ?? 0;
              displayVal = matchedBench?.score || "—";
            }

            // Find maximum to scale percentages
            const allVals = models.map(m => {
              if (chartMetric === "context-window") {
                return parseContext(m.contextWindow) ?? 0;
              } else {
                return parseScore(m.benchmarks?.find(b => b.name.toLowerCase().includes(chartMetric))?.score) ?? 0;
              }
            });
            const maxVal = Math.max(...allVals, 1);
            const percentage = Math.max(8, (value / maxVal) * 100);

            return (
              <div key={model.id} className="p-3.5 rounded-xl bg-[#141414] border border-[#282828] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{model.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">{displayVal}</span>
                </div>
                <div className="w-full bg-[#242426] h-2 rounded-full overflow-hidden border border-[#333333]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Token Cost Estimator Panel */}
      <div className="rounded-2xl bg-[#1C1C1E] border border-[#282828] p-6 shadow-2xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Dynamic Running Cost Estimator</h2>
          <p className="text-xs text-[#90908F] mt-1 leading-relaxed">
            Estimate query costs based on the model pricing database and your expected volume.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-gray-400 block font-medium">Input Tokens per Request</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={calcInputTokens}
              onChange={(e) => setCalcInputTokens(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#141414] border border-[#282828] rounded-lg py-2 px-3 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 block font-medium">Output Tokens per Request</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={calcOutputTokens}
              onChange={(e) => setCalcOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[#141414] border border-[#282828] rounded-lg py-2 px-3 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {models.map((model, idx) => {
            const cost = calculateCost(model, calcInputTokens, calcOutputTokens);
            const isFree = model.type === "open-source" || model.type === "open-weights";
            
            // Scaled bar width relative to highest cost
            const maxCost = Math.max(...calculatedCosts, 0.001);
            const barPercentage = isFree ? 0 : Math.max(5, (cost / maxCost) * 100);

            return (
              <div key={model.id} className="p-3.5 rounded-xl bg-[#141414] border border-[#282828] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{model.name}</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {isFree ? "Free (Self-Hosted)" : `$${cost.toFixed(4)}`}
                  </span>
                </div>
                {!isFree && (
                  <div className="w-full bg-[#242426] h-2 rounded-full overflow-hidden border border-[#333333]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500/80 to-emerald-400 transition-all duration-500"
                      style={{ width: `${barPercentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transparency Note */}
      <div className="flex items-center gap-2 text-xs text-[#90908F] bg-[#141414] px-4 py-3 rounded-xl border border-[#282828] mb-4">
        <Info size={15} className="text-emerald-400 flex-shrink-0" />
        <span>
          Not all models have been independently verified yet. Benchmark scores display exact field confidence (<span className="text-emerald-400 font-semibold">VERIFIED</span> / <span className="text-amber-400 font-semibold">LIKELY</span> / <span className="text-gray-400 font-semibold">DRAFT</span>). Uncorroborated benchmarks show <span className="text-gray-400 font-mono">Pending Curator Audit</span>.
        </span>
      </div>

      {/* Comparison Table */}
      <CopyableTable title="Model Comparison Matrix">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="w-48 p-4 text-left font-medium text-gray-400 border-b border-white/10 sticky left-0 bg-[#0E0E10] z-20 border-r border-white/10"></th>
              {models.map((model) => (
                <th key={model.id} className="w-72 p-4 align-top border-b border-white/10 relative group">
                  <div className="flex flex-col gap-2.5 pr-8">
                    <button 
                      onClick={() => removeModel(model.id)}
                      className="absolute top-4 right-4 p-1.5 bg-black/50 hover:bg-red-500/80 rounded-full text-white/50 hover:text-white transition-colors z-20"
                      aria-label="Remove model"
                    >
                      <X size={14} />
                    </button>
                    <Link href={`/models/${model.slug}`} className="block hover:opacity-80 transition-opacity">
                      <div className="mb-2.5">
                        <ModelLogo logo={model.logo} name={model.name} developer={model.developer} size={44} />
                      </div>
                      <h3 className="text-base font-bold text-white leading-snug break-words pr-1">{model.name}</h3>
                      <p className="text-xs text-[#4ADE80] font-medium mt-1 truncate">{model.developer}</p>
                    </Link>
                  </div>
                </th>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <th key={`empty-${i}`} className="w-72 p-4 align-middle text-center border-b border-white/5 border-dashed bg-white/[0.02]">
                  <div className="text-gray-500 text-sm italic">Add a model</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {/* Type */}
            <tr>
              <td className="p-4 text-sm font-medium text-gray-400 flex items-center gap-2 sticky left-0 bg-[#0E0E10] z-10 border-r border-white/10"><Tag size={16} /> Type</td>
              {models.map((model) => (
                <td key={model.id} className="p-4"><TypeBadge type={model.type} /></td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-t-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* License */}
            <tr>
              <td className="p-4 text-sm font-medium text-gray-400 flex items-center gap-2 sticky left-0 bg-[#0E0E10] z-10 border-r border-white/10"><Shield size={16} /> License</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-white">{model.license}</td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-l-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Parameters */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">Parameters</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-white font-mono font-medium">
                  {formatParameters(model)}
                </td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-p-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Active Parameters (MoE) */}
            {models.some((m) => Boolean(m.activeParameters)) && (
              <tr>
                <td className="p-4 text-sm font-semibold text-gray-300 bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">Active Parameters (MoE)</td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 text-sm text-emerald-400 font-mono font-medium">
                    {model.activeParameters || "N/A (Dense)"}
                  </td>
                ))}
                {Array.from({ length: 4 - models.length }).map((_, i) => (
                  <td key={`empty-ap-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
                ))}
              </tr>
            )}

            {/* Modalities */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">Modalities</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 align-middle">
                  <div className="flex flex-wrap gap-1">
                    {model.modality?.map((m) => (
                      <ModalityTag key={m} modality={m} />
                    ))}
                  </div>
                </td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-m-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Context Window */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">Context Window</td>
              {models.map((model, idx) => {
                const isWinner = idx === bestContextIdx;
                return (
                  <td
                    key={model.id}
                    className={`p-4 text-sm font-mono font-medium transition-colors ${
                      isWinner ? "bg-emerald-500/5 text-emerald-400 font-bold border-x border-emerald-500/10" : "text-white"
                    }`}
                  >
                    {model.contextWindow || "Unknown"}
                    {isWinner && <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">Largest</span>}
                  </td>
                );
              })}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-c-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Total Estimated Cost */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">Estimated cost / query</td>
              {models.map((model, idx) => {
                const cost = calculatedCosts[idx];
                const isWinner = idx === bestCostIdx;
                const isFree = model.type === "open-source" || model.type === "open-weights";
                return (
                  <td
                    key={model.id}
                    className={`p-4 text-sm font-mono font-medium transition-colors ${
                      isWinner ? "bg-emerald-500/5 text-emerald-400 font-bold border-x border-emerald-500/10" : "text-white"
                    }`}
                  >
                    {isFree ? "Free" : `$${cost.toFixed(4)}`}
                    {isWinner && <span className="ml-1.5 text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded">Cheapest</span>}
                  </td>
                );
              })}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-cost-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* SWE-Bench Benchmark */}
            <tr>
              <td className="p-4 text-sm font-semibold text-[#4ADE80] bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">SWE-Bench Score</td>
              {models.map((model, idx) => {
                const matched = model.benchmarks?.find(b => b.name.toLowerCase().includes("swe-bench"));
                const isWinner = idx === bestSweIdx;
                const conf = model.fieldConfidence?.benchmarks;
                return (
                  <td
                    key={model.id}
                    className={`p-4 text-sm font-mono transition-colors ${
                      isWinner && matched?.score ? "bg-emerald-500/5 text-emerald-400 font-bold border-x border-emerald-500/10" : "text-gray-200"
                    }`}
                  >
                    {matched?.score ? (
                      <div className="flex items-center gap-1.5">
                        <span>{matched.score}</span>
                        {isWinner && <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-sans font-semibold">Top</span>}
                        {conf === "VERIFIED" && <span className="text-[9px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-sans">Verified</span>}
                        {conf === "LIKELY" && <span className="text-[9px] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-sans">Likely</span>}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs font-sans italic">— <span className="text-[10px] text-gray-600 font-normal">(Pending Audit)</span></span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-swe-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Aider Polyglot Benchmark */}
            <tr>
              <td className="p-4 text-sm font-semibold text-[#4ADE80] bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">Aider Polyglot</td>
              {models.map((model, idx) => {
                const matched = model.benchmarks?.find(b => b.name.toLowerCase() === "aider polyglot");
                const isWinner = idx === bestAiderIdx;
                const conf = model.fieldConfidence?.benchmarks;
                return (
                  <td
                    key={model.id}
                    className={`p-4 text-sm font-mono transition-colors ${
                      isWinner && matched?.score ? "bg-emerald-500/5 text-emerald-400 font-bold border-x border-emerald-500/10" : "text-gray-200"
                    }`}
                  >
                    {matched?.score ? (
                      <div className="flex items-center gap-1.5">
                        <span>{matched.score}</span>
                        {isWinner && <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-sans font-semibold">Top</span>}
                        {conf === "VERIFIED" && <span className="text-[9px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-sans">Verified</span>}
                        {conf === "LIKELY" && <span className="text-[9px] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-sans">Likely</span>}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs font-sans italic">— <span className="text-[10px] text-gray-600 font-normal">(Pending Audit)</span></span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-aider-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* GPQA Diamond Benchmark */}
            <tr>
              <td className="p-4 text-sm font-semibold text-[#4ADE80] bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">GPQA Diamond</td>
              {models.map((model, idx) => {
                const matched = model.benchmarks?.find(b => b.name.toLowerCase() === "gpqa diamond");
                const isWinner = idx === bestGpqaIdx;
                const conf = model.fieldConfidence?.benchmarks;
                return (
                  <td
                    key={model.id}
                    className={`p-4 text-sm font-mono transition-colors ${
                      isWinner && matched?.score ? "bg-emerald-500/5 text-emerald-400 font-bold border-x border-emerald-500/10" : "text-gray-200"
                    }`}
                  >
                    {matched?.score ? (
                      <div className="flex items-center gap-1.5">
                        <span>{matched.score}</span>
                        {isWinner && <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded font-sans font-semibold">Top</span>}
                        {conf === "VERIFIED" && <span className="text-[9px] uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded font-sans">Verified</span>}
                        {conf === "LIKELY" && <span className="text-[9px] uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.5 rounded font-sans">Likely</span>}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs font-sans italic">— <span className="text-[10px] text-gray-600 font-normal">(Pending Audit)</span></span>
                    )}
                  </td>
                );
              })}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-gpqa-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* General Benchmarks Comparison (Others) */}
            {allBenchmarkNames
              .filter(name => !["mmlu", "humaneval", "gsm8k", "swe-bench verified", "swe-bench pro", "aider polyglot", "gpqa diamond"].includes(name.toLowerCase()))
              .map((benchName) => (
                <tr key={benchName}>
                  <td className="p-4 text-sm font-semibold text-gray-300 bg-[#0E0E10] sticky left-0 z-10 border-r border-white/10">{benchName}</td>
                  {models.map((model) => {
                    const bench = model.benchmarks?.find((b) => b.name === benchName);
                    return (
                      <td key={model.id} className="p-4">
                        {bench ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-white font-mono">{bench.score}</span>
                            {bench.verified && (
                              <span className="text-[10px] text-[#4ADE80] bg-[#4ADE80]/10 px-1.5 py-0.5 rounded font-mono">
                                Verified
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">—</span>
                        )}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - models.length }).map((_, i) => (
                    <td key={`empty-${benchName}-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </CopyableTable>
    </div>
  );
}
