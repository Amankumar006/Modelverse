"use strict";

/**
 * scripts/workers/lookup-benchmarks.js
 *
 * Worker: lookup_benchmarks
 * 1. Claims a batch of 'queued' jobs for action_type = 'lookup_benchmarks'.
 * 2. Reads the crawled source snapshot from data/cache/snapshots/<model_id>.json.
 *    (If not yet available, re-queues the job with a note and defers).
 * 3. Runs deterministic table extraction via extract-benchmarks-deterministic.js.
 * 4. Confirms content substantiation via verify-citation-content.js.
 * 5. Applies field_confidence logic and stages benchmarks via staged-write
 *    (curator approval required before they reach live columns).
 * 6. Updates job status to 'done' (or 'failed' / 'skipped') with result_summary.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { extractBenchmarksFromMarkdownTable } = require("../lib/extract-benchmarks-deterministic");
const { verifyBenchmarkSubstantiation } = require("../lib/verify-citation-content");
const { sanitizeBenchmarksForWrite } = require("../lib/verified-write");
const { stageChanges } = require("../lib/staged-write");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);
const SNAPSHOTS_DIR = path.join(process.cwd(), "data", "cache", "snapshots");

function parseBatchSize() {
  const argIdx = process.argv.indexOf("--batch-size");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const parsed = parseInt(process.argv[argIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  const envSize = parseInt(process.env.BATCH_SIZE || "", 10);
  if (!isNaN(envSize) && envSize > 0) return envSize;
  return 25;
}

function loadSnapshot(modelId, slug) {
  const file1 = path.join(SNAPSHOTS_DIR, `${modelId}.json`);
  const file2 = slug ? path.join(SNAPSHOTS_DIR, `${slug}.json`) : null;

  if (fs.existsSync(file1)) {
    try {
      return JSON.parse(fs.readFileSync(file1, "utf8"));
    } catch {
      return null;
    }
  }

  if (file2 && fs.existsSync(file2)) {
    try {
      return JSON.parse(fs.readFileSync(file2, "utf8"));
    } catch {
      return null;
    }
  }

  return null;
}

async function runBenchmarkWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: lookup_benchmarks] Starting batch processing (batch size: ${batchSize})...`);

  // 1. Claim queued jobs
  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", "lookup_benchmarks")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error("❌ Failed to query queued jobs:", error.message);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log("✨ No queued jobs for lookup_benchmarks.");
    return { done: 0, failed: 0, skipped: 0 };
  }

  console.log(`📥 Claimed ${jobs.length} jobs to process.`);

  let doneCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const job of jobs) {
    // Mark running
    await db
      .from("enrichment_jobs")
      .update({
        status: "running",
        attempts: (job.attempts || 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    try {
      // Fetch model data
      const { data: model, error: modelErr } = await db
        .from("models")
        .select("*")
        .eq("id", job.model_id)
        .single();

      if (modelErr || !model) {
        throw new Error(modelErr ? modelErr.message : "Model not found in database");
      }

      // Check for source snapshot
      const snapshot = loadSnapshot(model.id, model.slug);
      if (!snapshot || !snapshot.text || snapshot.text.length < 50) {
        // Check dependency state in scrape_source
        const { data: scrapeJob } = await db
          .from("enrichment_jobs")
          .select("status, attempts, error")
          .eq("model_id", model.id)
          .eq("action_type", "scrape_source")
          .maybeSingle();

        const currentAttempts = job.attempts || 0;

        if (scrapeJob && (scrapeJob.status === "failed" || scrapeJob.status === "skipped" || scrapeJob.status === "blocked")) {
          console.log(`  🚫 Model ${model.name} scrape_source is ${scrapeJob.status}. Marking lookup_benchmarks as blocked.`);
          await db
            .from("enrichment_jobs")
            .update({
              status: "blocked",
              error: `Blocked because scrape_source is ${scrapeJob.status}: ${scrapeJob.error || "no content extracted"}`,
              result_summary: { reason: "source_failed" },
              updated_at: new Date().toISOString(),
            })
            .eq("id", job.id);
          skippedCount++;
          continue;
        }

        if (currentAttempts >= 5) {
          console.log(`  ⚠️ Model ${model.name} exceeded max 5 attempts awaiting snapshot. Marking needs_review.`);
          await db
            .from("enrichment_jobs")
            .update({
              status: "needs_review",
              error: "Exceeded max 5 retry attempts awaiting scrape_source snapshot",
              result_summary: { reason: "max_attempts_exceeded" },
              updated_at: new Date().toISOString(),
            })
            .eq("id", job.id);
          skippedCount++;
          continue;
        }

        console.log(`  ⏳ Model ${model.name} is awaiting scrape_source snapshot (attempt ${currentAttempts}/5). Setting status to waiting...`);
        await db
          .from("enrichment_jobs")
          .update({
            status: "waiting",
            result_summary: { note: "awaiting snapshot from scrape_source", attempt: currentAttempts },
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        skippedCount++;
        continue;
      }

      console.log(`  📊 Analyzing snapshot for benchmarks: ${model.name}...`);
      const extracted = extractBenchmarksFromMarkdownTable(snapshot.text, model.name);

      const sources = Array.isArray(model.sources) ? [...model.sources] : [];
      const primaryCitation = (snapshot.crawledUrls && snapshot.crawledUrls[0]) || sources[0] || `https://huggingface.co/${model.slug}`;

      const substantiatedBenchmarks = [];
      const rejectedBenchmarks = [];

      for (const b of extracted) {
        const sub = verifyBenchmarkSubstantiation(snapshot.text, b.name, b.score);
        if (sub.substantiated) {
          substantiatedBenchmarks.push({
            name: b.name,
            score: b.score,
            sources: [primaryCitation],
            verified: true,
          });
        } else {
          rejectedBenchmarks.push({
            name: b.name,
            score: b.score,
            reason: "Score not substantiated within proximity window of snapshot text",
          });
        }
      }

      // Record evidence in model_evidence table
      for (const b of substantiatedBenchmarks) {
        try {
          const fieldKey = `benchmarks.${b.name.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
          await db.from("model_evidence").upsert({
            model_id: model.id,
            field_name: fieldKey,
            source_type: "official_model_card",
            source_url: primaryCitation,
            extracted_value: { score: b.score, name: b.name },
            confidence: "OFFICIAL",
            verification_notes: "Substantiated in official markdown table snapshot with exact score match",
            extracted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: "model_id,field_name,source_url" });
        } catch (evErr) {
          // Non-fatal logging
          console.warn(`  ⚠️ Could not record evidence for benchmark ${b.name}:`, evErr.message);
        }
      }

      // Merge with existing valid benchmarks if any
      const existingBenchmarks = Array.isArray(model.benchmarks) ? model.benchmarks : [];
      const combinedBenchmarks = [...substantiatedBenchmarks];

      for (const eb of existingBenchmarks) {
        if (eb && eb.name && !combinedBenchmarks.some((cb) => cb.name.toLowerCase() === eb.name.toLowerCase())) {
          combinedBenchmarks.push(eb);
        }
      }

      // Write-layer guardrail validation
      const validation = sanitizeBenchmarksForWrite(combinedBenchmarks, [primaryCitation, ...sources]);

      if (!validation.valid) {
        console.warn(`  ⚠️ Benchmark sanitation warnings for ${model.name}:`, validation.errors);
      }

      const finalBenchmarks = validation.sanitized;
      const fieldConfidence = typeof model.field_confidence === "object" && model.field_confidence !== null
        ? { ...model.field_confidence }
        : {};

      if (finalBenchmarks.length >= 2) {
        fieldConfidence.benchmarks = "OFFICIAL";
      } else if (finalBenchmarks.length === 1) {
        fieldConfidence.benchmarks = "LIKELY";
      }

      // Stage benchmark proposals for curator approval — no direct live writes.
      if (finalBenchmarks.length > 0) {
        const updatedSources = Array.from(new Set([...sources, primaryCitation]));
        await stageChanges(db, model.id, {
          benchmarks: finalBenchmarks,
          field_confidence: fieldConfidence,
          sources: updatedSources,
        });
      }

      const resultSummary = {
        benchmarksFound: extracted.length,
        substantiated: substantiatedBenchmarks.length,
        totalStored: finalBenchmarks.length,
        rejected: rejectedBenchmarks,
        timestamp: new Date().toISOString(),
      };

      await db
        .from("enrichment_jobs")
        .update({
          status: "done",
          error: null,
          result_summary: resultSummary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      doneCount++;
      console.log(`  ✅ Benchmark lookup done for ${model.name}: ${substantiatedBenchmarks.length} substantiated / ${extracted.length} extracted.`);
    } catch (err) {
      console.error(`  ❌ Benchmark job failed for model ${job.model_id}:`, err.message);
      await db
        .from("enrichment_jobs")
        .update({
          status: "failed",
          error: err.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (lookup_benchmarks) BATCH COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount} | Skipped (awaiting snapshot): ${skippedCount}`);
  return { done: doneCount, failed: failedCount, skipped: skippedCount };
}

if (require.main === module) {
  runBenchmarkWorker().catch((err) => {
    console.error("Worker error:", err);
    process.exit(1);
  });
}

module.exports = { runBenchmarkWorker };
