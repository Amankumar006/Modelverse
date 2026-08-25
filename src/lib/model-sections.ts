/* ------------------------------------------------------------------ */
/*  Pure helpers describing the /models/[slug] page structure          */
/*                                                                     */
/*  React-free and side-effect-free so both server components and      */
/*  assert-based test scripts can consume them (see                    */
/*  tests/model-facts.test.js).                                        */
/*                                                                     */
/*  Value imports must stay limited to pure modules — this file is     */
/*  also imported (type-only) by client islands.                       */
/* ------------------------------------------------------------------ */

import { normalizePricing } from "./model-normalization";
import { formatParameters } from "./model-format";
import type { Benchmark, ModelEntry, ModelEvidence } from "./models";

export interface SectionMeta {
  /** Anchor target id — MUST match the rendered section ids verbatim (SEO deep links). */
  id: string;
  label: string;
}

export interface SectionGroup {
  title: "Understand" | "Evaluate" | "Reference";
  items: SectionMeta[];
}

export interface SectionAvailabilityFlags {
  hasKeyFeatures: boolean;
  hasEditorial: boolean;
  hasComparable: boolean;
  hasQuickstart: boolean;
  hasCustomSections: boolean;
  hasReadme: boolean;
  hasEvidence: boolean;
  hasSources: boolean;
}

/**
 * Build the tiered navigator structure for a model page, omitting sections
 * whose content flag is false so no nav entry ever points at a missing
 * anchor. Order defines reading order: Understand → Evaluate → Reference.
 */
export function buildSectionGroups(flags: SectionAvailabilityFlags): SectionGroup[] {
  const understand: SectionMeta[] = [
    { id: "overview", label: "Overview" },
    ...(flags.hasKeyFeatures ? [{ id: "key-features", label: "Key features" }] : []),
    ...(flags.hasEditorial ? [{ id: "editorial-analysis", label: "Editorial analysis" }] : []),
  ];

  const evaluate: SectionMeta[] = [
    { id: "lineage-spec", label: "Lineage & specs" },
    { id: "capabilities", label: "Capabilities" },
    ...(flags.hasComparable ? [{ id: "comparable-models", label: "Comparable models" }] : []),
    { id: "benchmarks", label: "Benchmarks" },
    { id: "pricing", label: "API pricing" },
    ...(flags.hasQuickstart ? [{ id: "getting-started", label: "Getting started" }] : []),
  ];

  const reference: SectionMeta[] = [
    ...(flags.hasCustomSections ? [{ id: "custom-sections", label: "Integration guides" }] : []),
    ...(flags.hasReadme ? [{ id: "readme-docs", label: "Technical readme" }] : []),
    ...(flags.hasEvidence ? [{ id: "provenance", label: "Verified citations" }] : []),
    ...(flags.hasSources ? [{ id: "sources", label: "Sources" }] : []),
  ];

  // Annotated before .filter() — chaining would lose the contextual literal
  // type on `title` and widen it to string.
  const groups: SectionGroup[] = [
    { title: "Understand", items: understand },
    { title: "Evaluate", items: evaluate },
    { title: "Reference", items: reference },
  ];
  return groups.filter((group) => group.items.length > 0);
}

/** Flatten groups into the ordered section list used by the spy + chip bar. */
export function flattenSections(groups: SectionGroup[]): SectionMeta[] {
  return groups.flatMap((group) => group.items);
}

/* ------------------------------------------------------------------ */
/*  Capability taxonomy (13-key) — shared by the capabilities matrix   */
/*  and the quick-facts rail. Icons stay in the component; this is     */
/*  the data-only source of truth.                                     */
/* ------------------------------------------------------------------ */

export type CapabilityCategory = "Core Intelligence" | "Multimodal" | "Developer & System";

export interface CapabilityDefinition {
  key: string;
  title: string;
  category: CapabilityCategory;
  description: string;
}

export const CAPABILITY_CATEGORIES: CapabilityCategory[] = [
  "Core Intelligence",
  "Multimodal",
  "Developer & System",
];

