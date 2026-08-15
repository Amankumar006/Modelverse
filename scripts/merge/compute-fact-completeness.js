"use strict";

/**
 * scripts/merge/compute-fact-completeness.js
 *
 * Precondition gate for editorial generation.
 * Evaluates verified facts (provenance tiers 'VERIFIED' and 'OFFICIAL').
 *
 * Hard Gate:
 * A model is ELIGIBLE for editorial LLM spend only if:
 * 1. verifiedFactCount >= 2
 * 2. verifiedBenchmarksCount >= 1 (at least 1 verified numeric benchmark with provenance)
 *
 * This prevents wasted LLM API calls on models that cannot pass the provenance gate.
 */

const TRUSTED_TIERS = new Set(["VERIFIED", "OFFICIAL"]);
const PLACEHOLDERS = new Set(["", "-", "—", "unknown", "undisclosed", "n/a", "null"]);

function isPopulated(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") {
    const trimmed = val.trim().toLowerCase();
    return Boolean(trimmed) && !PLACEHOLDERS.has(trimmed);
  }
  if (typeof val === "number") return Number.isFinite(val);
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return false;
}

/**
 * Evaluates factual completeness and gate eligibility for a model row.
 *
 * @param {object} model - Model record from Supabase / memory
 * @returns {{
 *   eligible: boolean,
 *   verifiedFactCount: number,
 *   verifiedBenchmarksCount: number,
 *   verifiedFacts: object,
 *   reasons: string[]
 * }}
 */
function computeFactCompleteness(model) {
  if (!model || typeof model !== "object") {
    return {
      eligible: false,
      verifiedFactCount: 0,
      verifiedBenchmarksCount: 0,
      verifiedFacts: {},
      reasons: ["Invalid model input"],
    };
  }

  const fieldConfidence = model.field_confidence || model.fieldConfidence || {};
  const reasons = [];
  const verifiedFacts = {};

  // 1. Benchmarks check
  const benchmarks = Array.isArray(model.benchmarks) ? model.benchmarks : [];
  const verifiedBenchmarks = benchmarks.filter((b) => {
    if (!b || typeof b !== "object") return false;
    const score = typeof b.score === "number" ? b.score : parseFloat(String(b.score).replace(/[%,$]/g, ""));
    const hasScore = Number.isFinite(score);
    const hasSources = (Array.isArray(b.sources) && b.sources.length > 0) || (typeof b.source === "string" && b.source.startsWith("http"));
    const isConfTrusted = TRUSTED_TIERS.has(fieldConfidence.benchmarks);
    return hasScore && hasSources && (b.verified || isConfTrusted);
  });

  const verifiedBenchmarksCount = verifiedBenchmarks.length;
  if (verifiedBenchmarksCount > 0) {
    verifiedFacts.benchmarks = verifiedBenchmarks;
  }

  // 2. Pricing check
  if (isPopulated(model.pricing) && TRUSTED_TIERS.has(fieldConfidence.pricing)) {
    verifiedFacts.pricing = model.pricing;
  }

  // 3. Context Window check
  const contextWindow = model.context_window || model.contextWindow;
  if (isPopulated(contextWindow) && TRUSTED_TIERS.has(fieldConfidence.contextWindow)) {
    verifiedFacts.contextWindow = contextWindow;
  }

  // 4. Parameters check
  const parameters = model.parameters;
  if (isPopulated(parameters) && TRUSTED_TIERS.has(fieldConfidence.parameters)) {
    verifiedFacts.parameters = parameters;
  }

  // 5. License check
  const license = model.license;
  if (isPopulated(license) && TRUSTED_TIERS.has(fieldConfidence.license)) {
    verifiedFacts.license = license;
  }

  // 6. Hugging Face Hub / official repo verification
  if (TRUSTED_TIERS.has(fieldConfidence.hfHub) || TRUSTED_TIERS.has(fieldConfidence.hf_hub)) {
    verifiedFacts.hfHub = true;
  }

  const verifiedFactCount = Object.keys(verifiedFacts).length;

  if (verifiedFactCount < 2) {
    reasons.push(`Insufficient verified facts (found ${verifiedFactCount}, requires >= 2)`);
  }
  if (verifiedBenchmarksCount < 1) {
    reasons.push("Missing at least one verified numeric benchmark with substantiated citation");
  }

  const eligible = verifiedFactCount >= 2 && verifiedBenchmarksCount >= 1;

  return {
    eligible,
    verifiedFactCount,
    verifiedBenchmarksCount,
    verifiedFacts,
    reasons,
  };
}

module.exports = {
  computeFactCompleteness,
  TRUSTED_TIERS,
};
