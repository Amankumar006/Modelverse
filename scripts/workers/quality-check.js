"use strict";

/**
 * scripts/workers/quality-check.js
 *
 * Worker: quality_check
 * Hourly, cheap, LLM-free recompute of the deterministic quality gate:
 * 1. Claims a batch of 'queued' jobs for action_type = 'quality_check'.
 * 2. Recomputes scoreModelPage() per model and refreshes derived bookkeeping
 *    (quality_score / quality_reasons / quality_breakdown / quality_checked_at).
 * 3. Demotes on regression: a previously-indexed card that no longer clears
 *    the gate drops to its recomputed status immediately and raises needs_review.
 * 4. NEVER promotes: a thin card that crosses into index eligibility only gets
 *    needs_review raised — flipping quality_status to 'indexed' (which feeds
 *    the public indexed views) happens exclusively at curator approval.
 * 5. Updates job status to 'done' (or 'failed' via markJobFailure).
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");
const { markJobFailure } = require("../lib/job-lifecycle");
const { scoreModelPage } = require("../quality/score-content");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseBatchSize() {
  const argIdx = process.argv.indexOf("--batch-size");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const parsed = parseInt(process.argv[argIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  const envSize = parseInt(process.env.BATCH_SIZE || "", 10);
  if (!isNaN(envSize) && envSize > 0) return envSize;
  return 50; // Pure compute + one read/write per model — cheap.
}

// Same DB-row -> scorer mapping as scripts/recompute-quality.js: scoreModelPage
// consumes the camelCase snapshot shape, not raw snake_case columns.
function modelForScore(row) {
  return {
    ...(row.metadata || {}),
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    releaseDate: row.release_date,
    type: row.type,
    status: row.status,
    parameters: row.parameters,
    activeParameters: row.active_parameters,
    contextWindow: row.context_window,
    modality: row.modality || [],
    deployment: row.deployment || [],
    primaryTask: row.primary_task,
    license: row.license,
    family: row.family,
    tier: row.tier,
    previousVersion: row.previous_version,
    baseModel: row.base_model,
    description: row.description,
    descriptionDraft: row.description_draft,
    cardSummary: row.card_summary,
    pageOverview: row.page_overview,
    editorialNote: row.editorial_note,
    keyFeatures: row.key_features || [],
    benchmarks: row.benchmarks || [],
    pricing: row.pricing,
    pricingLastVerified: row.pricing_last_verified,
    links: row.links || row.resources || {},
    sources: row.sources || [],
    tags: row.tags || [],
    quickstart: row.metadata?.quickstart,
    customSections: row.metadata?.custom_sections,
  };
}

async function runQualityCheckWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: quality_check] Starting batch processing (batch size: ${batchSize})...`);

  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", "quality_check")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error("❌ Failed to query queued jobs:", error.message);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log("✨ No queued jobs for quality_check.");
    return { done: 0, failed: 0, demoted: 0, crossedEligibility: 0 };
  }

  console.log(`📥 Claimed ${jobs.length} jobs to process.`);

  let doneCount = 0;
  let failedCount = 0;
  let demotedCount = 0;
  let crossedCount = 0;

  for (const job of jobs) {
    await db
      .from("enrichment_jobs")
      .update({
        status: "running",
        attempts: (job.attempts || 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    try {
      const { data: model, error: modelErr } = await db
        .from("models")
        .select("*")
        .eq("id", job.model_id)
        .single();

      if (modelErr || !model) {
        throw new Error(modelErr ? modelErr.message : "Model not found in database");
      }

      const gate = scoreModelPage(modelForScore(model));
      const wasEligible = model.quality_status === "indexed";
      const nowEligible = gate.status === "indexed";

      // Derived bookkeeping is always refreshed — these columns describe the
      // live card as scored right now, they are not content.
      const updatePayload = {
        quality_score: gate.score,
        quality_reasons: gate.reasons || [],
        quality_breakdown: gate.breakdown || null,
        quality_checked_at: new Date().toISOString(),
      };

      let demoted = false;
      let crossedIntoEligibility = false;

      if (wasEligible && !nowEligible) {
        // Regression: pull the card out of indexed feeds immediately and put
        // it in front of a curator with the fresh failure reasons.
        demoted = true;
        demotedCount++;
        updatePayload.quality_status = gate.status;
        updatePayload.needs_review = true;
      } else if (!wasEligible && nowEligible) {
        // Crossing into eligibility is a PROMOTION signal, not a promotion:
        // quality_status stays untouched until a curator approves. Raise the
        // flag only when it isn't already pending review.
        crossedIntoEligibility = true;
        crossedCount++;
        if (!model.needs_review) updatePayload.needs_review = true;

        // The card now clears editorial's fact-completeness gate, so prose
        // generation becomes worthwhile. Revive any parked job first (the
        // editorial worker parks ineligible ones as 'blocked'), then create
        // the row if it doesn't exist at all.
        const { error: revErr } = await db
          .from("enrichment_jobs")
          .update({ status: "queued", updated_at: new Date().toISOString() })
          .eq("model_id", model.id)
          .eq("action_type", "generate_editorial")
          .in("status", ["blocked", "skipped"]);
        if (revErr) {
          console.warn(`  ⚠️ Could not revive generate_editorial for ${model.slug}: ${revErr.message}`);
        }
        const { error: edErr } = await db
          .from("enrichment_jobs")
          .upsert(
            [{ model_id: model.id, action_type: "generate_editorial", status: "queued" }],
            { onConflict: "model_id,action_type", ignoreDuplicates: true },
          );
        if (edErr) {
          // Non-fatal: the card is still fully reviewable without prose.
          console.warn(`  ⚠️ Could not queue generate_editorial for ${model.slug}: ${edErr.message}`);
        }
      }
      // Stable cards get bookkeeping only — never touch needs_review.

      const { error: updateError } = await db
        .from("models")
        .update(updatePayload)
        .eq("id", model.id);

      if (updateError) {
        throw new Error(`Quality write failed for ${model.slug}: ${updateError.message}`);
      }

      await db
        .from("enrichment_jobs")
        .update({
          status: "done",
          error: null,
          result_summary: {
            slug: model.slug,
            score: gate.score,
            gateStatus: gate.status,
            prevStatus: model.quality_status ?? null,
            demoted,
            crossedIntoEligibility,
            timestamp: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      doneCount++;
      const transition = demoted
        ? `⬇️ DEMOTED (${model.quality_status} -> ${gate.status})`
        : crossedIntoEligibility
          ? "⬆️ eligible — awaiting curator approval"
          : "steady";
      console.log(`  ✅ ${model.name}: ${gate.score}/100 (${gate.status}) — ${transition}`);
    } catch (err) {
      console.error(`  ❌ Quality check failed for model ${job.model_id}:`, err.message);
      await markJobFailure(db, job.id, err.message, (job.attempts || 0) + 1);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (quality_check) BATCH COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount} | Demoted: ${demotedCount} | Newly eligible: ${crossedCount}`);
  return { done: doneCount, failed: failedCount, demoted: demotedCount, crossedEligibility: crossedCount };
}

if (require.main === module) {
  runQualityCheckWorker().catch((err) => {
    console.error("Worker error:", err);
    process.exit(1);
  });
}

module.exports = { runQualityCheckWorker, modelForScore };
