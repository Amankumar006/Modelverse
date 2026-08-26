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
 * 4. Promotes automatically when AUTO_PROMOTE_MODELS=true: a thin card whose
 *    recomputed scoreModelPage() clears the index gate flips quality_status to
 *    'indexed', capped at PROMOTION_CAP promotions per day (default 25) so a
 *    backlog can't flood the sitemap in one run. needs_review stays raised as
 *    a post-hoc audit signal, and every promotion is recorded in the job's
 *    result_summary.promoted for auditing. The `verified` flag and editorial
 *    prose remain human-gated regardless of this setting. When the flag is
 *    false (local default), crossing eligibility only raises needs_review and
 *    flipping to 'indexed' stays at curator approval, as before.
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

// Auto-promotion rails. Off by default; the scheduled workflow turns it on via
// repository variables so flipping the policy never requires a code deploy.
function promotionConfig() {
  const capRaw = parseInt(process.env.PROMOTION_CAP || "", 10);
  return {
    enabled: process.env.AUTO_PROMOTE_MODELS === "true",
    cap: !isNaN(capRaw) && capRaw > 0 ? capRaw : 25,
  };
}

// Daily promotion budget: count today's already-promoted cards from the audit
// trail (result_summary.promoted) so an hourly cron can't exceed the cap by
// running many small batches across the day.
async function countPromotionsToday(client) {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const { count, error } = await client
    .from("enrichment_jobs")
    .select("id", { count: "exact", head: true })
    .eq("action_type", "quality_check")
    .contains("result_summary", { promoted: true })
    .gte("updated_at", startOfToday.toISOString());
  if (error) {
    // Fail closed: an unreadable audit trail means we can't bound the cap.
    console.warn(`⚠️ Could not count today's promotions (${error.message}); auto-promotion disabled for this run.`);
    return null;
  }
  return count || 0;
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
  const promotion = promotionConfig();
  console.log(`🚀 [Worker: quality_check] Starting batch processing (batch size: ${batchSize}, auto-promote: ${promotion.enabled ? `on, cap ${promotion.cap}/day` : "off"})...`);

  let promotionsRemaining = 0;
  if (promotion.enabled) {
    const promotedToday = await countPromotionsToday(db);
    promotionsRemaining = promotedToday === null ? 0 : Math.max(0, promotion.cap - promotedToday);
    console.log(`📈 Promotion budget today: ${promotedToday === null ? "unavailable" : `${promotedToday}/${promotion.cap} used, ${promotionsRemaining} remaining`}`);
  }

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
    return { done: 0, failed: 0, demoted: 0, crossedEligibility: 0, promoted: 0 };
  }

  console.log(`📥 Claimed ${jobs.length} jobs to process.`);

  let doneCount = 0;
  let failedCount = 0;
  let demotedCount = 0;
  let crossedCount = 0;
  let promotedCount = 0;

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
      let promoted = false;

      if (wasEligible && !nowEligible) {
        // Regression: pull the card out of indexed feeds immediately and put
        // it in front of a curator with the fresh failure reasons.
        demoted = true;
        demotedCount++;
        updatePayload.quality_status = gate.status;
        updatePayload.needs_review = true;
      } else if (!wasEligible && nowEligible) {
        crossedIntoEligibility = true;
        crossedCount++;
        // needs_review stays raised either way — an auto-promotion is still a
        // post-hoc audit item for the curator queue, just no longer a blocker.
        if (!model.needs_review) updatePayload.needs_review = true;

        if (promotion.enabled && promotionsRemaining > 0) {
          updatePayload.quality_status = "indexed";
          promoted = true;
          promotedCount++;
          promotionsRemaining--;
        }

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
            promoted,
            timestamp: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      doneCount++;
      const transition = demoted
        ? `⬇️ DEMOTED (${model.quality_status} -> ${gate.status})`
        : promoted
          ? "⬆️ PROMOTED (auto) — flagged for curator audit"
          : crossedIntoEligibility
            ? promotion.enabled
              ? "⬆️ eligible — daily cap reached, promoting on a future run"
              : "⬆️ eligible — awaiting curator approval"
            : "steady";
      console.log(`  ✅ ${model.name}: ${gate.score}/100 (${gate.status}) — ${transition}`);
    } catch (err) {
      console.error(`  ❌ Quality check failed for model ${job.model_id}:`, err.message);
      await markJobFailure(db, job.id, err.message, (job.attempts || 0) + 1);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (quality_check) BATCH COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount} | Demoted: ${demotedCount} | Newly eligible: ${crossedCount} | Auto-promoted: ${promotedCount}`);
  return { done: doneCount, failed: failedCount, demoted: demotedCount, crossedEligibility: crossedCount, promoted: promotedCount };
}

if (require.main === module) {
  runQualityCheckWorker().catch((err) => {
    console.error("Worker error:", err);
    process.exit(1);
  });
}

module.exports = { runQualityCheckWorker, modelForScore };
