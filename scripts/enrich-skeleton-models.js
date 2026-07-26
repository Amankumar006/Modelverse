/**
 * scripts/enrich-skeleton-models.js
 *
 * Enriches unverified skeleton models (verified: false) obeying strict provenance tiers:
 *   - Bucket A (Structured facts): parameter count, license, HF API source URL -> verified: false, needsReview: true
 *   - Bucket B (Vendor-reported benchmarks): sourceType: "vendor-reported", verified: false
 *   - Bucket C (Synthesized prose): written to descriptionDraft / keyFeaturesDraft only
 *   - Direct HF lookup ONLY when org/repo path is present (no fuzzy text search)
 *   - Script NEVER sets verified: true
 *
 * Usage:
 *   node scripts/enrich-skeleton-models.js --vendor="Cohere"
 *   node scripts/enrich-skeleton-models.js --all
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");
const { z } = require("zod");

const BenchmarkSchema = z.object({
  name: z.string(),
  score: z.string(),
  verified: z.boolean(),
  sourceType: z.enum(["vendor-reported", "independent-eval"]).optional()
});

const PrimaryTaskEnum = z.enum([
  "chat-reasoning", "code-generation", "image-generation", "video-generation",
  "audio-speech", "embedding", "agentic", "multimodal-general", "translation",
  "search-retrieval", "other"
]);
const DeploymentEnum = z.enum(["api-only", "self-hostable", "on-device"]);

const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  developer: z.string(),
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
  descriptionDraft: z.string().optional(),
  templatedDescription: z.boolean().optional(),
  keyFeatures: z.array(z.string()),
  keyFeaturesDraft: z.array(z.string()).optional(),
  benchmarks: z.array(BenchmarkSchema),
  family: z.string().nullable(),
  tier: z.string().optional(),
  institution: z.string().optional(),
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
  needsReview: z.boolean().optional(),
  featured: z.boolean().default(false),
  boost: z.number().min(1).max(5).default(1),
  curatorNotes: z.string().default("")
});

const MODELS_DIR = path.join(__dirname, "..", "data", "models");
const README_DIR = path.join(__dirname, "..", "data", "models", "readme");
const CACHE_DIR = path.join(__dirname, ".import-cache");
const FETCH_DATE = new Date().toISOString().slice(0, 10);

function getHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Enrichment/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function extractHfOrgRepo(modelData) {
  const links = modelData.links || {};
  const sources = modelData.sources || [];
  const candidates = [...Object.values(links), ...sources];

  for (const c of candidates) {
    if (typeof c === "string" && c.includes("huggingface.co/")) {
      const rest = c.split("huggingface.co/")[1];
      const parts = rest.split("/").map(p => p.split("#")[0].split("?")[0]).filter(Boolean);
      if (parts.length >= 2 && parts[0] !== "datasets" && parts[0] !== "spaces") {
        return `${parts[0]}/${parts[1]}`;
      }
    }
  }
  return null;
}

function formatParams(num) {
  if (!num || num <= 0) return null;
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(0)}M`;
  return `${num}`;
}

async function fetchHfModelData(orgRepo) {
  const apiUrl = `https://huggingface.co/api/models/${orgRepo}`;
  try {
    const res = await getHttps(apiUrl);
    if (res.status !== 200) return null;
    return { data: JSON.parse(res.data), apiUrl };
  } catch (err) {
    return null;
  }
}

async function processModel(file, raw, targetVendor) {
  if (targetVendor && raw.developer !== targetVendor) return null;
  if (raw.verified === true && !raw.needsReview) return null; // Skip human-verified entries

  const orgRepo = extractHfOrgRepo(raw);
  if (!orgRepo) {
    return { id: raw.id, name: raw.name, status: "NEEDS_MANUAL_MATCH", reason: "No confirmed HF org/repo path" };
  }

  const hfResult = await fetchHfModelData(orgRepo);
  if (!hfResult) {
    return { id: raw.id, name: raw.name, status: "FAILED_FETCH", orgRepo };
  }

  const { data: hfData, apiUrl } = hfResult;
  let modified = false;

  // 1. Bucket A: Parameter count
  if (raw.parameters === "undisclosed" || !raw.parameters) {
    const safetensors = hfData.safetensors?.total;
    if (safetensors) {
      const formatted = formatParams(safetensors);
      if (formatted) {
        raw.parameters = formatted;
        modified = true;
      }
    }
  }

  // 2. Bucket A: License string
  if ((raw.license === "proprietary" || raw.license === "Other/Custom") && hfData.cardData?.license) {
    raw.license = hfData.cardData.license;
    modified = true;
  }

  // 3. Bucket A: Source citation
  if (!raw.sources.includes(apiUrl)) {
    raw.sources.push(apiUrl);
    modified = true;
  }

  // 4. Bucket C: Draft prose (written ONLY to descriptionDraft & keyFeaturesDraft)
  if (hfData.cardData?.summary || hfData.pipeline_tag) {
    const draftDesc = hfData.cardData?.summary || `${raw.name} is a ${hfData.pipeline_tag || "machine learning"} model from ${raw.developer} hosted on Hugging Face (${orgRepo}).`;
    raw.descriptionDraft = draftDesc;

    const draftFeatures = [];
    if (hfData.pipeline_tag) draftFeatures.push(`Pipeline: ${hfData.pipeline_tag}`);
    if (hfData.tags && hfData.tags.length > 0) {
      draftFeatures.push(`HF Tags: ${hfData.tags.slice(0, 4).join(", ")}`);
    }
    raw.keyFeaturesDraft = draftFeatures;
    modified = true;
  }

  // 5. Always set needsReview: true and verified: false
  raw.verified = false;
  raw.needsReview = true;
  raw.updatedAt = FETCH_DATE;

  // 6. Validate against ModelSchema
  const val = ModelSchema.safeParse(raw);
  if (!val.success) {
    const errors = val.error.issues.map(i => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    console.error(`❌ Validation failed for ${raw.id}:\n${errors}`);
    return { id: raw.id, status: "VALIDATION_FAILED", errors };
  }

  // Save enriched file
  fs.writeFileSync(path.join(MODELS_DIR, file), JSON.stringify(val.data, null, 2) + "\n");
  return { id: raw.id, status: "ENRICHED", orgRepo, parameters: raw.parameters, license: raw.license };
}

async function main() {
  const args = process.argv.slice(2);
  const vendorArg = args.find(a => a.startsWith("--vendor="));
  const targetVendor = vendorArg ? vendorArg.split("=")[1] : null;

  console.log(`🔍 Skeleton Metadata Enrichment Engine`);
  console.log(`Target Vendor: ${targetVendor || "ALL"}\n`);

  const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith(".json") && f !== "_index.json");
  const manualMatchQueue = [];
  const results = [];

  for (const f of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, f), "utf-8"));
    const res = await processModel(f, raw, targetVendor);
    if (!res) continue;

    if (res.status === "NEEDS_MANUAL_MATCH") {
      manualMatchQueue.push(res);
    } else {
      results.push(res);
    }
  }

  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, "needs-manual-match.json"), JSON.stringify(manualMatchQueue, null, 2));

  console.log(`\n=== Execution Summary ===`);
  console.log(`  Processed / Enriched: ${results.filter(r => r.status === "ENRICHED").length}`);
  console.log(`  Needs Manual HF Match: ${manualMatchQueue.length} (saved to scripts/.import-cache/needs-manual-match.json)`);
  console.log(`  Failed Fetches: ${results.filter(r => r.status === "FAILED_FETCH").length}`);

  if (results.some(r => r.status === "ENRICHED")) {
    const compileOutput = execSync("node scripts/compile-models.js", { encoding: "utf-8" });
    console.log(`\n  ${compileOutput.trim()}`);
    execSync("npx tsc --noEmit", { encoding: "utf-8" });
    console.log(`  ✅ Type check passed (tsc --noEmit)`);
  }
}

main();
