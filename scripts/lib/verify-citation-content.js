"use strict";

/**
 * scripts/lib/verify-citation-content.js
 *
 * Content-Level Citation Verifier:
 * Validates that the citation text actually substantiates the factual claim
 * via:
 * 1. Markdown Table Cell Alignment (finding the score in the exact column under the benchmark header)
 * 2. Proximity Search across up to 1000 characters
 * 3. Bullet & key-value formats (e.g. "MMLU: 88.6%", "GSM8K (0-shot): 95.0")
 */

const { extractBenchmarksFromMarkdownTable, KNOWN_BENCHMARKS } = require("./extract-benchmarks-deterministic");

const fetchCache = new Map();

async function fetchPageText(url, timeoutMs = 8000) {
  if (!url || typeof url !== "string") return null;
  if (fetchCache.has(url)) return fetchCache.get(url);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Convert github web URLs to raw.githubusercontent.com for clean text parsing
    let targetUrl = url;
    if (targetUrl.includes("github.com") && !targetUrl.includes("raw.githubusercontent.com") && targetUrl.includes("/blob/")) {
      targetUrl = targetUrl.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
    } else if (targetUrl.startsWith("https://huggingface.co/") && !targetUrl.includes("/raw/main/") && !targetUrl.includes("/api/")) {
      const parts = targetUrl.replace("https://huggingface.co/", "").split("/").filter(Boolean);
      if (parts.length === 2) {
        targetUrl = `https://huggingface.co/${parts[0]}/${parts[1]}/raw/main/README.md`;
      }
    }

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Modelverse-CitationVerifier/1.0" },
    });
    clearTimeout(timer);

    if (!res.ok) {
      fetchCache.set(url, null);
      return null;
    }

    const text = await res.text();
    fetchCache.set(url, text);
    return text;
  } catch {
    fetchCache.set(url, null);
    return null;
  }
}

/**
 * Verifies that a citation text actually substantiates a numeric benchmark claim.
 *
 * @param {string} rawText - Raw page text or markdown
 * @param {string} benchmarkName - Name of the benchmark (e.g. "MMLU", "HumanEval", "GPQA", "MATH", "GSM8K")
 * @param {number|string} score - The reported score value (e.g. 88.6 or "88.6%")
 * @param {number} maxDistance - Maximum character distance between name and score (default 1000)
 * @returns {{ substantiated: boolean, matchedScore?: number, excerpt?: string }}
 */
function verifyBenchmarkSubstantiation(rawText, benchmarkName, score, maxDistance = 1000) {
  if (!rawText || !benchmarkName || score == null) {
    return { substantiated: false };
  }

  const numScore = typeof score === "number" ? score : parseFloat(String(score).replace(/[%,$]/g, ""));
  if (!Number.isFinite(numScore)) return { substantiated: false };

  // 1. Table-based substantiation check
  const tableResults = extractBenchmarksFromMarkdownTable(rawText);
  for (const b of tableResults) {
    if (b.name.toLowerCase() === benchmarkName.toLowerCase() && Math.abs(b.score - numScore) < 0.2) {
      return {
        substantiated: true,
        matchedScore: b.score,
        excerpt: `[Table Cell] ${b.name}: ${b.score}`
      };
    }
  }

  // 2. Text / Proximity substantiation check
  const clean = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const lowerText = clean.toLowerCase();

  // Generate name variations (e.g. "HumanEval" -> "human-eval", "human eval", "humaneval")
  const normName = benchmarkName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const nameVariants = [
    benchmarkName,
    normName,
    benchmarkName.replace(/([a-z])([A-Z])/g, "$1 $2"),
    benchmarkName.replace(/([a-z])([A-Z])/g, "$1-$2"),
  ].filter(Boolean);

  // Search for occurrence of any name variant
  for (const variant of nameVariants) {
    let searchIndex = 0;
    const vLower = variant.toLowerCase();

    while (searchIndex < lowerText.length) {
      const namePos = lowerText.indexOf(vLower, searchIndex);
      if (namePos === -1) break;

      // Extract window around the benchmark name (expanded to 1000 chars)
      const windowStart = Math.max(0, namePos - 150);
      const windowEnd = Math.min(lowerText.length, namePos + vLower.length + maxDistance);
      const windowText = lowerText.slice(windowStart, windowEnd);

      // Check if the score appears in this window (exact float, integer, or percentage)
      const scoreStr1 = numScore.toFixed(1); // e.g. "88.6"
      const scoreStr2 = String(Math.round(numScore)); // e.g. "89"
      const scoreStr3 = String(numScore); // e.g. "88.6"

      if (windowText.includes(scoreStr1) || windowText.includes(scoreStr3) || (windowText.includes(scoreStr2) && Math.abs(numScore - Math.round(numScore)) < 0.2)) {
        const rawExcerpt = clean.slice(windowStart, windowEnd).trim();
        return {
          substantiated: true,
          matchedScore: numScore,
          excerpt: rawExcerpt.length > 250 ? rawExcerpt.slice(0, 250) + "..." : rawExcerpt,
        };
      }

      searchIndex = namePos + vLower.length;
    }
  }

  return { substantiated: false };
}

/**
 * Checks whether a citation URL substantiates a benchmark claim.
 */
async function verifyCitationUrlForBenchmark(url, benchmarkName, score) {
  if (!url || typeof url !== "string") return { substantiated: false, reason: "invalid URL" };
  if (url.includes("github.com/anomalyco/models.dev") || url.includes("openrouter.ai/api/v1/models")) {
    return { substantiated: false, reason: "aggregator/pricing URL cannot substantiate benchmark claims" };
  }

  const pageText = await fetchPageText(url);
  if (!pageText) return { substantiated: false, reason: "could not fetch page text" };

  return verifyBenchmarkSubstantiation(pageText, benchmarkName, score);
}

module.exports = {
  fetchPageText,
  verifyBenchmarkSubstantiation,
  verifyCitationUrlForBenchmark,
};
