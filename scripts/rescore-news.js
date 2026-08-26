"use strict";

/**
 * scripts/rescore-news.js
 *
 * Scheduled re-scoring pass for published news articles.
 *
 * The ingestion pipeline scores each article exactly once, at birth, using the
 * RAW SOURCE TEXT it fetched from the original outlet. Those source texts are
 * archived to data/news-sources/<slug>.json by the ingestion script (and
 * committed to main by the workflow) — without them, the originality component
 * of the scorer simply cannot run, so this script treats source-text
 * availability as a trust tier rather than pretending a degraded score is a
 * fresh verdict:
 *
 *   snapshot available      → full-trust re-score. Promote AND demote on the
 *                             result (caps and duplicate guard still apply).
 *   no snapshot, indexed    → SKIP entirely. The body hasn't changed since a
 *                             full-context scoring verified it; a re-score
 *                             without source text can only lose information,
 *                             and acting on it would mass-demotion every
 *                             pre-archive article. Never demote on missing
 *                             context.
 *   no snapshot, unlisted   → allowed to PROMOTE (or receive a regenerated
 *                             analysis section) only with positive evidence
 *                             that the birth-time scoring ran and passed
 *                             originality: stored quality_reasons non-empty
 *                             and containing no "too close to source". In
 *                             that case originality points are carried over
 *                             via scoreNewsArticle's assumeOriginalityPass
 *                             flag (explicit audit reason attached). Without
 *                             such evidence the article is skipped.
 *
 * Regeneration: recent near-misses whose only failing signal is the missing
 * analysis section get a grounded "Why It Matters" section generated via
 * Gemini — grounded in the article's own text only, Zod-validated, capped via
 * REGEN_CAP. In --dry-run the LLM is not called; candidates are listed with a
 * predicted post-regeneration score instead.
 *
 * Articles whose stored reasons include a duplicate verdict are never
 * promoted — re-scoring cannot see the ingestion-time fingerprint index.
 *
 * Exits non-zero only on infrastructure failure (DB unreachable); per-article
 * LLM failures are logged and skipped so one bad response can't kill a batch.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const https = require("https");
const { createClient } = require("@supabase/supabase-js");
const { z } = require("zod");
const { scoreNewsArticle } = require("./quality/score-content");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

function intEnv(name, fallback) {
  const parsed = parseInt(process.env[name] || "", 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : fallback;
}

const PROMOTE_CAP = intEnv("PROMOTE_CAP", 30);
const REGEN_CAP = intEnv("REGEN_CAP", 20);
const NEAR_MISS_FLOOR = intEnv("NEAR_MISS_FLOOR", 45);
const REGEN_MAX_AGE_DAYS = intEnv("REGEN_MAX_AGE_DAYS", 30);
const ANALYSIS_MODEL = process.env.NEWS_ANALYSIS_MODEL || "gemini-2.0-flash";
const ANALYSIS_TIMEOUT_MS = 45000;

// ─── CLI ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const regenerateEnabled = !args.includes("--no-regenerate");
const slugArg = args.find((a) => a.startsWith("--slug="));

// ─── Analysis generation ────────────────────────────────────────────────────

const AnalysisResponse = z.object({
  analysis: z.string().min(120).max(1500).nullable(),
});

/**
 * Generates a grounded "Why It Matters" section from the article's own text.
 * Returns the markdown section (with header), or null when the model declines
 * / errors / produces anything unusable. Never throws.
 */
