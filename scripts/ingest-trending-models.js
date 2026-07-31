const fs = require("fs");
const path = require("path");
const https = require("https");

const MODELS_DIR = path.join(process.cwd(), "data", "models");
const PENDING_DIR = path.join(process.cwd(), "data", "models-pending");
const README_DIR = path.join(process.cwd(), "data", "models", "readme");
const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");

if (!fs.existsSync(INGESTION_DIR)) {
  fs.mkdirSync(INGESTION_DIR, { recursive: true });
}
if (!fs.existsSync(PENDING_DIR)) {
  fs.mkdirSync(PENDING_DIR, { recursive: true });
}

function getHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Ingestion-Bot/1.0 (https://themodelverse.in)" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ─── Rich metadata extraction helpers ───────────────────────────────

const PIPELINE_TO_TASK = {
  "text-generation": "chat-reasoning",
  "text2text-generation": "chat-reasoning",
  "text-classification": "other",
  "token-classification": "other",
  "question-answering": "chat-reasoning",
  "summarization": "chat-reasoning",
  "translation": "translation",
  "fill-mask": "other",
  "conversational": "chat-reasoning",
  "image-classification": "other",
  "object-detection": "other",
  "image-segmentation": "other",
  "image-text-to-text": "multimodal-general",
  "visual-question-answering": "multimodal-general",
  "image-to-text": "multimodal-general",
  "text-to-image": "image-generation",
  "text-to-video": "video-generation",
  "text-to-audio": "audio-speech",
  "text-to-speech": "audio-speech",
  "automatic-speech-recognition": "audio-speech",
  "audio-classification": "audio-speech",
  "audio-text-to-text": "audio-speech",
  "feature-extraction": "embedding",
  "sentence-similarity": "embedding",
  "zero-shot-classification": "chat-reasoning",
  "reinforcement-learning": "agentic",
  "robotics": "agentic",
  "depth-estimation": "other",
  "video-classification": "other",
};

const PIPELINE_TO_MODALITY = {
  "text-generation": ["text"],
  "text2text-generation": ["text"],
  "text-classification": ["text"],
  "conversational": ["text"],
  "image-text-to-text": ["text", "image"],
  "visual-question-answering": ["text", "image"],
  "image-to-text": ["text", "image"],
  "text-to-image": ["text", "image"],
  "text-to-video": ["text", "video"],
  "text-to-audio": ["text", "audio"],
  "text-to-speech": ["text", "audio"],
  "automatic-speech-recognition": ["audio", "text"],
  "audio-classification": ["audio"],
  "audio-text-to-text": ["text", "audio"],
  "video-classification": ["video"],
  "depth-estimation": ["image"],
  "image-classification": ["image"],
  "object-detection": ["image"],
  "image-segmentation": ["image"],
};

function formatParams(total) {
  if (!total || total <= 0) return "undisclosed";
  if (total >= 1e12) return `${(total / 1e12).toFixed(1)}T`;
  if (total >= 1e9) return `${(total / 1e9).toFixed(1)}B`;
  if (total >= 1e6) return `${(total / 1e6).toFixed(0)}M`;
  return `${total}`;
}

function extractLicense(tags, cardData) {
  if (cardData && cardData.license) return cardData.license.toUpperCase();
  for (const tag of tags) {
    if (tag.startsWith("license:")) return tag.replace("license:", "").toUpperCase();
  }
  return "Other/Custom";
}

function extractArxiv(tags) {
  for (const tag of tags) {
    if (tag.startsWith("arxiv:")) return `https://arxiv.org/abs/${tag.replace("arxiv:", "")}`;
  }
  return null;
}

function extractArchitecture(config) {
  if (config && config.architectures && config.architectures.length > 0) {
    return config.architectures[0];
  }
  if (config && config.model_type) return config.model_type;
  return null;
}

function extractLanguages(cardData, tags) {
  if (cardData && cardData.language) {
    const langs = Array.isArray(cardData.language) ? cardData.language : [cardData.language];
    return langs.join(", ");
  }
  const langTags = tags.filter(t => t === "en" || t === "zh" || t === "ja" || t === "ko" || t === "multilingual" || t === "de" || t === "fr" || t === "es");
  return langTags.length > 0 ? langTags.join(", ") : null;
}

function isMoE(tags, config) {
  if (tags.includes("moe")) return true;
  if (config && config.num_experts_per_tok) return true;
  return false;
}

// ─── Fetch full model details from HuggingFace API ──────────────────

async function fetchModelDetails(hfId) {
  try {
    const raw = await getHttps(`https://huggingface.co/api/models/${hfId}`);
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

// ─── Existing ID detection ──────────────────────────────────────────

function getExistingIds() {
  const ids = new Set();
  const slugs = new Set();

  const scanDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
        if (data.id) ids.add(data.id);
        if (data.slug) slugs.add(data.slug);
      } catch (e) {}
    }
  };

  scanDir(MODELS_DIR);
  scanDir(PENDING_DIR);

  // Scan rejection tombstones to prevent re-ingesting rejected candidate models
  const tombstonePath = path.join(process.cwd(), "data", "tracking", "rejected-models.json");
  if (fs.existsSync(tombstonePath)) {
    try {
      const tombstones = JSON.parse(fs.readFileSync(tombstonePath, "utf-8"));
      if (Array.isArray(tombstones)) {
        tombstones.forEach((item) => {
          ids.add(item);
          slugs.add(item);
        });
      }
    } catch (e) {}
  }

  return { ids, slugs };
}

