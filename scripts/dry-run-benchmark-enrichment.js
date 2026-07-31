const fs = require("fs");
const path = require("path");

const PROD_DIR = path.join(process.cwd(), "data", "models");
const CACHE_DIR = path.join(process.cwd(), "data", "cache");
const REPORT_PATH = path.join(process.cwd(), "data", "tracking", "enrichment-dry-run.json");

console.log("🔍 Running Strict Vendor & Variant-Preserving Benchmark Enrichment Analysis...");

function readSnapshot(filename) {
  const p = path.join(CACHE_DIR, filename);
  if (!fs.existsSync(p)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    return raw.data || raw;
  } catch (e) {
    return null;
  }
}

const VARIANT_SUFFIXES = ["instruct", "chat", "coder", "code", "vision", "quant", "gguf", "awq", "turbo", "lite", "flash", "pro", "max", "ultra", "mini", "nano", "preview"];

function extractVariants(str) {
  if (!str) return [];
  const s = str.toLowerCase();
  return VARIANT_SUFFIXES.filter((v) => s.includes(v));
}

function extractVendor(model) {
  const dev = (model.developer || "").toLowerCase();
  const slug = (model.slug || "").toLowerCase();

  if (dev.includes("meta") || slug.includes("meta") || slug.includes("llama")) return "meta";
  if (dev.includes("google") || slug.includes("google") || slug.includes("gemini") || slug.includes("gemma")) return "google";
  if (dev.includes("anthropic") || slug.includes("anthropic") || slug.includes("claude")) return "anthropic";
  if (dev.includes("openai") || slug.includes("openai") || slug.includes("gpt") || slug.includes("o1") || slug.includes("o3")) return "openai";
  if (dev.includes("cohere") || slug.includes("cohere")) return "cohere";
  if (dev.includes("alibaba") || dev.includes("qwen") || slug.includes("qwen")) return "alibaba";
  if (dev.includes("nvidia") || slug.includes("nvidia")) return "nvidia";
  if (dev.includes("mistral") || slug.includes("mistral")) return "mistral";
  if (dev.includes("deepseek") || slug.includes("deepseek")) return "deepseek";
  return dev.replace(/[^a-z0-9]/g, "");
}