async function generateAnalysisSection(article) {
  const contextBody = article.body.slice(0, 6000);
  const prompt = [
    "You are an editor for an AI news publication. Write the missing analytical closing section for the article below.",
    "",
    "Rules:",
    "- Base EVERY statement strictly on the provided article text. Do not add outside facts, numbers, dates, or names.",
    "- If the text does not support meaningful analysis, return {\"analysis\": null} instead of inventing content.",
    "- Start your output section with the exact heading '## Why It Matters'.",
    "- Markdown prose only: no code fences, no HTML tags, no links.",
    "- 120-300 words.",
    "",
    "Respond with a single JSON object: {\"analysis\": \"<markdown section>\"} (or null).",
    "",
    `ARTICLE TITLE: ${article.title}`,
    `ARTICLE EXCERPT: ${article.excerpt || ""}`,
    "ARTICLE BODY:",
    contextBody,
  ].join("\n");

  const raw = await new Promise((resolve) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(ANALYSIS_MODEL)}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    });
    const req = https.request(
      url,
      { method: "POST", headers: { "Content-Type": "application/json" } },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode >= 400) {
              resolve({ ok: false, error: `Gemini HTTP ${res.statusCode}: ${data.slice(0, 200)}` });
              return;
            }
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
            resolve(text.trim() ? { ok: true, text } : { ok: false, error: "empty Gemini response" });
          } catch (e) {
            resolve({ ok: false, error: `Gemini parse failed: ${e.message}` });
          }
        });
      },
    );
    req.on("error", (e) => resolve({ ok: false, error: e.message }));
    req.setTimeout(ANALYSIS_TIMEOUT_MS, () => {
      req.destroy();
      resolve({ ok: false, error: "Gemini request timed out" });
    });
    req.write(payload);
    req.end();
  });

  if (!raw.ok) {
    console.warn(`      ⚠️ generation skipped (${raw.error})`);
    return null;
  }

  // Lenient extraction like research-client: tolerate fences/chatter around
  // the JSON object.
  const jsonMatch = raw.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn("      ⚠️ generation skipped (no JSON object in response)");
    return null;
  }

  let candidate;
  try {
    candidate = AnalysisResponse.parse(JSON.parse(jsonMatch[0]));
  } catch {
    console.warn("      ⚠️ generation skipped (response failed schema validation)");
    return null;
  }
  if (!candidate.analysis) {
    console.warn("      ℹ️ model declined (insufficient grounding in source text)");
    return null;
  }

  // Defense in depth: rendered through react-markdown (HTML escaped), but
  // never persist markup-looking content into article bodies.
  const cleaned = candidate.analysis.replace(/<\/?[a-zA-Z][^>]*>/g, "").trim();
  if (cleaned.length < 120) return null;
  return /^##\s/.test(cleaned) ? cleaned : `## Why It Matters\n\n${cleaned}`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Loads the birth-time source texts ingestion archived for this slug, from
 * data/news-sources/<slug>.json ({ sourceTexts: [...] }). Returns null when
 * nothing usable is archived (all pre-archive articles).
 */
function loadArchivedSourceTexts(slug) {
  try {
    const snapshot = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "data", "news-sources", `${slug}.json`), "utf-8"),
    );
    const texts = [];
    if (Array.isArray(snapshot.sourceTexts)) {
      texts.push(...snapshot.sourceTexts.filter((t) => typeof t === "string" && t.trim()));
    }
    return texts.length > 0 ? texts : null;
  } catch {
    return null;
  }
}

// Birth-time evidence review: stored reasons must prove that a full-context
// gate ran AND that its originality check actually saw source text. Absence
// of a "too close to source" failure alone proves nothing — some historical
// ingestion runs were themselves blind (their stored reasons carry the same
// "source text unavailable" marker), and carrying originality credit from a
// blind run would just launder the blindness.
function birthEvidence(row) {
  const storedReasons = Array.isArray(row.quality_reasons)
    ? row.quality_reasons.filter((r) => typeof r === "string")
    : [];
  const originalityWasBlind = storedReasons.some((r) =>
    r.includes("source text unavailable for originality check"),
  );
  return {
    storedReasons,
    gateRanAtBirth: storedReasons.length > 0,
    originalityPassedAtBirth:
      storedReasons.length > 0
      && !originalityWasBlind
      && !storedReasons.some((r) => r.startsWith("too close to source")),
  };
}

function isRegenerationCandidate(row, gate, duplicateFlagged) {
  if (!regenerateEnabled) return false;
  if (gate.status === "indexed") return false;
  if (gate.score < NEAR_MISS_FLOOR) return false;
  if (!gate.reasons.includes("no original analysis section")) return false;
  if (duplicateFlagged) return false;

  const ageDays = (Date.now() - new Date(row.publish_date).getTime()) / 86_400_000;
  return ageDays >= 0 && ageDays <= REGEN_MAX_AGE_DAYS;
}