// ─── Main ingestion ─────────────────────────────────────────────────

async function runIngestion() {
  console.log("🚀 Starting Daily Ingestion Pipeline...");
  const { ids: existingIds, slugs: existingSlugs } = getExistingIds();
  const createdModels = [];

  // 1. Fetch trending model list
  console.log("🔍 Fetching HuggingFace Trending models...");
  let trendingList = [];
  try {
    const jsonStr = await getHttps("https://huggingface.co/api/models?limit=20");
    trendingList = JSON.parse(jsonStr);
    if (!Array.isArray(trendingList)) trendingList = [];
  } catch (err) {
    console.error("❌ Failed fetching HuggingFace trending:", err.message);
  }

  // 2. For each trending model, fetch full details and build rich entries
  for (const listItem of trendingList) {
    const parts = listItem.id.split("/");
    const author = parts[0] || "Other";
    const modelName = parts[1] || listItem.id;
    const devSlug = slugify(author);
    const modelSlug = slugify(modelName);
    const fullId = `${devSlug}-${modelSlug}`;

    if (existingIds.has(fullId) || existingSlugs.has(modelSlug)) continue;

    // Fetch rich details from individual model endpoint
    console.log(`  📡 Fetching details for ${listItem.id}...`);
    const detail = await fetchModelDetails(listItem.id);
    const tags = (detail && detail.tags) || listItem.tags || [];
    const config = detail && detail.config;
    const cardData = detail && detail.cardData;
    const safetensors = detail && detail.safetensors;

    // Extract rich metadata
    const pipelineTag = (detail && detail.pipeline_tag) || listItem.pipeline_tag || "text-generation";
    const primaryTask = PIPELINE_TO_TASK[pipelineTag] || "multimodal-general";
    const modality = PIPELINE_TO_MODALITY[pipelineTag] || ["text"];
    const license = extractLicense(tags, cardData);
    const arxivUrl = extractArxiv(tags);
    const architecture = extractArchitecture(config);
    const languages = extractLanguages(cardData, tags);
    const moe = isMoE(tags, config);
    const libraryName = (detail && detail.library_name) || listItem.library_name || null;

    // Parameter count
    const totalParams = safetensors && safetensors.total ? safetensors.total : (safetensors && safetensors.parameters ? Object.values(safetensors.parameters)[0] : null);
    const paramStr = formatParams(totalParams);

    // Release date
    const releaseDate = (detail && detail.createdAt) ? detail.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
    const todayStr = new Date().toISOString().split("T")[0];

    // Downloads / Likes
    const downloads = (detail && detail.downloads) || listItem.downloads || 0;
    const likes = (detail && detail.likes) || listItem.likes || 0;

    // Build rich description
    const descParts = [];
    descParts.push(`${modelName} is a ${paramStr}-parameter ${moe ? "Mixture-of-Experts (MoE) " : ""}${pipelineTag.replace(/-/g, " ")} model developed by ${author}.`);
    if (architecture) descParts.push(`Built on the ${architecture} architecture${libraryName ? ` using ${libraryName}` : ""}.`);
    if (languages) descParts.push(`Supports ${languages} language(s).`);
    descParts.push(`Released on ${releaseDate} with ${likes.toLocaleString()} likes and ${downloads.toLocaleString()} downloads on Hugging Face.`);
    const description = descParts.join(" ");

    // Build rich key features
    const keyFeatures = [];
    keyFeatures.push(`${paramStr} parameters${moe ? " with sparse MoE architecture for efficient inference" : ""}`);
    if (architecture) keyFeatures.push(`Built on ${architecture} architecture${libraryName ? ` (${libraryName})` : ""}`);
    keyFeatures.push(`Primary task: ${pipelineTag.replace(/-/g, " ")} (${modality.join(", ")} modality)`);
    if (languages) keyFeatures.push(`Language support: ${languages}`);
    keyFeatures.push(`Open-weights under ${license} license — self-hostable and fine-tunable`);
    if (downloads > 100000) keyFeatures.push(`High adoption: ${downloads.toLocaleString()} downloads on Hugging Face`);

    // Build links
    const links = { huggingface: `https://huggingface.co/${listItem.id}` };
    if (arxivUrl) links.paper = arxivUrl;

    // Build tags
    const modelTags = ["open-weights", "trending", "huggingface"];
    if (moe) modelTags.push("moe");
    if (libraryName) modelTags.push(libraryName);
    if (pipelineTag) modelTags.push(pipelineTag);

    const newModelJson = {
      id: fullId,
      name: modelName,
      slug: modelSlug,
      developer: author,
      releaseDate,
      updatedAt: todayStr,
      type: "open-weights",
      status: "active",
      modality,
      primaryTask,
      deployment: ["self-hostable"],
      license,
      parameters: paramStr,
      contextWindow: "unknown",
      description,
      keyFeatures,
      benchmarks: [],
      family: null,
      previousVersion: null,
      links,
      logo: null,
      tags: modelTags,
      sources: [`https://huggingface.co/${listItem.id}`],
      verified: false,
      verificationStatus: "DRAFT",
      fieldConfidence: {
        parameters: "LIKELY",
        license: "LIKELY"
      },
      needsReview: true,
      featured: false,
      boost: 1,
      curatorNotes: `Auto-ingested from HuggingFace Trending on ${todayStr}. Architecture: ${architecture || "unknown"}. Params: ${paramStr}. License: ${license}.`
    };

    // Build rich README
    const readmeMd = `# ${modelName}

## Model Overview
**${modelName}** is a **${paramStr}-parameter** ${moe ? "Mixture-of-Experts " : ""}${pipelineTag.replace(/-/g, " ")} model developed by **${author}**.${architecture ? ` Built on the \`${architecture}\` architecture.` : ""}${languages ? ` Supports ${languages}.` : ""} Released on **${releaseDate}**.

---

## 📊 Quick Specs

| Specification | Value |
|:---|:---|
| **Parameters** | ${paramStr} |
| **Architecture** | ${architecture || "—"} |
| **Task** | ${pipelineTag.replace(/-/g, " ")} |
| **Modality** | ${modality.join(", ")} |
| **License** | ${license} |
| **Framework** | ${libraryName || "—"} |
| **MoE** | ${moe ? "Yes" : "No"} |
| **Languages** | ${languages || "—"} |

---

## ✨ Key Features

${keyFeatures.map(f => `- ${f}`).join("\n")}

---

## 📈 Community Adoption

- **${likes.toLocaleString()} likes** on Hugging Face
- **${downloads.toLocaleString()} downloads** on Hugging Face

---

## 🔗 Resources

- **Hugging Face Hub**: [${modelName} on Hugging Face](https://huggingface.co/${listItem.id})
${arxivUrl ? `- **Paper**: [arXiv](${arxivUrl})` : ""}

---

## 📜 License & Access
**${license}** — Open-weights model available for download, fine-tuning, and self-hosted deployment.
`;

    // Save JSON to pending staging directory & README
    fs.writeFileSync(path.join(PENDING_DIR, `${fullId}.json`), JSON.stringify(newModelJson, null, 2), "utf-8");
    fs.writeFileSync(path.join(README_DIR, `${modelSlug}.md`), readmeMd, "utf-8");

    existingIds.add(fullId);
    existingSlugs.add(modelSlug);
    createdModels.push(modelName);
    console.log(`⏳ Staged for Verification: ${modelName} — ${paramStr} params, ${pipelineTag}, ${license}`);
  }

  // 3. Summary & Run Cross-Source Verification Engine
  console.log("\n📊 Ingestion Summary:");
  if (createdModels.length === 0) {
    console.log("✨ No new models found. Staging registry is up to date!");
  } else {
    console.log(`🎉 Ingested ${createdModels.length} new candidate models into data/models-pending/:`);
    createdModels.forEach((name) => console.log(` - ${name}`));

    console.log("\n🔍 Running cross-source verification pipeline...");
    const { runVerificationPipeline } = require("./verify-model-facts");
    await runVerificationPipeline();

    console.log("\n⚡ Auto-compiling search indexes...");
    require("./compile-models.js");
  }
}

runIngestion();
