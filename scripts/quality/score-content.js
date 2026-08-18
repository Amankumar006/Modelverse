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
  if (entry.citation && validHttpUrl(entry.citation)) return true;
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

    // 1. Identity Completeness (max 10)
    const identityFields = [
      ["name", model?.name],
      ["slug", model?.slug],
      ["developer", model?.developer],
      ["release date", model?.releaseDate || model?.release_date],
      ["license", model?.license],
    ];
    const identityFilled = identityFields.filter(([, value]) => populated(value)).length;
    const identityScore = Math.round((10 * identityFilled) / identityFields.length);
    if (identityFilled !== identityFields.length) {
      reasons.push(`missing identity fields: ${identityFields.filter(([, value]) => !populated(value)).map(([name]) => name).join(", ")}`);
    }

    // 2. Specifications Completeness (max 10)
    const isProprietary = model?.type === "closed-source" || model?.type === "api-only" || model?.license === "Proprietary";
    const paramsValue = populated(model?.parameters)
      ? model.parameters
      : (isProprietary && Boolean(text(model?.parameters)) ? model.parameters : null);

    const specFields = [
      ["parameters", paramsValue],
      ["context window", model?.contextWindow || model?.context_window],
      ["modality", Array.isArray(model?.modality) ? model.modality.length : model?.modality],
      ["deployment", Array.isArray(model?.deployment) ? model.deployment.length : model?.deployment],
      ["primary task", model?.primaryTask || model?.primary_task],
    ];
    const specFilled = specFields.filter(([, value]) => populated(value)).length;
    const specScore = Math.round((10 * specFilled) / specFields.length);
    if (specFilled !== specFields.length) {
      reasons.push(`incomplete specifications: ${specFields.filter(([, value]) => !populated(value)).map(([name]) => name).join(", ")}`);
    }

    // 3. Lineage & Ancestry (max 8)
    let lineageScore = 0;
    if (populated(model?.family)) lineageScore += 3;
    if (populated(model?.tier)) lineageScore += 2;
    if (populated(model?.previousVersion || model?.previous_version || model?.baseModel || model?.base_model)) lineageScore += 3;

    // 4. Content & Unique Architecture Overview (max 15)
    const pageOverview = text(model?.pageOverview || model?.page_overview);
    const cardSummary = text(model?.cardSummary || model?.card_summary);
    const description = text(model?.description);
    const poBoilerplate = isStructuralBoilerplate(pageOverview, model);
    const csBoilerplate = isStructuralBoilerplate(cardSummary, model);

    const uniqueTexts = new Set(modelTextFields(model).map((v) => v.replace(/\s+/g, " ").trim().toLowerCase()));
    let contentScore = 0;

    if (poBoilerplate || csBoilerplate) {
      reasons.push("templated / boilerplate structural text detected");
    } else {
      if (description.length > 50) contentScore += 5;
      if (cardSummary.length > 30) contentScore += 4;
      if (pageOverview.length > 100) contentScore += 6;
      if (uniqueTexts.size <= 1 && description.length > 0) {
        contentScore = Math.max(3, contentScore - 5);
        reasons.push("description duplicated across sections");
      }
    }

    // 5. Getting Started & Integration Guides (max 12)
    const quickstart = model?.quickstart || model?.metadata?.quickstart;
    const customSections = model?.customSections || model?.custom_sections || model?.metadata?.custom_sections;
    let gettingStartedScore = 0;
    if (quickstart && typeof quickstart === "object") {
      const codeLangs = Object.keys(quickstart).filter((k) => !["overview", "prerequisites", "installation", "environment", "env"].includes(k));
      if (codeLangs.length >= 2) gettingStartedScore += 8;
      else if (codeLangs.length >= 1) gettingStartedScore += 5;
      if (quickstart.overview || quickstart.prerequisites || quickstart.installation) gettingStartedScore += 2;
    }
    if (Array.isArray(customSections) && customSections.length > 0) {
      gettingStartedScore = Math.min(12, gettingStartedScore + 2);
    }

    // 6. Verified Numeric Performance Benchmarks with Provenance (max 15 — mandatory for index eligibility)
    const rawBenchmarks = Array.isArray(model?.benchmarks) ? model.benchmarks : [];
    
    let performanceBenchmarkCount = 0;
    let technicalMetricCount = 0;
    let economicMetricCount = 0;
    let rankingMetricCount = 0;
    let availabilityMetricCount = 0;

    for (const b of rawBenchmarks) {
      const metricType = String(b?.metricType || "performance").toLowerCase().trim();
      const isVerifiedAndSourced = benchmarkIsVerifiedAndSourced(b, model);

      if (metricType === "performance") {
        if (isVerifiedAndSourced) {
          performanceBenchmarkCount++;
        }
      } else if (metricType === "technical") {
        technicalMetricCount++;
      } else if (metricType === "economic") {
        economicMetricCount++;
      } else if (metricType === "ranking") {
        rankingMetricCount++;
      } else if (metricType === "availability") {
        availabilityMetricCount++;
      }
    }

    const meetsTwoPerformanceBenchmarkGate = performanceBenchmarkCount >= 2;

    let benchmarkScore = 0;
    if (performanceBenchmarkCount >= 4) {
      benchmarkScore = 15;
    } else if (performanceBenchmarkCount >= 2) {
      benchmarkScore = 12;
    } else if (performanceBenchmarkCount === 1) {
      benchmarkScore = 6;
      reasons.push("only one verified numeric performance benchmark with citation (requires at least 2)");
    } else {
      reasons.push("missing verified numeric performance benchmarks with citations (requires at least 2 performance benchmarks)");
    }

    // 7. Pricing & Commercial Transparency (max 8)
    const pricing = model?.pricing;
    let pricingScore = 0;
    if (Array.isArray(pricing) && pricing.length > 0) {
      pricingScore = 8;
    } else if (pricing && typeof pricing === "object" && Object.keys(pricing).length > 0) {
      pricingScore = 6;
    } else if (model?.type === "open-source" || model?.type === "open-weights") {
      pricingScore = 8; // Open weights models get full transparency points
    }

    // 8. Sources & Provenance Attribution (max 10)
    const sources = Array.isArray(model?.sources) ? model.sources.filter(validHttpUrl) : [];
    const links = model?.links && typeof model.links === "object" ? Object.values(model.links).filter((l) => typeof l === "string" && validHttpUrl(l)) : [];
    let sourcesScore = 0;
    const totalSources = sources.length + links.length;
    if (totalSources >= 3) sourcesScore = 10;
    else if (totalSources >= 1) sourcesScore = 6;
    else reasons.push("lacks verified resource links and source citations");

    // 9. Genuine Reviewed Editorial Note (max 8)
    const editorialNote = text(model?.editorialNote || model?.editorial_note || model?.reviewedNote);
    const enBoilerplate = isStructuralBoilerplate(editorialNote, model);
    let editorialScore = 0;

    if (enBoilerplate) {
      reasons.push("templated / boilerplate editorial note");
    } else if (editorialNote.length > 150) {
      editorialScore = 8;
    } else if (editorialNote.length > 50) {
      editorialScore = 4;
    } else {
      reasons.push("missing genuine editorial note");
    }

    // 10. UI Completeness & Structured Key Features (max 4)
    const keyFeatures = model?.keyFeatures || model?.key_features;
    const hasFeatures = Array.isArray(keyFeatures) && keyFeatures.length >= 2;
    let uiScore = 0;
    if (hasFeatures) uiScore += 2;
    if (Array.isArray(model?.tags) && model.tags.length >= 2) uiScore += 2;

    // Comparison integrity penalty
    if (comparisonHasOwnPlaceholder(model)) {
      reasons.push("comparison row has placeholder values");
      uiScore = Math.max(0, uiScore - 4);
    }

    let score = identityScore + specScore + lineageScore + contentScore + gettingStartedScore + benchmarkScore + pricingScore + sourcesScore + editorialScore + uiScore;
    score = Math.round(Math.max(0, Math.min(100, score)));

    const breakdown = {
      identity: identityScore,
      specifications: specScore,
      lineage: lineageScore,
      content: contentScore,
      gettingStarted: gettingStartedScore,
      benchmarks: benchmarkScore,
      pricing: pricingScore,
      sources: sourcesScore,
      editorial: editorialScore,
      uiCompleteness: uiScore,
      total: score,
      performanceBenchmarkCount,
      technicalMetricCount,
      economicMetricCount,
      rankingMetricCount,
      availabilityMetricCount,
      meetsTwoPerformanceBenchmarkGate,
    };

    // Index gate: must score >= 65 AND meet the 2 performance benchmarks requirement AND no boilerplate
    const isIndexed = score >= 65 && meetsTwoPerformanceBenchmarkGate && !poBoilerplate && !enBoilerplate;
    return { score, status: isIndexed ? "indexed" : "thin", reasons, breakdown };
  }, "thin");
}

