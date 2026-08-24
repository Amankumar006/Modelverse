"use strict";

/**
 * data/schemas/editorial-output.schema.js
 *
 * Zod contract for editorial LLM output (generate-editorial worker).
 * Replaces bare JSON.parse: AI responses are untrusted input, and a
 * malformed or prompt-injected payload must never reach staged_changes.
 */

const { z } = require("zod");

const editorialOutputSchema = z.object({
  cardSummary: z.string().min(1).max(400),
  pageOverview: z.string().min(1).max(8000),
  editorialNote: z.string().min(1).max(8000),
});

/**
 * Parse + validate an LLM response that should contain exactly the three
 * editorial prose fields. Tolerates markdown-fenced JSON.
 *
 * @param {string} rawText - raw model response text
 * @returns {{ ok: true, data: {cardSummary,string,pageOverview:string,editorialNote:string} }
 *          | { ok: false, error: string }}
 */
function parseEditorialOutput(rawText) {
  if (typeof rawText !== "string" || !rawText.trim()) {
    return { ok: false, error: "empty response" };
  }

  let candidate = rawText.trim();
  const fenced = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced && fenced[1]) {
    candidate = fenced[1].trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    // Some models prepend chatter before the JSON object — try the first {...} block.
    const braceMatch = rawText.match(/\{[\s\S]*\}/);
    if (!braceMatch) return { ok: false, error: "no JSON object found in response" };
    try {
      parsed = JSON.parse(braceMatch[0]);
    } catch {
      return { ok: false, error: "response is not valid JSON" };
    }
  }

  const result = editorialOutputSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error?.issues?.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    return { ok: false, error: `editorial schema violation: ${issues || "unknown"}` };
  }

  // Only the three contracted fields survive.
  return {
    ok: true,
    data: {
      cardSummary: result.data.cardSummary,
      pageOverview: result.data.pageOverview,
      editorialNote: result.data.editorialNote,
    },
  };
}

module.exports = { editorialOutputSchema, parseEditorialOutput };
