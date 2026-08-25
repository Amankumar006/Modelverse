"use client";

import React from "react";
import { Activity } from "lucide-react";
import { useActiveSection } from "./ActiveSectionProvider";
import type { AlwaysOnFacts, QuickFact } from "@/lib/model-sections";

interface QuickFactsRailProps {
  alwaysOn: AlwaysOnFacts;
  /** Section id → contextual facts; derived server-side as plain strings. */
  contextual: Record<string, QuickFact[]>;
  /** Section id → display label, for the contextual block's caption. */
  sectionLabels: Record<string, string>;
  showCompareCta: boolean;
}

/**
 * Right-rail "vitals" panel. Always-on model facts stay fixed while the
 * contextual block swaps to match the section in the reading zone. Receives
 * pre-formatted strings only — no data logic ships to the browser.
 */
export default function QuickFactsRail({
  alwaysOn,
  contextual,
  sectionLabels,
  showCompareCta,
}: QuickFactsRailProps) {
  const { activeId } = useActiveSection();
  const facts = activeId ? contextual[activeId] : undefined;
  const hasCapabilities = alwaysOn.capabilitiesSupported !== null;

  return (
    <div className="space-y-5 text-xs">
      <div className="flex items-center gap-1.5 text-[var(--text)] font-bold uppercase tracking-wider">
        <Activity size={13} className="text-[var(--accent)]" />
        <span>Vitals</span>
      </div>

      {/* Always-on facts */}
      <dl className="space-y-2.5">
        {alwaysOn.priceFrom && (
          <div>
            <dt className="text-[var(--muted)] font-medium">Price from</dt>
            <dd className="font-mono tabular-nums font-bold text-[var(--accent)] mt-0.5 break-words">
              {alwaysOn.priceFrom}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-[var(--muted)] font-medium">Context window</dt>
          <dd className="font-mono tabular-nums font-bold text-[var(--text)] mt-0.5 break-words">
            {alwaysOn.contextWindow}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)] font-medium">Parameters</dt>
          <dd className="font-bold text-[var(--text)] mt-0.5 break-words">
            {alwaysOn.parameters}
          </dd>
        </div>
        {hasCapabilities && (
          <div>
            <dt className="text-[var(--muted)] font-medium">Capabilities</dt>
            <dd className="font-bold text-[var(--text)] mt-0.5">
              {alwaysOn.capabilitiesSupported} of {alwaysOn.capabilitiesTotal} supported
            </dd>
          </div>
        )}
      </dl>

      {/* Contextual block — keyed remount drives the fade swap */}
      {facts && facts.length > 0 && (
        <div
          key={activeId}
          className="fact-swap p-3 rounded-[var(--radius-control)] bg-[var(--accent-soft)]/15 border border-[var(--accent)]/20 space-y-2"
          aria-live="polite"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
            {activeId ? sectionLabels[activeId] ?? "Details" : "Details"}
          </p>
          <dl className="space-y-1.5">
            {facts.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-2">
                <dt className="text-[var(--muted)] font-medium shrink-0">{fact.label}</dt>
                <dd className="font-mono tabular-nums font-bold text-[var(--text)] text-right">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {showCompareCta && (
        <a
          href="#comparable-models"
          className="block text-center px-3 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-white font-bold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          Compare models
        </a>
      )}
    </div>
  );
}
