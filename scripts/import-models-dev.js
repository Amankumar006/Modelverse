/**
 * scripts/import-models-dev.js
 *
 * One-time bulk import from models.dev into Modelverse.
 * NOT added to daily-ingestion.yml — run manually, review via PR, then discard.
 *
 * Usage:
 *   node scripts/import-models-dev.js
 *
 * Outputs (all to scripts/.import-cache/):
 *   - metadata.json          — fetch provenance (timestamp, count, source)
 *   - cross-reference.json   — match results (direct, fuzzy, net-new)
 *   - net-new/               — generated Modelverse-schema JSON files
 *   - enrichment-candidates.json — overlap models where models.dev has data we're missing
 *   - conflicts.json         — overlap models where data disagrees
 *   - skipped.json           — models skipped (unmapped developer, scope filter, etc.)
 */

const fs = require("fs");
const path = require("path");
const { z } = require("zod");

// ─── Config ──────────────────────────────────────────────────────────────
const CACHE_DIR = path.join(__dirname, ".import-cache");
const SNAPSHOT_PATH = path.join(CACHE_DIR, "models-dev-snapshot.json");
const MODELS_DIR = path.join(__dirname, "..", "data", "models");
const NET_NEW_DIR = path.join(CACHE_DIR, "net-new");

const SOURCE_URL = "https://models.dev/models.json";
const SOURCE_CITATION = "https://github.com/anomalyco/models.dev";
const FETCH_DATE = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// ─── Developer Mapping ──────────────────────────────────────────────────
// models.dev provider prefix → Modelverse DEVELOPERS enum value
const PROVIDER_TO_DEVELOPER = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google DeepMind",
  meta: "Meta",
  mistral: "Mistral AI",
  cohere: "Cohere",
  deepseek: "DeepSeek",
  xai: "xAI",
  alibaba: "Alibaba",
  microsoft: "Microsoft",
  nvidia: "NVIDIA",
  minimax: "MiniMax",
  moonshotai: "Moonshot AI",
  sakana: "Sakana AI",
  thinkingmachines: "Thinking Machines",
  tencent: "Tencent",
  // Providers NOT in the enum — will be skipped and flagged
  // zhipuai, deepreinforce, meituan, poolside, sarvam, stepfun, xiaomi, perplexity
};

// ─── License Mapping ─────────────────────────────────────────────────────
// models.dev license string → Modelverse LICENSES enum value
const LICENSE_MAP = {
  "Apache-2.0": "Apache-2.0",
  MIT: "MIT",
  "CC-BY-NC-4.0": "CC-BY-NC-4.0",
};

// ─── Modelverse Schema (compile-time validation) ─────────────────────────
const PrimaryTaskEnum = z.enum([
  "chat-reasoning", "code-generation", "image-generation", "video-generation",
  "audio-speech", "embedding", "agentic", "multimodal-general", "translation",
  "search-retrieval", "other",
]);
const DeploymentEnum = z.enum(["api-only", "self-hostable", "on-device"]);
const BenchmarkSchema = z.object({
  name: z.string(),
  score: z.string(),
  verified: z.boolean(),
});
const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  developer: z.string(),
  institution: z.string().optional(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["open-source", "open-weights", "closed-source", "api-only", "research-preview"]),
  status: z.enum(["active", "deprecated", "sunset"]).default("active"),
  vendorApiStatus: z.enum(["active", "deprecated", "sunset"]).optional(),
  modality: z.array(z.string()).min(1),
  primaryTask: PrimaryTaskEnum,
  deployment: z.array(DeploymentEnum).min(1),
  license: z.string(),
  parameters: z.string(),
  contextWindow: z.string(),
  description: z.string(),
  templatedDescription: z.boolean().optional(),
  keyFeatures: z.array(z.string()),
  benchmarks: z.array(BenchmarkSchema),
  family: z.string().nullable(),
  tier: z.string().optional(),
  previousVersion: z.string().nullable(),
  costTiers: z.array(z.object({ id: z.string(), label: z.string(), description: z.string().optional() })).optional(),
  pricing: z.array(z.object({ tier: z.string().optional(), unit: z.string(), amount: z.number(), currency: z.string().default("USD"), notes: z.string().optional() })).optional(),
  pricingLastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  links: z.record(z.string(), z.string()),
  logo: z.string().nullable(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()),
  sources: z.array(z.string()).min(1),
  verified: z.boolean(),
  featured: z.boolean().default(false),
  boost: z.number().min(1).max(5).default(1),
  curatorNotes: z.string().default(""),
});

