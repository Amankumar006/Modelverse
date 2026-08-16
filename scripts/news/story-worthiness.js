"use strict";

/**
 * scripts/news/story-worthiness.js
 *
 * Fast, deterministic 0-10 heuristic gate for news story-worthiness.
 * Evaluates candidates without LLM calls based on:
 * - Source authority (tier-1 labs & technical publications)
 * - Novelty / Action signals (new models, architectural launches, major breakthroughs vs minor patches)
 * - Topical relevance to Modelverse's catalog (known foundation models, frontier labs, AI architectures)
 * - Deduplication against recent titles
 *
 * Threshold:
 * >= 6/10 -> Eligible for multi-source research & longform synthesis.
 * < 6/10  -> Routed to short single-source brief path or skipped if very low.
 */

const TIER_1_AUTHORITIES = [
  "anthropic",
  "openai",
  "google deepmind",
  "deepmind",
  "hugging face",
  "nvidia",
  "meta ai",
  "mistral ai",
  "mit technology review",
  "alibaba",
  "qwen",
  "deepseek",
  "moonshot ai"
];

const MAJOR_EVENT_KEYWORDS = [
  /\b(?:released?|launch(?:es|ed)?|announc(?:es|ed)|unveils?|introduc(?:es|ed))\b/i,
  /\b(?:frontier|foundation model|open-weights?|open-source|architecture|reasoning|multimodal)\b/i,
  /\b(?:benchmark|evaluations?|breakthrough|state-of-the-art|sota|agentic|supercomputer)\b/i,
  /\b(?:gpt-[45]|claude-[34]|gemini-[23]|llama-[34]|deepseek-[rv]|qwen-[23]|kimi|mistral)\b/i,
];

const MINOR_EVENT_PENALTIES = [
  /\b(?:minor|patch|maintenance|bug fix|hotfix|changelog)\b/i,
  /\b(?:version \d+\.\d+\.\d+|v\d+\.\d+\.\d+)\b/i,
  /\b(?:outage|pricing tweak|terms of service|tos update|podcast episode)\b/i,
  /\b(?:opinion:|editorial:|letter to editor|roundup)\b/i,
];

function storyWorthiness(candidate, recentTitles = []) {
  if (!candidate || typeof candidate !== "object") return 0;

  const title = String(candidate.title || "").trim();
  const lab = String(candidate.lab || candidate.author || "").toLowerCase();
  const description = String(candidate.description || "").toLowerCase();
  const titleLower = title.toLowerCase();

  if (!title) return 0;

  let score = 3; // Baseline score for parsed technical feed item

  // 1. Source Authority Bonus (+2)
  if (TIER_1_AUTHORITIES.some((auth) => lab.includes(auth))) {
    score += 2;
  }

  // 2. Major Event / Novelty Bonus (+1 to +3)
  let noveltyMatches = 0;
  for (const regex of MAJOR_EVENT_KEYWORDS) {
    if (regex.test(titleLower) || regex.test(description)) {
      noveltyMatches++;
    }
  }
  score += Math.min(3, noveltyMatches);

  // 3. Known Frontier Model / Lab Keyword in Title (+1)
  if (/\b(?:gpt|claude|gemini|llama|mistral|deepseek|qwen|kimi|diffusers|vllm|pytorch)\b/i.test(titleLower)) {
    score += 1;
  }

  // 4. Minor Event / Low-Signal Penalties (-3 to -4)
  for (const penaltyRegex of MINOR_EVENT_PENALTIES) {
    if (penaltyRegex.test(titleLower)) {
      score -= 3;
      break;
    }
  }

  // 5. Recent Title Collision Penalty (-3)
  const normalizedTitle = titleLower.replace(/\W+/g, " ").trim();
  if (recentTitles.some((existing) => String(existing).toLowerCase().replace(/\W+/g, " ").trim() === normalizedTitle)) {
    score -= 3;
  }

  const finalScore = Math.max(0, Math.min(10, score));

  return {
    score: finalScore,
    isWorthLongform: finalScore >= 6,
    reasons: [
      TIER_1_AUTHORITIES.some((auth) => lab.includes(auth)) ? "Tier-1 source authority" : null,
      noveltyMatches > 0 ? `Novelty signals (${noveltyMatches})` : null,
      finalScore < 6 ? "Standard brief threshold" : "Eligible for multi-source research & longform",
    ].filter(Boolean),
  };
}

module.exports = {
  storyWorthiness,
  TIER_1_AUTHORITIES,
};
