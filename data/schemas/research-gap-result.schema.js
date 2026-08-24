"use strict";

/**
 * data/schemas/research-gap-result.schema.js
 *
 * Zod contract for research-gaps worker output (Gemini web-grounded JSON).
 *
 * LLM output is untrusted input (security.md): everything passes through
 * sanitizeResearchResults() before it may touch staged_changes — unknown
 * fields are stripped, scalar/array shapes are enforced per field, values
 * without at least one plausible http(s) source URL are DROPPED, and
 * placeholder text ("unknown", "undisclosed", …) never survives.
 */

const { z } = require("zod");

/** Fields the researcher may be asked about, and their expected shape. */
const ARRAY_FIELDS = new Set([
  "modality", "deployment", "tags", "key_features", "sources", "aliases",
]);

const SCALAR_FIELDS = new Set([
  "developer", "release_date", "type", "family", "tier",
  "parameters", "active_parameters", "context_window", "license",
  "primary_task", "base_model", "previous_version", "description",
  "api_availability", "vendor_api_status",
]);

const PLACEHOLDER_VALUES = new Set([
  "", "-", "—", "unknown", "undisclosed", "not disclosed", "n/a", "na", "none", "null",
]);

const httpUrl = z.url().refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
  message: "must be an http(s) URL",
});

const sourcedScalar = z.object({
  value: z.union([z.string(), z.number(), z.boolean()]),
  sourceUrls: z.array(httpUrl).min(1).max(8),
}).loose();

const benchmarkEntry = z.object({
  name: z.string().min(2).max(120),
  // Accepts 88.6, "88.6", "88.6%" → numeric score extracted via coerceScore().
  score: z.union([z.number(), z.string()]),
  sourceUrls: z.array(httpUrl).min(1).max(8),
});

// Top-level contract: a JSON object keyed by field name. Per-field shapes are
// enforced field-by-field inside sanitizeResearchResults() so one bad field
// doesn't discard the whole response.
const researchGapResultSchema = z.record(z.string(), z.unknown());

/** Numeric-ish string → finite number ("88.6%" → 88.6); null when not numeric. */
function coerceScore(raw) {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[%,$\s]/g, "").replace(/[×x].*$/, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

function isPlaceholder(value) {
  return typeof value === "string" && PLACEHOLDER_VALUES.has(value.trim().toLowerCase());
}

/**
 * Validate + normalize a raw researched payload against the requested fields.
 *
 * @param {unknown} raw - parsed LLM response object
 * @param {{ requestedFields?: string[], allowBenchmarks?: boolean }} opts
 * @returns {{
 *   sanitized: Record<string, string|string[]>,
 *   benchmarks: Array<{name: string, score: number, metricType: string, sources: string[], verified: boolean}>,
 *   dropped: Record<string, string>,
 * }}
 */
function sanitizeResearchResults(raw, opts = {}) {
  const sanitized = {};
  const benchmarks = [];
  const dropped = {};

  const requested = Array.isArray(opts.requestedFields) ? opts.requestedFields : null;
  const allowBenchmarks = opts.allowBenchmarks !== false;

  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { sanitized, benchmarks, dropped: { "*": "response was not a JSON object" } };
  }

  for (const [key, entry] of Object.entries(raw)) {
    if (key === "benchmarks") continue; // handled below

    if (!requested || !requested.includes(key)) {
      dropped[key] = "field was not requested";
      continue;
    }

    const value = entry && typeof entry === "object" && !Array.isArray(entry) ? entry.value : undefined;
    const sourceUrls = entry && typeof entry === "object" && Array.isArray(entry.sourceUrls)
      ? entry.sourceUrls.filter((u) => typeof u === "string" && /^https?:\/\//.test(u))
      : [];

    if (sourceUrls.length === 0) {
      dropped[key] = "no plausible source URL";
      continue;
    }

    if (isPlaceholder(value)) {
      dropped[key] = "placeholder value";
      continue;
    }

    if (ARRAY_FIELDS.has(key)) {
      let list = null;
      if (Array.isArray(value)) {
        list = value.map((v) => String(v).trim()).filter((v) => v && !PLACEHOLDER_VALUES.has(v.toLowerCase()));
      } else if (typeof value === "string") {
        list = value.split(",").map((v) => v.trim()).filter(Boolean);
      }
      if (!list || list.length === 0) {
        dropped[key] = "empty or malformed array";
        continue;
      }
      sanitized[key] = [...new Set(list)].slice(0, 12);
      continue;
    }

    if (SCALAR_FIELDS.has(key)) {
      if (Array.isArray(value) || (value && typeof value === "object")) {
        dropped[key] = "expected a scalar value";
        continue;
      }
      const str = typeof value === "number" || typeof value === "boolean" ? String(value) : String(value ?? "").trim();
      if (!str || PLACEHOLDER_VALUES.has(str.toLowerCase())) {
        dropped[key] = "empty value";
        continue;
      }
      sanitized[key] = str.slice(0, 2000);
      continue;
    }

    dropped[key] = "field is not researchable";
  }

  // Benchmarks: coerce scores, keep only entries with sources.
  if (allowBenchmarks && Array.isArray(raw.benchmarks)) {
    for (const b of raw.benchmarks.slice(0, 10)) {
      const parsed = benchmarkEntry.safeParse(b);
      if (!parsed.success) {
        dropped["benchmarks"] = "malformed benchmark entries present";
        continue;
      }
      const score = coerceScore(parsed.data.score);
      const name = parsed.data.name.trim();
      const urls = [...new Set(parsed.data.sourceUrls)];
      if (score == null) {
        dropped["benchmarks"] = "non-numeric benchmark score";
        continue;
      }
      if (benchmarks.some((existing) => existing.name.toLowerCase() === name.toLowerCase())) {
        continue; // first occurrence wins
      }
      benchmarks.push({
        name,
        score,
        metricType: "performance",
        sources: urls,
        verified: true,
      });
    }
  } else if (allowBenchmarks && raw.benchmarks !== undefined) {
    dropped["benchmarks"] = "benchmarks was not an array";
  }

  return { sanitized, benchmarks, dropped };
}

module.exports = {
  researchGapResultSchema,
  sanitizeResearchResults,
  coerceScore,
  ARRAY_FIELDS,
  SCALAR_FIELDS,
};
