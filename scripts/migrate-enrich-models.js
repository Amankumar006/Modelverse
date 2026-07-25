/**
 * One-time migration script to backfill rich metadata for models
 * that were auto-ingested before the enhanced ingestion engine.
 * 
 * For models with valid HuggingFace model URLs → fetches rich API data
 * For models with non-model HF URLs (datasets, papers) → enriches from existing data
 * 
 * Usage: node scripts/migrate-enrich-models.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const MODELS_DIR = path.join(process.cwd(), "data", "models");
const README_DIR = path.join(process.cwd(), "data", "models", "readme");

function getHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Migration/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function formatParams(total) {
  if (!total || total <= 0) return null;
  if (total >= 1e12) return `${(total / 1e12).toFixed(1)}T`;
  if (total >= 1e9) return `${(total / 1e9).toFixed(1)}B`;
  if (total >= 1e6) return `${(total / 1e6).toFixed(0)}M`;
  return `${total}`;
}

// Valid primaryTask values in our schema
const VALID_TASKS = new Set([
  "chat-reasoning", "code-generation", "image-generation", "video-generation",
  "audio-speech", "embedding", "agentic", "multimodal-general", "translation",
  "search-retrieval", "other"
]);

const PIPELINE_TO_TASK = {
  "text-generation": "chat-reasoning",
  "text2text-generation": "chat-reasoning",
  "question-answering": "chat-reasoning",
  "conversational": "chat-reasoning",
  "image-text-to-text": "multimodal-general",
  "visual-question-answering": "multimodal-general",
  "image-to-text": "multimodal-general",
  "text-to-image": "image-generation",
  "text-to-video": "video-generation",
  "text-to-audio": "audio-speech",
  "text-to-speech": "audio-speech",
  "automatic-speech-recognition": "audio-speech",
  "feature-extraction": "embedding",
  "sentence-similarity": "embedding",
  "robotics": "agentic",
  "reinforcement-learning": "agentic",
  "translation": "translation",
};

const PIPELINE_TO_MODALITY = {
  "text-generation": ["text"],
  "image-text-to-text": ["text", "image"],
  "text-to-image": ["text", "image"],
  "text-to-video": ["text", "video"],
  "text-to-audio": ["text", "audio"],
  "text-to-speech": ["text", "audio"],
  "automatic-speech-recognition": ["audio", "text"],
  "robotics": ["text", "image"],
};

/**
 * Extract HuggingFace model ID from a URL like https://huggingface.co/org/model
 * Returns null for non-model URLs (datasets, papers, spaces)
 */
function extractHfModelId(url) {
  if (!url) return null;
  const match = url.match(/^https?:\/\/huggingface\.co\/([^\/]+\/[^\/]+)\/?$/);
  if (!match) return null;
  const id = match[1];
  // Exclude non-model paths
  if (id.startsWith("datasets/") || id.startsWith("spaces/") || id.startsWith("papers/")) return null;
  return id;
}

