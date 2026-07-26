"use client";

import { useState } from "react";
import type { ModelEntry } from "@/lib/models";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

interface ModelDetailTabsProps {
  model: ModelEntry;
  markdownContent: string | null;
}

export default function ModelDetailTabs({ model, markdownContent }: ModelDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "benchmarks" | "resources">("overview");

  return (
    <div className="w-full space-y-6">
      {/* Horizontal Glass Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
            activeTab === "overview"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          Overview & Readme
        </button>

        <button
          onClick={() => setActiveTab("specs")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
            activeTab === "specs"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          Technical Specs & Features
        </button>

        {((model.benchmarks && model.benchmarks.length > 0) || (model.pricing && model.pricing.length > 0)) && (
          <button
            onClick={() => setActiveTab("benchmarks")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
              activeTab === "benchmarks"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Benchmarks & Pricing
          </button>
        )}

        <button
          onClick={() => setActiveTab("resources")}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
            activeTab === "resources"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          Resources & Provenance
        </button>
      </div>

      {/* Tab 1: Overview & Readme */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Summary Callout */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Model Summary</h3>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed font-sans font-normal">
              {model.description}
            </p>
          </div>

          {/* Render Full Readme Markdown */}
          {markdownContent && (
            <div className="pt-4">
              <MarkdownRenderer content={markdownContent} />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Technical Specs & Key Features */}
      {activeTab === "specs" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Features Grid */}
          {model.keyFeatures && model.keyFeatures.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Key Features & Capabilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {model.keyFeatures.map((feat, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
                    <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm text-white/90">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Specs Table */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Full Specifications Table</h3>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-white/5 text-emerald-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Specification</th>
                    <th className="px-4 py-3">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  <tr>
                    <td className="px-4 py-3 font-sans text-white/60">Developer</td>
                    <td className="px-4 py-3 font-semibold text-white">{model.developer}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans text-white/60">Parameters</td>
                    <td className="px-4 py-3 text-emerald-400">{model.parameters}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans text-white/60">Context Window</td>
                    <td className="px-4 py-3 text-emerald-400">{model.contextWindow}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans text-white/60">Primary Task</td>
                    <td className="px-4 py-3 text-white capitalize">{model.primaryTask.replace(/-/g, " ")}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans text-white/60">License</td>
                    <td className="px-4 py-3 text-white">{model.license}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans text-white/60">Deployment</td>
                    <td className="px-4 py-3 text-white">{model.deployment.join(", ")}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-sans text-white/60">Modalities</td>
                    <td className="px-4 py-3 text-white">{model.modality.join(", ")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Benchmarks & Pricing */}
      {activeTab === "benchmarks" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Benchmarks Table */}
          {model.benchmarks && model.benchmarks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Evaluated Benchmarks</h3>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/5 text-emerald-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Benchmark</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Provenance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {model.benchmarks.map((b, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-semibold text-white">{b.name}</td>
                        <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{b.score}</td>
                        <td className="px-4 py-3 text-white/60 text-[11px]">
                          {b.sourceType === "vendor-reported" ? "Vendor Reported" : "Independent Eval"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pricing Table */}
          {model.pricing && model.pricing.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Token Pricing Rates</h3>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <table className="w-full text-left text-xs text-white/80">
                  <thead className="bg-white/5 text-emerald-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Tier / Unit</th>
                      <th className="px-4 py-3">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {model.pricing.map((p, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-sans text-white/80">{p.tier ? `${p.tier} (${p.unit})` : p.unit}</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">${p.amount} {p.currency || "USD"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Resources & Provenance */}
      {activeTab === "resources" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Resource Links */}
          {model.links && Object.keys(model.links).length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Official Links & Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(model.links).map(([title, url]) => (
                  <a
                    key={title}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center justify-between group"
                  >
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors capitalize">
                      {title}
                    </span>
                    <svg className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sources & Provenance Audit */}
          {model.sources && model.sources.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Data Sources & Provenance Audit</h3>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                {model.sources.map((src, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono text-white/70">
                    <span className="text-emerald-400">•</span>
                    <a href={src} target="_blank" rel="noreferrer" className="hover:text-emerald-300 underline truncate">
                      {src}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
