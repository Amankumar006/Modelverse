"use strict";

/**
 * scripts/backfill-enqueue-jobs.js
 *
 * ONE-OFF Phase 4 backlog closure (safe to re-run — idempotent).
 *
 * Discovery only fans out to NEW trending + the current top-100 thin models,
 * so long-tail models that predate the pipeline never get enrichment jobs at
 * all (the Aug 2026 audit found ~345 such models). This script inserts the
 * MISSING (model_id, action_type) enrichment_jobs rows for every thin model ×
 * pipeline stage so the hourly workers can drain the backlog over time.
 *
 * Idempotency: only rows that do not exist yet are inserted (upsert with
 * ignoreDuplicates on model_id,action_type). Jobs already done/failed/queued
 * are left exactly as they are — freshness-based re-queueing stays discovery's
 * job, not this script's.
 *
 * Usage:
 *   node scripts/backfill-enqueue-jobs.js [--dry-run] [--limit N]
 * Env: SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Same stage list discovery fans out, plus research_gaps so gap-closing is
// part of every thin model's backlog (the worker orders featured-first).
const ACTION_TYPES = [
  "scrape_source",
  "lookup_specs",
  "lookup_pricing",
  "lookup_benchmarks",
  "research_gaps",
];

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    limit: (() => {
      const idx = args.indexOf("--limit");
      if (idx === -1 || !args[idx + 1]) return null;
      const parsed = parseInt(args[idx + 1], 10);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    })(),
  };
}

async function main() {
  const { dryRun, limit } = parseArgs();

  console.log(`🚀 [backfill-enqueue] ${dryRun ? "(DRY RUN) " : ""}Closing the thin-model job backlog...\n`);

  // 1. Thin candidates — same definition discovery uses for its own sweep,
  //    plus the DISPUTED exclusion the research worker enforces.
  let query = db
    .from("models")
    .select("id, slug")
    .or("quality_status.eq.thin,quality_status.is.null")
    .neq("status", "staged")
    .neq("verification_status", "DISPUTED")
    .order("featured", { ascending: false })
    .order("boost", { ascending: false })
    .order("release_date", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data: models, error } = await query;
  if (error) {
    console.error("❌ Failed to load thin models:", error.message);
    process.exit(1);
  }

  if (!models || models.length === 0) {
    console.log("✨ No thin models found — backlog already closed.");
    return;
  }
  console.log(`📋 Thin models in scope: ${models.length}${limit ? ` (capped)` : ""}`);

  // 2. Existing jobs for these models — insert ONLY missing combinations.
  const modelIds = models.map((m) => m.id);
  const existing = new Set();
  for (let i = 0; i < modelIds.length; i += 200) {
    const chunk = modelIds.slice(i, i + 200);
    const { data: jobs, error: jobsErr } = await db
      .from("enrichment_jobs")
      .select("model_id, action_type")
      .in("model_id", chunk)
      .in("action_type", ACTION_TYPES);
    if (jobsErr) {
      console.error("❌ Failed to load existing jobs:", jobsErr.message);
      process.exit(1);
    }
    for (const j of jobs || []) existing.add(`${j.model_id}:${j.action_type}`);
  }

  const rows = [];
  const perType = Object.fromEntries(ACTION_TYPES.map((t) => [t, 0]));
  for (const model of models) {
    for (const actionType of ACTION_TYPES) {
      if (existing.has(`${model.id}:${actionType}`)) continue;
      rows.push({ model_id: model.id, action_type: actionType, status: "queued" });
      perType[actionType]++;
    }
  }

  console.log(`📦 Missing job rows to insert: ${rows.length}`);
  for (const t of ACTION_TYPES) console.log(`   - ${t}: ${perType[t]}`);

  if (rows.length === 0) {
    console.log("✨ Nothing to insert — all combinations already exist.");
    return;
  }

  if (dryRun) {
    console.log("\n👁 Dry run — no rows written. Re-run without --dry-run to apply.");
    return;
  }

  // 3. Insert in chunks; ignoreDuplicates keeps concurrent runs harmless.
  const CHUNK = 500;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { data: upserted, error: upsertErr } = await db
      .from("enrichment_jobs")
      .upsert(chunk, { onConflict: "model_id,action_type", ignoreDuplicates: true })
      .select("id");
    if (upsertErr) {
      console.error(`❌ Chunk ${Math.floor(i / CHUNK)} failed:`, upsertErr.message);
      continue;
    }
    inserted += (upserted || []).length;
  }

  console.log(`\n✅ Inserted ${inserted}/${rows.length} missing job rows.`);
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