async function fetchModelDetails(hfId) {
  try {
    const { status, data } = await getHttps(`https://huggingface.co/api/models/${hfId}`);
    if (status !== 200) return null;
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function isStaleModel(data) {
  return (
    (data.parameters === "undisclosed" && data.license === "Other/Custom") ||
    (data.curatorNotes && data.curatorNotes.includes("Automated ingestion")) ||
    (data.description && data.description.includes("trending open-weight AI model"))
  );
}

async function migrate() {
  console.log("🔄 Starting Model Enrichment Migration...\n");
  
  const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith(".json"));
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
    } catch (e) { continue; }

    if (!isStaleModel(data)) {
      skipped++;
      continue;
    }

    const hfUrl = data.links && data.links.huggingface;
    const hfModelId = extractHfModelId(hfUrl);
    const todayStr = new Date().toISOString().split("T")[0];

    if (hfModelId) {
      // ── Route A: Fetch rich data from HuggingFace API ──
      console.log(`  📡 Fetching HF details for ${hfModelId}...`);
      const detail = await fetchModelDetails(hfModelId);
      
      if (!detail) {
        console.log(`  ❌ Failed to fetch ${hfModelId}, skipping`);
        failed++;
        continue;
      }

      const tags = detail.tags || [];
      const config = detail.config;
      const cardData = detail.cardData;
      const safetensors = detail.safetensors;
      const pipelineTag = detail.pipeline_tag || "text-generation";
      
      // Extract fields
      const totalParams = safetensors && safetensors.total ? safetensors.total : 
                          (safetensors && safetensors.parameters ? Object.values(safetensors.parameters)[0] : null);
      const paramStr = formatParams(totalParams) || data.parameters;
      
      const license = (() => {
        if (cardData && cardData.license) return cardData.license.toUpperCase();
        for (const tag of tags) { if (tag.startsWith("license:")) return tag.replace("license:", "").toUpperCase(); }
        return data.license;
      })();

      const architecture = config && config.architectures ? config.architectures[0] : (config && config.model_type ? config.model_type : null);
      const libraryName = detail.library_name || null;
      const moe = tags.includes("moe") || (config && config.num_experts_per_tok);
      const arxiv = tags.find(t => t.startsWith("arxiv:"));
      const arxivUrl = arxiv ? `https://arxiv.org/abs/${arxiv.replace("arxiv:", "")}` : null;
      const languages = cardData && cardData.language ? (Array.isArray(cardData.language) ? cardData.language.join(", ") : cardData.language) : null;
      const releaseDate = detail.createdAt ? detail.createdAt.split("T")[0] : data.releaseDate;
      const downloads = detail.downloads || 0;
      const likes = detail.likes || 0;

      // Update fields
      data.parameters = paramStr;
      data.license = license;
      data.releaseDate = releaseDate;
      data.updatedAt = todayStr;
      data.primaryTask = PIPELINE_TO_TASK[pipelineTag] || "other";
      data.modality = PIPELINE_TO_MODALITY[pipelineTag] || ["text"];

      // Build rich description
      const descParts = [];
      descParts.push(`${data.name} is a ${paramStr}-parameter ${moe ? "Mixture-of-Experts (MoE) " : ""}${pipelineTag.replace(/-/g, " ")} model developed by ${data.developer}.`);
      if (architecture) descParts.push(`Built on the ${architecture} architecture${libraryName ? ` using ${libraryName}` : ""}.`);
      if (languages) descParts.push(`Supports ${languages} language(s).`);
      descParts.push(`Released on ${releaseDate} with ${likes.toLocaleString()} likes and ${downloads.toLocaleString()} downloads on Hugging Face.`);
      data.description = descParts.join(" ");

      // Build rich key features
      data.keyFeatures = [
        `${paramStr} parameters${moe ? " with sparse MoE architecture for efficient inference" : ""}`,
        ...(architecture ? [`Built on ${architecture} architecture${libraryName ? ` (${libraryName})` : ""}`] : []),
        `Primary task: ${pipelineTag.replace(/-/g, " ")} (${data.modality.join(", ")} modality)`,
        ...(languages ? [`Language support: ${languages}`] : []),
        `Open-weights under ${license} license — self-hostable and fine-tunable`,
        ...(downloads > 100000 ? [`High adoption: ${downloads.toLocaleString()} downloads on Hugging Face`] : []),
      ];

      // Update links
      if (arxivUrl && !data.links.paper) data.links.paper = arxivUrl;

      // Update tags
      if (moe && !data.tags.includes("moe")) data.tags.push("moe");
      if (libraryName && !data.tags.includes(libraryName)) data.tags.push(libraryName);
      if (pipelineTag && !data.tags.includes(pipelineTag)) data.tags.push(pipelineTag);

      data.curatorNotes = `Enriched via migration on ${todayStr}. Architecture: ${architecture || "unknown"}. Params: ${paramStr}. License: ${license}.`;

      console.log(`  ✅ Enriched: ${data.name} — ${paramStr} params, ${pipelineTag}, ${license}`);

    } else {
      // ── Route B: No HF model ID — enrich from GitHub/existing data ──
      console.log(`  📝 No HF model API for ${data.name} — enriching from existing metadata...`);
      
      // Fix primaryTask if invalid
      if (!VALID_TASKS.has(data.primaryTask)) {
        data.primaryTask = "other";
      }

      // Improve description from boilerplate
      if (data.description && data.description.includes("trending open-weight AI model")) {
        data.description = `${data.name} is a research model developed by ${data.developer}. ${data.keyFeatures && data.keyFeatures.length > 0 ? data.keyFeatures[0] + "." : ""}`;
      }

      data.updatedAt = todayStr;
      data.curatorNotes = `Partially enriched via migration on ${todayStr}. Manual review recommended.`;
      console.log(`  ⚠️  Partially enriched: ${data.name} (no HF model API available)`);
    }

    // ── Save updated JSON ──
    fs.writeFileSync(path.join(MODELS_DIR, file), JSON.stringify(data, null, 2), "utf-8");

    // ── Regenerate README ──
    const readmeMd = `# ${data.name}

## Model Overview
**${data.name}** is a **${data.parameters}-parameter** model developed by **${data.developer}**.
Released on **${data.releaseDate}**.

---

## 📊 Quick Specs

| Specification | Value |
|:---|:---|
| **Parameters** | ${data.parameters} |
| **Task** | ${data.primaryTask} |
| **Modality** | ${data.modality.join(", ")} |
| **License** | ${data.license} |
| **Type** | ${data.type} |

---

## ✨ Key Features

${(data.keyFeatures || []).map(f => `- ${f}`).join("\n")}

---

## 🔗 Resources

${data.links.huggingface ? `- **Hugging Face**: [${data.name}](${data.links.huggingface})` : ""}
${data.links.github ? `- **GitHub**: [Repository](${data.links.github})` : ""}
${data.links.paper ? `- **Paper**: [arXiv](${data.links.paper})` : ""}
${data.links.website ? `- **Website**: [Project Page](${data.links.website})` : ""}

---

## 📜 License & Access
**${data.license}** — See repository for specific license details.
`;

    fs.writeFileSync(path.join(README_DIR, `${data.slug}.md`), readmeMd, "utf-8");
    updated++;
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`  ✅ Updated: ${updated}`);
  console.log(`  ⏭️  Skipped (already rich): ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);

  if (updated > 0) {
    console.log("\n⚡ Re-compiling search indexes...");
    require("./compile-models.js");
  }
}

migrate();
