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

module.exports = { MAX_ATTEMPTS, markJobFailure };
