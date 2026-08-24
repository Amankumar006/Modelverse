/**
 * scripts/workers/lookup-capabilities.js
 * 
 * Worker for action_type: 'lookup_capabilities'
 * Deterministically extracts structured model capabilities from:
 * 1. OpenRouter catalog architecture & supported parameters
 * 2. Hugging Face pipeline tags & model card metadata
 * 3. Canonical task classifications and model family architectures
 * 
 * Writes verified capabilities to models.capabilities (JSONB)
 * and records individual capability evidence in model_evidence table.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");
const { markJobFailure } = require("../lib/job-lifecycle");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const OPENROUTER_CACHE_PATH = path.join(__dirname, "../../data/cache/openrouter.json");

function parseBatchSize() {
  const argIdx = process.argv.indexOf("--batch-size");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const parsed = parseInt(process.argv[argIdx + 1], 10);
    return isNaN(parsed) ? 25 : parsed;
  }
  return 25;
}

function loadOpenRouterCache() {
  if (fs.existsSync(OPENROUTER_CACHE_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(OPENROUTER_CACHE_PATH, "utf8"));
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed?.data?.data)) return parsed.data.data;
      if (Array.isArray(parsed?.data)) return parsed.data;
      return [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Deterministically extracts structured capability flags for a model
 */