export const CAPABILITY_TAXONOMY: CapabilityDefinition[] = [
  { key: "reasoning", title: "Deep Reasoning & CoT", category: "Core Intelligence", description: "Multi-step chain-of-thought and verifiable problem solving" },
  { key: "tool_calling", title: "Tool & Function Calling", category: "Developer & System", description: "Invokes external APIs, custom tools, and function definitions" },
  { key: "vision_input", title: "Vision & Image Input", category: "Multimodal", description: "Native high-resolution visual document, chart, and photo parsing" },
  { key: "structured_outputs", title: "Strict JSON Schema", category: "Developer & System", description: "Guaranteed JSON schema output compliance and typed payloads" },
  { key: "web_search", title: "Web Grounding & Search", category: "Core Intelligence", description: "Live internet query retrieval and citation verification" },
  { key: "prompt_caching", title: "Prompt Prefix Caching", category: "Developer & System", description: "Low-latency prompt caching for repeated context prefixes" },
  { key: "fine_tuning", title: "Fine-Tuning & LoRA", category: "Developer & System", description: "Custom adapter weights, LoRA, and domain fine-tuning support" },
  { key: "image_generation", title: "Image Synthesis", category: "Multimodal", description: "Direct raster diffusion / generative visual image rendering" },
  { key: "audio_input", title: "Audio & Speech Input", category: "Multimodal", description: "Direct speech, voice note, and raw audio understanding" },
  { key: "audio_output", title: "Voice & Audio Synthesis", category: "Multimodal", description: "Real-time streaming text-to-speech and expressive voice output" },
  { key: "computer_use", title: "Computer & OS Control", category: "Core Intelligence", description: "Direct desktop GUI control, mouse actions, and OS interaction" },
  { key: "video_input", title: "Video Stream Processing", category: "Multimodal", description: "Continuous frame sequence and video timeline ingestion" },
  { key: "batch", title: "Batch API Processing", category: "Developer & System", description: "Asynchronous 50% discount batch queue throughput" },
];

export interface CapabilityGroupSummary {
  category: CapabilityCategory;
  supported: number;
  total: number;
}

