"use strict";

/**
 * scripts/lib/verified-write.js
 *
 * Write-layer guardrail for model facts and benchmarks.
 * Enforces that no benchmark or factual spec can be committed to Supabase
 * without a non-empty, valid HTTP/HTTPS source citation array.
 */

function validHttpUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitizes and validates benchmarks before writing to database.
 * Every benchmark must have a name, finite numeric score, and at least one valid HTTP source citation.
 *
 * @param {Array<object>} benchmarks - Array of benchmark objects
 * @param {Array<string>} fallbackSources - Array of parent model source URLs
 * @returns {{ sanitized: Array<object>, valid: boolean, errors: Array<string> }}
 */
function sanitizeBenchmarksForWrite(benchmarks, fallbackSources = []) {
  if (!Array.isArray(benchmarks) || benchmarks.length === 0) {
    return { sanitized: [], valid: true, errors: [] };
  }

  const validSources = (Array.isArray(fallbackSources) ? fallbackSources : []).filter(validHttpUrl);
  const errors = [];
  const sanitized = [];

  for (let i = 0; i < benchmarks.length; i++) {
    const b = benchmarks[i];
    if (!b || typeof b !== "object") {
      errors.push(`Benchmark at index ${i} is not a valid object.`);
      continue;
    }

    const name = typeof b.name === "string" ? b.name.trim() : "";
    if (!name) {
      errors.push(`Benchmark at index ${i} is missing a name.`);
      continue;
    }

    const rawScore = typeof b.score === "number" ? b.score : Number(String(b.score).replace(/[%,$]/g, ""));
    if (!Number.isFinite(rawScore)) {
      errors.push(`Benchmark '${name}' at index ${i} has a non-numeric score: ${b.score}`);
      continue;
    }

    const entrySources = [];
    if (b.source && validHttpUrl(b.source)) entrySources.push(b.source);
    if (Array.isArray(b.sources)) {
      for (const s of b.sources) {
        if (validHttpUrl(s) && !entrySources.includes(s)) entrySources.push(s);
      }
    }

    // Merge fallback parent sources if entry has none
    const finalSources = entrySources.length > 0 ? entrySources : validSources;
    if (finalSources.length === 0) {
      errors.push(`Benchmark '${name}' lacks any verifiable HTTP/HTTPS source citation.`);
      continue;
    }

    sanitized.push({
      name,
      score: rawScore,
      sources: finalSources,
      verified: Boolean(b.verified),
      harness: b.harness || undefined
    });
  }

  return {
    sanitized,
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validHttpUrl,
  sanitizeBenchmarksForWrite
};
