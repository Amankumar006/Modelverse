"use client";

import React, { useState, Fragment } from "react";
import type { ModelEntry } from "@/lib/models";
import { formatParameters, getModalities } from "@/lib/models";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { ArrowUpRight } from "lucide-react";

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

export default function ModelDetailTabs({
  model,
  markdownContent,
}: ModelDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "benchmarks" | "resources">("overview");

  const tabs: { key: "overview" | "specs" | "benchmarks" | "resources"; label: string }[] = [
    { key: "overview", label: "Overview" },
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
            <p className="max-w-2xl leading-relaxed text-[var(--text)] text-base font-normal">{distinctOverview}</p>
          )}

          {editorialNote && (
            <div className="p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-sm">
              <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent)] mb-2">Editorial Context</h4>
              <p className="text-[var(--muted)] leading-relaxed">{editorialNote}</p>
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
                      {liveFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="text-[var(--accent)] font-bold">—</span>
                          <span>{f}</span>
                        </li>
                      ))}
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

        {/* Tab 2: Specs */}
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
                {liveFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-[var(--muted)]">—</span>
                    <span>{f}</span>
                  </li>
                ))}
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

        {/* Tab 3: Benchmarks & Pricing */}
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
                    const sub = b.subCategory || "None";
                    if (!acc[cat]) acc[cat] = {};
                    if (!acc[cat][sub]) acc[cat][sub] = [];
                    acc[cat][sub].push(b);
                    return acc;
                  }, {} as Record<string, Record<string, typeof model.benchmarks>>)
                ).map(([category, subcategories]) => {
                  const hasMultipleCategories = Object.keys(
                    model.benchmarks.reduce((a, b) => { a[b.category || "General"] = true; return a; }, {} as Record<string, boolean>)
                  ).length > 1;

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
                        <table className="w-full min-w-[300px] text-sm">
                          <tbody>
                            {Object.entries(subcategories).map(([subCategory, benchs]) => (
                              <Fragment key={subCategory}>
                                {subCategory !== "None" && (
                                  <tr>
                                    <td colSpan={3} className="pt-4 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-[var(--muted)] border-b border-[var(--muted)]/10">
                                      {subCategory}
                                    </td>
                                  </tr>
                                )}
                                
                                {benchs.map((b) => (
                                  <tr key={b.name} className="border-b border-[var(--muted)]/10 last:border-0 hover:bg-[var(--bg)]/50 transition-colors">
                                    <td className={`py-2.5 text-[var(--text)] font-semibold ${subCategory !== "None" ? 'pl-3' : ''}`}>
                                      {b.name}
                                    </td>
                                    <td className="py-2.5 tabular-nums text-[var(--accent)] font-mono font-bold">{b.score}</td>
                                    <td className="py-2.5 text-right pr-2">
                                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                        <span className={`h-2 w-2 rounded-full ${b.sourceType === "vendor-reported" ? DOT.vendor : DOT.independent}`} />
                                        {b.sourceType === "vendor-reported" ? "Vendor-reported" : "Independent"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </Fragment>
                            ))}
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

        {/* Tab 4: Resources */}
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
