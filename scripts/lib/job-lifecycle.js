"use strict";

/**
 * scripts/lib/job-lifecycle.js
 *
 * Shared enrichment-job lifecycle helpers used by queue-claiming workers.
 */

const MAX_ATTEMPTS = 5;

/**
 * Records a job failure, transitioning to terminal 'needs_review' once the
 * attempt cap is exhausted so discovery stops re-queueing it every hour
 * (documented protocol in WORKER_ARCHITECTURE.md §1).
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} db - service-role client
 * @param {string} jobId - enrichment_jobs.id
 * @param {string} message - failure detail stored in `error`
 * @param {number} currentAttempt - attempt number of THIS run (job.attempts + 1)
 * @returns {boolean} true when the job hit the cap and moved to needs_review
 */
async function markJobFailure(db, jobId, message, currentAttempt) {
  const capped = currentAttempt >= MAX_ATTEMPTS;
  await db
    .from("enrichment_jobs")
    .update({
      status: capped ? "needs_review" : "failed",
      error: message,
      ...(capped ? { result_summary: { reason: "max_attempts_exceeded" } } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);
  return capped;
}

/**
 * Stage chaining: after a fact-stage job completes successfully, make sure the
 * model's quality_check job re-runs so the deterministic gate re-scores the
 * card against its freshest state (raising needs_review when an unscored card
 * crosses into index eligibility — quality_check never promotes directly,
 * curator approval does). Without this, a long-tail model whose one QC pass
 * ran before its facts landed would stay scored on stale data forever, since
 * freshness re-queueing is discovery-driven and discovery only sweeps the
 * top-100 thin models.
 *
 * Re-queues an existing done/blocked/skipped row, inserts one when absent, and
 * leaves queued/running/needs_review rows untouched so in-flight or
 * attempt-capped jobs are never clobbered.
 *
 * Best-effort by design: chaining is bookkeeping, not the job's payload — a
 * failure here must never flip an already-completed job to failed.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} db - service-role client
 * @param {string} modelId - models.id whose quality gate should refresh
 * @returns {boolean} true when the quality_check job is queued or already live
 */
async function queueQualityCheck(db, modelId) {
  const now = new Date().toISOString();
  try {
    const { data: revived, error: reviveErr } = await db
      .from("enrichment_jobs")
      .update({ status: "queued", updated_at: now })
      .eq("model_id", modelId)
      .eq("action_type", "quality_check")
      .in("status", ["done", "skipped", "blocked"])
      .select("id");
    if (!reviveErr && revived && revived.length > 0) return true;

    const { error: upsertErr } = await db
      .from("enrichment_jobs")
      .upsert(
        [{ model_id: modelId, action_type: "quality_check", status: "queued" }],
        { onConflict: "model_id,action_type", ignoreDuplicates: true },
      );
    if (upsertErr) {
      console.warn(`⚠️ [job-lifecycle] could not chain quality_check for ${modelId}:`, upsertErr.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`⚠️ [job-lifecycle] could not chain quality_check for ${modelId}:`, err.message);
    return false;
  }
}

module.exports = { MAX_ATTEMPTS, markJobFailure, queueQualityCheck };
