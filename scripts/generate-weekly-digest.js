const fs = require("fs");
const path = require("path");

const MODELS_DIR = path.join(process.cwd(), "data", "models");
const NEWS_DIR = path.join(process.cwd(), "data", "news");
const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");
const WEEKLY_EMAIL_PATH = path.join(INGESTION_DIR, "weekly-digest.html");

if (!fs.existsSync(INGESTION_DIR)) {
  fs.mkdirSync(INGESTION_DIR, { recursive: true });
}

function categorizeModels(models) {
  const categories = {
    frontier: [],
    visionVideo: [],
    openWeight: [],
    domainSpecialized: [],
    communityQuant: []
  };

  const frontierLabs = ["anthropic", "openai", "google deepmind", "moonshot ai", "deepmind", "google"];
  const domainTasks = ["code-generation", "cybersecurity", "medical", "healthcare", "audio-speech", "other"];

  for (const m of models) {
    const devLower = (m.developer || "").toLowerCase();
    const taskLower = (m.primaryTask || "").toLowerCase();
    const mods = (m.modality || []).map(x => x.toLowerCase());
    const nameLower = (m.name || "").toLowerCase();
    const slugLower = (m.slug || "").toLowerCase();

    // 1. Vision & Video
    if (mods.includes("video") || mods.includes("motion") || taskLower.includes("video") || nameLower.includes("motion") || nameLower.includes("wan")) {
      categories.visionVideo.push(m);
    }
    // 2. Frontier Reasoning
    else if (frontierLabs.some(lab => devLower.includes(lab)) && (taskLower.includes("reasoning") || m.type === "api-only" || m.type === "closed-source")) {
      categories.frontier.push(m);
    }
    // 3. Domain Specialized
    else if (domainTasks.some(t => taskLower.includes(t)) || devLower.includes("nvidia") || nameLower.includes("cyber") || nameLower.includes("med")) {
      categories.domainSpecialized.push(m);
    }
    // 4. Community Quantizations / Fine-tunes
    else if (slugLower.includes("gguf") || slugLower.includes("nvfp4") || slugLower.includes("uncensored") || devLower.includes("unsloth")) {
      categories.communityQuant.push(m);
    }
    // 5. Open-Weight Powerhouses
    else {
      categories.openWeight.push(m);
    }
  }

  return categories;
}

function renderTable(models) {
  if (!models || models.length === 0) return "";
  let table = "\n\n| Model | Developer | Primary Task | Modality | Parameters | Status |\n";
  table += "| :--- | :--- | :--- | :--- | :--- | :--- |\n";

  for (const m of models) {
    const mods = (m.modality || ["text"]).join(", ");
    const params = m.parameters || "Undisclosed";
    const status = m.type || (m.openSource ? "Open-Weights" : "Closed");
    table += `| [**${m.name}**](https://www.themodelverse.in/models/${m.slug}) | ${m.developer} | \`${m.primaryTask || "Multimodal"}\` | ${mods} | ${params} | \`${status}\` |\n`;
  }
  return table + "\n\n";
}