/** Per-category supported/total counts, in canonical category order. */
export function groupCapabilities(
  capabilities?: Record<string, boolean>
): CapabilityGroupSummary[] {
  return CAPABILITY_CATEGORIES.map((category) => {
    const defs = CAPABILITY_TAXONOMY.filter((d) => d.category === category);
    return {
      category,
      supported: defs.filter((d) => Boolean(capabilities?.[d.key])).length,
      total: defs.length,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Quick facts — derived server-side, shipped to the rail as          */
/*  pre-formatted serializable strings so the client island stays dumb. */
/* ------------------------------------------------------------------ */

export interface AlwaysOnFacts {
  /** Cheapest non-cached token rate, e.g. "$3.00 / 1M input tokens"; null when unpriced. */
  priceFrom: string | null;
  contextWindow: string;
  parameters: string;
  /** Supported count across the taxonomy; null when no capability record exists. */
  capabilitiesSupported: number | null;
  capabilitiesTotal: number;
}

function formatMoney(amount: number): string {
  // Matches the pricing table's precision convention (sub-cent rates keep 4 dp).
  return `$${amount.toFixed(amount < 0.01 ? 4 : 2)}`;
}

// Mirrors the hero tile's context-window rendering; promoted here so the
// rail and strip share one implementation.
function formatContextWindow(cw: string | Record<string, unknown> | undefined): string {
  if (cw && typeof cw === "object") {
    const native = (cw as { native?: number }).native;
    if (typeof native === "number" && native > 0) {
      return `${native.toLocaleString("en-US")} tokens`;
    }
    return JSON.stringify(cw);
  }
  return cw || "Undisclosed";
}

export function deriveAlwaysOnFacts(model: ModelEntry): AlwaysOnFacts {
  const items = normalizePricing(model.pricing).filter(
    (item) => !item.unit.toLowerCase().includes("cached")
  );
  let cheapest: { amount: number; unit: string } | undefined;
  for (const item of items) {
    if (!cheapest || item.amount < cheapest.amount) cheapest = item;
  }
  const priceFrom = cheapest
    ? `${formatMoney(cheapest.amount)} / ${cheapest.unit}`
    : null;

  const hasCapabilityRecord =
    Boolean(model.capabilities) && Object.keys(model.capabilities ?? {}).length > 0;

  return {
    priceFrom,
    contextWindow: formatContextWindow(model.contextWindow),
    parameters: formatParameters(model),
    capabilitiesSupported: hasCapabilityRecord
      ? Object.values(model.capabilities ?? {}).filter(Boolean).length
      : null,
    capabilitiesTotal: CAPABILITY_TAXONOMY.length,
  };
}

export interface QuickFact {
  label: string;
  value: string;
}

export interface TopBenchmark {
  name: string;
  score: string;
}

function numericScore(score: string | number): number | null {
  if (typeof score === "number") return Number.isFinite(score) ? score : null;
  if (typeof score === "string" && score.trim() !== "" && !isNaN(parseFloat(score))) {
    return parseFloat(score);
  }
  return null;
}

function formatScore(score: number): string {
  // Trim float noise (84.50000001 → "84.5") without padding small scores.
  return String(parseFloat(score.toPrecision(6)));
}

/**
 * Highest verified performance benchmarks, best first. Falls back to any
 * verified numeric benchmark only when the model publishes no verified
 * performance-typed ones — never mixes unverified rows in.
 */
export function deriveTopBenchmarks(benchmarks: Benchmark[] | undefined, limit = 3): TopBenchmark[] {
  const scored = (benchmarks ?? [])
    .map((b) => ({ b, score: numericScore(b.score) }))
    .filter((x): x is { b: Benchmark; score: number } => x.score !== null && x.b.verified);

  let pool = scored.filter((x) => x.b.metricType === "performance");
  if (pool.length === 0) pool = scored;

  return pool
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => ({ name: x.b.name, score: formatScore(x.score) }));
}

export interface PricingHighlights {
  input: QuickFact | null;
  output: QuickFact | null;
  /** Used when the model publishes a single blended per-token rate. */
  blended: QuickFact | null;
}

/** Cheapest input/output rates from normalized pricing; cached-hit rows excluded. */
export function derivePricingHighlights(rawPricing: unknown): PricingHighlights {
  type PricingItem = ReturnType<typeof normalizePricing>[number];
  const items = normalizePricing(rawPricing).filter(
    (item) => !item.unit.toLowerCase().includes("cached")
  );

  let input: PricingItem | undefined;
  let output: PricingItem | undefined;
  let blended: PricingItem | undefined;

  for (const item of items) {
    const unit = item.unit.toLowerCase();
    if (unit.includes("input")) {
      if (!input || item.amount < input.amount) input = item;
    } else if (unit.includes("output")) {
      if (!output || item.amount < output.amount) output = item;
    } else if (!blended || item.amount < blended.amount) {
      blended = item;
    }
  }

  const toFact = (item: PricingItem): QuickFact => ({
    label: `Cheapest ${unitWord(item.unit)}`,
    value: `${formatMoney(item.amount)} / ${item.unit}`,
  });

  return {
    input: input ? toFact(input) : null,
    output: output ? toFact(output) : null,
    blended: !input && !output && blended ? toFact(blended) : null,
  };
}

function unitWord(unit: string): string {
  const u = unit.toLowerCase();
  if (u.includes("output")) return "output";
  if (u.includes("input")) return "input";
  return "rate";
}

/** Per-section contextual facts keyed by section id; absent keys render nothing. */
export function deriveContextualFacts(
  model: ModelEntry,
  evidence: ModelEvidence[]
): Record<string, QuickFact[]> {
  const facts: Record<string, QuickFact[]> = {};

  const topBenchmarks = deriveTopBenchmarks(model.benchmarks);
  if (topBenchmarks.length > 0) {
    facts.benchmarks = topBenchmarks.map((b) => ({ label: b.name, value: b.score }));
  }

  const pricingHighlights = derivePricingHighlights(model.pricing);
  const pricingFacts = [pricingHighlights.input, pricingHighlights.output, pricingHighlights.blended].filter(
    (f): f is QuickFact => f !== null
  );
  if (pricingFacts.length > 0) facts.pricing = pricingFacts;

  if (
    Boolean(model.capabilities) &&
    Object.keys(model.capabilities ?? {}).length > 0
  ) {
    const supported = Object.values(model.capabilities ?? {}).filter(Boolean).length;
    facts.capabilities = [
      { label: "Supported", value: `${supported} of ${CAPABILITY_TAXONOMY.length}` },
    ];
  }

  if (model.releaseDate) {
    const lineageFacts: QuickFact[] = [];
    const released = new Date(
      `${model.releaseDate}T00:00:00Z`
    ).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
    if (!isNaN(new Date(`${model.releaseDate}T00:00:00Z`).getTime())) {
      lineageFacts.push({ label: "Released", value: released });
    }
    if (model.previousVersion) {
      lineageFacts.push({ label: "Previous version", value: model.previousVersion });
    }
    if (lineageFacts.length > 0) facts["lineage-spec"] = lineageFacts;
  }

  if (evidence.length > 0) {
    const official = evidence.filter((e) => e.confidence === "OFFICIAL").length;
    const verified = evidence.filter((e) => e.confidence === "VERIFIED").length;
    facts.provenance = [
      { label: "Evidence records", value: String(evidence.length) },
      ...(official > 0 ? [{ label: "Official sources", value: String(official) }] : []),
      ...(verified > 0 ? [{ label: "Independently verified", value: String(verified) }] : []),
    ];
  }

  return facts;
}