// ─── Scorer: News Articles ─────────────────────────────────────────────────

const OFFICIAL_PRIMARY_DOMAINS = new Set([
  "anthropic.com", "openai.com", "deepmind.google", "google.com",
  "huggingface.co", "blogs.nvidia.com", "nvidia.com", "meta.com",
  "ai.meta.com", "mistral.ai", "x.ai", "deepseek.com", "moonshot.cn", "qwenlm.github.io"
]);

const { scoreDeepDiveExtras, DEEP_DIVE_WORD_FLOOR, checkPedagogicalStructure } = require("./deep-dive-quality-checks");

function scoreNewsArticle(article, sourceTexts) {
  return safeResult(() => {
    const reasons = [];
    const body = text(article?.body);
    const wordCount = words(body).length;
    const isDeepDive = article?.article_type === "deep-dive" || article?.articleType === "deep-dive";
    const isLongform = isDeepDive || article?.article_type === "longform" || article?.articleType === "longform";
    let score = 0;

    // 1. Originality check against each individual source text
    const sources = Array.isArray(sourceTexts)
      ? sourceTexts.filter((entry) => typeof entry === "string" && entry.trim())
      : [];
    const bodyShingles = shingleSet(body);
    
    let maxSimilarity = 0;
    let closestSourceIdx = -1;
    sources.forEach((sourceText, idx) => {
      const sim = jaccardSimilarity(bodyShingles, shingleSet(sourceText));
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        closestSourceIdx = idx;
      }
    });

    const maxAllowedSimilarity = isDeepDive ? 0.45 : (isLongform ? 0.50 : 0.55);

    if (sources.length === 0) {
      reasons.push("source text unavailable for originality check");
    } else if (body && maxSimilarity <= maxAllowedSimilarity) {
      score += 35;
    } else {
      reasons.push(`too close to source ${closestSourceIdx + 1} (${(maxSimilarity * 100).toFixed(1)}% similarity)`);
    }

    // 2. Analysis section check
    const hasAnalysis = hasOriginalAnalysis(body) || isDeepDive;
    if (hasAnalysis) {
      score += 25;
    } else {
      reasons.push("no original analysis section");
    }

    // 3. Source citations & domain diversity
    const urls = toSourceUrls(article);
    const validUrls = urls.filter(validHttpUrl);
    const domains = sourceDomains(validUrls);

    if (validUrls.length) {
      score += 15;
    } else {
      reasons.push("missing valid source attribution");
    }

    if (domains.size > 1) {
      score += 15;
      // Bonus (+10): Mix of official primary + independent coverage
      const hasOfficial = Array.from(domains).some((d) => OFFICIAL_PRIMARY_DOMAINS.has(d));
      const hasIndependent = Array.from(domains).some((d) => !OFFICIAL_PRIMARY_DOMAINS.has(d));
      if (hasOfficial && hasIndependent) {
        score += 10;
      }
    } else {
      reasons.push("not a multi-source synthesis");
    }

    // 4. Length floor check
    const minWords = isDeepDive ? DEEP_DIVE_WORD_FLOOR : (isLongform ? 800 : 120);
    if (wordCount >= minWords) {
      score += 10;
    } else {
      reasons.push(`below editorial length floor (${wordCount}/${minWords} words)`);
    }

    // 5. Deep-Dive Pedagogical Extras & Structure
    let deepDiveStructureComplete = true;
    if (isDeepDive) {
      const extraDelta = scoreDeepDiveExtras(article);
      score += extraDelta;
      const structure = checkPedagogicalStructure(body);
      if (!structure.complete) {
        deepDiveStructureComplete = false;
        reasons.push(`missing pedagogical sections: ${structure.missing.join(", ")}`);
      }
    }

    // 6. Hard indexing gates
    let isIndexed = score >= 55 && hasAnalysis;
    if (isLongform) {
      if (domains.size < 2) {
        isIndexed = false;
        reasons.push("multi-source synthesis requires >= 2 distinct source domains");
      }
      if (wordCount < minWords) {
        isIndexed = false;
      }
      if (maxSimilarity > maxAllowedSimilarity) {
        isIndexed = false;
      }
    }
    if (isDeepDive && !deepDiveStructureComplete) {
      isIndexed = false;
    }

    score = Math.round(Math.max(0, Math.min(100, score)));
    return { score, status: isIndexed ? "indexed" : "unlisted", reasons };
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
