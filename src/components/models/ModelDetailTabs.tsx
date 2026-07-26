"use client";

import { useState } from "react";
import type { ModelEntry } from "@/lib/models";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { ArrowUpRight } from "lucide-react";

interface ModelDetailTabsProps {
  model: ModelEntry;
  markdownContent: string | null;
  showDraftPreview?: boolean;
}

const DOT = {
  active: "bg-emerald-500",
  deprecated: "bg-amber-500",
  sunset: "bg-rose-500",
  vendor: "bg-amber-500",
  independent: "bg-emerald-500",
};

function DraftLabel() {
  return (
    <p className="mb-2 text-xs text-[#D97757] font-medium">
      Draft — unreviewed, curator preview only
    </p>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[#90908F]">{children}</p>;
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between border-b border-[#282828] py-2.5 text-sm">
      <dt className="text-[#90908F]">{label}</dt>
      <dd className="tabular-nums text-[#E1E1E0] font-mono">{value}</dd>
    </div>
  );
}

export default function ModelDetailTabs({
  model,
  markdownContent,
  showDraftPreview = false,
}: ModelDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "benchmarks" | "resources">("overview");

  const tabs: { key: "overview" | "specs" | "benchmarks" | "resources"; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "specs", label: "Specs" },
    { key: "benchmarks", label: "Benchmarks" },
    { key: "resources", label: "Resources" },
  ];

  const hasLiveDescription = Boolean(model.description?.trim());
  const hasDraftDescription = Boolean(model.descriptionDraft?.trim());
  const liveFeatures = model.keyFeatures ?? [];
  const draftFeatures = model.keyFeaturesDraft ?? [];
  const showDraftFeatures = liveFeatures.length === 0 && showDraftPreview && draftFeatures.length > 0;
  const linkEntries = Object.entries(model.links || {}).filter(([, url]) => Boolean(url));

  return (
    <div className="w-full">
      {/* Claude Docs Minimal Tab Switcher */}
      <div className="flex gap-8 border-b border-[#282828]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "border-emerald-400 text-white font-semibold"
                : "border-transparent text-[#90908F] hover:text-[#E1E1E0]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="py-7">
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {hasLiveDescription ? (
              <p className="max-w-2xl leading-relaxed text-[#E1E1E0] text-base">{model.description}</p>
            ) : showDraftPreview && hasDraftDescription ? (
              <div>
                <DraftLabel />
                <p className="max-w-2xl leading-relaxed text-[#90908F] text-base">{model.descriptionDraft}</p>
              </div>
            ) : (
              <Empty>Enrichment in progress — a reviewed description isn&apos;t available yet.</Empty>
            )}

            {/* Markdown Documentation */}
            {markdownContent && (
              <div className="pt-6 border-t border-[#282828]">
                <MarkdownRenderer content={markdownContent} />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specs */}
        {activeTab === "specs" && (
          <div className="space-y-8">
            <section>
              <h3 className="mb-3 text-xs uppercase tracking-wider font-semibold text-[#90908F]">Key features</h3>
              {liveFeatures.length > 0 ? (
                <ul className="space-y-2 text-sm text-[#E1E1E0]">
                  {liveFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-[#90908F]">—</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : showDraftFeatures ? (
                <div>
                  <DraftLabel />
                  <ul className="space-y-2 text-sm text-[#90908F]">
                    {draftFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="text-[#90908F]">—</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Empty>Not yet documented.</Empty>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold text-[#90908F]">Specifications</h3>
              <dl>
                <Row label="Parameters" value={model.parameters !== "undisclosed" ? model.parameters : undefined} />
                <Row label="Context window" value={model.contextWindow !== "undisclosed" ? model.contextWindow : undefined} />
                <Row label="License" value={model.license !== "Other/Custom" ? model.license : undefined} />
                <Row label="Primary task" value={model.primaryTask.replace(/-/g, " ")} />
                <Row label="Deployment" value={model.deployment.join(", ")} />
                <Row label="Modalities" value={model.modality.join(", ")} />
              </dl>
            </section>
          </div>
        )}

        {/* Tab 3: Benchmarks & Pricing */}
        {activeTab === "benchmarks" && (
          <div className="space-y-8">
            <section>
              <h3 className="mb-3 text-xs uppercase tracking-wider font-semibold text-[#90908F]">Benchmarks</h3>
              {model.benchmarks?.length ? (
                <table className="w-full text-sm">
                  <tbody>
                    {model.benchmarks.map((b) => (
                      <tr key={b.name} className="border-b border-[#282828]">
                        <td className="py-2.5 text-[#E1E1E0] font-medium">{b.name}</td>
                        <td className="py-2.5 tabular-nums text-white font-mono font-bold">{b.score}</td>
                        <td className="py-2.5 text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#90908F]">
                            <span className={`h-1.5 w-1.5 rounded-full ${b.sourceType === "vendor-reported" ? DOT.vendor : DOT.independent}`} />
                            {b.sourceType === "vendor-reported" ? "Vendor-reported" : "Independent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Empty>No benchmark data recorded yet.</Empty>
              )}
            </section>

            <section>
              <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold text-[#90908F]">Pricing</h3>
              {model.pricing && model.pricing.length > 0 ? (
                <div className="space-y-2">
                  {model.pricing.map((p, idx) => (
                    <p key={idx} className="text-sm text-[#E1E1E0]">
                      {p.tier ? <span className="font-semibold text-white mr-1.5">{p.tier}:</span> : null}
                      ${p.amount} {p.currency || "USD"} / {p.unit}
                    </p>
                  ))}
                </div>
              ) : (
                <Empty>No public pricing — self-hosted or not yet published.</Empty>
              )}
            </section>
          </div>
        )}

        {/* Tab 4: Resources */}
        {activeTab === "resources" && (
          <div className="space-y-8">
            <section>
              <h3 className="mb-3 text-xs uppercase tracking-wider font-semibold text-[#90908F]">Links</h3>
              {linkEntries.length ? (
                <ul className="space-y-2">
                  {linkEntries.map(([key, url]) => (
                    <li key={key}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-[#E1E1E0] hover:text-[#D97757] hover:underline transition-colors capitalize"
                      >
                        {key === "huggingface" ? "Hugging Face" : key === "github" ? "GitHub Repository" : key === "blogPost" ? "Developer Blog" : key}
                        <ArrowUpRight size={13} className="text-[#90908F]" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty>No official links recorded.</Empty>
              )}
            </section>

            <section>
              <h3 className="mb-1 text-xs uppercase tracking-wider font-semibold text-[#90908F]">Sources</h3>
              <p className="mb-2 text-xs text-[#666664]">Citations used to compile this entry.</p>
              {model.sources?.length ? (
                <ul className="space-y-1.5">
                  {model.sources.map((s) => (
                    <li key={s} className="break-all text-xs font-mono text-[#90908F]">
                      <a href={s} target="_blank" rel="noreferrer" className="hover:text-[#D97757] hover:underline">
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
        )}
      </div>
    </div>
  );
}
