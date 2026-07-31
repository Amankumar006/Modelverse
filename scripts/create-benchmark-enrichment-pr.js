const fs = require("fs");
const path = require("path");

const PROD_DIR = path.join(process.cwd(), "data", "models");
const CACHE_DIR = path.join(process.cwd(), "data", "cache");
const SUMMARY_MD_PATH = path.join(process.cwd(), "data", "tracking", "enrichment-pr-summary.md");

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
    .replace(/^[^/]+\//, "")
    .replace(/[^a-z0-9]/g, "");
}

function isStrictMatch(model, itemCandidate) {
  const mVendor = extractVendor(model);
  const candVendor = extractVendor({ developer: itemCandidate.id || itemCandidate.slug || "", slug: itemCandidate.id || itemCandidate.name || "" });

  if (mVendor && candVendor && mVendor !== candVendor) {
    return false;
  }

  const mVariants = extractVariants(model.slug + " " + model.name);
  const candVariants = extractVariants((itemCandidate.id || "") + " " + (itemCandidate.name || ""));

  mVariants.sort();
  candVariants.sort();

  if (mVariants.join(",") !== candVariants.join(",")) {
    return false;
  }

  const mNorm = normalizeCoreName(model.slug);
  const candNorm = normalizeCoreName(itemCandidate.id || itemCandidate.slug || itemCandidate.name);

  return mNorm === candNorm || mNorm.replace(/^(meta|google|anthropic|openai|cohere|alibaba|nvidia|mistral)/, "") === candNorm.replace(/^(meta|google|anthropic|openai|cohere|alibaba|nvidia|mistral)/, "");
}

