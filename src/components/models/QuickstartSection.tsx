"use client";

import React, { useState } from "react";
import { normalizeQuickstart } from "@/lib/model-normalization";
import CodeBlock from "@/components/ui/CodeBlock";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { Terminal, Key, Box, AlertCircle, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

interface QuickstartSectionProps {
  quickstart: unknown;
  modelName?: string;
  developer?: string;
}

export default function QuickstartSection({ quickstart, modelName = "model" }: QuickstartSectionProps) {
  const normalized = normalizeQuickstart(quickstart);
  const { codeExamples, overview, prerequisites, installation, environment, firstRequest, responseHandling, productionNotes } = normalized;

  // Initialize selected language to first available code example
  const [selectedLang, setSelectedLang] = useState<string>(codeExamples[0]?.language || "python");

  if (!normalized.hasContent) {
    return null;
  }

  const activeExample = codeExamples.find((ex) => ex.language === selectedLang) || codeExamples[0];

  return (
    <section id="getting-started" className="section-anchor space-y-6 pt-6 border-t border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <Terminal size={14} />
            <span>Developer Quickstart</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Getting Started
          </h2>
        </div>
        <span className="text-xs font-mono text-[var(--muted)] bg-[var(--card-bg)] px-2.5 py-1 rounded-[var(--radius-control)] border border-[var(--muted)]/10 w-fit">
          API Reference &amp; SDKs
        </span>
      </div>

      {/* A. Overview */}
      {overview && (
        <div className="text-sm text-[var(--muted)] leading-relaxed font-normal max-w-3xl">
          <MarkdownRenderer content={overview} />
        </div>
      )}

      {/* Main Interactive Code Examples Panel */}
      {codeExamples.length > 0 && (
        <div className="space-y-3">
          {/* Language Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)] font-medium">
              Select an implementation language for {modelName}:
            </p>
            {codeExamples.length > 1 && (
              <div className="flex gap-1.5 p-1 rounded-[var(--radius-pill)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
                {codeExamples.map((ex) => (
                  <button
                    key={ex.language}
                    type="button"
                    onClick={() => setSelectedLang(ex.language)}
                    className={`px-3 py-1 text-xs font-bold rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                      selectedLang === ex.language
                        ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Code Block */}
          {activeExample && (
            <CodeBlock
              language={activeExample.language}
              code={activeExample.code}
              filename={`${modelName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-quickstart.${
                activeExample.language === "python" ? "py" : activeExample.language === "javascript" ? "js" : activeExample.language === "typescript" ? "ts" : "sh"
              }`}
            />
          )}
        </div>
      )}

      {/* Additional Implementation Guidance (B - H) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* B. Prerequisites */}
        {prerequisites && prerequisites.length > 0 && (
          <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 border border-[var(--muted)]/10 space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--text)] flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span>Prerequisites</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--muted)]">
              {prerequisites.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[var(--accent)] font-bold">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* C. Installation */}
        {installation && (
          <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 border border-[var(--muted)]/10 space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--text)] flex items-center gap-1.5">
              <Box size={13} className="text-[var(--accent)]" />
              <span>Installation</span>
            </h4>
            {typeof installation === "string" ? (
              <div className="text-xs font-mono bg-[var(--bg)] p-2.5 rounded-[var(--radius-control)] border border-[var(--muted)]/10 text-[var(--text)]">
                {installation}
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(installation).map(([pkgManager, cmd]) => (
                  <div key={pkgManager} className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-mono text-[var(--muted)]">{pkgManager}</span>
                    <div className="text-xs font-mono bg-[var(--bg)] p-2 rounded-[var(--radius-control)] border border-[var(--muted)]/10 text-[var(--text)]">
                      {cmd}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* D. Environment Variables */}
        {environment && (
          <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 border border-[var(--muted)]/10 space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--text)] flex items-center gap-1.5">
              <Key size={13} className="text-amber-500" />
              <span>Authentication &amp; Environment</span>
            </h4>
            {typeof environment === "string" ? (
              <div className="text-xs font-mono bg-[var(--bg)] p-2.5 rounded-[var(--radius-control)] border border-[var(--muted)]/10 text-[var(--text)]">
                {environment}
              </div>
            ) : Array.isArray(environment) ? (
              <ul className="space-y-1 text-xs font-mono text-[var(--text)]">
                {environment.map((envVar, i) => (
                  <li key={i} className="bg-[var(--bg)] px-2.5 py-1 rounded-[var(--radius-control)] border border-[var(--muted)]/10">
                    {envVar}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-1.5">
                {Object.entries(environment).map(([key, desc]) => (
                  <div key={key} className="text-xs">
                    <code className="text-[var(--accent)] font-bold font-mono">{key}</code>
                    <span className="text-[var(--muted)] ml-2">— {desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* E. First Request */}
        {firstRequest && (
          <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 border border-[var(--muted)]/10 space-y-2.5">
            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent)] flex items-center gap-1.5">
              <Sparkles size={13} className="text-[var(--accent)]" />
              <span>First Request Guide</span>
            </h4>
            <div className="text-xs text-[var(--muted)] leading-relaxed">
              <MarkdownRenderer content={firstRequest} />
            </div>
          </div>
        )}
      </div>

      {/* G. Response Handling */}
      {responseHandling && (
        <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 border border-[var(--muted)]/10 space-y-2.5">
          <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--text)] flex items-center gap-1.5">
            <ChevronRight size={14} className="text-[var(--accent)]" />
            <span>Response Parsing &amp; Handling</span>
          </h4>
          {typeof responseHandling === "string" ? (
            <div className="text-xs text-[var(--muted)] leading-relaxed">
              <MarkdownRenderer content={responseHandling} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(responseHandling).map(([field, explanation]) => (
                <div key={field} className="p-2.5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10">
                  <span className="font-mono font-bold text-[var(--text)] block mb-0.5">{field}</span>
                  <span className="text-[var(--muted)]">{explanation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* H. Production Notes */}
      {productionNotes && productionNotes.length > 0 && (
        <div className="p-4 rounded-[var(--radius-card)] bg-amber-500/5 border border-amber-500/20 text-xs space-y-2">
          <h4 className="text-xs uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1.5">
            <AlertCircle size={13} />
            <span>Production Best Practices &amp; Considerations</span>
          </h4>
          <ul className="space-y-1.5 text-zinc-300">
            {productionNotes.map((note, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span className="leading-relaxed">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
