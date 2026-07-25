const fs = require("fs");
const path = require("path");
const https = require("https");

const MODELS_DIR = path.join(process.cwd(), "data", "models");
const README_DIR = path.join(process.cwd(), "data", "models", "readme");
const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");
const SEEN_POSTS_PATH = path.join(INGESTION_DIR, "seen-posts.json");

if (!fs.existsSync(INGESTION_DIR)) {
  fs.mkdirSync(INGESTION_DIR, { recursive: true });
}

function getHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Ingestion-Bot/1.0 (https://themodelverse.in)" } }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(10000, () => {
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

function parseRss(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
    const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent) || /<dc:date>([\s\S]*?)<\/dc:date>/.exec(itemContent);
    
    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim(),
        link: linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim(),
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString()
      });
    }
  }
  return items;
}

// Get existing model slugs & IDs
function getExistingIds() {
  const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json"));
  const ids = new Set();
  const slugs = new Set();

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
      if (data.id) ids.add(data.id);
      if (data.slug) slugs.add(data.slug);
    } catch (e) {}
  }
  return { ids, slugs };
}

async function fetchHuggingFaceTrending() {
  console.log("🔍 Ingesting HuggingFace Trending models...");
  try {
    const jsonStr = await getHttps("https://huggingface.co/api/models?limit=20");
    const models = JSON.parse(jsonStr);
    if (!Array.isArray(models)) {
      return [];
    }
    return models.map((m) => {
      const parts = m.id.split("/");
      const author = parts[0] || "Other";
      const modelName = parts[1] || m.id;
      return {
        id: m.id,
        author: author,
        name: modelName,
        huggingfaceUrl: `https://huggingface.co/${m.id}`,
        likes: m.likes || 0,
        downloads: m.downloads || 0,
        source: "HuggingFace Trending"
      };
    });
  } catch (err) {
    console.error("❌ Failed fetching HuggingFace trending:", err.message);
    return [];
  }
}

async function fetchLabFeeds() {
  console.log("🔍 Ingesting AI Lab Feeds (OpenAI & Google DeepMind)...");
  const candidates = [];
  
  try {
    const openaiXml = await getHttps("https://openai.com/news/rss.xml");
    const items = parseRss(openaiXml);
    items.forEach((item) => {
      candidates.push({ ...item, lab: "OpenAI" });
    });
  } catch (e) {
    console.error("Failed fetching OpenAI feed:", e.message);
  }

  try {
    const deepmindXml = await getHttps("https://deepmind.google/blog/rss.xml");
    const items = parseRss(deepmindXml);
    items.forEach((item) => {
      candidates.push({ ...item, lab: "Google DeepMind" });
    });
  } catch (e) {
    console.error("Failed fetching DeepMind feed:", e.message);
  }

  return candidates;
}

async function runIngestion() {
  console.log("🚀 Starting Daily Ingestion Pipeline...");
  const { ids: existingIds, slugs: existingSlugs } = getExistingIds();
  const createdModels = [];

  // 1. Process Hugging Face Trending
  const hfCandidates = await fetchHuggingFaceTrending();
  for (const candidate of hfCandidates) {
    const devSlug = slugify(candidate.author);
    const modelSlug = slugify(candidate.name);
    const fullId = `${devSlug}-${modelSlug}`;

    if (existingIds.has(fullId) || existingSlugs.has(modelSlug)) {
      continue;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    
    // Draft model JSON schema
    const newModelJson = {
      id: fullId,
      name: candidate.name,
      slug: modelSlug,
      developer: candidate.author,
      releaseDate: todayStr,
      updatedAt: todayStr,
      type: "open-weights",
      modality: ["text"],
      primaryTask: "multimodal-general",
      deployment: ["self-hostable"],
      license: "Other/Custom",
      parameters: "undisclosed",
      contextWindow: "unknown",
      description: `${candidate.name} is a trending open-weight AI model developed by ${candidate.author}, featuring high community adoption on Hugging Face (${candidate.likes} likes, ${candidate.downloads} downloads).`,
      keyFeatures: [
        `Trending open-weight release by ${candidate.author}`,
        `Community favorite on Hugging Face with ${candidate.likes} likes`,
        `Supports self-hosted inference and deployment`
      ],
      benchmarks: [],
      family: null,
      previousVersion: null,
      links: {
        huggingface: candidate.huggingfaceUrl
      },
      logo: null,
      tags: ["open-weights", "trending", "huggingface"],
      sources: [candidate.huggingfaceUrl],
      verified: false,
      featured: false,
      boost: 1,
      curatorNotes: `Automated ingestion draft from Hugging Face Trending on ${todayStr}. Needs human verification.`
    };

    // Draft README markdown
    const readmeMd = `# ${candidate.name}

## Model Overview
**${candidate.name}** is an open-weight model created by **${candidate.author}**. It was automatically ingested into Modelverse on **${todayStr}** from Hugging Face Trending.

---

## ✨ Key Features

- **Trending Release**: Fast growing open-weight model on Hugging Face
- **Community Adoption**: ${candidate.likes} likes and ${candidate.downloads} downloads
- **Self-Hostable**: Available for local deployment and fine-tuning

---

## 🔗 Resources

- **Hugging Face Hub**: [${candidate.name} on Hugging Face](${candidate.huggingfaceUrl})

---

## 📜 License & Access
**Open-Weights** — See repository for specific license details.
`;

    // Save JSON & README
    const jsonPath = path.join(MODELS_DIR, `${fullId}.json`);
    const readmePath = path.join(README_DIR, `${modelSlug}.md`);

    fs.writeFileSync(jsonPath, JSON.stringify(newModelJson, null, 2), "utf-8");
    fs.writeFileSync(readmePath, readmeMd, "utf-8");

    existingIds.add(fullId);
    existingSlugs.add(modelSlug);
    createdModels.push(candidate.name);
    console.log(`✅ Draft created for HF model: ${candidate.name} (${fullId})`);
  }

  // 2. Log Ingestion Summary
  console.log("\n📊 Ingestion Summary:");
  if (createdModels.length === 0) {
    console.log("✨ No new models found. Registry is 100% up to date!");
  } else {
    console.log(`🎉 Ingested ${createdModels.length} new draft models:`);
    createdModels.forEach((name) => console.log(` - ${name}`));
  }
}

runIngestion();