function normalizeCoreName(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/^https?:\/\/[^\/]+\//, "")
    .replace(/^[^/]+\//, "") // strip repo org prefix
    .replace(/[^a-z0-9]/g, "");
}

function isStrictMatch(model, itemCandidate) {
  const mVendor = extractVendor(model);
  const candVendor = extractVendor({ developer: itemCandidate.id || itemCandidate.slug || "", slug: itemCandidate.id || itemCandidate.name || "" });

  // Vendor Isolation Check: Vendors must match unless unknown
  if (mVendor && candVendor && mVendor !== candVendor) {
    return false;
  }

  // Variant Suffix Isolation Check: Variants must match exactly
  const mVariants = extractVariants(model.slug + " " + model.name);
  const candVariants = extractVariants((itemCandidate.id || "") + " " + (itemCandidate.name || ""));

  mVariants.sort();
  candVariants.sort();

  if (mVariants.join(",") !== candVariants.join(",")) {
    return false;
  }

  // Core Model Name Normalization Match
  const mNorm = normalizeCoreName(model.slug);
  const candNorm = normalizeCoreName(itemCandidate.id || itemCandidate.slug || itemCandidate.name);

  return mNorm === candNorm || mNorm.replace(/^(meta|google|anthropic|openai|cohere|alibaba|nvidia|mistral)/, "") === candNorm.replace(/^(meta|google|anthropic|openai|cohere|alibaba|nvidia|mistral)/, "");
}

function runDryRun() {
  const files = fs.readdirSync(PROD_DIR).filter((f) => f.endsWith(".json"));

  const aaData = readSnapshot("artificial-analysis.json");
  const openRouterData = readSnapshot("openrouter.json");
  const hfData = readSnapshot("hf-leaderboard.json");

  let totalModels = files.length;
  let exactMatchedModels = 0;
  let noMatchModels = 0;
  let benchmarksWouldBeAdded = 0;

  const matchedPairsTable = [];

  for (const file of files) {
    try {
      const model = JSON.parse(fs.readFileSync(path.join(PROD_DIR, file), "utf-8"));

      let matchedSources = [];
      let potentialBenchmarks = [];
      let catalogMatchedId = "";

      // 1. OpenRouter Strict Match
      if (openRouterData && Array.isArray(openRouterData.data || openRouterData)) {
        const list = openRouterData.data || openRouterData;
        const match = list.find((item) => isStrictMatch(model, item));
        if (match) {
          matchedSources.push("OpenRouter");
          catalogMatchedId = match.id;
        }
      }

      // 2. HuggingFace Open LLM Leaderboard Strict Match
      if (hfData && Array.isArray(hfData.rows || hfData)) {
        const rows = hfData.rows || hfData;
        const match = rows.find((r) => {
          const rowData = r.row || r;
          const repo = rowData.model_name_for_query || rowData.eval_name || "";
          return isStrictMatch(model, { id: repo, name: repo });
        });
        if (match) {
          matchedSources.push("HF-Leaderboard");
          const rowData = match.row || match;
          catalogMatchedId = catalogMatchedId || (rowData.model_name_for_query || rowData.eval_name);
          if (rowData.gpqa != null) potentialBenchmarks.push({ name: "GPQA", score: String(rowData.gpqa) });
          if (rowData.mmlu_pro != null) potentialBenchmarks.push({ name: "MMLU-Pro", score: String(rowData.mmlu_pro) });
          if (rowData.ifeval != null) potentialBenchmarks.push({ name: "IFEval", score: String(rowData.ifeval) });
        }
      }

      // 3. Artificial Analysis Strict Match
      if (aaData && Array.isArray(aaData.data || aaData)) {
        const list = aaData.data || aaData;
        const match = list.find((item) => isStrictMatch(model, item));
        if (match) {
          matchedSources.push("Artificial-Analysis");
          catalogMatchedId = catalogMatchedId || (match.id || match.slug);
        }
      }

      if (matchedSources.length > 0) {
        exactMatchedModels++;
        if (potentialBenchmarks.length > 0) benchmarksWouldBeAdded += potentialBenchmarks.length;
        matchedPairsTable.push({
          modelSlug: model.slug,
          modelName: model.name,
          vendor: extractVendor(model),
          variants: extractVariants(model.slug + " " + model.name),
          matchedCatalogId: catalogMatchedId,
          matchedSources,
          proposedBenchmarks: potentialBenchmarks,
          topLevelVerifiedUntouched: model.verified,
        });
      } else {
        noMatchModels++;
      }
    } catch (e) {}
  }

  const trackingDir = path.join(process.cwd(), "data", "tracking");
  if (!fs.existsSync(trackingDir)) fs.mkdirSync(trackingDir, { recursive: true });

  const summary = {
    analyzedAt: new Date().toISOString(),
    totalModelsAnalyzed: totalModels,
    strictMatchedModels: exactMatchedModels,
    noMatchModels,
    benchmarksWouldBeAdded,
    matchedPairsSample: matchedPairsTable,
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2), "utf-8");
  console.log("\n📊 Strict Vendor & Variant-Preserving Analysis Results:");
  console.log(`   - Total Production Models Analyzed: ${totalModels}`);
  console.log(`   - Strict Verified Matches Found: ${exactMatchedModels}`);
  console.log(`   - No Match Found: ${noMatchModels}`);
  console.log(`   - Potential Benchmark Scores Available: ${benchmarksWouldBeAdded}`);
  console.log(`\n✅ Dry-Run Report written to: data/tracking/enrichment-dry-run.json (Zero files were mutated).`);
  return summary;
}

runDryRun();
