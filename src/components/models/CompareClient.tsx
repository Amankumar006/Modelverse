"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import TypeBadge from "@/components/ui/TypeBadge";
import { X, Plus, Search, Tag, Shield, Info } from "lucide-react";
import { ModelEntry, formatParameters } from "@/lib/models";
import CopyableTable from "@/components/ui/CopyableTable";
import ModelLogo from "@/components/ui/ModelLogo";

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
    const currentSlugs = models.map((m) => m.slug).join(",");
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (currentSlugs) {
      params.set("models", currentSlugs);
    } else {
      params.delete("models");
    }
    
    const newUrl = `${pathname}?${params.toString()}`;
    if (`${pathname}?${searchParams?.toString()}` !== newUrl && newUrl !== `${pathname}?`) {
      router.replace(newUrl, { scroll: false });
    }
  }, [models, pathname, router, searchParams]);

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
    ).slice(0, 50);
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

  const parseScore = (scoreStr: string | undefined): number | null => {
    if (!scoreStr) return null;
    const num = parseFloat(scoreStr.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? null : num;
  };

  const parseContext = (contextStr: string | undefined): number | null => {
    if (!contextStr) return null;
    if (contextStr.toLowerCase().includes("1m")) return 1000000;
    if (contextStr.toLowerCase().includes("2m")) return 2000000;
    const num = parseInt(contextStr.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return null;
    if (contextStr.toLowerCase().includes("k")) return num * 1000;
    return num;
  };

  const calculateCost = (
    model: ModelEntry,
    inputQty: number,
    outputQty: number
  ): number => {
    if (!model.pricing || model.pricing.length === 0) return 0;
    const inputPricing = model.pricing.find((p) => p.tier?.toLowerCase().includes("input")) || model.pricing[0];
    const outputPricing = model.pricing.find((p) => p.tier?.toLowerCase().includes("output")) || model.pricing[1] || model.pricing[0];

    let inputCost = 0;
    let outputCost = 0;

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
  const [calcInputTokens, setCalcInputTokens] = useState<number>(100000);
  const [calcOutputTokens, setCalcOutputTokens] = useState<number>(20000);

  const calculatedCosts = models.map(m => calculateCost(m, calcInputTokens, calcOutputTokens));

  return (
    <div className="space-y-8">
      {/* Header Search & Selection Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--card-bg)] p-4 border border-[var(--muted)]/10 rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
        <div className="text-sm text-[var(--muted)] font-medium">
          Comparing <span className="font-bold text-[var(--text)]">{models.length}</span> of 4 models
        </div>
        <div className="relative w-full sm:w-96" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={15} />
            <input
              type="text"
              placeholder={models.length >= 4 ? "Maximum 4 models allowed" : "Add model to compare..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              disabled={models.length >= 4}
              className="w-full bg-[var(--bg)] border border-[var(--muted)]/10 rounded-[var(--radius-control)] py-2 pl-9 pr-4 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50 font-sans shadow-sm"
            />
          </div>
          {isDropdownOpen && models.length < 4 && (
            <div className="absolute z-30 w-full mt-2 bg-[var(--card-bg)] border border-[var(--muted)]/10 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] max-h-60 overflow-y-auto">
              {filteredModels.length > 0 ? (
                filteredModels.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addModel(m)}
                    className="w-full text-left px-4 py-3 hover:bg-[var(--accent-soft)]/20 flex items-center gap-3 transition-colors border-b border-[var(--muted)]/10 last:border-0 cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-[var(--text)]">{m.name}</div>
                      <div className="text-xs text-[var(--muted)]">{m.developer}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-sm text-[var(--muted)] text-center">No matching models found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Model Benchmark Comparison Chart */}
      <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 p-6 shadow-[var(--shadow-card)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--muted)]/10">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text)]">Compare Agent & Coding Benchmarks</h2>
            <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
              Visualize side-by-side relative performance differences for selected models on core coding benchmarks.
            </p>
          </div>
          <div className="flex flex-wrap items-center bg-[var(--bg)] p-1.5 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 gap-1">
            {["SWE-Bench", "Aider Polyglot", "GPQA Diamond", "Context Window"].map((m) => {
              const active = chartMetric === m.toLowerCase().replace(" ", "-");
              return (
                <button
                  key={m}
                  onClick={() => setChartMetric(m.toLowerCase().replace(" ", "-"))}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                    active
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {models.map((model) => {
            let value = 0;
            let displayVal = "N/A";
            
            if (chartMetric === "context-window") {
              const cw = typeof model.contextWindow === "object" && model.contextWindow !== null ? String((model.contextWindow as any).native) : (model.contextWindow as string);
              const parsedVal = parseContext(cw);
              value = parsedVal ?? 0;
              displayVal = cw || "Unknown";
            } else {
              const matchedBench = model.benchmarks?.find(b => b.name.toLowerCase().includes(chartMetric));
              const parsedVal = parseScore(matchedBench?.score);
              value = parsedVal ?? 0;
              displayVal = matchedBench?.score || "—";
            }

            const allVals = models.map(m => {
              if (chartMetric === "context-window") {
                const cw = typeof m.contextWindow === "object" && m.contextWindow !== null ? String((m.contextWindow as any).native) : (m.contextWindow as string);
                return parseContext(cw) ?? 0;
              } else {
                return parseScore(m.benchmarks?.find(b => b.name.toLowerCase().includes(chartMetric))?.score) ?? 0;
              }
            });
            const maxVal = Math.max(...allVals, 1);
            const percentage = Math.max(8, (value / maxVal) * 100);

            return (
              <div key={model.id} className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text)]">{model.name}</span>
                  <span className="font-mono text-[var(--accent)] font-bold tabular-nums">{displayVal}</span>
                </div>
                <div className="w-full bg-[var(--card-bg)] h-2.5 rounded-full overflow-hidden border border-[var(--muted)]/10">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Token Cost Estimator Panel */}
      <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 p-6 shadow-[var(--shadow-card)] space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text)]">Dynamic Running Cost Estimator</h2>
          <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
            Estimate query costs based on the model pricing database and your expected volume.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-[var(--muted)] block font-bold">Input Tokens per Request</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={calcInputTokens}
              onChange={(e) => setCalcInputTokens(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[var(--bg)] border border-[var(--muted)]/10 rounded-[var(--radius-control)] py-2 px-3.5 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-bold shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-[var(--muted)] block font-bold">Output Tokens per Request</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={calcOutputTokens}
              onChange={(e) => setCalcOutputTokens(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full bg-[var(--bg)] border border-[var(--muted)]/10 rounded-[var(--radius-control)] py-2 px-3.5 text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-bold shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {models.map((model) => {
            const cost = calculateCost(model, calcInputTokens, calcOutputTokens);
            const isFree = model.type === "open-source" || model.type === "open-weights";
            const maxCost = Math.max(...calculatedCosts, 0.001);
            const barPercentage = isFree ? 0 : Math.max(5, (cost / maxCost) * 100);

            return (
              <div key={model.id} className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text)]">{model.name}</span>
                  <span className="font-mono text-[var(--accent)] font-bold tabular-nums">
                    {isFree ? "Free (Self-Hosted)" : `$${cost.toFixed(4)}`}
                  </span>
                </div>
                {!isFree && (
                  <div className="w-full bg-[var(--card-bg)] h-2.5 rounded-full overflow-hidden border border-[var(--muted)]/10">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
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
      <div className="flex items-center gap-2.5 text-xs text-[var(--muted)] bg-[var(--card-bg)] p-4 rounded-[var(--radius-card)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)]">
        <Info size={16} className="text-[var(--accent)] flex-shrink-0" />
        <span>
          Not all models have been independently verified yet. Benchmark scores display exact field confidence (<span className="text-[var(--accent)] font-bold">VERIFIED</span> / <span className="text-amber-500 font-bold">LIKELY</span> / <span className="text-[var(--muted)] font-bold">DRAFT</span>). Uncorroborated benchmarks show <span className="text-[var(--muted)] font-mono">Pending Curator Audit</span>.
        </span>
      </div>

      {/* Comparison Table */}
      <div className="hidden md:block">
        <CopyableTable title="Model Comparison Matrix">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr>
                <th className="w-48 p-4 text-left font-bold text-[var(--muted)] border-b border-[var(--muted)]/10 sticky left-0 bg-[var(--card-bg)] z-20 border-r border-[var(--muted)]/10"></th>
                {models.map((model) => (
                  <th key={model.id} className="w-72 p-4 align-top border-b border-[var(--muted)]/10 relative group">
                    <div className="flex flex-col gap-2.5 pr-8">
                      <button 
                        onClick={() => removeModel(model.id)}
                        className="absolute top-4 right-4 p-1.5 bg-[var(--bg)] hover:bg-[var(--accent-soft)] rounded-full text-[var(--muted)] hover:text-[var(--accent)] transition-colors z-20 cursor-pointer"
                        aria-label="Remove model"
                      >
                        <X size={14} />
                      </button>
                      <Link href={`/models/${model.slug}`} className="block hover:opacity-80 transition-opacity">
                        <div className="mb-2.5">
                          <ModelLogo logo={model.logo} name={model.name} developer={model.developer} size={44} />
                        </div>
                        <h3 className="text-base font-extrabold text-[var(--text)] leading-snug break-words pr-1">{model.name}</h3>
                        <p className="text-xs text-[var(--accent)] font-bold mt-1 truncate">{model.developer}</p>
                      </Link>
                    </div>
                  </th>
                ))}
                {Array.from({ length: 4 - models.length }).map((_, i) => (
                  <th key={`empty-${i}`} className="w-72 p-6 align-middle text-center border-2 border-dashed border-[var(--accent)]/20 bg-[var(--tag-bg)]/30 rounded-[var(--radius-card)] m-2">
                    <div className="text-[var(--tag-text)] text-sm font-bold flex items-center justify-center gap-1.5">
                      <Plus size={16} />
                      <span>Add Model</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10">
              {/* Type */}
              <tr>
                <td className="p-4 text-sm font-bold text-[var(--muted)] flex items-center gap-2 sticky left-0 bg-[var(--card-bg)] z-10 border-r border-[var(--muted)]/10"><Tag size={16} /> Type</td>
                {models.map((model) => (
                  <td key={model.id} className="p-4"><TypeBadge type={model.type} /></td>
                ))}
                {Array.from({ length: 4 - models.length }).map((_, i) => (
                  <td key={`empty-t-${i}`} className="p-4 bg-[var(--card-bg)]/50 border-r border-[var(--muted)]/10 border-dashed last:border-r-0"></td>
                ))}
              </tr>

              {/* License */}
              <tr>
                <td className="p-4 text-sm font-bold text-[var(--muted)] flex items-center gap-2 sticky left-0 bg-[var(--card-bg)] z-10 border-r border-[var(--muted)]/10"><Shield size={16} /> License</td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 text-sm text-[var(--text)] font-semibold">
                    {typeof model.license === "object" ? model.license.name || "Custom" : model.license}
                  </td>
                ))}
                {Array.from({ length: 4 - models.length }).map((_, i) => (
                  <td key={`empty-l-${i}`} className="p-4 bg-[var(--card-bg)]/50 border-r border-[var(--muted)]/10 border-dashed last:border-r-0"></td>
                ))}
              </tr>

              {/* Parameters */}
              <tr>
                <td className="p-4 text-sm font-bold text-[var(--muted)] bg-[var(--card-bg)] sticky left-0 z-10 border-r border-[var(--muted)]/10">Parameters</td>
                {models.map((model) => (
                  <td key={model.id} className="p-4 text-sm text-[var(--text)] font-mono tabular-nums font-bold">
                    {formatParameters(model)}
                  </td>
                ))}
                {Array.from({ length: 4 - models.length }).map((_, i) => (
                  <td key={`empty-p-${i}`} className="p-4 bg-[var(--card-bg)]/50 border-r border-[var(--muted)]/10 border-dashed last:border-r-0"></td>
                ))}
              </tr>

              {/* Active Parameters (MoE) */}
              {models.some((m) => Boolean(m.activeParameters)) && (
                <tr>
                  <td className="p-4 text-sm font-bold text-[var(--muted)] bg-[var(--card-bg)] sticky left-0 z-10 border-r border-[var(--muted)]/10">Active Parameters (MoE)</td>
                  {models.map((model) => (
                    <td key={model.id} className="p-4 text-sm text-[var(--accent)] font-mono tabular-nums font-bold">
                      {typeof model.activeParameters === "object" && model.activeParameters !== null ? Object.values(model.activeParameters).join(" / ") : model.activeParameters || "N/A (Dense)"}
                    </td>
                  ))}
                  {Array.from({ length: 4 - models.length }).map((_, i) => (
                    <td key={`empty-ap-${i}`} className="p-4 bg-[var(--card-bg)]/50 border-r border-[var(--muted)]/10 border-dashed last:border-r-0"></td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </CopyableTable>
      </div>

      {/* Mobile Card Stack View */}
      <div className="md:hidden space-y-4">
        <h2 className="text-xl font-extrabold text-[var(--text)]">Model Comparison Matrix</h2>
        {models.map((model) => (
          <div key={model.id} className="rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 p-4 shadow-[var(--shadow-card)] space-y-3 relative">
            <button 
              onClick={() => removeModel(model.id)}
              className="absolute top-4 right-4 p-1.5 bg-[var(--bg)] hover:bg-[var(--accent-soft)] rounded-full text-[var(--muted)] hover:text-[var(--accent)] transition-colors z-20 cursor-pointer"
              aria-label="Remove model"
            >
              <X size={14} />
            </button>
            <div className="flex items-center gap-3">
              <ModelLogo logo={model.logo} name={model.name} developer={model.developer} size={32} />
              <div>
                <h3 className="font-extrabold text-[var(--text)] text-base leading-snug break-words pr-4">{model.name}</h3>
                <p className="text-xs text-[var(--accent)] font-bold mt-0.5">{model.developer}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-[var(--muted)]/10 mt-3">
              <div>
                <span className="text-[var(--muted)] font-bold block mb-1">Type</span>
                <TypeBadge type={model.type} />
              </div>
              <div>
                <span className="text-[var(--muted)] font-bold block mb-1">License</span>
                <span className="font-semibold text-[var(--text)]">
                  {typeof model.license === "object" ? model.license.name || "Custom" : model.license}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] font-bold block mb-1">Parameters</span>
                <span className="font-mono font-bold text-[var(--text)] tabular-nums">{formatParameters(model)}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] font-bold block mb-1">Context</span>
                <span className="font-mono font-bold text-[var(--text)] tabular-nums">
                  {model.contextWindow ? (typeof model.contextWindow === "object" && model.contextWindow !== null ? (model.contextWindow as { native?: number }).native : model.contextWindow) : "—"}
                </span>
              </div>
              {model.activeParameters && (
                <div className="col-span-2">
                  <span className="text-[var(--muted)] font-bold block mb-1">Active Parameters</span>
                  <span className="font-mono font-bold text-[var(--accent)] tabular-nums">
                    {typeof model.activeParameters === "object" && model.activeParameters !== null ? Object.values(model.activeParameters).join(" / ") : model.activeParameters}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {models.length < 4 && (
          <div className="p-6 text-center border-2 border-dashed border-[var(--accent)]/20 bg-[var(--tag-bg)]/30 rounded-[var(--radius-card)]">
             <div className="text-[var(--tag-text)] text-sm font-bold flex items-center justify-center gap-1.5">
               <Plus size={16} />
               <span>Use the search bar above to add models</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
