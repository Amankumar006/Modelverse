"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ModelEntry } from "@/lib/models";
import { X, Plus, Search, ChevronDown, Activity, Calendar, Server, Tag, Shield, FileCode2 } from "lucide-react";
import TypeBadge from "@/components/ui/TypeBadge";
import ModalityTag from "@/components/ui/ModalityTag";
import CopyableTable from "@/components/ui/CopyableTable";
import VisionBenchmarkChart from "./VisionBenchmarkChart";

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

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-2xl text-center">
        <Activity size={48} className="text-gray-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No models selected</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Add some models to compare their specs, context windows, and benchmarks side-by-side.
        </p>
        <div className="relative w-full max-w-sm" ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search for a model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-[#121A15] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4ADE80]"
            />
          </div>
          {isDropdownOpen && (
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
    );
  }

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

      {/* Interactive Vision Benchmark & Latency Chart */}
      <VisionBenchmarkChart />

      {/* Comparison Table */}
      <CopyableTable title="Model Comparison Matrix">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="w-48 p-4 text-left font-medium text-gray-400 border-b border-white/10"></th>
              {models.map((model) => (
                <th key={model.id} className="w-72 p-4 align-top border-b border-white/10 relative group">
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => removeModel(model.id)}
                      className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-red-500/80 rounded-full text-white/50 hover:text-white transition-colors"
                      aria-label="Remove model"
                    >
                      <X size={14} />
                    </button>
                    <Link href={`/models/${model.slug}`} className="block hover:opacity-80 transition-opacity">
                      {model.logo && (
                        <div className="w-12 h-12 relative mb-3 rounded-lg overflow-hidden bg-white/10">
                          <Image src={model.logo} alt={model.name} fill className="object-cover" />
                        </div>
                      )}
                      <h3 className="text-lg font-bold text-white leading-tight">{model.name}</h3>
                      <p className="text-sm text-[#4ADE80] mt-1">{model.developer}</p>
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
              <td className="p-4 text-sm font-medium text-gray-400 flex items-center gap-2"><Tag size={16} /> Type</td>
              {models.map((model) => (
                <td key={model.id} className="p-4"><TypeBadge type={model.type} /></td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-t-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Release Date */}
            <tr>
              <td className="p-4 text-sm font-medium text-gray-400 flex items-center gap-2"><Calendar size={16} /> Release Date</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-white">{new Date(model.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-r-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* License */}
            <tr>
              <td className="p-4 text-sm font-medium text-gray-400 flex items-center gap-2"><Shield size={16} /> License</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-white">{model.license}</td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-l-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Parameters */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-white/[0.02]">Parameters</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-white font-mono font-medium">
                  {model.parameters || "Undisclosed"}
                </td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-p-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Modalities */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-white/[0.02]">Modalities</td>
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
              <td className="p-4 text-sm font-semibold text-gray-300 bg-white/[0.02]">Context Window</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-white font-mono font-medium">
                  {model.contextWindow || "Unknown"}
                </td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-c-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Primary Task */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-white/[0.02]">Primary Task</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-gray-200 capitalize">
                  {model.primaryTask?.replace("-", " ") || "General"}
                </td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-task-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Release Date */}
            <tr>
              <td className="p-4 text-sm font-semibold text-gray-300 bg-white/[0.02]">Release Date</td>
              {models.map((model) => (
                <td key={model.id} className="p-4 text-sm text-gray-400 font-mono">
                  {model.releaseDate || "N/A"}
                </td>
              ))}
              {Array.from({ length: 4 - models.length }).map((_, i) => (
                <td key={`empty-r-${i}`} className="p-4 bg-white/[0.02] border-r border-white/5 border-dashed last:border-r-0"></td>
              ))}
            </tr>

            {/* Benchmarks Comparison */}
            {allBenchmarkNames.map((benchName) => (
              <tr key={benchName}>
                <td className="p-4 text-sm font-semibold text-[#4ADE80] bg-white/[0.02]">{benchName}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </CopyableTable>
    </div>
  );
}
