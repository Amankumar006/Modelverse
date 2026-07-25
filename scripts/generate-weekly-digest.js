const fs = require("fs");
const path = require("path");

const MODELS_DIR = path.join(process.cwd(), "data", "models");
const NEWS_DIR = path.join(process.cwd(), "data", "news");
const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");
const WEEKLY_EMAIL_PATH = path.join(INGESTION_DIR, "weekly-digest.html");

if (!fs.existsSync(INGESTION_DIR)) {
  fs.mkdirSync(INGESTION_DIR, { recursive: true });
}

function generateWeeklyDigest() {
  console.log("📅 Generating Weekly Sunday Model Digest...");

  const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json") && !f.endsWith("_index.json") && !f.endsWith("models-archive.json"));
  const allModels = [];

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
      allModels.push(data);
    } catch (e) {}
  }

  // Filter models from last 7 days
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let weeklyModels = allModels.filter((m) => {
    const d = new Date(m.releaseDate || m.updatedAt);
    return d >= sevenDaysAgo;
  });

  // Fallback if < 5 models in last 7 days (for testing / initial run)
  if (weeklyModels.length < 5) {
    allModels.sort((a, b) => new Date(b.releaseDate || b.updatedAt).getTime() - new Date(a.releaseDate || a.updatedAt).getTime());
    weeklyModels = allModels.slice(0, 10);
  }

  console.log(`Gathered ${weeklyModels.length} models for the Weekly Sunday Digest.`);

  const todayStr = now.toISOString().split("T")[0];
  const weeklyArticleSlug = `weekly-model-recap-${todayStr}`;

  // 1. Create Weekly Recap News Article
  const articleBody = `Welcome to the **Modelverse Weekly Digest** for ${todayStr}.\n\nThis week, our automated ingestion engine indexed and published **${weeklyModels.length} frontier and open-weight AI models**.\n\n### Featured Releases This Week\n\n` +
    weeklyModels.map(m => `#### 🚀 [${m.name}](https://www.themodelverse.in/models/${m.slug})\n- **Parent Company / Developer**: ${m.developer}\n- **Primary Task / Use Case**: ${m.primaryTask || "Multimodal General"}\n- **Modalities**: ${(m.modality || ["text"]).join(", ")}\n- **Parameters**: ${m.parameters || "Undisclosed"}\n- **Key Highlights**: ${(m.keyFeatures || []).slice(0, 2).join(". ")}\n- **Links**: [View Specs & Benchmarks on Modelverse](https://www.themodelverse.in/models/${m.slug})`).join("\n\n---\n\n") +
    `\n\n---\n\n*Stay updated with real-time AI benchmarks, model comparisons, and release tracking at [Modelverse](https://www.themodelverse.in).*`;

  const newsJson = {
    id: weeklyArticleSlug,
    slug: weeklyArticleSlug,
    title: `Weekly Model Recap: ${weeklyModels.length} Frontier & Open-Weight Releases (${todayStr})`,
    category: "weekly-news",
    isTrending: true,
    publishDate: todayStr,
    author: "Modelverse Editorial Team",
    readTime: "4 min read",
    excerpt: `Complete weekly digest of ${weeklyModels.length} newly released AI models featuring specs, parent companies, primary tasks, and key features.`,
    body: articleBody,
    coverImage: "/images/news/news_weekly.jpg",
    status: "published",
    confidenceLevel: "confirmed",
    externalSources: ["https://www.themodelverse.in"],
    relatedModels: weeklyModels.map(m => m.slug).slice(0, 5),
    tags: ["weekly-digest", "model-releases", "ai-roundup"]
  };

  fs.writeFileSync(path.join(NEWS_DIR, `${weeklyArticleSlug}.json`), JSON.stringify(newsJson, null, 2), "utf-8");
  console.log(`✅ Created Weekly Recap article: ${weeklyArticleSlug}.json`);

  // 2. Create HTML Email Digest
  const modelCardsHtml = weeklyModels.map(m => `
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
      <h1 style="margin: 0; font-size: 22px; color: #ffffff;">🌟 Modelverse Weekly Sunday Digest</h1>
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
