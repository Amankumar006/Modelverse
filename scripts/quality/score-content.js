"use strict";

/**
 * Deterministic content-quality checks. Keep these dependency-free: ingestion
 * runs them for every item and they must never make a network or LLM request.
 * The n-gram comparison can later be replaced with an embedding similarity
 * check without changing the callers.
 */

const PLACEHOLDERS = new Set(["", "-", "—", "unknown", "undisclosed", "n/a", "null"]);

function text(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function populated(value) {
  const normalized = text(value).toLowerCase();
  return Boolean(normalized) && !PLACEHOLDERS.has(normalized);
}

function words(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(Boolean);
}

function shingleSet(value, size = 5) {
  const tokens = words(value);
  const shingles = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    shingles.add(tokens.slice(index, index + size).join(" "));
  }
  return shingles;
}

function jaccardSimilarity(left, right) {
  const leftSet = left instanceof Set ? left : shingleSet(left);
  const rightSet = right instanceof Set ? right : shingleSet(right);
  if (leftSet.size === 0 || rightSet.size === 0) return 0;
  let intersection = 0;
  for (const token of leftSet) if (rightSet.has(token)) intersection += 1;
  return intersection / (leftSet.size + rightSet.size - intersection);
}

function toSourceUrls(article) {
  const candidates = [article?.sources, article?.externalSources, article?.external_sources];
  const urls = [];
  for (const sourceList of candidates) {
    if (!Array.isArray(sourceList)) continue;
    for (const entry of sourceList) {
      const url = typeof entry === "string" ? entry : entry?.url;
      if (typeof url === "string" && url.trim()) urls.push(url.trim());
    }
  }
  return [...new Set(urls)];
}

function validHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function sourceDomains(urls) {
  const domains = new Set();
  for (const url of urls) {
    try {
      domains.add(new URL(url).hostname.replace(/^www\./, "").toLowerCase());
    } catch {
      // Invalid URLs are scored as absent source attribution below.
    }
  }
  return domains;
}

function hasOriginalAnalysis(body) {
  const value = text(body);
  if (!value) return false;
  if (/^#{1,6}\s*(?:why (?:this|it) matters|analysis|context|our take)\b/im.test(value)) return true;

  // A reflective paragraph without dates/numeric claims is a conservative
  // fallback for editorial analysis that does not use a markdown heading.
  return value.split(/\n\s*\n/).some((paragraph) => {
    const normalized = text(paragraph);
    return normalized.length >= 180
      && !/\b\d+(?:[.,]\d+)?(?:%|\b)/.test(normalized)
      && /\b(?:signals|suggests|means|could|likely|implication|trade-?off|context|for developers|for teams)\b/i.test(normalized);
  });
}

function benchmarkIsNumeric(entry) {
  if (!entry || !populated(entry.score)) return false;
  const score = typeof entry.score === "number" ? entry.score : Number(String(entry.score).replace(/[%,$]/g, ""));
  return Number.isFinite(score);
}

function modelTextFields(model) {
  return [
    model?.description,
    model?.cardSummary,
    model?.pageOverview,
    model?.descriptionDraft,
    model?.editorialNote,
  ].map(text).filter(Boolean);
}

function comparisonHasOwnPlaceholder(model) {
  const rows = model?.comparableModels || model?.comparisons || model?.comparisonTable;
  if (!Array.isArray(rows)) return false;
  const ownRow = rows.find((row) => row?.slug === model?.slug || row?.id === model?.id || row?.name === model?.name);
  if (!ownRow || typeof ownRow !== "object") return false;
  return Object.entries(ownRow)
    .filter(([key]) => !["slug", "id", "name", "model"].includes(key))
    .some(([, value]) => !populated(value));
}

function safeResult(fn, indexedStatus) {
  try {
    return fn();
  } catch {
    return { score: 0, status: indexedStatus, reasons: ["malformed input"] };
  }
}

function scoreModelPage(model) {
  return safeResult(() => {
    const reasons = [];
    const requiredFields = [
      ["parameters", model?.parameters],
      ["context window", model?.contextWindow],
      ["license", model?.license],
      ["developer", model?.developer],
      ["release date", model?.releaseDate],
      ["description", model?.description],
    ];
    const filled = requiredFields.filter(([, value]) => populated(value)).length;
    let score = (30 * filled) / requiredFields.length;
    if (filled !== requiredFields.length) reasons.push(`incomplete fields: ${requiredFields.filter(([, value]) => !populated(value)).map(([name]) => name).join(", ")}`);

    const uniqueTexts = new Set(modelTextFields(model).map((value) => value.replace(/\s+/g, " ").trim().toLowerCase()));
    if (uniqueTexts.size <= 1) {
      reasons.push("description duplicated across sections");
    } else {
      score += 25;
    }

    const numericBenchmarks = Array.isArray(model?.benchmarks) ? model.benchmarks.filter(benchmarkIsNumeric).length : 0;
    if (numericBenchmarks >= 2) score += 20;
    else if (numericBenchmarks === 1) {
      score += 10;
      reasons.push("only one numeric benchmark");
    } else reasons.push("missing numeric benchmarks");

    if (comparisonHasOwnPlaceholder(model)) {
      reasons.push("comparison row has placeholder values");
    } else {
      score += 15;
    }

    const editorialNote = text(model?.editorialNote || model?.reviewedNote);
    if (editorialNote.length > 150) score += 10;
    else reasons.push("missing reviewed editorial note");

    score = Math.round(Math.max(0, Math.min(100, score)));
    return { score, status: score >= 65 ? "indexed" : "thin", reasons };
  }, "thin");
}

function scoreNewsArticle(article, sourceTexts) {
  return safeResult(() => {
    const reasons = [];
    const body = text(article?.body);
    let score = 0;
    const sources = Array.isArray(sourceTexts) ? sourceTexts.filter((entry) => typeof entry === "string" && entry.trim()) : [];
    const bodyShingles = shingleSet(body);
    const maxSimilarity = sources.reduce((max, sourceText) => Math.max(max, jaccardSimilarity(bodyShingles, shingleSet(sourceText))), 0);
    if (sources.length === 0) reasons.push("source text unavailable for originality check");
    else if (body && maxSimilarity <= 0.55) score += 35;
    else reasons.push("too close to source");

    if (hasOriginalAnalysis(body)) score += 25;
    else reasons.push("no original analysis section");

    const urls = toSourceUrls(article);
    const validUrls = urls.filter(validHttpUrl);
    if (validUrls.length) score += 15;
    else reasons.push("missing valid source attribution");

    if (sourceDomains(validUrls).size > 1) score += 15;
    else reasons.push("not a multi-source synthesis");

    if (words(body).length >= 120) score += 10;
    else reasons.push("below editorial length floor");

    score = Math.round(Math.max(0, Math.min(100, score)));
    return { score, status: score >= 55 ? "indexed" : "unlisted", reasons };
  }, "unlisted");
}

module.exports = {
  scoreModelPage,
  scoreNewsArticle,
  shingleSet,
  jaccardSimilarity,
};