// ─── Helper Functions ────────────────────────────────────────────────────

function normalizeDate(dateStr) {
  if (!dateStr) return null;
  // YYYY-MM-DD → pass through
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // YYYY-MM → append -01
  if (/^\d{4}-\d{2}$/.test(dateStr)) return `${dateStr}-01`;
  return null;
}

function formatContextWindow(ctx) {
  if (!ctx) return "unknown";
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(ctx % 1000000 === 0 ? 0 : 1)}M tokens`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K tokens`;
  return `${ctx} tokens`;
}

function mergeModalities(mods) {
  if (!mods) return ["text"];
  const all = new Set([...(mods.input || []), ...(mods.output || [])]);
  return all.size > 0 ? [...all] : ["text"];
}

function inferPrimaryTask(mdev) {
  const mods = mergeModalities(mdev.modalities);
  const hasImage = mods.includes("image");
  const hasVideo = mods.includes("video");
  const hasAudio = mods.includes("audio");
  const outputMods = mdev.modalities?.output || ["text"];

  if (outputMods.includes("image")) return "image-generation";
  if (outputMods.includes("video")) return "video-generation";
  if (outputMods.includes("audio")) return "audio-speech";
  if (mdev.reasoning) return "chat-reasoning";
  if (hasImage || hasVideo || hasAudio) return "multimodal-general";
  return "chat-reasoning";
}

function inferType(mdev) {
  if (mdev.open_weights === true) return "open-weights";
  return "api-only";
}

function inferDeployment(mdev) {
  const deps = [];
  if (mdev.open_weights) deps.push("self-hostable");
  deps.push("api-only"); // All models in models.dev are API-accessible
  return deps;
}