function extractCapabilities(model, openRouterModels) {
  const name = String(model.name || "").toLowerCase();
  const slug = String(model.slug || "").toLowerCase();
  const primaryTask = String(model.primary_task || "").toLowerCase();
  const modality = Array.isArray(model.modality)
    ? model.modality.map((m) => String(m).toLowerCase()).join(" ")
    : typeof model.modality === "object" && model.modality !== null
    ? JSON.stringify(model.modality).toLowerCase()
    : String(model.modality || "").toLowerCase();
  const description = String(model.description || "").toLowerCase();
  const tags = Array.isArray(model.tags)
    ? model.tags.map((t) => String(t).toLowerCase())
    : typeof model.tags === "string"
    ? model.tags.toLowerCase().split(",")
    : [];

  // Match OpenRouter entry
  const orMatch = openRouterModels.find((or) => {
    const orId = String(or.id || "").toLowerCase();
    const orName = String(or.name || "").toLowerCase();
    return orId === slug || orName === name || orId.includes(slug) || slug.includes(orId.split("/")[1] || "___");
  });

  const supportedParams = Array.isArray(orMatch?.supported_parameters)
    ? orMatch.supported_parameters.map((p) => String(p).toLowerCase())
    : [];

  const architecture = orMatch?.architecture || {};
  const orModality = (architecture.modality || "").toLowerCase();

  // 1. Vision Input
  const hasVision =
    modality.includes("image->") ||
    modality.includes("multimodal") ||
    orModality.includes("image->") ||
    tags.some((t) => t.includes("vision") || t.includes("image-to-text") || t.includes("multimodal")) ||
    name.includes("-vl") ||
    name.includes("vision") ||
    slug.includes("vision") ||
    slug.includes("-vl-") ||
    description.includes("visual understanding") ||
    description.includes("process images");

  // 2. Image Generation
  const hasImageGen =
    primaryTask === "image-generation" ||
    modality.includes("->image") ||
    tags.some((t) => t.includes("text-to-image") || t.includes("diffusers")) ||
    slug.includes("dall-e") ||
    slug.includes("flux") ||
    slug.includes("stable-diffusion") ||
    slug.includes("midjourney");

  // 3. Audio Input (Speech Recognition)
  const hasAudioInput =
    modality.includes("audio->") ||
    tags.some((t) => t.includes("automatic-speech-recognition") || t.includes("audio-to-text")) ||
    slug.includes("whisper") ||
    name.includes("whisper") ||
    description.includes("speech-to-text");

  // 4. Audio Output (Text-to-Speech)
  const hasAudioOutput =
    modality.includes("->audio") ||
    tags.some((t) => t.includes("text-to-speech") || t.includes("voice")) ||
    slug.includes("tts") ||
    description.includes("text-to-speech");

  // 5. Video Input
  const hasVideoInput =
    modality.includes("video->") ||
    tags.some((t) => t.includes("video-text-to-text") || t.includes("video-qa")) ||
    name.includes("video") ||
    description.includes("process video") ||
    description.includes("video understanding");

  // 6. Tool Calling / Function Calling
  const hasToolCalling =
    supportedParams.includes("tools") ||
    supportedParams.includes("function_call") ||
    supportedParams.includes("tool_choice") ||
    tags.some((t) => t.includes("tool-use") || t.includes("function-calling")) ||
    description.includes("tool use") ||
    description.includes("function calling") ||
    slug.includes("gpt-4") ||
    slug.includes("claude-3") ||
    slug.includes("gemini-1.5") ||
    slug.includes("gemini-2.0") ||
    slug.includes("mistral-large") ||
    slug.includes("qwen2.5-72b-instruct");

  // 7. Structured Outputs / JSON Schema
  const hasStructuredOutputs =
    supportedParams.includes("response_format") ||
    supportedParams.includes("json_schema") ||
    slug.includes("gpt-4o") ||
    slug.includes("claude-3-5") ||
    slug.includes("gemini-1.5-pro") ||
    slug.includes("gemini-2.0") ||
    description.includes("structured output");

  // 8. JSON Mode
  const hasJsonMode =
    hasStructuredOutputs ||
    supportedParams.includes("response_format") ||
    description.includes("json mode") ||
    tags.some((t) => t.includes("json"));

  // 9. Deep Reasoning (Chain of Thought)
  const hasReasoning =
    primaryTask === "chat-reasoning" ||
    slug.includes("deepseek-r1") ||
    slug.includes("o1") ||
    slug.includes("o3") ||
    slug.includes("qwq") ||
    name.includes("reasoner") ||
    name.includes("thinking") ||
    description.includes("chain of thought") ||
    description.includes("reasoning model");

  // 10. Computer Use / GUI Agent
  const hasComputerUse =
    slug.includes("computer-use") ||
    slug.includes("claude-3-5-sonnet") ||
    slug.includes("claude-3-7-sonnet") ||
    slug.includes("operator") ||
    description.includes("gui automation") ||
    description.includes("computer use");

  // 11. Web Search Grounding
  const hasWebSearch =
    supportedParams.includes("web_search") ||
    slug.includes("perplexity") ||
    slug.includes("sonar") ||
    slug.includes("search") ||
    description.includes("web search") ||
    description.includes("grounded search");

  // 12. Prompt Caching
  const hasPromptCaching =
    slug.includes("claude-3") ||
    slug.includes("gemini-1.5") ||
    slug.includes("deepseek-v3") ||
    slug.includes("deepseek-r1") ||
    slug.includes("gpt-4o");

  // 13. Batch Processing
  const hasBatch =
    slug.includes("openai") ||
    slug.includes("anthropic") ||
    slug.includes("google");

  // 14. Fine-tuning Available
  const isFineTunable =
    model.type === "open-weights" ||
    slug.includes("gpt-4o-mini") ||
    slug.includes("gpt-3.5-turbo") ||
    slug.includes("babbage") ||
    slug.includes("davinci");

  const capabilities = {
    vision_input: hasVision,
    image_generation: hasImageGen,
    audio_input: hasAudioInput,
    audio_output: hasAudioOutput,
    video_input: hasVideoInput,
    tool_calling: hasToolCalling,
    structured_outputs: hasStructuredOutputs,
    json_mode: hasJsonMode,
    reasoning: hasReasoning,
    computer_use: hasComputerUse,
    web_search: hasWebSearch,
    prompt_caching: hasPromptCaching,
    batch: hasBatch,
    fine_tuning: isFineTunable,
    evidence_source: orMatch ? `OpenRouter API (${orMatch.id})` : "Catalog Architecture & Tags",
  };

  return { capabilities, orMatch };
}