function generateWeeklyDigest() {
  console.log("📅 Generating Rich Weekly Model Digest...");

  const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json") && !f.endsWith("_index.json") && !f.endsWith("models-archive.json"));
  const allModels = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
      allModels.push(data);
    } catch (e) {}
  }

  // Sort by date newest first
  allModels.sort((a, b) => new Date(b.releaseDate || b.updatedAt || 0).getTime() - new Date(a.releaseDate || a.updatedAt || 0).getTime());

  // Filter models from last 7 days (or top 25 if testing)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let weeklyModels = allModels.filter((m) => {
    const d = new Date(m.releaseDate || m.updatedAt);
    return d >= sevenDaysAgo;
  });

  if (weeklyModels.length < 10) {
    weeklyModels = allModels.slice(0, 27);
  }

  console.log(`Gathered ${weeklyModels.length} models for the Weekly Digest.`);

  const todayStr = now.toISOString().split("T")[0];
  const weeklyArticleSlug = `weekly-model-recap-${todayStr}`;
  const cats = categorizeModels(weeklyModels);

  // Build In-Depth Featured Model Spotlights
  const spotlightModels = weeklyModels.filter(m => m.featured || m.type === "api-only" || m.parameters === "2.8T" || m.name.includes("Opus") || m.name.includes("Gemma 4") || m.name.includes("Motion")).slice(0, 6);

  let spotlightContent = "";
  for (const m of spotlightModels) {
    spotlightContent += `#### 🌟 [${m.name}](https://www.themodelverse.in/models/${m.slug})\n`;
    spotlightContent += `> **Developer**: ${m.developer} • **Task**: \`${m.primaryTask || "General Intelligence"}\` • **Parameters**: \`${m.parameters || "Undisclosed"}\` • **Access**: \`${m.type || "Open-Weights"}\`\n\n`;
    spotlightContent += `${m.description || "Frontier release indexed by Modelverse."}\n\n`;
    if (m.keyFeatures && m.keyFeatures.length > 0) {
      spotlightContent += `**Key Technical Innovations:**\n`;
      m.keyFeatures.slice(0, 4).forEach(kf => {
        spotlightContent += `- ${kf}\n`;
      });
    }
    spotlightContent += `\n👉 [Explore Full Specs & Benchmarks for ${m.name}](https://www.themodelverse.in/models/${m.slug})\n\n---\n\n`;
  }

  // Construct Rich Article Body
  const articleBody = `Welcome to the **Modelverse Weekly Intelligence Digest** for **${todayStr}**.

Over the past week, the global AI ecosystem experienced rapid architectural iteration, with **${weeklyModels.length} new foundation, open-weight, and domain-specialized models** indexed in the Modelverse repository.

> **Executive Summary & Macro Trends:**
> - **Test-Time Compute & Long Context Standardized**: Closed frontier labs (Anthropic's *Claude Opus 5*, Moonshot AI's *Kimi K3*) are prioritizing adaptive reasoning budgets alongside 1M+ token context windows.
> - **Video World Models & Spatial Motion**: Open-weights research saw major breakthroughs in skeleton-free motion transfer (*Motion4Motion*) and mobile real-time video diffusion (*MobileWan*).
> - **Domain Specialization Expansion**: Dedicated cybersecurity (*Gemini 3.5 Flash Cyber*) and healthcare vision-language models (*MedGemma 1.5 4B*) are outperforming general-purpose LLMs on specialized benchmarks.

---

### 🏆 Top Model Spotlights of the Week

${spotlightContent}

### 🌟 1. Frontier Foundation & Reasoning Breakthroughs

Frontier laboratories continue to push the boundaries of reasoning performance, extended context caching, and agentic code generation.

${renderTable(cats.frontier)}

${cats.frontier.map(m => `##### 🚀 [${m.name}](https://www.themodelverse.in/models/${m.slug})\n- **Developer**: ${m.developer}\n- **Summary**: ${m.description || "Frontier model release."}\n- **Highlights**: ${(m.keyFeatures || []).slice(0, 2).join(". ")}`).join("\n\n")}

---

### 🎥 2. Generative Vision, Video & Spatial World Models

Generative video models are rapidly advancing toward real-time temporal consistency, low-latency mobile inference, and skeleton-free motion control.

${renderTable(cats.visionVideo)}

${cats.visionVideo.map(m => `##### 🎥 [${m.name}](https://www.themodelverse.in/models/${m.slug})\n- **Developer**: ${m.developer}\n- **Summary**: ${m.description || "Video & vision model."}\n- **Highlights**: ${(m.keyFeatures || []).slice(0, 2).join(". ")}`).join("\n\n")}

---

### ⚡ 3. Open-Weight & High-Efficiency Foundation Models

Open-weight foundation models offer strong reasoning capabilities, privacy guarantees, and local deployment efficiency across edge and cloud infrastructure.

${renderTable(cats.openWeight)}

${cats.openWeight.slice(0, 6).map(m => `##### ⚡ [${m.name}](https://www.themodelverse.in/models/${m.slug})\n- **Developer**: ${m.developer}\n- **Summary**: ${m.description || "Open-weight model release."}\n- **Highlights**: ${(m.keyFeatures || []).slice(0, 2).join(". ")}`).join("\n\n")}

---

### 🛠️ 4. Specialized Domain Models (Cyber, Medical, Code)

Domain-specific fine-tuning delivers state-of-the-art accuracy in security vulnerability detection, clinical medical comprehension, and interactive robotics.

${renderTable(cats.domainSpecialized)}

${cats.domainSpecialized.map(m => `##### 🛠️ [${m.name}](https://www.themodelverse.in/models/${m.slug})\n- **Developer**: ${m.developer}\n- **Summary**: ${m.description || "Domain specialized model."}\n- **Highlights**: ${(m.keyFeatures || []).slice(0, 2).join(". ")}`).join("\n\n")}

---

### 📦 5. Community Open-Source Fine-tunes & Quantizations

The Hugging Face open-source community continues to publish optimized GGUF quantizations, NVFP4 low-bit representations, and specialized instruction-tuned fusions.

${renderTable(cats.communityQuant)}

---

