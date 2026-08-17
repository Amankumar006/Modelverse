"use client";

import React, { useState } from "react";
import type { ModelEntry } from "@/lib/models";
import { formatParameters, getModalities } from "@/lib/models";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { ArrowUpRight, Copy, Check } from "lucide-react";

interface ModelDetailTabsProps {
  model: ModelEntry;
  markdownContent: string | null;
}

const DOT = {
  active: "bg-[var(--accent)]",
  deprecated: "bg-amber-500",
  sunset: "bg-rose-500",
  vendor: "bg-amber-500",
  independent: "bg-[var(--accent)]",
};

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--muted)]">{children}</p>;
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between border-b border-[var(--muted)]/10 py-2.5 text-sm">
      <dt className="text-[var(--muted)] font-medium">{label}</dt>
      <dd className="tabular-nums text-[var(--text)] font-mono font-bold">{value}</dd>
    </div>
  );
}

function QuickstartSection({ quickstart }: { quickstart: Record<string, string> }) {
  const entries = Object.entries(quickstart).filter(
    ([, code]) => typeof code === "string" && code.trim().length > 0
  );
  const [selectedLang, setSelectedLang] = useState<string>(entries[0]?.[0] || "python");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (entries.length === 0) return null;

  const currentCode = quickstart[selectedLang] || entries[0][1];

  const handleCopy = (key: string, code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const getLanguageLabel = (key: string) => {
    const map: Record<string, string> = {
      python: "Python",
      javascript: "JavaScript",
      typescript: "TypeScript",
      curl: "cURL",
      bash: "Bash",
      json: "JSON",
      go: "Go",
      rust: "Rust",
    };
    return map[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--muted)]/10">
        <div>
          <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Quickstart & API Integration</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5">Ready-to-run implementation code snippet for inference and integration.</p>
        </div>
        {entries.length > 1 && (
          <div className="flex gap-1.5 p-1 rounded-[var(--radius-pill)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
            {entries.map(([key]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedLang(key)}
                className={`px-3 py-1 text-xs font-bold rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                  selectedLang === key
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {getLanguageLabel(key)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg)]/80 border-b border-[var(--muted)]/10 text-xs">
          <span className="font-mono font-bold text-[var(--text)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            {getLanguageLabel(selectedLang)}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(selectedLang, currentCode)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer"
          >
            {copiedKey === selectedLang ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} className="text-[var(--muted)]" />
                <span>Copy code</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-[var(--text)] leading-relaxed whitespace-pre font-normal selection:bg-[var(--accent-soft)]">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ModelDetailTabs({
  model,
  markdownContent,
}: ModelDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "getting-started" | "specs" | "benchmarks" | "resources">("overview");

  const quickstart = (model.quickstart || model.metadata?.quickstart || {}) as Record<string, string>;
  const hasQuickstart = Object.values(quickstart).some(
    (code) => typeof code === "string" && code.trim().length > 0
  );

  const tabs: { key: "overview" | "getting-started" | "specs" | "benchmarks" | "resources"; label: string }[] = [
    { key: "overview", label: "Overview" },
    ...(hasQuickstart ? [{ key: "getting-started" as const, label: "Getting Started" }] : []),
    { key: "specs", label: "Specs" },
    { key: "benchmarks", label: "Benchmarks" },
    { key: "resources", label: "Resources" },
  ];

  const distinctOverview =
    model.pageOverview && model.pageOverview.trim() !== model.description.trim()
      ? model.pageOverview.trim()
      : null;
  const editorialNote = model.editorialNote?.trim();
  const liveFeatures = model.keyFeatures ?? [];
  const linkEntries = Object.entries(model.links || {}).filter(([, url]) => Boolean(url));

  return (
    <div className="w-full">
      {/* Daylight Pill Tab Switcher */}
      <div
        role="tablist"
        aria-label="Model details and benchmarks"
        className="flex gap-2 p-1.5 rounded-[var(--radius-pill)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 w-fit mb-6"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            id={`tab-${t.key}`}
            role="tab"
            aria-selected={activeTab === t.key}
            aria-controls={`tabpanel-${t.key}`}
            tabIndex={activeTab === t.key ? 0 : -1}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer ${
              activeTab === t.key
                ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panels - All rendered in server HTML for SEO and crawlers */}
      <div className="py-4">
        {/* Tab 1: Overview */}
        <div
          id="tabpanel-overview"
          role="tabpanel"
          aria-labelledby="tab-overview"
          className={`space-y-6 ${activeTab === "overview" ? "block" : "hidden"}`}
        >
          {distinctOverview && (
            <div className="max-w-3xl leading-relaxed text-[var(--text)] text-base font-normal">
              <MarkdownRenderer content={distinctOverview} />
            </div>
          )}

          {editorialNote && (
            <div className="p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-sm">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent)] mb-2">Editorial Context</h4>
              <div className="text-[var(--muted)] leading-relaxed text-sm">
                <MarkdownRenderer content={editorialNote} />
              </div>
            </div>
          )}

          {markdownContent ? (
            <div className="pt-6 border-t border-[var(--muted)]/10">
              <MarkdownRenderer content={markdownContent} />
            </div>
          ) : (
            !distinctOverview && !editorialNote && (
              <div className="space-y-4">
                {liveFeatures.length > 0 && (
                  <div className="p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
                    <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] mb-3">Model Capabilities & Focus</h4>
                    <ul className="space-y-2 text-sm text-[var(--text)]">
                      {liveFeatures.map((f) => {
                        const cleanFeature = f.replace(/^[\s—–\-•*]+\s*/, "");
                        return (
                          <li key={f} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                            <span>{cleanFeature}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-[var(--muted)]">
                  Complete technical specifications, verified benchmarks, and deployment parameters are indexed in the tabs above.
                </p>
              </div>
            )
          )}

          {model.customSections && model.customSections.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-[var(--muted)]/10">
              {model.customSections.map((sec, i) => (
                <section key={sec.id || i} className="space-y-3">
                  <h3 className="text-base font-extrabold text-[var(--text)]">{sec.title}</h3>
                  <div className="prose prose-invert max-w-none text-sm text-[var(--text)] leading-relaxed">
                    <MarkdownRenderer content={sec.content} />
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        {/* Tab 2: Getting Started (if quickstart exists) */}
        {hasQuickstart && (
          <div
            id="tabpanel-getting-started"
            role="tabpanel"
            aria-labelledby="tab-getting-started"
            className={`space-y-8 ${activeTab === "getting-started" ? "block" : "hidden"}`}
          >
            <QuickstartSection quickstart={quickstart} />
          </div>
        )}

        {/* Tab 3: Specs */}
        <div
          id="tabpanel-specs"
          role="tabpanel"
          aria-labelledby="tab-specs"
          className={`space-y-8 ${activeTab === "specs" ? "block" : "hidden"}`}
        >
          <section>
            <h3 className="mb-3 text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Key features</h3>
            {liveFeatures.length > 0 ? (
              <ul className="space-y-2 text-sm text-[var(--text)]">
                {liveFeatures.map((f) => {
                  const cleanFeature = f.replace(/^[\s—–\-•*]+\s*/, "");
                  return (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--muted)]/60 mt-2 shrink-0" />
                      <span>{cleanFeature}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <Empty>Not yet documented.</Empty>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Specifications</h3>
            <dl className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] rounded-[var(--radius-card)] p-4 border border-[var(--muted)]/10">
              <Row label="Parameters" value={formatParameters(model)} />
              {model.activeParameters && (
                <Row label="Active Parameters (MoE)" value={typeof model.activeParameters === "object" ? Object.values(model.activeParameters).join(" / ") : model.activeParameters as string} />
              )}
              {(() => {
                const cw = typeof model.contextWindow === "object" && model.contextWindow !== null ? (model.contextWindow as { native?: number }).native : model.contextWindow;
                return <Row label="Context window" value={cw !== "undisclosed" ? cw : undefined} />;
              })()}
              {(() => {
                const lic = typeof model.license === "object" && model.license !== null ? (model.license as { name?: string, weights?: { name?: string } }).name || (model.license as { name?: string, weights?: { name?: string } }).weights?.name || "Custom" : model.license;
                return <Row label="License" value={lic !== "Other/Custom" ? lic : undefined} />;
              })()}
              <Row label="Primary task" value={model.primaryTask.replace(/-/g, " ")} />
              <Row label="Deployment" value={model.deployment.join(", ")} />
              <Row label="Modalities" value={getModalities(model.modality).join(", ")} />
            </dl>
          </section>
        </div>

        {/* Tab 4: Benchmarks & Pricing */}
        <div
          id="tabpanel-benchmarks"
          role="tabpanel"
          aria-labelledby="tab-benchmarks"
          className={`space-y-8 ${activeTab === "benchmarks" ? "block" : "hidden"}`}
        >
          <section>
            <h3 className="mb-4 text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Benchmarks</h3>
            {model.benchmarks?.length ? (
              <div className="space-y-6">
                {Object.entries(
                  model.benchmarks.reduce((acc, b) => {
                    const cat = b.category || "General";
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(b);
                    return acc;
                  }, {} as Record<string, typeof model.benchmarks>)
                ).map(([category, benchs]) => {
                  const hasMultipleCategories = Object.keys(
                    model.benchmarks.reduce((a, b) => { a[b.category || "General"] = true; return a; }, {} as Record<string, boolean>)
                  ).length > 1;

                  // Extract any custom columns present in this category
                  const categoryCustomCols = Array.from(
                    new Set(benchs.flatMap((b) => Object.keys(b.customColumns || {})))
                  );

                  return (
                    <div key={category} className="mb-6 last:mb-0">
                      {/* Dynamic Table Title if there are multiple domains */}
                      {(hasMultipleCategories || category !== "General") && (
                        <h4 className="mb-3 text-[13px] uppercase tracking-wider font-extrabold text-[var(--text)] flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                          {category} Benchmarks
                        </h4>
                      )}

                      <div className="overflow-x-auto bg-[var(--card-bg)] shadow-[var(--shadow-card)] rounded-[var(--radius-card)] p-4 border border-[var(--muted)]/10">
                        <table className="w-full min-w-[340px] text-sm">
                          <thead className="border-b border-[var(--muted)]/10 text-[11px] uppercase tracking-wider text-[var(--muted)] font-mono">
                            <tr>
                              <th className="pb-2 text-left font-bold">Benchmark</th>
                              <th className="pb-2 text-left font-bold">Score</th>
                              {categoryCustomCols.map((col) => (
                                <th key={col} className="pb-2 text-left font-bold">
                                  {col}
                                </th>
                              ))}
                              <th className="pb-2 text-right font-bold pr-2">Evaluation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--muted)]/10">
                            {benchs.map((b) => {
                              const citation = (b.citation || b.source || "") as string;
                              return (
                                <tr key={b.name} className="hover:bg-[var(--bg)]/50 transition-colors">
                                  <td className="py-2.5 text-[var(--text)] font-semibold">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span>{b.name}</span>
                                        {citation && citation.startsWith("http") && (
                                          <a
                                            href={citation}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors inline-flex items-center"
                                            title="View citation"
                                          >
                                            <ArrowUpRight size={12} />
                                          </a>
                                        )}
                                      </div>
                                      {b.subCategory && b.subCategory !== "None" && (
                                        <span className="text-[11px] text-[var(--muted)] font-mono font-normal">
                                          {b.subCategory}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 tabular-nums text-[var(--accent)] font-mono font-bold">{b.score}</td>
                                  {categoryCustomCols.map((col) => (
                                    <td key={col} className="py-2.5 font-mono text-xs text-[var(--muted)]">
                                      {b.customColumns?.[col] ?? "—"}
                                    </td>
                                  ))}
                                  <td className="py-2.5 text-right pr-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                      <span className={`h-2 w-2 rounded-full ${b.sourceType === "vendor-reported" ? DOT.vendor : DOT.independent}`} />
                                      {b.sourceType === "vendor-reported" ? "Vendor-reported" : "Independent"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty>No benchmark data recorded yet.</Empty>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Pricing</h3>
            {model.pricing && model.pricing.length > 0 ? (
              <div className="space-y-2 bg-[var(--card-bg)] shadow-[var(--shadow-card)] rounded-[var(--radius-card)] p-4 border border-[var(--muted)]/10">
                {model.pricing.map((p, idx) => (
                  <p key={idx} className="text-sm text-[var(--text)]">
                    {p.tier ? <span className="font-bold text-[var(--text)] mr-1.5">{p.tier}:</span> : null}
                    ${p.amount} {p.currency || "USD"} / {p.unit}
                  </p>
                ))}
              </div>
            ) : (
              <Empty>No public pricing — self-hosted or not yet published.</Empty>
            )}
          </section>
        </div>

        {/* Tab 5: Resources */}
        <div
          id="tabpanel-resources"
          role="tabpanel"
          aria-labelledby="tab-resources"
          className={`space-y-8 ${activeTab === "resources" ? "block" : "hidden"}`}
        >
          <section>
            <h3 className="mb-3 text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Links</h3>
            {linkEntries.length ? (
              <ul className="space-y-2 bg-[var(--card-bg)] shadow-[var(--shadow-card)] rounded-[var(--radius-card)] p-4 border border-[var(--muted)]/10">
                {linkEntries.map(([key, url]) => (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--text)] hover:text-[var(--accent)] hover:underline transition-colors capitalize font-medium"
                    >
                      {key === "huggingface" ? "Hugging Face" : key === "github" ? "GitHub Repository" : key === "blogPost" ? "Developer Blog" : key}
                      <ArrowUpRight size={13} className="text-[var(--muted)]" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No official links recorded.</Empty>
            )}
          </section>

          <section>
            <h3 className="mb-1 text-xs uppercase tracking-wider font-bold text-[var(--muted)]">Sources</h3>
            <p className="mb-2 text-xs text-[var(--muted)]">Citations used to compile this entry.</p>
            {model.sources?.length ? (
              <ul className="space-y-1.5">
                {model.sources.map((s) => (
                  <li key={s} className="break-all text-xs font-mono text-[var(--muted)]">
                    <a href={s} target="_blank" rel="noreferrer" className="hover:text-[var(--accent)] hover:underline">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-rose-400">No sources recorded.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
