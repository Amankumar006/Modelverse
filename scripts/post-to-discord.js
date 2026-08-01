const fs = require("fs");
const path = require("path");

async function postToDiscord(modelData = null, newsArticles = null) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log("ℹ️ DISCORD_WEBHOOK_URL is not configured in environment. Skipping Discord webhook notification.");
    return;
  }

  console.log("🤖 Starting Discord Auto-Notifier Webhook...");

  // 1. Resolve fallback payloads if arguments not explicitly passed
  if (!modelData) {
    const archivePath = path.join(process.cwd(), "data", "models-archive.json");
    if (fs.existsSync(archivePath)) {
      try {
        const models = JSON.parse(fs.readFileSync(archivePath, "utf-8"));
        if (Array.isArray(models) && models.length > 0) {
          modelData = models[0];
        }
      } catch (e) {}
    }
    if (!modelData) {
      const prodDir = path.join(process.cwd(), "data", "models");
      if (fs.existsSync(prodDir)) {
        const files = fs.readdirSync(prodDir).filter((f) => f.endsWith(".json") && f !== "_index.json");
        if (files.length > 0) {
          try {
            modelData = JSON.parse(fs.readFileSync(path.join(prodDir, files[0]), "utf-8"));
          } catch (e) {}
        }
      }
    }
  }

  if (!newsArticles || newsArticles.length === 0) {
    const articlesPath = path.join(process.cwd(), "data", "ingestion", "new-articles.json");
    if (fs.existsSync(articlesPath)) {
      try {
        const raw = JSON.parse(fs.readFileSync(articlesPath, "utf-8"));
        if (Array.isArray(raw) && raw.length > 0) {
          newsArticles = raw;
        }
      } catch (e) {}
    }
  }

  const embeds = [];

  // Scenario A: Single Model Release Notification
  if (modelData) {
    const formattedParams = modelData.activeParameters
      ? `${modelData.parameters} (${modelData.activeParameters} active)`
      : modelData.parameters || "Undisclosed";

    const topBenchmarks = (modelData.benchmarks || [])
      .slice(0, 3)
      .map((b) => `• **${b.name}**: \`${b.score}\``)
      .join("\n") || "No benchmark scores recorded yet.";

    embeds.push({
      title: `🚀 New Model Verified: ${modelData.name}`,
      url: `https://www.themodelverse.in/models/${modelData.slug}`,
      description: modelData.description ? modelData.description.slice(0, 240) + "..." : "New AI foundation model released and verified on Modelverse.",
      color: 0x10b981, // Emerald Green
      fields: [
        { name: "🏢 Developer", value: modelData.developer || "Unknown", inline: true },
        { name: "⚡ Parameters", value: formattedParams, inline: true },
        { name: "📜 License", value: modelData.license || "Open", inline: true },
        { name: "📊 Key Benchmarks", value: topBenchmarks, inline: false },
      ],
      footer: {
        text: "Modelverse AI Catalog • themodelverse.in",
        icon_url: "https://www.themodelverse.in/icon.jpg",
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Scenario B: Daily News Articles Digest
  if (newsArticles && newsArticles.length > 0) {
    const articleFields = newsArticles.slice(0, 4).map((art, idx) => ({
      name: `${idx + 1}. ${art.title}`,
      value: `> ${art.excerpt ? art.excerpt.slice(0, 140) + "..." : "Read article"}\n[Read Story on Modelverse →](https://www.themodelverse.in/news/${art.slug})`,
      inline: false,
    }));

    embeds.push({
      title: `📰 Modelverse AI News Digest (${newsArticles.length} updates)`,
      url: "https://www.themodelverse.in/news",
      description: "Here are the latest verified AI announcements and model release updates tracked today:",
      color: 0x3b82f6, // Blue
      fields: articleFields,
      footer: {
        text: "Modelverse News Feed • themodelverse.in",
        icon_url: "https://www.themodelverse.in/icon.jpg",
      },
      timestamp: new Date().toISOString(),
    });
  }



  if (embeds.length === 0) {
    console.log("ℹ️ No content payload to send to Discord.");
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Modelverse Bot",
        avatar_url: "https://www.themodelverse.in/icon.jpg",
        embeds: embeds,
      }),
    });

    if (response.ok || response.status === 204) {
      console.log("🎉 Successfully posted rich notification embed to Discord channel!");
    } else {
      const errText = await response.text();
      console.error(`❌ Discord webhook failed with HTTP status ${response.status}: ${errText}`);
    }
  } catch (err) {
    console.error("❌ Failed to send Discord webhook payload:", err.message);
  }
}

// Support CLI execution
if (require.main === module) {
  postToDiscord();
}

module.exports = { postToDiscord };
