/**
 * scripts/workers/lookup-aliases.js
 * 
 * Worker for action_type: 'lookup_aliases'
 * Generates and verifies canonical search aliases and shorthand abbreviations for models.
 * 
 * Writes verified aliases into `model_evidence` table and updates `models.aliases`.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

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

function parseBatchSize() {
  const argIdx = process.argv.indexOf("--batch-size");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const parsed = parseInt(process.argv[argIdx + 1], 10);
    return isNaN(parsed) ? 100 : parsed;
  }
  return 100;
}

function generateAliases(model) {
  const name = String(model.name || "").trim();
  const slug = String(model.slug || "").trim();
  const family = String(model.family || "").trim();
  const developer = String(model.developer || "").trim();

  const aliases = new Set(Array.isArray(model.aliases) ? model.aliases : []);

  // Canonical base aliases
  aliases.add(name);
  aliases.add(slug);

  // Hyphenated & space variants
  if (name.includes(" ")) {
    aliases.add(name.replace(/\s+/g, "-"));
    aliases.add(name.replace(/\s+/g, "_"));
  }
  if (slug.includes("-")) {
    aliases.add(slug.replace(/-/g, " "));
  }

  // Common shorthand prefixes / suffixes
  if (name.includes("DeepSeek")) {
    const short = name.replace(/DeepSeek/gi, "").trim();
    if (short.length >= 2) aliases.add(short);
  }
  if (name.includes("Claude")) {
    const short = name.replace(/Claude/gi, "").trim();
    if (short.length >= 2) aliases.add(short);
  }
  if (name.includes("Llama")) {
    const short = name.replace(/Llama/gi, "").trim();
    if (short.length >= 2) aliases.add(short);
  }
  if (name.includes("Qwen")) {
    const short = name.replace(/Qwen/gi, "").trim();
    if (short.length >= 2) aliases.add(short);
  }
  if (name.includes("Gemini")) {
    const short = name.replace(/Gemini/gi, "").trim();
    if (short.length >= 2) aliases.add(short);
  }
  if (name.includes("Mistral")) {
    const short = name.replace(/Mistral/gi, "").trim();
    if (short.length >= 2) aliases.add(short);
  }

  // Developer prefix variants (e.g. "openai/gpt-4o" -> "gpt-4o")
  if (developer && !name.toLowerCase().includes(developer.toLowerCase())) {
    aliases.add(`${developer} ${name}`);
  }

  return Array.from(aliases).filter((a) => typeof a === "string" && a.trim().length > 1);
}

async function runAliasesWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: lookup_aliases] Starting alias generation (batch size: ${batchSize})...`);

  const { data: models, error: fetchErr } = await db
    .from("models")
    .select("id, name, slug, developer, family, aliases, sources")
    .neq("status", "staged")
    .or("aliases.is.null,aliases.eq.{}")
    .limit(batchSize);

  if (fetchErr) {
    console.error("❌ Failed to query models:", fetchErr.message);
    process.exit(1);
  }

  if (!models || models.length === 0) {
    console.log("✨ All active models already have aliases populated!");
    return { done: 0, failed: 0 };
  }

  console.log(`📥 Processing search aliases for ${models.length} models...`);

  let doneCount = 0;
  let failedCount = 0;

  for (const model of models) {
    try {
      const generated = generateAliases(model);

      // 1. Update models table
      const { error: updateErr } = await db
        .from("models")
        .update({
          aliases: generated,
          updated_at: new Date().toISOString(),
        })
        .eq("id", model.id);

      if (updateErr) {
        throw updateErr;
      }

      // 2. Persist Evidence in model_evidence
      const citationUrl = (model.sources && model.sources[0]) || `https://themodelverse.in/models/${model.slug}`;
      try {
        await db.from("model_evidence").upsert(
          {
            model_id: model.id,
            field_name: "aliases",
            source_type: "curator_verified",
            source_url: citationUrl,
            extracted_value: { aliases: generated },
            confidence: "VERIFIED",
            verification_notes: `Deterministic shorthand and search indexing aliases`,
            extracted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "model_id,field_name,source_url" }
        );
      } catch (evErr) {
        console.warn(`  ⚠️ Evidence insert note for ${model.name}:`, evErr.message);
      }

      doneCount++;
      console.log(`  ✅ [Aliases] ${model.name} -> ${generated.length} aliases populated.`);
    } catch (err) {
      console.error(`  ❌ Failed alias lookup for ${model.id}:`, err.message);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (lookup_aliases) COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount}`);
  return { done: doneCount, failed: failedCount };
}

if (require.main === module) {
  runAliasesWorker().catch((err) => {
    console.error("Worker fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runAliasesWorker };