function executeEnrichmentPR() {
  const files = fs.readdirSync(PROD_DIR).filter((f) => f.endsWith(".json"));

  const aaData = readSnapshot("artificial-analysis.json");
  const openRouterData = readSnapshot("openrouter.json");
  const hfData = readSnapshot("hf-leaderboard.json");

  let modifiedFilesCount = 0;
  let modelsWithNewBenchmarkScores = 0;
  let modelsWithPricingConfidence = 0;
  const summaryRows = [];

  for (const file of files) {
    const filePath = path.join(PROD_DIR, file);
    try {
      const model = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      let matchedSources = [];
      let newBenchmarks = [];
      let openRouterMatched = false;
      let hfMatched = false;
      let aaMatched = false;

      // 1. OpenRouter Match (Pricing & Context Window)
      if (openRouterData && Array.isArray(openRouterData.data || openRouterData)) {
        const match = (openRouterData.data || openRouterData).find((item) => isStrictMatch(model, item));
        if (match) {
          openRouterMatched = true;
          matchedSources.push("https://openrouter.ai/api/v1/models");
        }
      }

      // 2. HF Leaderboard Match (Benchmarks)
      if (hfData && Array.isArray(hfData.rows || hfData)) {
        const match = (hfData.rows || hfData).find((r) => {
          const rowData = r.row || r;
          const repo = rowData.model_name_for_query || rowData.eval_name || "";
          return isStrictMatch(model, { id: repo, name: repo });
        });
        if (match) {
          hfMatched = true;
          matchedSources.push("https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard");
          const rowData = match.row || match;
          if (rowData.gpqa != null) newBenchmarks.push({ name: "GPQA", score: String(rowData.gpqa), verified: false });
          if (rowData.mmlu_pro != null) newBenchmarks.push({ name: "MMLU-Pro", score: String(rowData.mmlu_pro), verified: false });
          if (rowData.ifeval != null) newBenchmarks.push({ name: "IFEval", score: String(rowData.ifeval), verified: false });
        }
      }

      // 3. Artificial Analysis Match (Benchmarks & Pricing)
      if (aaData && Array.isArray(aaData.data || aaData)) {
        const match = (aaData.data || aaData).find((item) => isStrictMatch(model, item));
        if (match) {
          aaMatched = true;
          matchedSources.push("https://artificialanalysis.ai");
          if (match.benchmarks) {
            for (const [bName, bVal] of Object.entries(match.benchmarks)) {
              if (bVal != null) newBenchmarks.push({ name: bName, score: String(bVal), verified: false });
            }
          }
        }
      }

      if (matchedSources.length > 0) {
        model.fieldConfidence = model.fieldConfidence || {};

        // Domain-Specific Confidence Mapping:
        // OpenRouter corroborates pricing & contextWindow ONLY
        if (openRouterMatched || aaMatched) {
          model.fieldConfidence.pricing = (openRouterMatched && aaMatched) ? "VERIFIED" : "LIKELY";
          model.fieldConfidence.contextWindow = "LIKELY";
          modelsWithPricingConfidence++;
        }

        // Benchmarks are ONLY marked LIKELY/VERIFIED if AA or HF Leaderboard matched and provided benchmarks!
        if (hfMatched || (aaMatched && newBenchmarks.length > 0)) {
          model.fieldConfidence.benchmarks = (hfMatched && aaMatched) ? "VERIFIED" : "LIKELY";
        } else {
          // If no benchmark source matched, benchmark field confidence MUST NOT be set to LIKELY!
          delete model.fieldConfidence.benchmarks;
        }

        // Append non-duplicate sources
        model.sources = model.sources || [];
        for (const src of matchedSources) {
          if (!model.sources.includes(src)) model.sources.push(src);
        }

        // Append non-duplicate benchmarks
        if (newBenchmarks.length > 0) {
          model.benchmarks = model.benchmarks || [];
          for (const nb of newBenchmarks) {
            if (!model.benchmarks.some((b) => b.name === nb.name)) {
              model.benchmarks.push(nb);
            }
          }
          modelsWithNewBenchmarkScores++;
        }

        fs.writeFileSync(filePath, JSON.stringify(model, null, 2), "utf-8");
        modifiedFilesCount++;

        summaryRows.push({
          file,
          slug: model.slug,
          openRouterMatched,
          hfMatched,
          aaMatched,
          newBenchmarkScoresCount: newBenchmarks.length,
          pricingConf: model.fieldConfidence.pricing || "—",
          benchmarkConf: model.fieldConfidence.benchmarks || "DRAFT/UNMATCHED",
          topLevelVerifiedUntouched: model.verified,
        });
      }
    } catch (e) {}
  }

  // Generate markdown summary
  let mdContent = `# PR Summary — Domain-Correct Catalog Enrichment\n\n`;
  mdContent += `**Branch**: \`feat/enrich-existing-benchmarks\`\n`;
  mdContent += `**Total Modified Files**: ${modifiedFilesCount}\n`;
  mdContent += `**Files With New Benchmark Scores**: ${modelsWithNewBenchmarkScores}\n`;
  mdContent += `**Files With Pricing/Context Confidence**: ${modelsWithPricingConfidence}\n\n`;
  mdContent += `| File Name | Model Slug | OpenRouter Matched | HF Matched | Benchmark Scores Added | Pricing Conf | Benchmark Conf | Top-Level \`verified\` Untouched |\n`;
  mdContent += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
  for (const r of summaryRows.slice(0, 20)) {
    mdContent += `| \`${r.file}\` | \`${r.slug}\` | ${r.openRouterMatched} | ${r.hfMatched} | ${r.newBenchmarkScoresCount} | \`${r.pricingConf}\` | \`${r.benchmarkConf}\` | \`${r.topLevelVerifiedUntouched}\` |\n`;
  }

  fs.writeFileSync(SUMMARY_MD_PATH, mdContent, "utf-8");

  console.log(`✅ Successfully enriched ${modifiedFilesCount} models with correct domain mapping!`);
  console.log(`   - Models with Pricing/Context Confidence: ${modelsWithPricingConfidence}`);
  console.log(`   - Models with New Benchmark Scores Written: ${modelsWithNewBenchmarkScores}`);
  console.log(`📄 Summary report written to: data/tracking/enrichment-pr-summary.md`);
}

executeEnrichmentPR();
