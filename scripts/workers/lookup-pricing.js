"use strict";

/**
 * scripts/workers/lookup-pricing.js
 *
 * Worker: lookup_pricing
 * 1. Claims a batch of 'queued' jobs for action_type = 'lookup_pricing'.
 * 2. Fetches live pricing & context window data from OpenRouter API.
 * 3. Writes pricing & context_window with source citation 'https://openrouter.ai/api/v1/models'.
 * 4. Sets field_confidence.pricing = 'VERIFIED'.
 * 5. Updates job status to 'done' (or 'failed' / 'skipped') with result_summary.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const https = require("https");
const { createClient } = require("@supabase/supabase-js");
const { markJobFailure } = require("../lib/job-lifecycle");

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
  return 25;
}

function norm(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function fetchOpenRouterLive() {
  return new Promise((resolve) => {
    const headers = { "User-Agent": "Modelverse-PricingWorker/1.0" };
    if (process.env.OPENROUTER_API_KEY) {
      headers["Authorization"] = `Bearer ${process.env.OPENROUTER_API_KEY}`;
    }
    const req = https.get("https://openrouter.ai/api/v1/models", { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.data || []);
        } catch {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function loadCachedOpenRouter() {
  try {
    const p = path.join(process.cwd(), "data", "cache", "openrouter.json");
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, "utf8"));
      return raw.data?.data || raw.data || [];
    }
  } catch {}
  return [];
}

async function runPricingWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: lookup_pricing] Starting batch processing (batch size: ${batchSize})...`);

  // 1. Claim queued jobs
  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", "lookup_pricing")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error("❌ Failed to query queued jobs:", error.message);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log("✨ No queued jobs for lookup_pricing.");
    return { done: 0, failed: 0, skipped: 0 };
  }

  console.log(`📥 Claimed ${jobs.length} jobs to process.`);

  // Load OpenRouter catalog (live with snapshot fallback)
  console.log("🌐 Fetching OpenRouter live model catalog...");
  let orModels = await fetchOpenRouterLive();
  if (!orModels || orModels.length === 0) {
    console.warn("⚠️ OpenRouter live API unavailable; falling back to cached snapshot.");
    orModels = loadCachedOpenRouter();
  }
  console.log(`📋 Loaded ${orModels.length} OpenRouter model entries for matching.`);

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
      // Fetch model
      const { data: model, error: modelErr } = await db
        .from("models")
        .select("*")
        .eq("id", job.model_id)
        .single();

      if (modelErr || !model) {
        throw new Error(modelErr ? modelErr.message : "Model not found in database");
      }

      const targetNorm = norm(model.name);
      const slugNorm = norm(model.slug);

      // Find best match in OpenRouter
      const orMatch = orModels.find((o) => {
        const oId = norm(o.id);
        const oName = norm(o.name);
        return (
          oId === targetNorm ||
          oId === slugNorm ||
          oName === targetNorm ||
          (targetNorm.length >= 5 && (oId.includes(targetNorm) || targetNorm.includes(oId)))
        );
      });

      const fieldConfidence = typeof model.field_confidence === "object" && model.field_confidence !== null
        ? { ...model.field_confidence }
        : {};
      const sources = Array.isArray(model.sources) ? [...model.sources] : [];
      const links = typeof model.links === "object" && model.links !== null ? { ...model.links } : {};

      const updateData = {
        updated_at: new Date().toISOString(),
      };

      let resultSummary = {};

      if (orMatch) {
        const openRouterCitation = "https://openrouter.ai/api/v1/models";
        if (!sources.includes(openRouterCitation)) {
          sources.push(openRouterCitation);
          updateData.sources = sources;
        }
        links.openrouter = `https://openrouter.ai/${orMatch.id}`;
        updateData.links = links;

        // Extract context window
        if (orMatch.context_length) {
          const cwTokens = orMatch.context_length;
          const formattedCw = cwTokens >= 1000000
            ? `${(cwTokens / 1000000).toFixed(0)}M tokens`
            : `${Math.round(cwTokens / 1000)}K tokens`;
          updateData.context_window = formattedCw;
          fieldConfidence.contextWindow = "VERIFIED";
        }

        // Extract pricing
        if (orMatch.pricing) {
          const inPrice = orMatch.pricing.prompt ? parseFloat(orMatch.pricing.prompt) * 1000000 : null;
          const outPrice = orMatch.pricing.completion ? parseFloat(orMatch.pricing.completion) * 1000000 : null;
          if (inPrice != null && outPrice != null) {
            updateData.pricing = {
              inputPricePerM: Number(inPrice.toFixed(4)),
              outputPricePerM: Number(outPrice.toFixed(4)),
            };
            fieldConfidence.pricing = "VERIFIED";

            try {
              await db.from("model_evidence").upsert({
                model_id: model.id,
                field_name: "pricing",
                source_type: "provider_api",
                source_url: "https://openrouter.ai/api/v1/models",
                extracted_value: updateData.pricing,
                confidence: "VERIFIED",
                verification_notes: `Live provider rates for OpenRouter ID: ${orMatch.id}`,
                extracted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }, { onConflict: "model_id,field_name,source_url" });
            } catch (evErr) {
              console.warn(`  ⚠️ Pricing evidence note:`, evErr.message);
            }
          }
        }

        if (updateData.context_window) {
          try {
            await db.from("model_evidence").upsert({
              model_id: model.id,
              field_name: "context_window",
              source_type: "provider_api",
              source_url: "https://openrouter.ai/api/v1/models",
              extracted_value: { context_window: updateData.context_window, tokens: orMatch.context_length },
              confidence: "VERIFIED",
              verification_notes: `Provider context length: ${orMatch.context_length} tokens`,
              extracted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: "model_id,field_name,source_url" });
          } catch (evErr) {
            console.warn(`  ⚠️ Context window evidence note:`, evErr.message);
          }
        }

        updateData.field_confidence = fieldConfidence;

        await db.from("models").update(updateData).eq("id", model.id);

        resultSummary = {
          matched: true,
          openRouterId: orMatch.id,
          pricing: updateData.pricing || null,
          contextWindow: updateData.context_window || null,
          timestamp: new Date().toISOString(),
        };

        console.log(`  ✅ Pricing match found for ${model.name} (${orMatch.id}).`);
      } else {
        resultSummary = {
          matched: false,
          openRouterId: null,
          note: "Model not found on OpenRouter marketplace (free/self-hosted or closed non-API).",
          timestamp: new Date().toISOString(),
        };
        console.log(`  ℹ️ No OpenRouter pricing entry for ${model.name}.`);
      }

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
    } catch (err) {
      console.error(`  ❌ Pricing job failed for model ${job.model_id}:`, err.message);
      await markJobFailure(db, job.id, err.message, (job.attempts || 0) + 1);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (lookup_pricing) BATCH COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount} | Skipped: ${skippedCount}`);
  return { done: doneCount, failed: failedCount, skipped: skippedCount };
}

if (require.main === module) {
  runPricingWorker().catch((err) => {
    console.error("Worker error:", err);
    process.exit(1);
  });
}

module.exports = { runPricingWorker };
