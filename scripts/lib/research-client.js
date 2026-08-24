"use strict";

/**
 * scripts/lib/research-client.js
 *
 * Gemini client with google_search grounding for the research-gaps worker.
 * Uses the same GEMINI_API_KEY as the editorial worker; grounding bills per
 * grounded request, so callers must bound batch sizes.
 *
 * Response contract: the model is asked for a JSON object keyed by requested
 * field name, each value being {value, sourceUrls[]}. JSON parsing here is
 * lenient (fences/chatter tolerated) — strict validation happens downstream
 * in data/schemas/research-gap-result.schema.js. This module never writes to
 * the database.
 */

const https = require("https");

const DEFAULT_MODEL = process.env.GEMINI_RESEARCH_MODEL || "gemini-2.0-flash";
const DEFAULT_TIMEOUT_MS = 45000;

/**
 * POST generateContent with the google_search tool enabled.
 *
 * Note: responseMimeType "application/json" is intentionally NOT set — it is
 * incompatible with tool use on some Gemini versions and fails hard. The
 * prompt itself demands JSON output and extractJsonObject() tolerates noise.
 *
 * @returns {Promise<{ ok: true, text: string, groundingUrls: string[], model: string }
 *                  | { ok: false, error: string, model: string }>}
 */
function callGeminiGrounded({ apiKey, prompt, model = DEFAULT_MODEL, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return new Promise((resolve) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
      },
    });

    const req = https.request(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode >= 400) {
              resolve({ ok: false, error: `Gemini HTTP ${res.statusCode}: ${data.slice(0, 200)}`, model });
              return;
            }
            const parsed = JSON.parse(data);
            const candidate = parsed.candidates?.[0];
            const rawText = candidate?.content?.parts?.map((p) => p.text || "").join("") || "";

            // Grounding metadata: the actual pages search retrieved — union
            // these with model-cited URLs downstream for provenance.
            const groundingUrls = [];
            for (const chunk of candidate?.groundingMetadata?.groundingChunks || []) {
              const uri = chunk?.web?.uri;
              if (typeof uri === "string" && /^https?:\/\//.test(uri)) groundingUrls.push(uri);
            }

            if (!rawText.trim()) {
              resolve({ ok: false, error: "empty response from Gemini", model });
              return;
            }
            resolve({ ok: true, text: rawText, groundingUrls: [...new Set(groundingUrls)], model });
          } catch (e) {
            resolve({ ok: false, error: `Gemini response parse failed: ${e.message}`, model });
          }
        });
      },
    );

    req.on("error", (e) => resolve({ ok: false, error: `Gemini request failed: ${e.message}`, model }));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ ok: false, error: "Gemini request timed out", model });
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Extract the first balanced JSON object from noisy LLM output.
 * Handles ```json fences, leading chatter, trailing prose.
 * @returns {object|null}
 */
function extractJsonObject(text) {
  if (typeof text !== "string" || !text.trim()) return null;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [];
  if (fenced && fenced[1]) candidates.push(fenced[1]);
  candidates.push(text);

  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      // fall through to brace scanning
    }
  }

  // Brace-scan for the first balanced {...} block (ignores braces in strings).
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(text.slice(start, i + 1));
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * Build the research prompt asking ONLY for the missing fields.
 */
function buildResearchPrompt({ modelName, developer, slug, missingFields, benchmarksNeeded, contextSnippet }) {
  const fieldList = missingFields.join(", ");
  const benchmarkClause = benchmarksNeeded > 0
    ? `\n- Also find at least ${benchmarksNeeded} verifiable numeric benchmark results for this model (e.g. MMLU, GSM8K, HumanEval, GPQA) with exact scores. Use key "benchmarks": [{"name": "...", "score": <number>, "sourceUrls": ["..."]}]`
    : "";

  return `You are a meticulous factual researcher for an AI model directory (themodelverse.in).
Research the AI model "${modelName}"${developer ? ` by ${developer}` : ""} (slug: ${slug}) using web search.

Fill ONLY these missing fields: ${fieldList}.${benchmarkClause}

STRICT RULES:
1. Respond with ONLY a valid JSON object — no prose before or after.
2. Each requested field maps to {"value": <string or string[]>, "sourceUrls": ["<url where you found it>"]}.
3. Every field MUST include at least one real source URL from your search results. A field without a URL will be discarded.
4. NEVER guess or invent values. If you cannot verify a field from search results, OMIT the key entirely.
5. Values must be concise facts (e.g. context_window: "128K tokens", release_date: "2025-03-14"), not marketing copy.
${contextSnippet ? `\nREFERENCE CONTEXT from the model's known sources (may help):\n${contextSnippet}` : ""}`;
}

/**
 * High-level entry: research one model's missing fields with web grounding.
 *
 * @param {object} opts
 * @param {string} opts.apiKey - GEMINI_API_KEY
 * @param {string} opts.modelName - models.name
 * @param {string} [opts.developer]
 * @param {string} opts.slug
 * @param {string[]} opts.missingFields - from computeMissingFields().factGaps (benchmarks excluded)
 * @param {number} [opts.benchmarksNeeded]
 * @param {string} [opts.contextSnippet] - fetched reference-page text, pre-truncated
 * @returns {Promise<{ok: true, results: object, groundingUrls: string[], model: string}
 *                 |{ok: false, error: string, model?: string}>}
 */
async function researchModelFields(opts) {
  const prompt = buildResearchPrompt(opts);
  const response = await callGeminiGrounded({ apiKey: opts.apiKey, prompt, model: opts.model });

  if (!response.ok) {
    return { ok: false, error: response.error, model: response.model };
  }

  const results = extractJsonObject(response.text);
  if (!results) {
    return { ok: false, error: "could not extract JSON object from grounded response", model: response.model };
  }

  return { ok: true, results, groundingUrls: response.groundingUrls, model: response.model };
}

module.exports = {
  callGeminiGrounded,
  buildResearchPrompt,
  researchModelFields,
  extractJsonObject,
  DEFAULT_MODEL,
};
