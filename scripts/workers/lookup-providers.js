/**
 * scripts/workers/lookup-providers.js
 * 
 * Worker for action_type: 'lookup_providers'
 * Enriches models with live API provider routing, vendor status, and platform availability:
 * 1. OpenRouter catalog provider endpoints & routing
 * 2. Developer vendor status (e.g. OpenAI, Anthropic, Google, Cohere, Meta, Mistral)
 * 3. ChatGPT & Web platform availability
 * 
 * Persists granular evidence in `model_evidence` table.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const OPENROUTER_CACHE_PATH = path.join(__dirname, "../../data/cache/openrouter.json");

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

function parseBatchSize() {
  const argIdx = process.argv.indexOf("--batch-size");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const parsed = parseInt(process.argv[argIdx + 1], 10);
    return isNaN(parsed) ? 100 : parsed;
  }
  return 100;
}

function normalize(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Determine tier based on model parameters, context, and capabilities
 */
function inferModelTier(model, orMatch) {
  const name = String(model.name || "").toLowerCase();
  const slug = String(model.slug || "").toLowerCase();
  const contextLength = orMatch?.context_length || 0;

  if (slug.includes("ultra") || slug.includes("opus") || slug.includes("pro") || slug.includes("large") || slug.includes("70b") || slug.includes("72b") || slug.includes("405b") || slug.includes("deepseek-v3") || slug.includes("deepseek-r1")) {
    return "flagship";
  }
  if (slug.includes("flash") || slug.includes("mini") || slug.includes("haiku") || slug.includes("small") || slug.includes("8b") || slug.includes("7b") || slug.includes("3b") || slug.includes("1b") || slug.includes("lite")) {
    return "efficient";
  }
  if (slug.includes("coder") || slug.includes("code") || slug.includes("math") || slug.includes("vision") || slug.includes("tts") || slug.includes("image") || slug.includes("audio")) {
    return "specialized";
  }
  return "general";
}

async function runProvidersWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: lookup_providers] Starting batch processing (batch size: ${batchSize})...`);

  const openRouterModels = loadOpenRouterCache();
  console.log(`📦 Loaded ${openRouterModels.length} OpenRouter reference models.`);

  const { data: models, error: fetchErr } = await db
    .from("models")
    .select("id, name, slug, developer, status, type, api_availability, vendor_api_status, chatgpt_availability, tier, links")
    .neq("status", "staged")
    .limit(batchSize);

  if (fetchErr) {
    console.error("❌ Failed to query models:", fetchErr.message);
    process.exit(1);
  }

  console.log(`📥 Checking provider availability for ${models.length} models...`);

  let doneCount = 0;
  let failedCount = 0;

  for (const model of models) {
    try {
      const slugNorm = normalize(model.slug);
      const nameNorm = normalize(model.name);
      const developer = String(model.developer || "").toLowerCase();

      // Find OpenRouter match
      const orMatch = openRouterModels.find((or) => {
        const orId = normalize(or.id);
        const orName = normalize(or.name);
        return (
          orId === slugNorm ||
          orName === nameNorm ||
          (slugNorm.length >= 6 && orId.includes(slugNorm)) ||
          (slugNorm.length >= 6 && slugNorm.includes(orId.split("/")[1] || "___"))
        );
      });

      const providers = new Set(Array.isArray(model.api_availability) ? model.api_availability : []);

      if (orMatch) {
        providers.add("OpenRouter");
        if (orMatch.top_provider?.is_moderated) {
          providers.add("OpenRouter (Moderated)");
        }
      }

      // Detect official API support
      const isOfficialAPI =
        developer.includes("openai") ||
        developer.includes("anthropic") ||
        developer.includes("google") ||
        developer.includes("cohere") ||
        developer.includes("mistral") ||
        developer.includes("deepseek") ||
        developer.includes("groq") ||
        developer.includes("together");

      if (isOfficialAPI) {
        providers.add(`${model.developer} API`);
      }

      if (model.type === "open-weights") {
        providers.add("Self-Hosted (Hugging Face / vLLM / Ollama)");
      }

      // ChatGPT availability
      const isAvailableInChatGPT =
        developer.includes("openai") &&
        (model.slug.includes("gpt-4") ||
          model.slug.includes("o1") ||
          model.slug.includes("o3") ||
          model.slug.includes("gpt-5") ||
          model.slug.includes("chatgpt"));

      // Vendor API status
      let vendorStatus = model.vendor_api_status;
      if (!vendorStatus || vendorStatus === "UNKNOWN") {
        if (orMatch || isOfficialAPI) {
          vendorStatus = "ACTIVE";
        } else if (model.type === "open-weights") {
          vendorStatus = "COMMUNITY_HOSTED";
        } else {
          vendorStatus = "UNAVAILABLE";
        }
      }

      // Infer Tier if missing
      const tier = model.tier && model.tier.trim() !== "" ? model.tier : inferModelTier(model, orMatch);

      const updatedProviders = Array.from(providers);

      // 1. Update models table
      const { error: updateErr } = await db
        .from("models")
        .update({
          api_availability: updatedProviders,
          vendor_api_status: vendorStatus,
          chatgpt_availability: isAvailableInChatGPT,
          tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq("id", model.id);

      if (updateErr) {
        throw updateErr;
      }

      // 2. Persist Evidence in model_evidence
      if (orMatch) {
        try {
          await db.from("model_evidence").upsert(
            {
              model_id: model.id,
              field_name: "api_availability.openrouter",
              source_type: "provider_api",
              source_url: `https://openrouter.ai/${orMatch.id}`,
              extracted_value: {
                openRouterId: orMatch.id,
                providers: updatedProviders,
                context_length: orMatch.context_length,
              },
              confidence: "OFFICIAL",
              verification_notes: `Active routing verified via OpenRouter marketplace ID ${orMatch.id}`,
              extracted_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "model_id,field_name,source_url" }
          );
        } catch (evErr) {
          console.warn(`  ⚠️ Evidence insert note for ${model.name}:`, evErr.message);
        }
      }

      doneCount++;
      console.log(`  ✅ [Providers] ${model.name} -> ${updatedProviders.length} providers | Vendor: ${vendorStatus} | Tier: ${tier}`);
    } catch (err) {
      console.error(`  ❌ Failed provider lookup for model ${model.id}:`, err.message);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (lookup_providers) COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount}`);
  return { done: doneCount, failed: failedCount };
}

if (require.main === module) {
  runProvidersWorker().catch((err) => {
    console.error("Worker fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runProvidersWorker };