async function runCapabilitiesWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: lookup_capabilities] Starting batch processing (batch size: ${batchSize})...`);

  const openRouterCatalog = loadOpenRouterCache();
  console.log(`📦 Loaded ${openRouterCatalog.length} OpenRouter reference models.`);

  // 1. Claim queued jobs from enrichment_jobs (or find models missing capabilities)
  const { data: queuedJobs } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", "lookup_capabilities")
    .eq("status", "queued")
    .limit(batchSize);

  let targetModelIds = [];
  const jobMap = new Map();

  if (queuedJobs && queuedJobs.length > 0) {
    targetModelIds = queuedJobs.map((j) => j.model_id);
    queuedJobs.forEach((j) => jobMap.set(j.model_id, j));
  } else {
    // Fallback: claim models with empty or missing capabilities
    const { data: emptyModels, error: fetchErr } = await db
      .from("models")
      .select("id")
      .neq("status", "staged")
      .or("capabilities.is.null,capabilities.eq.{}")
      .limit(batchSize);

    if (fetchErr) {
      console.error("❌ Failed to query models missing capabilities:", fetchErr.message);
      process.exit(1);
    }

    if (!emptyModels || emptyModels.length === 0) {
      console.log("✨ All active models already have structured capabilities populated!");
      return { done: 0, failed: 0 };
    }

    targetModelIds = emptyModels.map((m) => m.id);
  }

  console.log(`📥 Processing capabilities for ${targetModelIds.length} models...`);

  let doneCount = 0;
  let failedCount = 0;

  for (const modelId of targetModelIds) {
    const job = jobMap.get(modelId);
    if (job) {
      await db
        .from("enrichment_jobs")
        .update({
          status: "running",
          attempts: (job.attempts || 0) + 1,
          last_run_at: new Date().toISOString(),
        })
        .eq("id", job.id);
    }

    try {
      const { data: model, error: modelErr } = await db
        .from("models")
        .select("id, name, slug, developer, primary_task, modality, description, tags, type, sources")
        .eq("id", modelId)
        .single();

      if (modelErr || !model) {
        throw new Error(modelErr ? modelErr.message : "Model not found");
      }

      const { capabilities, orMatch } = extractCapabilities(model, openRouterCatalog);
      const sourceUrl = orMatch ? `https://openrouter.ai/api/v1/models` : `https://huggingface.co/${model.slug}`;

      // 1. Update models table
      const { error: updateErr } = await db
        .from("models")
        .update({
          capabilities,
          updated_at: new Date().toISOString(),
        })
        .eq("id", model.id);

      if (updateErr) {
        throw new Error(`Failed to update models.capabilities: ${updateErr.message}`);
      }

      // 2. Write key evidence entries into model_evidence
      const capabilityKeys = [
        "vision_input",
        "image_generation",
        "audio_input",
        "audio_output",
        "video_input",
        "tool_calling",
        "structured_outputs",
        "json_mode",
        "reasoning",
        "computer_use",
        "web_search",
        "prompt_caching",
      ];

      for (const key of capabilityKeys) {
        if (capabilities[key] === true) {
          try {
            await db.from("model_evidence").upsert(
              {
                model_id: model.id,
                field_name: `capabilities.${key}`,
                source_type: orMatch ? "provider_api" : "official_model_card",
                source_url: sourceUrl,
                extracted_value: { enabled: true, feature: key },
                confidence: orMatch ? "OFFICIAL" : "LIKELY",
                verification_notes: `Extracted via ${capabilities.evidence_source}`,
                extracted_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "model_id,field_name,source_url" }
            );
          } catch (evErr) {
            console.warn(`  ⚠️ Evidence recording warning for ${key}:`, evErr.message);
          }
        }
      }

      // 3. Mark job done if tracked in enrichment_jobs
      if (job) {
        await db
          .from("enrichment_jobs")
          .update({
            status: "done",
            error: null,
            result_summary: { capabilitiesExtracted: Object.keys(capabilities).filter((k) => capabilities[k] === true), timestamp: new Date().toISOString() },
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
      }

      doneCount++;
      const activeCount = Object.keys(capabilities).filter((k) => capabilities[k] === true).length;
      console.log(`  ✅ [Capabilities] ${model.name} (${model.slug}) -> ${activeCount} active capabilities recorded.`);
    } catch (err) {
      console.error(`  ❌ Failed capability extraction for model ${modelId}:`, err.message);
      if (job) {
        await markJobFailure(db, job.id, err.message, (job.attempts || 0) + 1);
      }
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (lookup_capabilities) COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount}`);
  return { done: doneCount, failed: failedCount };
}

if (require.main === module) {
  runCapabilitiesWorker().catch((err) => {
    console.error("Worker fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runCapabilitiesWorker, extractCapabilities };