// Ingestion-time duplicate verdicts live inside quality_reasons, which this
// script overwrites on every write. Carry them forward so a one-time
// near-duplicate ruling survives all future passes.
function mergeDuplicateReasons(row, reasons) {
  const duplicates = (row.quality_reasons || []).filter(
    (r) => typeof r === "string" && r.startsWith("near duplicate of"),
  );
  if (duplicates.length === 0) return reasons;
  const fresh = reasons.filter((r) => !(typeof r === "string" && r.startsWith("near duplicate of")));
  return [...duplicates, ...fresh];
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  let query = db
    .from("news_items")
    .select("id, slug, title, excerpt, body, category, publish_date, status, article_type, external_sources, sources, quality_status, quality_score, quality_reasons")
    .eq("status", "published")
    .order("publish_date", { ascending: false });

  if (slugArg) query = query.eq("slug", slugArg.slice("--slug=".length));

  const { data: articles, error } = await query;
  if (error) {
    console.error("❌ Database query error:", error.message);
    process.exit(1);
  }

  console.log(`\n🔁 Re-scoring ${articles.length} published articles ${dryRun ? "[DRY RUN]" : ""}...\n`);

  let promotionsRemaining = PROMOTE_CAP;
  let regenerationsRemaining = REGEN_CAP;
  let promotedCount = 0;
  let demotedCount = 0;
  let regeneratedCount = 0;
  let stableCount = 0;
  let skippedNoContextCount = 0;

  for (const row of articles) {
    const prevStatus = row.quality_status || "unlisted";
    const wasIndexed = prevStatus === "indexed";
    const { storedReasons, gateRanAtBirth, originalityPassedAtBirth } = birthEvidence(row);
    const duplicateFlagged = storedReasons.some((r) => r.startsWith("near duplicate of"));

    // Resolve the source-text trust tier for this article.
    const archivedTexts = loadArchivedSourceTexts(row.slug);
    let sourceTexts;
    let assumeOriginalityPass = false;
    let demotionTrusted = false;

    if (archivedTexts) {
      sourceTexts = archivedTexts;
      demotionTrusted = true;
    } else if (wasIndexed) {
      // No archive + already indexed: nothing about the article changed since
      // its full-context scoring. Skipping is strictly safer than re-scoring
      // blind (which would strip 35 originality points and demote it).
      skippedNoContextCount++;
      continue;
    } else if (!gateRanAtBirth || !originalityPassedAtBirth) {
      // No archive + no proof the birth gate saw source text: cannot verify
      // enough to change this article's indexing status in either direction.
      skippedNoContextCount++;
      continue;
    } else {
      sourceTexts = [];
      assumeOriginalityPass = true;
    }

    let gate = scoreNewsArticle(
      {
        title: row.title,
        category: row.category,
        article_type: row.article_type,
        body: row.body,
        external_sources: row.external_sources,
        sources: row.sources,
      },
      sourceTexts,
      { assumeOriginalityPass },
    );
    let updatedBody = null;

    if (isRegenerationCandidate(row, gate, duplicateFlagged)) {
      if (dryRun || regenerationsRemaining <= 0) {
        const predictedScore = Math.min(100, gate.score + 25); // +25 = analysis points
        console.log(`✍️  ${row.slug}: near-miss${dryRun ? " [DRY RUN — not calling Gemini]" : " (regen cap reached)"}, predicted post-regen score ~${predictedScore}`);
        if (dryRun) {
          stableCount++;
          continue;
        }
      } else {
        console.log(`✍️  ${row.slug}: score ${gate.score}, near-miss — generating analysis section...`);
        const section = await generateAnalysisSection(row);
        if (section) {
          regenerationsRemaining--;
          regeneratedCount++;
          updatedBody = `${row.body}\n\n${section}`;
          gate = scoreNewsArticle(
            { ...row, body: updatedBody },
            sourceTexts,
            { assumeOriginalityPass },
          );
        }
      }
    }

    const nowIndexed = gate.status === "indexed";

    // Promotion candidates must clear the duplicate guard: this pass can't
    // see the ingestion-time fingerprint index, so a historical near-duplicate
    // ruling is honored permanently.
    const promoting = nowIndexed && !wasIndexed && !duplicateFlagged && promotionsRemaining > 0;
    // Demotion only on full-trust (archived-source) evidence.
    const demoting = wasIndexed && !nowIndexed && demotionTrusted;

    if (promoting) promotionsRemaining--;
    if (!promoting && !demoting && updatedBody === null) {
      stableCount++;
      continue;
    }

    const finalStatus = promoting ? "indexed" : demoting ? gate.status : prevStatus;
    console.log(`📌 ${row.slug}: ${prevStatus} ➔ ${finalStatus} (score ${gate.score}${updatedBody ? ", analysis generated" : ""}${assumeOriginalityPass ? ", originality carried" : ""})`);
    if (gate.reasons.length > 0) {
      console.log(`   Reasons: ${gate.reasons.join("; ")}`);
    }

    if (!dryRun) {
      const payload = {
        quality_status: finalStatus,
        quality_score: gate.score,
        quality_reasons: mergeDuplicateReasons(row, gate.reasons),
        quality_checked_at: new Date().toISOString(),
      };
      if (updatedBody !== null) payload.body = updatedBody;
      const { error: updateError } = await db.from("news_items").update(payload).eq("id", row.id);
      if (updateError) {
        console.error(`   ❌ Failed to update ${row.slug}: ${updateError.message}`);
        continue;
      }
    }

    if (promoting) promotedCount++;
    else if (demoting) demotedCount++;
  }

  console.log(`\n✨ Rescore complete. Promoted: ${promotedCount} | Demoted: ${demotedCount} | Regenerated: ${regeneratedCount} | Stable: ${stableCount} | Skipped (no source context): ${skippedNoContextCount}\n`);
  console.log(`ℹ️  Articles skipped for missing source context regain full re-scoring once ingestion archives their source texts (data/news/<slug>.json).`);

  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `RESCORE_PROMOTED=${promotedCount}\n`);
    fs.appendFileSync(process.env.GITHUB_ENV, `RESCORE_REGENERATED=${regeneratedCount}\n`);
  }
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
