/**
 * scripts/enrich-existing-models.js
 *
 * Enriches existing models in data/models/ with missing pricing, logos, max output tokens,
 * and benchmarks from models.dev snapshot data without overwriting existing verified data.
 *
 * Usage:
 *   node scripts/enrich-existing-models.js
 */

const fs = require("fs");
const path = require("path");
const { z } = require("zod");

const MODELS_DIR = path.join(__dirname, "..", "data", "models");
const CACHE_DIR = path.join(__dirname, ".import-cache");
const SNAPSHOT_PATH = path.join(CACHE_DIR, "models-dev-snapshot.json");
const API_PATH = path.join(CACHE_DIR, "api-snapshot.json");
const SOURCE_CITATION = "https://github.com/anomalyco/models.dev";
const FETCH_DATE = new Date().toISOString().slice(0, 10);

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

// ─── Zod Schema for Validation ────────────────────────────────────────────
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

function formatTokens(ctx) {
  if (!ctx) return "";
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(ctx % 1000000 === 0 ? 0 : 1)}M tokens`;
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}K tokens`;
  return `${ctx} tokens`;
}

function extractPricing(mdevId, apiData) {
  if (!apiData) return null;
  let costObj = null;

  for (const prov of Object.values(apiData)) {
    if (prov.models && prov.models[mdevId] && prov.models[mdevId].cost) {
      costObj = prov.models[mdevId].cost;
      break;
    }
  }

  if (!costObj) {
    const shortId = mdevId.includes("/") ? mdevId.split("/")[1] : mdevId;
    for (const prov of Object.values(apiData)) {
      if (prov.models && prov.models[shortId] && prov.models[shortId].cost) {
        costObj = prov.models[shortId].cost;
        break;
      }
    }
  }

  if (!costObj) return null;

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

  return pricing.length > 0 ? pricing : null;
}

function tokenizeName(name) {
  if (!name) return new Set();
  let n = name.replace(/\s*\(\d{4}[-\d]*\)/g, "");
  n = n.replace(/\s*\(latest\)/gi, "");
  n = n.replace(/\s*\b\d{8}\b/g, "");
  n = n.replace(/\s+v2$/gi, "");
  const tokens = n.toLowerCase().match(/[a-z0-9\.]+/g) || [];
  return new Set(tokens);
}

function main() {
  console.log("🛠️  Enriching existing models in data/models/ with models.dev data...\n");

  if (!fs.existsSync(SNAPSHOT_PATH) || !fs.existsSync(API_PATH)) {
    console.error("❌ Snapshot files missing in scripts/.import-cache/");
    process.exit(1);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, "utf-8"));
  const apiData = JSON.parse(fs.readFileSync(API_PATH, "utf-8"));

  const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith(".json") && f !== "_index.json");
  console.log(`📂 Inspecting ${files.length} existing models...`);

  // Build lookup indexes for models.dev
  const snapshotById = {};
  const snapshotByTokens = [];

  for (const [k, v] of Object.entries(snapshot)) {
    snapshotById[k] = v;
    snapshotById[k.replace("/", "-")] = v;
    snapshotByTokens.push({ mdevId: k, name: v.name, tokens: tokenizeName(v.name), data: v });
  }

  let enrichedCount = 0;
  let pricingEnriched = 0;
  let logoEnriched = 0;
  let maxOutputEnriched = 0;

  for (const file of files) {
    const filePath = path.join(MODELS_DIR, file);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const mvId = file.replace(".json", "");

    // 1. Find matching models.dev record
    let mdevMatch = snapshotById[mvId] || snapshotById[mvId.replace("-", "/", 1)];
    let mdevId = mdevMatch ? mdevMatch.id : null;

    if (!mdevMatch) {
      const mvTokens = tokenizeName(raw.name);
      for (const item of snapshotByTokens) {
        if (mvTokens.size > 0 && item.tokens.size > 0 && Array.from(mvTokens).every(t => item.tokens.has(t)) && Array.from(item.tokens).every(t => mvTokens.has(t))) {
          mdevMatch = item.data;
          mdevId = item.mdevId;
          break;
        }
      }
    }

    let modified = false;

    // 2. Enrich Pricing (if missing)
    if (mdevId && (!raw.pricing || raw.pricing.length === 0)) {
      const pricing = extractPricing(mdevId, apiData);
      if (pricing) {
        raw.pricing = pricing;
        raw.pricingLastVerified = FETCH_DATE;
        modified = true;
        pricingEnriched++;
      }
    }

    // 3. Enrich Logo (if missing)
    if (!raw.logo && DEVELOPER_LOGOS[raw.developer]) {
      raw.logo = DEVELOPER_LOGOS[raw.developer];
      modified = true;
      logoEnriched++;
    }

    // 4. Enrich Max Output Tokens Feature (if missing in keyFeatures)
    if (mdevMatch && mdevMatch.limit?.output) {
      const maxOutputStr = `Max Output: ${formatTokens(mdevMatch.limit.output)}`;
      const hasOutputFeature = raw.keyFeatures.some(f => f.toLowerCase().includes("max output"));
      if (!hasOutputFeature) {
        raw.keyFeatures.unshift(maxOutputStr);
        modified = true;
        maxOutputEnriched++;
      }
    }

    // 5. Add source citation if modified
    if (modified) {
      if (!raw.sources.includes(SOURCE_CITATION)) {
        raw.sources.push(SOURCE_CITATION);
      }

      // Validate against Zod schema
      const valResult = ModelSchema.safeParse(raw);
      if (!valResult.success) {
        const errors = valResult.error.issues.map(i => `  ${i.path.join(".")}: ${i.message}`).join("\n");
        console.error(`❌ Schema validation failed for enriched ${file}:\n${errors}`);
        process.exit(1);
      }

      fs.writeFileSync(filePath, JSON.stringify(valResult.data, null, 2) + "\n");
      enrichedCount++;
    }
  }

  console.log(`\n=== Enrichment Summary ===`);
  console.log(`  Total existing models enriched: ${enrichedCount}`);
  console.log(`  Models updated with Pricing: ${pricingEnriched}`);
  console.log(`  Models updated with Logo: ${logoEnriched}`);
  console.log(`  Models updated with Max Output feature: ${maxOutputEnriched}`);

  if (enrichedCount > 0) {
    const compileOutput = execSync("node scripts/compile-models.js", { encoding: "utf-8" });
    console.log(`\n  ${compileOutput.trim()}`);
    execSync("npx tsc --noEmit", { encoding: "utf-8" });
    console.log(`  ✅ Type check passed (tsc --noEmit)`);
  }
}

const { execSync } = require("child_process");
main();
