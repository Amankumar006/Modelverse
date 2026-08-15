"use strict";

/**
 * scripts/discovery/discover-and-queue.js
 *
 * Discovery Orchestrator:
 * 1. Pulls candidate models (newly trending HF models + existing thin/unverified models).
 * 2. Fans out 4 independent action_types per candidate model into `enrichment_jobs`.
 * 3. Respects freshness windows (30d pricing/specs, 90d benchmarks/sources).
 * 4. Purely a fan-out step — logs queued job counts and exits.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const https = require("https");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const ACTION_TYPES = [
  "scrape_source",
  "lookup_benchmarks",
  "lookup_pricing",
  "lookup_specs",
];

const FRESHNESS_WINDOWS_MS = {
  scrape_source: 90 * 24 * 60 * 60 * 1000,     // 90 days
  lookup_benchmarks: 90 * 24 * 60 * 60 * 1000, // 90 days
  lookup_pricing: 30 * 24 * 60 * 60 * 1000,    // 30 days
  lookup_specs: 30 * 24 * 60 * 60 * 1000,      // 30 days
};

function getHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Discovery-Bot/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

async function discoverNewTrendingModels() {
  console.log("🔍 Scanning Hugging Face Trending for new candidate models...");
  const candidateIds = [];

  try {
    const raw = await getHttps("https://huggingface.co/api/models?limit=25");
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];

    for (const item of list) {
      if (!item.id) continue;
      const parts = item.id.split("/");
      const author = parts[0] || "Other";
      const modelName = parts[1] || item.id;
      const modelSlug = slugify(modelName);

      // Check if already in DB
      const { data: existing } = await db
        .from("models")
        .select("id")
        .or(`slug.eq.${modelSlug},name.eq.${modelName}`)
        .limit(1);

      if (!existing || existing.length === 0) {
        // Insert candidate skeleton
        const newModel = {
          name: modelName,
          slug: modelSlug,
          developer: author,
          release_date: new Date().toISOString().split("T")[0],
          type: "open-weights",
          status: "active",
          modality: ["text"],
          primary_task: "chat-reasoning",
          deployment: ["self-hostable"],
          license: "Other/Custom",
          description: `${modelName} is a model developed by ${author}.`,
          sources: [`https://huggingface.co/${item.id}`],
          links: { huggingface: `https://huggingface.co/${item.id}` },
          verified: false,
          needs_review: true,
          verification_status: "DRAFT",
          quality_status: "thin",
          quality_score: 40,
          boost: 1,
          featured: false,
        };

        const { data: inserted, error } = await db
          .from("models")
          .insert(newModel)
          .select("id, name, slug")
          .single();

        if (!error && inserted) {
          console.log(`  ✨ Discovered new model skeleton: ${inserted.name} (${inserted.id})`);
          candidateIds.push(inserted);
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ Hugging Face discovery check had a non-fatal warning:", err.message);
  }

  return candidateIds;
}

async function discoverThinExistingModels(limit = 100) {
  console.log(`🔍 Fetching priority thin models from database (limit ${limit})...`);

  const { data: thinModels, error } = await db
    .from("models")
    .select("id, name, slug, boost, release_date, quality_status, quality_score")
    .or("quality_status.eq.thin,quality_status.is.null")
    .order("boost", { ascending: false })
    .order("release_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("❌ Failed fetching thin models:", error.message);
    return [];
  }

  return thinModels || [];
}

async function discoverAndQueue() {
  console.log("🚀 Starting Discovery & Fan-Out Orchestrator...");

  // 1. Discover new candidate models + load thin candidates
  const newModels = await discoverNewTrendingModels();
  const thinModels = await discoverThinExistingModels(100);

  // Merge unique candidate models
  const modelMap = new Map();
  for (const m of [...newModels, ...thinModels]) {
    modelMap.set(m.id, m);
  }
  const candidateModels = Array.from(modelMap.values());
  console.log(`📋 Total Candidate Models for Evaluation: ${candidateModels.length}`);

  if (candidateModels.length === 0) {
    console.log("✨ No candidate models found to queue.");
    return;
  }

  const modelIds = candidateModels.map((m) => m.id);

  // 2. Fetch existing enrichment jobs for these models
  const { data: existingJobs, error: jobsErr } = await db
    .from("enrichment_jobs")
    .select("id, model_id, action_type, status, last_run_at, attempts")
    .in("model_id", modelIds);

  if (jobsErr) {
    console.error("❌ Failed to query existing enrichment_jobs:", jobsErr.message);
    process.exit(1);
  }

  const existingMap = new Map();
  for (const j of existingJobs || []) {
    existingMap.set(`${j.model_id}:${j.action_type}`, j);
  }

  const now = Date.now();
  const jobsToUpsert = [];
  const queuedCounts = {
    scrape_source: 0,
    lookup_benchmarks: 0,
    lookup_pricing: 0,
    lookup_specs: 0,
  };

  for (const model of candidateModels) {
    for (const actionType of ACTION_TYPES) {
      const key = `${model.id}:${actionType}`;
      const existing = existingMap.get(key);
      const freshnessWindow = FRESHNESS_WINDOWS_MS[actionType] || (30 * 24 * 60 * 60 * 1000);

      let shouldQueue = false;

      if (!existing) {
        // No job exists yet -> Queue
        shouldQueue = true;
      } else if (existing.status === "failed") {
        // Failed job -> Retry / re-queue
        shouldQueue = true;
      } else if (existing.status === "running") {
        // Stale running job (> 2 hours) -> Re-queue
        const lastRunTime = existing.last_run_at ? new Date(existing.last_run_at).getTime() : 0;
        if (now - lastRunTime > 2 * 60 * 60 * 1000) {
          shouldQueue = true;
        }
      } else if (existing.status === "done") {
        // Done job -> Re-queue only if stale past freshness window
        const lastRunTime = existing.last_run_at ? new Date(existing.last_run_at).getTime() : 0;
        if (now - lastRunTime > freshnessWindow) {
          shouldQueue = true;
        }
      }

      if (shouldQueue) {
        jobsToUpsert.push({
          model_id: model.id,
          action_type: actionType,
          status: "queued",
          updated_at: new Date().toISOString(),
        });
        queuedCounts[actionType] = (queuedCounts[actionType] || 0) + 1;
      }
    }
  }

  console.log(`📦 Preparing to upsert ${jobsToUpsert.length} jobs into enrichment_jobs...`);

  // Batch upsert jobs in chunks of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < jobsToUpsert.length; i += BATCH_SIZE) {
    const chunk = jobsToUpsert.slice(i, i + BATCH_SIZE);
    const { error: upsertErr } = await db
      .from("enrichment_jobs")
      .upsert(chunk, { onConflict: "model_id,action_type" });

    if (upsertErr) {
      console.error(`❌ Batch upsert error (chunk ${i / BATCH_SIZE}):`, upsertErr.message);
    }
  }

  console.log("\n=== DISCOVERY & QUEUE SUMMARY ===");
  console.log(`Candidates Evaluated: ${candidateModels.length}`);
  console.log(`Total Jobs Queued:    ${jobsToUpsert.length}`);
  console.log(` - scrape_source:      ${queuedCounts.scrape_source}`);
  console.log(` - lookup_benchmarks:  ${queuedCounts.lookup_benchmarks}`);
  console.log(` - lookup_pricing:     ${queuedCounts.lookup_pricing}`);
  console.log(` - lookup_specs:       ${queuedCounts.lookup_specs}`);
}

if (require.main === module) {
  discoverAndQueue().catch((err) => {
    console.error("Discovery error:", err);
    process.exit(1);
  });
}

module.exports = { discoverAndQueue };
