"use strict";

/**
 * scripts/monitoring/queue-status.js
 *
 * Queue Observability:
 * Queries enrichment_jobs grouped by action_type and status,
 * prints and returns an aggregated status table.
 *
 * Stall detection: exits with code 2 when the pipeline looks wedged —
 * ZERO jobs completed across ALL action types within the stall window
 * while at least one queued job predates it. A warm backlog alone is
 * normal (discovery deliberately keeps queues fed), so only the total
 * completion drought fails the run; per-type laggards are printed but
 * don't alarm. Wire this into a scheduled workflow and a non-zero exit
 * turns the existing failure-alert emails into stall alerts.
 *
 * Args/env: --stall-hours N | STALL_HOURS (default 24), --no-stall-check
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

async function getQueueStatus() {
  const db = getClient();

  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("action_type, status, attempts, last_run_at, created_at, updated_at");

  if (error) {
    console.error("❌ Failed to query enrichment_jobs:", error.message);
    throw error;
  }

  const summary = {};
  const ACTION_TYPES = [
    "scrape_source",
    "lookup_benchmarks",
    "lookup_pricing",
    "lookup_specs",
    "research_gaps",
    "generate_editorial",
    "quality_check",
  ];

  for (const act of ACTION_TYPES) {
    summary[act] = {
      queued: 0,
      running: 0,
      done: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      doneInWindow: 0,
      oldestQueuedAt: null,
    };
  }

  for (const j of jobs || []) {
    const act = j.action_type;
    const st = j.status;
    if (!summary[act]) {
      summary[act] = { queued: 0, running: 0, done: 0, failed: 0, skipped: 0, total: 0, doneInWindow: 0, oldestQueuedAt: null };
    }
    if (summary[act][st] !== undefined) {
      summary[act][st] += 1;
    }
    summary[act].total += 1;

    if (st === "queued" && j.created_at) {
      const ts = new Date(j.created_at).getTime();
      if (!summary[act].oldestQueuedAt || ts < summary[act].oldestQueuedAt) {
        summary[act].oldestQueuedAt = ts;
      }
    }
  }

  return { summary, totalJobs: (jobs || []).length, jobs: jobs || [] };
}

/**
 * Pipeline-wide stall: no completions of ANY type within the window while a
 * queued job predates it. Per-type laggards (queued work but nothing done in
 * window for that type alone) are reported for visibility only.
 */
function detectStalls(statusData, stallHours) {
  const cutoff = Date.now() - stallHours * 60 * 60 * 1000;
  const completionsByType = {};

  for (const j of statusData.jobs) {
    if (j.status === "done" && j.updated_at && new Date(j.updated_at).getTime() >= cutoff) {
      completionsByType[j.action_type] = (completionsByType[j.action_type] || 0) + 1;
      if (statusData.summary[j.action_type]) {
        statusData.summary[j.action_type].doneInWindow += 1;
      }
    }
  }

  const laggingTypes = [];
  let globalStall = false;

  for (const [act, counts] of Object.entries(statusData.summary)) {
    if (counts.queued === 0) continue;
    const hasRecentCompletion = (completionsByType[act] || 0) > 0;
    const backlogIsOld = counts.oldestQueuedAt !== null && counts.oldestQueuedAt < cutoff;
    if (!hasRecentCompletion && backlogIsOld) {
      laggingTypes.push(act);
    }
  }

  const anyQueuedOlderThanWindow = Object.values(statusData.summary)
    .some((c) => c.oldestQueuedAt !== null && c.oldestQueuedAt < cutoff);
  const totalCompletionsInWindow = Object.values(completionsByType).reduce((a, b) => a + b, 0);
  globalStall = totalCompletionsInWindow === 0 && anyQueuedOlderThanWindow;

  return { globalStall, laggingTypes, stallHours };
}

function printQueueStatus(statusData) {
  const { summary, totalJobs } = statusData;

  console.log("\n==================== ENRICHMENT QUEUE STATUS ====================");
  console.log(
    "Action Type".padEnd(20) +
    "Done".padStart(8) +
    "Failed".padStart(9) +
    "Running".padStart(10) +
    "Queued".padStart(9) +
    "Skipped".padStart(10) +
    "Total".padStart(9)
  );
  console.log("-".repeat(75));

  for (const [action, counts] of Object.entries(summary)) {
    console.log(
      action.padEnd(20) +
      String(counts.done).padStart(8) +
      String(counts.failed).padStart(9) +
      String(counts.running).padStart(10) +
      String(counts.queued).padStart(9) +
      String(counts.skipped).padStart(10) +
      String(counts.total).padStart(9)
    );
  }
  console.log("-".repeat(75));
  console.log(`Total Tracked Jobs in Queue: ${totalJobs}\n`);
}

function parseStallArgs() {
  const args = process.argv.slice(2);
  if (args.includes("--no-stall-check")) return { enabled: false };
  const idx = args.indexOf("--stall-hours");
  const fromArg = idx !== -1 ? parseInt(args[idx + 1], 10) : NaN;
  const fromEnv = parseInt(process.env.STALL_HOURS || "", 10);
  const hours = Number.isFinite(fromArg) && fromArg > 0
    ? fromArg
    : (Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 24);
  return { enabled: true, hours };
}

async function main() {
  try {
    const statusData = await getQueueStatus();
    printQueueStatus(statusData);

    const stall = parseStallArgs();
    if (!stall.enabled) return;

    const verdict = detectStalls(statusData, stall.hours);
    if (verdict.laggingTypes.length > 0 && !verdict.globalStall) {
      console.log(
        `⚠️ No recent completions for: ${verdict.laggingTypes.join(", ")} ` +
        `(within ${verdict.stallHours}h) — informational, backlog still moving elsewhere.`
      );
    }
    if (verdict.globalStall) {
      console.error(
        `\n🚨 PIPELINE STALL: zero enrichment jobs completed in the last ${verdict.stallHours}h ` +
        `while queued work predates the window. Workers are not draining the queue.`
      );
      process.exit(2);
    }
  } catch (err) {
    console.error("Queue status check failed:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getQueueStatus, printQueueStatus, detectStalls };
