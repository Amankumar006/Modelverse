"use client";

import React, { useState } from "react";
import type { ModelEvidence } from "@/lib/models";
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Sparkles,
  Info,
} from "lucide-react";

interface ProvenanceEvidenceDrawerProps {
  evidence: ModelEvidence[];
  modelName: string;
}

export default function ProvenanceEvidenceDrawer({
  evidence = [],
  modelName,
}: ProvenanceEvidenceDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterConfidence, setFilterConfidence] = useState<string>("ALL");

  if (!evidence || evidence.length === 0) {
    return null;
  }

  const officialCount = evidence.filter((e) => e.confidence === "OFFICIAL").length;
  const verifiedCount = evidence.filter((e) => e.confidence === "VERIFIED" || e.confidence === "LIKELY").length;

  const filteredEvidence = filterConfidence === "ALL"
    ? evidence
    : evidence.filter((e) => e.confidence === filterConfidence);

  const displayedEvidence = isExpanded ? filteredEvidence : filteredEvidence.slice(0, 4);

  return (
    <section className="space-y-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 border border-[var(--muted)]/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--muted)]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
              Verified Provenance &amp; Fact Citations
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <FileCheck2 size={12} />
              {evidence.length} Verified Facts
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Every specification, capability flag, and provider availability metric for {modelName} is backed by verifiable source citations.
          </p>
        </div>

        {/* Confidence breakdown pills */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setFilterConfidence("ALL")}
            className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
              filterConfidence === "ALL"
                ? "bg-[var(--text)] text-[var(--bg)] font-bold"
                : "bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/20"
            }`}
          >
            All ({evidence.length})
          </button>
          {officialCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterConfidence("OFFICIAL")}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                filterConfidence === "OFFICIAL"
                  ? "bg-amber-500 text-black font-bold"
                  : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30"
              }`}
            >
              Official ({officialCount})
            </button>
          )}
          {verifiedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterConfidence("VERIFIED")}
              className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                filterConfidence === "VERIFIED"
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30"
              }`}
            >
              Verified ({verifiedCount})
            </button>
          )}
        </div>
      </div>

      {/* Evidence Citations List */}
      <div className="space-y-2.5 pt-1">
        {displayedEvidence.map((ev) => {
          const isOfficial = ev.confidence === "OFFICIAL";
          const formattedDate = new Date(ev.extractedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          let domain = "";
          try {
            domain = new URL(ev.sourceUrl).hostname.replace(/^www\./, "");
          } catch {
            domain = ev.sourceType || "source";
          }

          let valuePreview = "";
          if (ev.extractedValue && typeof ev.extractedValue === "object") {
            const keys = Object.keys(ev.extractedValue);
            if (keys.length === 1 && typeof ev.extractedValue[keys[0]] === "string") {
              valuePreview = String(ev.extractedValue[keys[0]]);
            } else if (keys.length === 1 && Array.isArray(ev.extractedValue[keys[0]])) {
              valuePreview = (ev.extractedValue[keys[0]] as string[]).slice(0, 3).join(", ");
            } else {
              valuePreview = JSON.stringify(ev.extractedValue);
            }
          }

          return (
            <div
              key={ev.id}
              className="p-3.5 rounded-[12px] bg-[var(--bg)]/50 border border-[var(--muted)]/10 hover:border-[var(--accent)]/30 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--muted)]/10 text-[var(--text)]">
                    {ev.fieldName}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOfficial
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    }`}
                  >
                    {isOfficial ? <Sparkles size={10} /> : <CheckCircle2 size={10} />}
                    {ev.confidence}
                  </span>

                  <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                    <Calendar size={11} /> {formattedDate}
                  </span>
                </div>

                {ev.sourceUrl && (
                  <a
                    href={ev.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline shrink-0"
                  >
                    <span>{domain}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {valuePreview && (
                <div className="mt-2 text-xs text-[var(--text)]/90 bg-[var(--card-bg)] px-3 py-1.5 rounded-[8px] border border-[var(--muted)]/10 font-mono text-[11px] truncate">
                  <span className="text-[var(--muted)] font-sans mr-1">Extracted:</span>
                  {valuePreview}
                </div>
              )}

              {ev.verificationNotes && (
                <p className="text-[11px] text-[var(--muted)] mt-1.5 flex items-center gap-1">
                  <Info size={12} className="shrink-0 text-[var(--accent)]" />
                  {ev.verificationNotes}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand / Collapse Button */}
      {filteredEvidence.length > 4 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline py-1 px-3 rounded-full hover:bg-[var(--accent-soft)] transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} /> Show Less ({filteredEvidence.length} Total)
              </>
            ) : (
              <>
                <ChevronDown size={14} /> View All {filteredEvidence.length} Citations
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
