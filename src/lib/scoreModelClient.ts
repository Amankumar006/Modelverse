/**
 * src/lib/scoreModelClient.ts
 *
 * Client-safe quality scoring mirror for real-time validation in the Admin Editor.
 * Evaluates live changes as curators edit fields without needing network round-trips.
 */

import { type ModelEntry, type Benchmark } from "./models";

export interface QualityEvaluation {
  score: number;
  status: "indexed" | "thin";
  reasons: string[];
  breakdown: {
    metadata: { score: number; max: number; passed: boolean };
    benchmarks: { score: number; max: number; passed: boolean; count: number };
    content: { score: number; max: number; passed: boolean };
    editorial: { score: number; max: number; passed: boolean };
    features: { score: number; max: number; passed: boolean };
  };
}

function hasValue(val: unknown): boolean {
  if (val === null || val === undefined) return false;
  if (typeof val === "string") return val.trim().length > 0 && val.trim().toLowerCase() !== "unknown";
  if (typeof val === "number") return !isNaN(val);
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return false;
}

function isValidUrl(str: unknown): boolean {
  if (typeof str !== "string") return false;
  return str.startsWith("http://") || str.startsWith("https://");
}

export function evaluateModelQualityClient(model: Partial<ModelEntry>): QualityEvaluation {
  const reasons: string[] = [];

  // 1. Metadata completeness (15 points)
  const reqFields = [
    { name: "Name", val: model.name },
    { name: "Developer", val: model.developer },
    { name: "Description", val: model.description },
    { name: "Release Date", val: model.releaseDate },
    { name: "Parameters", val: model.parameters },
    { name: "Context Window", val: model.contextWindow },
    { name: "License", val: model.license },
  ];
  const filledCount = reqFields.filter((f) => hasValue(f.val)).length;
  const metaScore = Math.round((15 * filledCount) / reqFields.length);
  const metaPassed = filledCount === reqFields.length;
  if (!metaPassed) {
    const missing = reqFields.filter((f) => !hasValue(f.val)).map((f) => f.name);
    reasons.push(`Incomplete metadata: missing ${missing.join(", ")}`);
  }

  // 2. Verified Benchmarks (35 points)
  const benchmarks: Benchmark[] = Array.isArray(model.benchmarks) ? model.benchmarks : [];
  const validBenchmarks = benchmarks.filter((b) => {
    const scoreVal = b.score !== undefined && b.score !== null ? String(b.score).trim() : "";
    const hasNum = /\d/.test(scoreVal);
    const hasName = typeof b.name === "string" && b.name.trim().length > 0;
    const hasCite = isValidUrl((b as unknown as { citation?: string; sourceUrl?: string; source?: string })?.citation || (b as unknown as { source?: string })?.source);
    return hasNum && hasName && hasCite;
  });

  let benchScore = 0;
  let benchPassed = false;
  if (validBenchmarks.length >= 2) {
    benchScore = 35;
    benchPassed = true;
  } else if (validBenchmarks.length === 1) {
    benchScore = 15;
    reasons.push("Only 1 verified numeric benchmark with citation (requires at least 2)");
  } else {
    reasons.push("Missing verified numeric benchmarks with citations (requires at least 2)");
  }

  // 3. Unique Content & Overview (20 points)
  const desc = (model.description || "").trim().toLowerCase();
  const pageOverview = (model.pageOverview || "").trim().toLowerCase();
  const cardSummary = (model.cardSummary || "").trim().toLowerCase();

  let contentScore = 0;
  let contentPassed = false;
  const uniqueDescriptions = new Set([desc, pageOverview, cardSummary].filter(Boolean));
  if (uniqueDescriptions.size > 1 && desc.length >= 100) {
    contentScore = 20;
    contentPassed = true;
  } else if (desc.length >= 100) {
    contentScore = 10;
    reasons.push("Description is duplicated or missing separate card summary / overview");
  } else {
    reasons.push("Description is too short (<100 characters)");
  }

  // 4. Editorial Context (15 points)
  const editorial = (model.editorialNote || "").trim();
  let editorialScore = 0;
  let editorialPassed = false;
  if (editorial.length >= 80) {
    editorialScore = 15;
    editorialPassed = true;
  } else {
    reasons.push("Missing or thin editorial note (<80 characters)");
  }

  // 5. Features and Resources (15 points)
  const features = Array.isArray(model.keyFeatures) ? model.keyFeatures : [];
  const sources = Array.isArray(model.sources) ? model.sources : [];
  const links = model.links && typeof model.links === "object" ? Object.values(model.links) : [];

  let featuresScore = 0;
  let featuresPassed = false;
  const hasValidLinks = sources.some(isValidUrl) || links.some(isValidUrl);
  const hasFeatures = features.filter((f) => typeof f === "string" && f.trim().length > 0).length >= 2;

  if (hasValidLinks && hasFeatures) {
    featuresScore = 15;
    featuresPassed = true;
  } else {
    if (!hasFeatures) reasons.push("Requires at least 2 structured key capabilities/features");
    if (!hasValidLinks) reasons.push("Requires at least 1 valid resource link or source citation");
  }

  const totalScore = Math.min(100, Math.max(0, metaScore + benchScore + contentScore + editorialScore + featuresScore));
  const isIndexed = totalScore >= 65 && validBenchmarks.length >= 2 && metaPassed;

  return {
    score: totalScore,
    status: isIndexed ? "indexed" : "thin",
    reasons,
    breakdown: {
      metadata: { score: metaScore, max: 15, passed: metaPassed },
      benchmarks: { score: benchScore, max: 35, passed: benchPassed, count: validBenchmarks.length },
      content: { score: contentScore, max: 20, passed: contentPassed },
      editorial: { score: editorialScore, max: 15, passed: editorialPassed },
      features: { score: featuresScore, max: 15, passed: featuresPassed },
    },
  };
}
