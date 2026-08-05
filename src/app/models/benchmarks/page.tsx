"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { getAllModelEntries, SITE_URL } from "@/lib/models";
import { Search, Trophy, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import Head from "next/head";

type SortField = "MMLU" | "HumanEval" | "MATH" | "Parameters";
type SortDirection = "asc" | "desc";

export default function BenchmarksPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("MMLU");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const allModels = getAllModelEntries();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const parseScore = (scoreStr?: string) => {
    if (!scoreStr) return 0;
    const match = scoreStr.match(/[0-9.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

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
          parsedMMLU: parseScore(mmlu),
          parsedHumanEval: parseScore(humaneval),
          parsedMath: parseScore(math),
          parsedParams: parseParams(model.parameters),
        };
      })
      .filter((m) => m.parsedMMLU > 0 || m.parsedHumanEval > 0 || m.parsedMath > 0)
      .filter((m) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.developer.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;
        
        if (sortField === "MMLU") { valA = a.parsedMMLU; valB = b.parsedMMLU; }
        else if (sortField === "HumanEval") { valA = a.parsedHumanEval; valB = b.parsedHumanEval; }
        else if (sortField === "MATH") { valA = a.parsedMath; valB = b.parsedMath; }
        else if (sortField === "Parameters") { valA = a.parsedParams; valB = b.parsedParams; }

        if (valA === valB) {
          // Tie breaker by release date
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        }

        return sortDirection === "desc" ? valB - valA : valA - valB;
      });
  }, [allModels, searchQuery, sortField, sortDirection]);

  return (
    <>
      <Head>
        <title>AI Model Benchmarks & Leaderboard | Modelverse</title>
        <meta name="description" content="Global leaderboard comparing top AI models by MMLU, HumanEval, and MATH scores." />
        <link rel="canonical" href={`${SITE_URL}/models/benchmarks`} />
      </Head>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased flex flex-col justify-between">
        <div>
          <Navbar theme="dark" />
          <main className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-12 md:py-16 space-y-10">
            <header className="space-y-4 max-w-3xl">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight flex items-center gap-4">
                <Trophy size={40} className="text-yellow-500" />
                Global Leaderboard
              </h1>
              <p className="text-lg text-[var(--muted)] leading-relaxed font-medium">
                Compare frontier models by raw intelligence and capability across standardized evaluations like MMLU (knowledge), HumanEval (coding), and MATH (reasoning).
              </p>
            </header>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Search models or developers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/20 pl-9 pr-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] shadow-sm"
                />
              </div>
              <div className="text-xs text-[var(--muted)] font-medium">
                Showing {leaderboard.length} evaluated models
              </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10">
                  <tr>
                    <th className="p-4 font-extrabold text-[var(--text)]">Rank</th>
                    <th className="p-4 font-extrabold text-[var(--text)] min-w-[200px]">Model</th>
                    <th className="p-4 font-extrabold text-[var(--text)] cursor-pointer hover:bg-[var(--bg)] transition-colors" onClick={() => handleSort("Parameters")}>
                      <div className="flex items-center gap-1.5">
                        Parameters
                        {sortField === "Parameters" && (sortDirection === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
                      </div>
                    </th>
                    <th className="p-4 font-extrabold text-[var(--text)] cursor-pointer hover:bg-[var(--bg)] transition-colors" onClick={() => handleSort("MMLU")}>
                      <div className="flex items-center gap-1.5">
                        MMLU
                        {sortField === "MMLU" && (sortDirection === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
                      </div>
                    </th>
                    <th className="p-4 font-extrabold text-[var(--text)] cursor-pointer hover:bg-[var(--bg)] transition-colors" onClick={() => handleSort("HumanEval")}>
                      <div className="flex items-center gap-1.5">
                        HumanEval
                        {sortField === "HumanEval" && (sortDirection === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
                      </div>
                    </th>
                    <th className="p-4 font-extrabold text-[var(--text)] cursor-pointer hover:bg-[var(--bg)] transition-colors" onClick={() => handleSort("MATH")}>
                      <div className="flex items-center gap-1.5">
                        MATH
                        {sortField === "MATH" && (sortDirection === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />)}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--muted)]/10">
                  {leaderboard.map((model, idx) => (
                    <tr key={model.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                      <td className="p-4 text-[var(--muted)] font-bold">
                        #{idx + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <Link href={`/models/${model.slug}`} className="font-bold text-[var(--text)] hover:text-[var(--accent)] flex items-center gap-1.5">
                            {model.name}
                            {model.verified && <CheckCircle2 size={12} className="text-emerald-500" />}
                          </Link>
                          <span className="text-[11px] text-[var(--muted)]">{model.developer}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[var(--muted)]">
                        {model.parameters ? (typeof model.parameters === "object" ? Object.values(model.parameters)[0] : model.parameters) : "—"}
                      </td>
                      <td className="p-4 font-mono font-bold text-[var(--text)]">
                        {model.mmlu || "—"}
                      </td>
                      <td className="p-4 font-mono font-bold text-[var(--text)]">
                        {model.humaneval || "—"}
                      </td>
                      <td className="p-4 font-mono font-bold text-[var(--text)]">
                        {model.math || "—"}
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[var(--muted)] font-medium">
                        No benchmarks found for the current search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
