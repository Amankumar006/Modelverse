"use strict";

/**
 * scripts/workers/lookup-specs.js
 *
 * Worker: lookup_specs
 * 1. Claims a batch of 'queued' jobs for action_type = 'lookup_specs'.
 * 2. Deterministically parses parameters, context window, license, and model type from name/slug/developer metadata.
 * 3. Never calls external LLMs or fails on missing network data.
 * 4. Stages normalized specs + fieldConfidence via staged-write (curator approval required).
 * 5. Updates job status to 'done' (or 'failed' if a code exception occurs).
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");
const { markJobFailure } = require("../lib/job-lifecycle");
const { stageChanges } = require("../lib/staged-write");

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

function extractParameters(name, slug, current) {
  if (current && current !== "undisclosed" && current !== "unknown") return current;
  const combined = `${name} ${slug}`;

  // 1. Check for MoE pattern e.g. 8x7B, 16x12B
  const matchMoE = combined.match(/\b(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*([bBmMtT])\b/i);
  if (matchMoE) {
    return `${matchMoE[1]}x${matchMoE[2]}${matchMoE[3].toUpperCase()}`;
  }

  // 2. Check for single parameter scale e.g. 70B, 32B, 1.5B, 405B, 8M
  const match = combined.match(/\b(\d+(?:\.\d+)?)\s*([bBmMtT])\b/);
  if (match) {
    return `${match[1]}${match[2].toUpperCase()}`;
  }

  return current || "undisclosed";
}

function normalizeContextWindow(name, slug, current) {
  if (typeof current === "number") {
    if (current >= 1000000) {
      return `${(current / 1000000).toFixed(current % 1000000 === 0 ? 0 : 1)}M tokens`;
    }
    if (current >= 1000) {
      return `${Math.round(current / 1000)}K tokens`;
    }
    return `${current} tokens`;
  }

  if (current && current !== "unknown" && current !== "undisclosed") {
    return String(current).trim();
  }

  const s = `${name} ${slug}`.toLowerCase();
  if (s.includes("1m") || s.includes("1000k") || s.includes("gemini")) return "1M tokens";
  if (s.includes("256k") || s.includes("262k")) return "256K tokens";
  if (s.includes("128k") || s.includes("131k") || s.includes("qwen") || s.includes("llama") || s.includes("mistral")) return "128K tokens";
  if (s.includes("64k")) return "64K tokens";
  if (s.includes("32k")) return "32K tokens";

  return "128K tokens";
}

function inferLicense(developer, typeStr, currentLic) {
  if (currentLic && currentLic !== "Other/Custom" && currentLic !== "unknown") return currentLic;
  if (typeStr === "closed-source" || typeStr === "api-only") return "Proprietary";

  const d = (developer || "").toLowerCase();
  if (d.includes("alibaba") || d.includes("qwen")) return "Apache-2.0";
  if (d.includes("meta") || d.includes("llama")) return "Llama-3.3-Community";
  if (d.includes("mistral")) return "Apache-2.0";
  if (d.includes("google") || d.includes("gemma")) return "Gemma-Terms-of-Use";
  if (d.includes("deepseek")) return "MIT";
  if (d.includes("microsoft")) return "MIT";
  if (d.includes("tii") || d.includes("falcon")) return "Apache-2.0";
  if (d.includes("stability")) return "CreativeML-OpenRAIL-M";
  if (d.includes("allenai") || d.includes("olmo")) return "Apache-2.0";

  return "Apache-2.0";
}

function inferModelType(developer, currentType) {
  if (currentType && currentType !== "open-weights") return currentType;
  const d = (developer || "").toLowerCase();
  if (["openai", "anthropic", "google deepmind", "cohere"].some((c) => d.includes(c))) {
    return "closed-source";
  }
  return "open-weights";
}

async function runSpecsWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: lookup_specs] Starting batch processing (batch size: ${batchSize})...`);

  // 1. Claim queued jobs
  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", "lookup_specs")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error("❌ Failed to query queued jobs:", error.message);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log("✨ No queued jobs for lookup_specs.");
    return { done: 0, failed: 0, skipped: 0 };
  }

  console.log(`📥 Claimed ${jobs.length} jobs to process.`);

  let doneCount = 0;
  let failedCount = 0;

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

      // Deterministic spec inference
      const parameters = extractParameters(model.name, model.slug, model.parameters);
      const contextWindow = normalizeContextWindow(model.name, model.slug, model.context_window);
      const modelType = inferModelType(model.developer, model.type);
      const license = inferLicense(model.developer, modelType, model.license);

      const fieldConfidence = typeof model.field_confidence === "object" && model.field_confidence !== null
        ? { ...model.field_confidence }
        : {};

      if (parameters && parameters !== "undisclosed") {
        fieldConfidence.parameters = fieldConfidence.parameters || "LIKELY";
      }
      if (license) {
        fieldConfidence.license = fieldConfidence.license || "LIKELY";
      }

      // Stage proposed specs — never write live columns directly. Curator
      // approves via /admin/review (stageChanges raises needs_review).
      const specEvidence = [
        ["parameters", parameters],
        ["context_window", contextWindow],
        ["license", license],
        ["type", modelType],
      ].map(([field, value]) => ({
        field_name: field,
        source_type: "other",
        source_url: `https://huggingface.co/${model.slug}`,
        extracted_value: { [field]: value },
        confidence: "LIKELY",
        verification_notes: "Deterministic spec inference from name/slug/developer metadata (lookup_specs)",
      }));

      const { staged, fields } = await stageChanges(db, model.id, {
        parameters,
        context_window: contextWindow,
        license,
        type: modelType,
        field_confidence: fieldConfidence,
      }, specEvidence);

      const resultSummary = {
        staged,
        stagedFields: fields,
        parameters,
        contextWindow,
        license,
        type: modelType,
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
      console.log(`  ✅ Specs parsed for ${model.name}: params=${parameters}, ctx=${contextWindow}, license=${license}`);
    } catch (err) {
      console.error(`  ❌ Specs parsing failed for model ${job.model_id}:`, err.message);
      await markJobFailure(db, job.id, err.message, (job.attempts || 0) + 1);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (lookup_specs) BATCH COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount}`);
  return { done: doneCount, failed: failedCount, skipped: 0 };
}

if (require.main === module) {
  runSpecsWorker().catch((err) => {
    console.error("Worker error:", err);
    process.exit(1);
  });
}

module.exports = { runSpecsWorker };
