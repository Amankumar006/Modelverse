"use client";

import React, { useState, useMemo } from "react";
import { ModelEntry } from "@/lib/models";
import { Search, Trophy, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type SortField = "MMLU" | "HumanEval" | "MATH" | "Parameters";
type SortDirection = "asc" | "desc";

export default function BenchmarksClient({ allModels }: { allModels: ModelEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("MMLU");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const parseScore = (scoreStr?: string | number) => {
    if (scoreStr == null) return 0;
    if (typeof scoreStr === "number") return scoreStr;
    const match = String(scoreStr).match(/[0-9.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseParams = (paramVal?: any) => {
    if (!paramVal) return 0;
    const str = typeof paramVal === "object" ? Object.values(paramVal)[0] : paramVal;
    if (typeof str !== "string") return 0;
    
    const numMatch = str.match(/[0-9.]+/);
    if (!numMatch) return 0;
    
    let num = parseFloat(numMatch[0]);
    if (str.toLowerCase().includes("b")) num *= 1_000_000_000;
    if (str.toLowerCase().includes("t")) num *= 1_000_000_000_000;
    if (str.toLowerCase().includes("m")) num *= 1_000_000;
    return num;
  };

  const leaderboard = useMemo(() => {
    return allModels
      .map((model) => {
        const mmlu = model.benchmarks?.find((b) => b.name.toLowerCase().includes("mmlu"))?.score;
        const humaneval = model.benchmarks?.find((b) => b.name.toLowerCase().includes("humaneval") || b.name.toLowerCase().includes("human eval"))?.score;
        const math = model.benchmarks?.find((b) => b.name.toLowerCase().includes("math") && !b.name.toLowerCase().includes("gsm"))?.score;
        
        return {
          ...model,
          mmlu,
          humaneval,
          math,
        };
      })
      .filter((model) => {
        if (!model.mmlu && !model.humaneval && !model.math) return false;
        
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            model.name.toLowerCase().includes(q) ||
            model.developer.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        
        if (sortField === "Parameters") {
          valA = parseParams(a.activeParameters || a.parameters);
          valB = parseParams(b.activeParameters || b.parameters);
        } else {
          const scoreA = sortField === "MMLU" ? a.mmlu : sortField === "HumanEval" ? a.humaneval : a.math;
          const scoreB = sortField === "MMLU" ? b.mmlu : sortField === "HumanEval" ? b.humaneval : b.math;
          valA = parseScore(scoreA);
          valB = parseScore(scoreB);
        }

        if (sortDirection === "asc") return valA - valB;
        return valB - valA;
      });
  }, [allModels, searchQuery, sortField, sortDirection]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-normal tracking-tight text-[var(--text)] flex items-center gap-3" style={{ fontFamily: "var(--font-display)" }}>
              <Trophy className="text-[var(--accent)]" size={32} />
              Leaderboard
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-2xl">
              Compare AI models across standardized evals.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
            <input
              type="text"
              placeholder="Search models or devs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--muted)]/20 rounded-full py-2 pl-10 pr-4 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        <div className="bg-[var(--card-bg)] border border-[var(--muted)]/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--muted)]/10 bg-[var(--muted)]/5">
                  <th className="py-4 px-6 font-semibold text-sm text-[var(--muted)]">Model</th>
                  {(["Parameters", "MMLU", "HumanEval", "MATH"] as SortField[]).map((field) => (
                    <th 
                      key={field}
                      className="py-4 px-6 font-semibold text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--text)] transition-colors group select-none"
                      onClick={() => handleSort(field)}
                    >
                      <div className="flex items-center gap-2">
                        {field}
                        <div className="flex flex-col opacity-50 group-hover:opacity-100 transition-opacity">
                          <ChevronUp size={12} className={sortField === field && sortDirection === "asc" ? "text-[var(--accent)] opacity-100" : ""} />
                          <ChevronDown size={12} className="-mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-[var(--accent)] opacity-100' : ''}" />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--muted)]/10">
                {leaderboard.map((model, idx) => (
                  <tr key={model.id} className="hover:bg-[var(--muted)]/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <span className="text-[var(--muted)]/50 font-mono text-sm w-6">{idx + 1}</span>
                        <div>
                          <Link href={`/models/${model.slug}`} className="font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors flex items-center gap-2">
                            {model.name}
                            {model.verified && <CheckCircle2 size={14} className="text-[var(--accent)]" />}
                          </Link>
                          <div className="text-xs text-[var(--muted)]">{model.developer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[var(--muted)]/10 text-xs font-medium text-[var(--text)]">
                        {model.activeParameters ? String(model.activeParameters).toUpperCase() : (model.parameters ? String(model.parameters).toUpperCase() : "-")}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-sm">
                      {model.mmlu || <span className="text-[var(--muted)]/40">-</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm">
                      {model.humaneval || <span className="text-[var(--muted)]/40">-</span>}
                    </td>
                    <td className="py-4 px-6 font-mono text-sm">
                      {model.math || <span className="text-[var(--muted)]/40">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {leaderboard.length === 0 && (
              <div className="py-24 text-center text-[var(--muted)]">
                No models found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
