"use strict";

/**
 * scripts/monitoring/queue-status.js
 *
 * Queue Observability:
 * Queries enrichment_jobs grouped by action_type and status,
 * prints and returns an aggregated status table.
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
    .select("action_type, status, attempts, last_run_at");

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
  ];

  for (const act of ACTION_TYPES) {
    summary[act] = {
      queued: 0,
      running: 0,
      done: 0,
      failed: 0,
      skipped: 0,
      total: 0,
    };
  }

  for (const j of jobs || []) {
    const act = j.action_type;
    const st = j.status;
    if (!summary[act]) {
      summary[act] = { queued: 0, running: 0, done: 0, failed: 0, skipped: 0, total: 0 };
    }
    if (summary[act][st] !== undefined) {
      summary[act][st] += 1;
    }
    summary[act].total += 1;
  }

  return { summary, totalJobs: (jobs || []).length };
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

async function main() {
  try {
    const statusData = await getQueueStatus();
    printQueueStatus(statusData);
  } catch (err) {
    console.error("Queue status check failed:", err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getQueueStatus, printQueueStatus };
