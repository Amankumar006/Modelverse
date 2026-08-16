"use strict";

/**
 * scripts/workers/scrape-source.js
 *
 * Worker: scrape_source
 * 1. Claims a batch of 'queued' jobs for action_type = 'scrape_source'.
 * 2. Crawls official source text (Hugging Face README, config, linked blog posts, arXiv).
 * 3. Writes raw crawled snapshot to data/cache/snapshots/<model_id>.json for shared worker consumption.
 * 4. Updates job status to 'done' (or 'failed' / 'skipped') with result_summary.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { crawlDeepOfficialSource } = require("../lib/crawl-deep-sources");
const { fetchReadme, extractOfficialUrls } = require("../lib/extract-official-urls");
const { fetchPageText } = require("../lib/verify-citation-content");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const SNAPSHOTS_DIR = path.join(process.cwd(), "data", "cache", "snapshots");
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

function parseBatchSize() {
  const argIdx = process.argv.indexOf("--batch-size");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const parsed = parseInt(process.argv[argIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  const envSize = parseInt(process.env.BATCH_SIZE || "", 10);
  if (!isNaN(envSize) && envSize > 0) return envSize;
  return 25; // Default batch size
}

function getHfRepoFromModel(model) {
  const links = model.links || {};
  if (typeof links === "object") {
    for (const [, v] of Object.entries(links)) {
      if (typeof v === "string" && v.includes("huggingface.co/")) {
        const clean = v.replace(/^https?:\/\/huggingface\.co\//, "").replace(/\/$/, "");
        const parts = clean.split("/").filter(Boolean);
        if (parts.length === 2 && !["datasets", "spaces", "collections", "papers"].includes(parts[0])) {
          return `${parts[0]}/${parts[1]}`;
        }
      }
    }
  }

  const sources = Array.isArray(model.sources) ? model.sources : [];
  for (const s of sources) {
    if (typeof s === "string" && s.includes("huggingface.co/")) {
      const clean = s.replace(/^https?:\/\/huggingface\.co\//, "").replace(/\/$/, "");
      const parts = clean.split("/").filter(Boolean);
      if (parts.length === 2 && !["datasets", "spaces", "collections", "papers"].includes(parts[0])) {
        return `${parts[0]}/${parts[1]}`;
      }
    }
  }

  return null;
}

async function scrapeModelSources(model) {
  const crawledUrls = [];
  const texts = [];

  const hfRepo = getHfRepoFromModel(model);

  // 1. Try deep official crawling via Hugging Face repository
  if (hfRepo) {
    crawledUrls.push(`https://huggingface.co/${hfRepo}`);
    const deepText = await crawlDeepOfficialSource(hfRepo);
    if (deepText && deepText.length > 50) {
      texts.push(deepText);
    }
  }

  // 2. Crawl any attached links (case-insensitive keys) and sources
  const links = model.links || {};
  const linkValues = typeof links === "object" ? Object.values(links) : [];
  const modelSources = Array.isArray(model.sources) ? model.sources : [];

  const directUrls = [...linkValues, ...modelSources]
    .filter((u) => typeof u === "string" && u.startsWith("http") && !u.includes("models.dev") && !u.includes("openrouter.ai"));

  for (const url of directUrls) {
    if (!crawledUrls.includes(url)) {
      crawledUrls.push(url);
      const pageText = await fetchPageText(url);
      if (pageText && pageText.length > 50) {
        texts.push(pageText);
      }
    }
  }

  // 3. Fallback: Always include baseline curated description if available
  if (model.description && model.description.length > 30) {
    texts.push(`## Model Description (${model.name})\n${model.description}`);
  }

  const combinedText = texts.join("\n\n---\n\n").trim();
  return {
    crawledUrls,
    text: combinedText,
    byteCounts: Buffer.byteLength(combinedText, "utf8"),
  };
}

async function runScrapeWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: scrape_source] Starting batch processing (batch size: ${batchSize})...`);

  // 1. Claim queued jobs
  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", "scrape_source")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error("❌ Failed to query queued jobs:", error.message);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log("✨ No queued jobs for scrape_source.");
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

      console.log(`  🌐 Scraping sources for: ${model.name} (${model.slug})...`);
      const { crawledUrls, text, byteCounts } = await scrapeModelSources(model);

      if (!text || text.length < 50) {
        console.warn(`  ⚠️ No content extracted for ${model.name}`);
        await db
          .from("enrichment_jobs")
          .update({
            status: "failed",
            error: "No source content could be retrieved",
            result_summary: {
              crawledUrls,
              byteCounts: 0,
              timestamp: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        failedCount++;
        continue;
      }

      // Save snapshot to disk
      const snapshotPayload = {
        modelId: model.id,
        slug: model.slug,
        name: model.name,
        crawledAt: new Date().toISOString(),
        crawledUrls,
        byteCounts,
        text,
      };

      const snapshotFile = path.join(SNAPSHOTS_DIR, `${model.id}.json`);
      const slugFile = path.join(SNAPSHOTS_DIR, `${model.slug}.json`);
      fs.writeFileSync(snapshotFile, JSON.stringify(snapshotPayload, null, 2), "utf8");
      fs.writeFileSync(slugFile, JSON.stringify(snapshotPayload, null, 2), "utf8");

      const resultSummary = {
        crawledUrls,
        byteCounts,
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
      console.log(`  ✅ Successfully saved snapshot for ${model.name} (${byteCounts} bytes).`);
    } catch (err) {
      console.error(`  ❌ Job failed for model ${job.model_id}:`, err.message);
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

  console.log(`\n=== WORKER (scrape_source) BATCH COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount} | Skipped: ${skippedCount}`);
  return { done: doneCount, failed: failedCount, skipped: skippedCount };
}

if (require.main === module) {
  runScrapeWorker().catch((err) => {
    console.error("Worker error:", err);
    process.exit(1);
  });
}

module.exports = { runScrapeWorker, scrapeModelSources };
