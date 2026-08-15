"use strict";

/**
 * Deterministic content-quality checks with cross-page structural template detection.
 * Enforces high-value publisher standards (Google AdSense / Helpful Content compliant).
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

function shingleSet(value, size = 4) {
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

// ─── Cross-Page Structural Template Detection ──────────────────────────────

const KNOWN_SYNTHETIC_TEMPLATES = [
  "is an advanced model by engineered for high performance",
  "delivers specialized capabilities across with a native context window of built by the architecture prioritizes low latency throughput dependable reasoning fidelity and flexible deployment across enterprise apis and local hardware environments",
  "represents a capable milestone in developed by it serves as an accessible open weight foundation balancing inference memory footprint response quality and multi domain reasoning recommended for developers evaluating modern frontier architectures for scalable production workloads",
  "representing a significant leap in designed for enterprise workloads with robust tooling and deterministic outputs",
].map((pattern) => shingleSet(pattern, 4));

function extractStructuralSkeleton(input, model = {}) {
  let val = text(input).toLowerCase();
  if (!val) return "";

  // Strip entity values so cross-page templates collapse into the same structure
  const entities = [
    model.name,
    model.slug,
    model.developer,
    model.family,
    model.parameters,
    model.contextWindow,
    model.license,
  ].map(text).filter(Boolean);

  for (const ent of entities) {
    if (ent.length >= 3) {
      const escaped = ent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      val = val.replace(new RegExp(`\\b${escaped}\\b`, "gi"), " <VAR> ");
    }
  }

  // Replace parameter numbers, token numbers, and percentages
  val = val
    .replace(/\b\d+(?:\.\d+)?\s*(?:[bBmMtT]|k|tokens?|parameters?)\b/gi, " <SPEC> ")
    .replace(/\b\d+(?:\.\d+)?%?\b/g, " <NUM> ")
    .replace(/[^a-z0-9<>]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return val;
}

function isStructuralBoilerplate(input, model = {}) {
  const str = text(input);
  if (!str || str.length < 50) return false;
  const currentShingles = shingleSet(extractStructuralSkeleton(str, model), 4);
  if (currentShingles.size === 0) return false;

  for (const templateShingles of KNOWN_SYNTHETIC_TEMPLATES) {
    if (jaccardSimilarity(currentShingles, templateShingles) >= 0.35) {
      return true;
    }
  }
  return false;
}

// ─── News Helpers ──────────────────────────────────────────────────────────

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
      // Invalid URLs handled below
    }
  }
  return domains;
}

function hasOriginalAnalysis(body) {
  const value = text(body);
  if (!value) return false;
  if (/^#{1,6}\s*(?:why (?:this|it) matters|analysis|context|our take)\b/im.test(value)) return true;

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

function benchmarkIsVerifiedAndSourced(entry, model) {
  if (!benchmarkIsNumeric(entry)) return false;

  // Check entry-level source citations
  if (entry.source && validHttpUrl(entry.source)) return true;
  if (Array.isArray(entry.sources) && entry.sources.some(validHttpUrl)) return true;

  // Check model-level verified confidence or source URLs
  const conf = model?.fieldConfidence?.benchmarks || model?.field_confidence?.benchmarks;
  if (conf === "VERIFIED" || conf === "OFFICIAL") return true;

  const modelSources = Array.isArray(model?.sources) ? model.sources : [];
  if (modelSources.some(validHttpUrl)) return true;

  const modelLinks = model?.links && typeof model.links === "object" ? Object.values(model.links) : [];
  if (modelLinks.some((l) => typeof l === "string" && validHttpUrl(l))) return true;

  return false;
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

function safeResult(fn, defaultStatus) {
  try {
    return fn();
  } catch {
    return { score: 0, status: defaultStatus, reasons: ["malformed input"] };
  }
}

// ─── Scorer: Model Pages ───────────────────────────────────────────────────

function scoreModelPage(model) {
  return safeResult(() => {
    const reasons = [];

    // 1. Required Metadata Completeness (up to 15 points)
    const isProprietary = model?.type === "closed-source" || model?.type === "api-only" || model?.license === "Proprietary";
    const paramsValue = populated(model?.parameters)
      ? model.parameters
      : (isProprietary && Boolean(text(model?.parameters)) ? model.parameters : null);

    const requiredFields = [
      ["parameters", paramsValue],
      ["context window", model?.contextWindow || model?.context_window],
      ["license", model?.license],
      ["developer", model?.developer],
      ["release date", model?.releaseDate || model?.release_date],
      ["description", model?.description],
    ];
    const filled = requiredFields.filter(([, value]) => populated(value)).length;
    let score = (15 * filled) / requiredFields.length;
    if (filled !== requiredFields.length) {
      reasons.push(`incomplete fields: ${requiredFields.filter(([, value]) => !populated(value)).map(([name]) => name).join(", ")}`);
    }

    // 2. Verified Numeric Benchmarks with Provenance (up to 35 points — mandatory for index eligibility)
    const verifiedBenchmarks = Array.isArray(model?.benchmarks)
      ? model.benchmarks.filter((b) => benchmarkIsVerifiedAndSourced(b, model)).length
      : 0;
    if (verifiedBenchmarks >= 2) {
      score += 35;
    } else if (verifiedBenchmarks === 1) {
      score += 15;
      reasons.push("only one verified numeric benchmark with citation");
    } else {
      reasons.push("missing verified numeric benchmarks with citations");
    }

    // 3. Unique Non-Templated Structural Content (up to 20 points)
    const pageOverview = text(model?.pageOverview || model?.page_overview);
    const cardSummary = text(model?.cardSummary || model?.card_summary);
    const poBoilerplate = isStructuralBoilerplate(pageOverview, model);
    const csBoilerplate = isStructuralBoilerplate(cardSummary, model);

    const uniqueTexts = new Set(modelTextFields(model).map((v) => v.replace(/\s+/g, " ").trim().toLowerCase()));

    if (poBoilerplate || csBoilerplate) {
      reasons.push("templated / boilerplate structural text detected");
    } else if (uniqueTexts.size > 1) {
      score += 20;
    } else {
      reasons.push("description duplicated across sections");
    }

    // 4. Genuine Reviewed Editorial Note (up to 15 points)
    const editorialNote = text(model?.editorialNote || model?.editorial_note || model?.reviewedNote);
    const enBoilerplate = isStructuralBoilerplate(editorialNote, model);

    if (enBoilerplate) {
      reasons.push("templated / boilerplate editorial note");
    } else if (editorialNote.length > 150) {
      score += 15;
    } else {
      reasons.push("missing genuine editorial note");
    }

    // 5. Resource Links & Structured Key Features (up to 15 points)
    const hasLinks = (model?.links && Object.keys(model.links).length > 0) || (Array.isArray(model?.sources) && model.sources.length > 0);
    const keyFeatures = model?.keyFeatures || model?.key_features;
    const hasFeatures = Array.isArray(keyFeatures) && keyFeatures.length >= 2;

    if (hasLinks && hasFeatures) {
      score += 15;
    } else {
      reasons.push("lacks verified resource links or structured key features");
    }

    // Comparison integrity check
    if (comparisonHasOwnPlaceholder(model)) {
      score = Math.max(0, score - 15);
      reasons.push("comparison row has placeholder values");
    }

    score = Math.round(Math.max(0, Math.min(100, score)));

    // Index gate: must score >= 65 AND have at least 2 verified benchmarks AND no boilerplate
    const isIndexed = score >= 65 && verifiedBenchmarks >= 2 && !poBoilerplate && !enBoilerplate;
    return { score, status: isIndexed ? "indexed" : "thin", reasons };
  }, "thin");
}

// ─── Scorer: News Articles ─────────────────────────────────────────────────

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
  extractStructuralSkeleton,
  isStructuralBoilerplate,
};