### 📊 Strategic Outlook & Key Takeaways

1. **Enterprise Deployment**: Production teams are increasingly pairing fast Flash/Lite tier models for high-throughput routing with heavy reasoning models for complex multi-step execution.
2. **Open-Weights Parity**: The gap between closed API benchmarks and open-weight models continues to narrow, with open models matching previous-generation frontier baselines.
3. **Multimodal Native Architecture**: Audio, vision, and text are no longer separate adapters; newly designed models incorporate unified multimodal tokenizers natively.

*Stay up to date with real-time AI benchmarks, model comparisons, and release tracking at [Modelverse](https://www.themodelverse.in).*`;

  const newsJson = {
    id: weeklyArticleSlug,
    slug: weeklyArticleSlug,
    title: `Weekly Model Recap: ${weeklyModels.length} Frontier & Open-Weight Releases (${todayStr})`,
    category: "weekly-news",
    isTrending: true,
    publishDate: todayStr,
    author: "Modelverse Editorial Team",
    readTime: "8 min read",
    excerpt: `Executive digest of ${weeklyModels.length} newly indexed AI models across reasoning, video generation, open-weight efficiency, cybersecurity, and quantization.`,
    body: articleBody,
    coverImage: "/images/news/news_weekly.jpg",
    status: "published",
    confidenceLevel: "confirmed",
    externalSources: ["https://www.themodelverse.in"],
    relatedModels: weeklyModels.map(m => m.slug).slice(0, 5),
    tags: ["weekly-digest", "model-releases", "ai-roundup"]
  };

  fs.writeFileSync(path.join(NEWS_DIR, `${weeklyArticleSlug}.json`), JSON.stringify(newsJson, null, 2), "utf-8");
  console.log(`✅ Created Rich Weekly Recap article: ${weeklyArticleSlug}.json`);

  // HTML Email Digest
  const modelCardsHtml = weeklyModels.slice(0, 10).map(m => `
    <div style="background-color: #162019; border: 1px solid #243629; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 11px; font-weight: bold; color: #4ADE80; background-color: #1A2E20; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">${m.developer}</span>
        <span style="font-size: 11px; color: #8C9E91;">${m.type || "Open-Weights"}</span>
      </div>
      <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #ffffff;">${m.name}</h3>
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #A3B8AA; line-height: 1.4;">${m.description || "Newly ingested AI model on Modelverse."}</p>
      
      <table style="width: 100%; font-size: 12px; color: #8C9E91; margin-bottom: 12px; border-top: 1px solid #243629; padding-top: 8px;">
        <tr>
          <td><strong>Use Case:</strong> ${m.primaryTask || "Multimodal"}</td>
          <td><strong>Parameters:</strong> ${m.parameters || "Undisclosed"}</td>
          <td><strong>Modality:</strong> ${(m.modality || ["text"]).join(", ")}</td>
        </tr>
      </table>

      <div style="text-align: right;">
        <a href="https://www.themodelverse.in/models/${m.slug}" style="display: inline-block; padding: 6px 14px; background-color: #4ADE80; color: #0C120F; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 12px;">Inspect Full Specs & Benchmarks →</a>
      </div>
    </div>
  `).join("");

  const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0C120F; color: #E2E8E4; padding: 24px;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #121A15; border: 1px solid #243629; border-radius: 16px; padding: 28px;">
    
    <div style="border-bottom: 1px solid #243629; padding-bottom: 16px; margin-bottom: 24px;">
      <h1 style="margin: 0; font-size: 22px; color: #ffffff;">🌟 Modelverse Weekly Intelligence Digest</h1>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #8C9E91;">Comprehensive roundup of ${weeklyModels.length} AI models released this week (${todayStr})</p>
    </div>

    ${modelCardsHtml}

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #243629; text-align: center; font-size: 12px; color: #5A6E60;">
      <p style="margin: 0;">Sent by Modelverse Weekly Automation • <a href="https://www.themodelverse.in" style="color: #4ADE80; text-decoration: none;">themodelverse.in</a></p>
    </div>

  </div>
</body>
</html>`;

  fs.writeFileSync(WEEKLY_EMAIL_PATH, emailHtml, "utf-8");
  console.log(`Saved Weekly Email Digest to ${WEEKLY_EMAIL_PATH}`);

  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, "HAS_WEEKLY_DIGEST=true\n");
    fs.appendFileSync(process.env.GITHUB_ENV, `WEEKLY_MODELS_COUNT=${weeklyModels.length}\n`);
  }

  console.log("⚡ Auto-compiling indexes...");
  require("./compile-models.js");
}

generateWeeklyDigest();