function generateId(mdevId) {
  // "openai/gpt-4o" → "openai-gpt-4o"
  return mdevId.replace(/\//g, "-").toLowerCase();
}

function generateSlug(mdevId) {
  return generateId(mdevId);
}

function buildTags(mdev) {
  const tags = [];
  if (mdev.reasoning) tags.push("reasoning");
  if (mdev.tool_call) tags.push("tool-calling");
  if (mdev.structured_output) tags.push("structured-output");
  if (mdev.open_weights) tags.push("open-weights");
  return tags;
}

function buildLinks(mdev) {
  const links = {};
  if (mdev.links) {
    for (const [label, url] of Object.entries(mdev.links)) {
      if (typeof url === "string") links[label] = url;
    }
  }
  if (mdev.weights) {
    for (const w of mdev.weights) {
      if (w.url) links[w.label || "Weights"] = w.url;
    }
  }
  return links;
}

function buildBenchmarks(mdev) {
  if (!mdev.benchmarks || !Array.isArray(mdev.benchmarks)) return [];
  return mdev.benchmarks.map(b => ({
    name: b.name,
    score: typeof b.score === "number" ? `${b.score}${b.metric === "percent correct" || b.metric === "resolved" || b.metric === "success rate" ? "%" : ` (${b.metric || "score"})`}` : String(b.score),
    verified: false, // Community-sourced, not primary
  }));
}

function mapLicense(mdev) {
  if (mdev.license && LICENSE_MAP[mdev.license]) return LICENSE_MAP[mdev.license];
  if (mdev.license) return "Other/Custom";
  if (mdev.open_weights) return "Other/Custom";
  return "Proprietary";
}

function tokenizeName(name) {
  if (!name) return new Set();
  // Strip dates like (2024-10-22), (2024-10), (latest), YYYYMMDD
  let n = name.replace(/\s*\(\d{4}[-\d]*\)/g, "");
  n = n.replace(/\s*\(latest\)/gi, "");
  const tokens = n.toLowerCase().match(/[a-z0-9\.]+/g) || [];
  return new Set(tokens);
}

const DEVELOPER_LOGOS = {
  "OpenAI": "/logos/openai.svg",
  "Anthropic": "/public/logos/anthropic.png",
  "Google DeepMind": "/logos/google-deepmind.svg",
  "Google": "/logos/google.svg",
  "Meta": "/logos/meta.svg",
  "Mistral AI": "/logos/mistral.svg",
  "Cohere": "/logos/cohere.svg",
  "DeepSeek": "/logos/deepseek.svg",
  "xAI": "/logos/xai.svg",
  "Alibaba": "/logos/alibaba.svg",
  "Microsoft": "/logos/microsoft.svg",
  "NVIDIA": "/logos/nvidia.svg",
  "MiniMax": "/logos/minimax.svg",
  "Moonshot AI": "/logos/moonshot.svg",
  "Sakana AI": "/logos/sakana.svg",
  "Tencent": "/logos/tencent.svg",
};

function extractPricing(mdevId, apiData) {
  if (!apiData) return { pricing: undefined, pricingLastVerified: undefined };

  let costObj = null;

  // 1. Direct match on provider/model
  for (const prov of Object.values(apiData)) {
    if (prov.models && prov.models[mdevId] && prov.models[mdevId].cost) {
      costObj = prov.models[mdevId].cost;
      break;
    }
  }

  // 2. Short ID match
  if (!costObj) {
    const shortId = mdevId.includes("/") ? mdevId.split("/")[1] : mdevId;
    for (const prov of Object.values(apiData)) {
      if (prov.models && prov.models[shortId] && prov.models[shortId].cost) {
        costObj = prov.models[shortId].cost;
        break;
      }
    }
  }

  if (!costObj) return { pricing: undefined, pricingLastVerified: undefined };

  const pricing = [];
  if (typeof costObj.input === "number") {
    pricing.push({ unit: "1M input tokens", amount: costObj.input, currency: "USD" });
  }
  if (typeof costObj.output === "number") {
    pricing.push({ unit: "1M output tokens", amount: costObj.output, currency: "USD" });
  }
  if (typeof costObj.cache_read === "number") {
    pricing.push({ unit: "1M cache read tokens", amount: costObj.cache_read, currency: "USD" });
  }

  return pricing.length > 0
    ? { pricing, pricingLastVerified: FETCH_DATE }
    : { pricing: undefined, pricingLastVerified: undefined };
}

function buildKeyFeatures(mdev) {
  const features = [];
  if (mdev.limit?.output) {
    features.push(`Max Output: ${formatContextWindow(mdev.limit.output)}`);
  }
  if (mdev.reasoning) {
    features.push("Native reasoning capability");
  }
  if (mdev.tool_call) {
    features.push("Tool / function calling support");
  }
  return features;
}

// ─── Main ────────────────────────────────────────────────────────────────

function main() {
  console.log("🔍 models.dev → Modelverse One-Time Import\n");

  // 1. Load snapshots
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    console.error(`❌ Snapshot not found at ${SNAPSHOT_PATH}. Run: curl -s ${SOURCE_URL} -o ${SNAPSHOT_PATH}`);
    process.exit(1);
  }
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf-8"));
  const mdevModels = Object.entries(snapshot);
  console.log(`📦 Loaded ${mdevModels.length} models from models.dev snapshot`);

  const apiPath = path.join(CACHE_DIR, "api-snapshot.json");
  let apiData = null;
  if (fs.existsSync(apiPath)) {
    apiData = JSON.parse(fs.readFileSync(apiPath, "utf-8"));
    console.log(`💰 Loaded provider pricing data from api-snapshot.json`);
  }

  // 2. Load existing Modelverse models
  const existingFiles = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith(".json") && f !== "_index.json");
  const existingModels = {};
  const existingByName = {};
  const existingByDevTokens = {};

  for (const file of existingFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
    const id = file.replace(".json", "");
    existingModels[id] = data;
    existingByName[data.name.toLowerCase()] = id;
    
    const dev = data.developer || "";
    if (!existingByDevTokens[dev]) existingByDevTokens[dev] = [];
    existingByDevTokens[dev].push({ id, name: data.name, tokens: tokenizeName(data.name) });
  }
  console.log(`📂 Loaded ${existingFiles.length} existing Modelverse models\n`);

  // 3. Cross-reference
  const directMatches = [];
  const fuzzyMatches = [];
  const netNew = [];
  const skipped = [];

  for (const [mdevId, mdev] of mdevModels) {
    const provider = mdevId.split("/")[0];
    const normId = generateId(mdevId);
    const developer = PROVIDER_TO_DEVELOPER[provider];

    // Skip if developer not in enum
    if (!developer) {
      skipped.push({
        mdevId,
        reason: `Provider "${provider}" not mapped to Modelverse DEVELOPERS enum`,
        name: mdev.name,
      });
      continue;
    }

    // Direct ID match
    if (existingModels[normId]) {
      directMatches.push({ mdevId, mvId: normId, matchType: "exact-id" });
      continue;
    }

    // Exact name match (case-insensitive)
    const nameLower = mdev.name.toLowerCase();
    if (existingByName[nameLower]) {
      fuzzyMatches.push({
        mdevId,
        mvId: existingByName[nameLower],
        matchType: "exact-name",
        mdevName: mdev.name,
        mvName: existingModels[existingByName[nameLower]].name,
      });
      continue;
    }

    // Token-based match (same developer, identical token set)
    const mdevTokens = tokenizeName(mdev.name);
    let tokenMatch = null;
    if (existingByDevTokens[developer]) {
      for (const item of existingByDevTokens[developer]) {
        if (mdevTokens.size > 0 && item.tokens.size > 0 && Array.from(mdevTokens).every(t => item.tokens.has(t)) && Array.from(item.tokens).every(t => mdevTokens.has(t))) {
          tokenMatch = item;
          break;
        }
      }
    }

    if (tokenMatch) {
      fuzzyMatches.push({
        mdevId,
        mvId: tokenMatch.id,
        matchType: "token-name",
        mdevName: mdev.name,
        mvName: tokenMatch.name,
      });
      continue;
    }

    // No match → net-new candidate
    netNew.push({ mdevId, mdev, developer });
  }

  console.log("=== Cross-Reference Results ===");
  console.log(`  Direct ID matches: ${directMatches.length}`);
  console.log(`  Exact/Token name matches: ${fuzzyMatches.length}`);
  console.log(`  Net-new candidates: ${netNew.length}`);
  console.log(`  Skipped (unmapped provider): ${skipped.length}`);

  // 4. Save cross-reference report
  fs.writeFileSync(
    path.join(CACHE_DIR, "cross-reference.json"),
    JSON.stringify({ directMatches, fuzzyMatches, netNew: netNew.map(n => n.mdevId), skipped }, null, 2)
  );

  // 5. Generate enrichment candidates for matched models
  const enrichmentCandidates = [];
  const conflicts = [];

  for (const match of [...directMatches, ...fuzzyMatches]) {
    const mdevId = match.mdevId;
    const mvId = match.mvId;
    const mdev = snapshot[mdevId];
    const mv = existingModels[mvId];

    const enrichments = {};
    const conflictFields = {};

    // Check contextWindow
    if (mdev.limit?.context && mv.contextWindow === "unknown") {
      enrichments.contextWindow = formatContextWindow(mdev.limit.context);
    }

    // Check releaseDate
    if (mdev.release_date && !mv.releaseDate) {
      enrichments.releaseDate = mdev.release_date;
    } else if (mdev.release_date && mv.releaseDate && mdev.release_date !== mv.releaseDate) {
      conflictFields.releaseDate = { mdev: mdev.release_date, mv: mv.releaseDate };
    }

    // Check benchmarks — if MV has none and mdev has some
    if ((!mv.benchmarks || mv.benchmarks.length === 0) && mdev.benchmarks && mdev.benchmarks.length > 0) {
      enrichments.benchmarks = buildBenchmarks(mdev);
    }

    const { pricing, pricingLastVerified } = extractPricing(mdevId, apiData);
    if (pricing && (!mv.pricing || mv.pricing.length === 0)) {
      enrichments.pricing = pricing;
      enrichments.pricingLastVerified = pricingLastVerified;
    }

    if (Object.keys(enrichments).length > 0) {
      enrichmentCandidates.push({ mvId, mdevId, enrichments });
    }
    if (Object.keys(conflictFields).length > 0) {
      conflicts.push({ mvId, mdevId, conflicts: conflictFields });
    }
  }

  fs.writeFileSync(path.join(CACHE_DIR, "enrichment-candidates.json"), JSON.stringify(enrichmentCandidates, null, 2));
  fs.writeFileSync(path.join(CACHE_DIR, "conflicts.json"), JSON.stringify(conflicts, null, 2));
  fs.writeFileSync(path.join(CACHE_DIR, "skipped.json"), JSON.stringify(skipped, null, 2));

  console.log(`\n  Enrichment candidates: ${enrichmentCandidates.length}`);
  console.log(`  Conflicts: ${conflicts.length}`);

  // 6. Generate net-new entries
  if (!fs.existsSync(NET_NEW_DIR)) fs.mkdirSync(NET_NEW_DIR, { recursive: true });

  let generated = 0;
  let validationFailed = 0;
  const generatedByDev = {};
  let pricingExtracted = 0;

  for (const { mdevId, mdev, developer } of netNew) {
    const id = generateId(mdevId);
    const slug = generateSlug(mdevId);

    const { pricing, pricingLastVerified } = extractPricing(mdevId, apiData);
    if (pricing) pricingExtracted++;

    const entry = {
      id,
      name: mdev.name,
      slug,
      developer,
      releaseDate: normalizeDate(mdev.release_date) || FETCH_DATE,
      updatedAt: FETCH_DATE,
      type: inferType(mdev),
      status: "active",
      modality: mergeModalities(mdev.modalities),
      primaryTask: inferPrimaryTask(mdev),
      deployment: inferDeployment(mdev),
      license: mapLicense(mdev),
      parameters: "undisclosed",
      contextWindow: formatContextWindow(mdev.limit?.context),
      description: mdev.description || `${mdev.name} by ${developer}.`,
      keyFeatures: buildKeyFeatures(mdev),
      benchmarks: buildBenchmarks(mdev),
      family: mdev.family || null,
      previousVersion: null,
      pricing,
      pricingLastVerified,
      links: buildLinks(mdev),
      logo: DEVELOPER_LOGOS[developer] || null,
      tags: buildTags(mdev),
      sources: [`${SOURCE_CITATION}`],
      verified: false,
      featured: false,
      boost: 1,
      curatorNotes: `Skeleton entry imported from models.dev backfill (${FETCH_DATE}). Needs manual enrichment and primary-source verification.`,
    };

    // Validate
    const result = ModelSchema.safeParse(entry);
    if (!result.success) {
      const errors = result.error.issues.map(i => `  ${i.path.join(".")}: ${i.message}`).join("\n");
      console.error(`\n⚠️  Validation failed for ${id}:\n${errors}`);
      validationFailed++;
      continue;
    }

    // Write to net-new directory (NOT to data/models/ yet)
    const outPath = path.join(NET_NEW_DIR, `${id}.json`);
    fs.writeFileSync(outPath, JSON.stringify(result.data, null, 2) + "\n");
    generated++;

    generatedByDev[developer] = (generatedByDev[developer] || 0) + 1;
  }

  console.log(`\n=== Generation Results ===`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Validation failures: ${validationFailed}`);
  console.log(`\n  By developer:`);
  for (const [dev, count] of Object.entries(generatedByDev).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${dev}: ${count}`);
  }

  // 7. Save metadata
  const metadata = {
    source: SOURCE_URL,
    sourceCitation: SOURCE_CITATION,
    fetchDate: FETCH_DATE,
    fetchTimestamp: new Date().toISOString(),
    totalInSnapshot: mdevModels.length,
    existingModelverseCount: existingFiles.length,
    directMatches: directMatches.length,
    fuzzyMatches: fuzzyMatches.length,
    netNewCandidates: netNew.length,
    skippedUnmappedProvider: skipped.length,
    generated,
    validationFailed,
    enrichmentCandidates: enrichmentCandidates.length,
    conflicts: conflicts.length,
    generatedByDeveloper: generatedByDev,
  };

  fs.writeFileSync(path.join(CACHE_DIR, "metadata.json"), JSON.stringify(metadata, null, 2));

  console.log(`\n✅ Import script complete. Files written to ${CACHE_DIR}/`);
  console.log(`   Next: review net-new/ entries, then copy to data/models/ on a feature branch.`);
}

main();
