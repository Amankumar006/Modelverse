const fs = require("fs");
const path = require("path");
const https = require("https");

const NEWS_DIR = path.join(process.cwd(), "data", "news");
const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");
const DIGEST_PATH = path.join(INGESTION_DIR, "latest-news-digest.html");

// ─── Configuration ──────────────────────────────────────────────────
const MAX_ARTICLES_PER_RUN = 10;    // Safety cap per ingestion run
const MAX_AGE_HOURS = 48;           // Only process articles from last 48h

// ─── Poster images rotation by lab/source ───────────────────────────
const POSTER_IMAGES = {
  "OpenAI": [
    "/images/news/news_featured.jpg",
    "/images/news/news_short.jpg",
    "/images/news/openai_sol_codex_updates_cover.jpg",
  ],
  "Google DeepMind": [
    "/images/news/news_review.jpg",
    "/images/news/alphaevolve_cover.jpg",
    "/images/news/diffusiongemma_cover.jpg",
    "/images/news/medgemma_cover.jpg",
  ],
  "default": [
    "/images/news/news_short.jpg",
    "/images/news/news_featured.jpg",
    "/images/news/news_review.jpg",
  ]
};

function getPosterImage(lab, index) {
  const pool = POSTER_IMAGES[lab] || POSTER_IMAGES["default"];
  return pool[index % pool.length];
}

if (!fs.existsSync(INGESTION_DIR)) {
  fs.mkdirSync(INGESTION_DIR, { recursive: true });
}

function getHttps(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Ingestion-Bot/1.0" } }, (res) => {
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
    .replace(/-+$/, "")
    .slice(0, 80); // Prevent absurdly long slugs
}

function parseRss(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
    const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(itemContent);
    const descMatch = /<description>([\s\S]*?)<\/description>/.exec(itemContent);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent) || /<dc:date>([\s\S]*?)<\/dc:date>/.exec(itemContent);
    
    if (titleMatch && linkMatch) {
      const cleanTitle = titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').trim();
      const cleanDesc = descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim() : cleanTitle;
      const rawDate = pubDateMatch ? pubDateMatch[1].trim() : null;
      
      items.push({
        title: cleanTitle,
        link: linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim(),
        description: cleanDesc.slice(0, 500), // Cap description length
        pubDate: rawDate,
        parsedDate: rawDate ? new Date(rawDate) : null
      });
    }
  }
  return items;
}

// ─── Date filtering: only keep recent articles ──────────────────────

function filterRecentArticles(items, maxAgeHours) {
  const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
  
  return items.filter(item => {
    if (!item.parsedDate || isNaN(item.parsedDate.getTime())) {
      // If no valid date, include it but mark as uncertain
      console.log(`  ⚠️  No valid date for "${item.title.slice(0, 50)}..." — including as fallback`);
      return true;
    }
    return item.parsedDate.getTime() >= cutoff;
  });
}

function getExistingNewsSlugs() {
  const files = fs.readdirSync(NEWS_DIR).filter((f) => f.endsWith(".json") && !f.endsWith("_index.json") && !f.endsWith("news-archive.json"));
  const slugs = new Set();
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(NEWS_DIR, file), "utf-8"));
      if (data.slug) slugs.add(data.slug);
    } catch (e) {}
  }
  return slugs;
}

// ─── Main ingestion ─────────────────────────────────────────────────

async function runDailyNewsIngestion() {
  console.log("📰 Starting Daily Short News Pipeline...");
  console.log(`   Config: max ${MAX_ARTICLES_PER_RUN} articles, age cutoff: ${MAX_AGE_HOURS}h`);
  const existingSlugs = getExistingNewsSlugs();
  const createdNews = [];

  const allCandidates = [];
  
  // Fetch OpenAI RSS
  try {
    const openaiXml = await getHttps("https://openai.com/news/rss.xml");
    const allItems = parseRss(openaiXml);
    console.log(`  OpenAI RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  OpenAI RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "OpenAI" }));
  } catch (e) {
    console.error("  ❌ Failed fetching OpenAI feed:", e.message);
  }

  // Fetch DeepMind RSS
  try {
    const deepmindXml = await getHttps("https://deepmind.google/blog/rss.xml");
    const allItems = parseRss(deepmindXml);
    console.log(`  DeepMind RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  DeepMind RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "Google DeepMind" }));
  } catch (e) {
    console.error("  ❌ Failed fetching DeepMind feed:", e.message);
  }

  // Sort by date (newest first) and cap
  allCandidates.sort((a, b) => {
    const da = a.parsedDate ? a.parsedDate.getTime() : 0;
    const db = b.parsedDate ? b.parsedDate.getTime() : 0;
    return db - da;
  });

  const candidates = allCandidates.slice(0, MAX_ARTICLES_PER_RUN);
  console.log(`\n  📋 Processing ${candidates.length} candidates (capped from ${allCandidates.length})`);

  const todayStr = new Date().toISOString().split("T")[0];
  let posterIndex = 0;

  for (const candidate of candidates) {
    const newsSlug = slugify(candidate.title);
    if (existingSlugs.has(newsSlug)) {
      console.log(`  ⏭️  Skipping (exists): ${candidate.title.slice(0, 60)}...`);
      continue;
    }

    // Use article's actual publication date if available
    const articleDate = candidate.parsedDate && !isNaN(candidate.parsedDate.getTime())
      ? candidate.parsedDate.toISOString().split("T")[0]
      : todayStr;

    const newsJson = {
      id: newsSlug,
      slug: newsSlug,
      title: candidate.title,
      category: "short-news",
      isTrending: true,
      publishDate: articleDate,
      author: `${candidate.lab} / Modelverse Editorial`,
      readTime: "2 min read",
      excerpt: candidate.description.slice(0, 180) + (candidate.description.length > 180 ? "..." : ""),
      body: `${candidate.description}\n\n### Official Announcement\nRead the full update directly from the official source at [${candidate.lab} News](${candidate.link}).\n\nStay tuned to [Modelverse](https://www.themodelverse.in) for real-time model analysis and benchmark coverage.`,
      coverImage: getPosterImage(candidate.lab, posterIndex),
      status: "published",
      confidenceLevel: "confirmed",
      externalSources: [candidate.link],
      relatedModels: [],
      tags: ["ai-news", "breaking", slugify(candidate.lab)]
    };

    fs.writeFileSync(path.join(NEWS_DIR, `${newsSlug}.json`), JSON.stringify(newsJson, null, 2), "utf-8");
    existingSlugs.add(newsSlug);
    createdNews.push(newsJson);
    posterIndex++;
    console.log(`  ✅ Published: ${candidate.title.slice(0, 70)}`);
  }

  // Generate Email Digest
  if (createdNews.length > 0) {
    const newsRows = createdNews.map(n => `
      <div style="background-color: #162019; border: 1px solid #243629; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #4ADE80; letter-spacing: 1px;">${n.category || "AI NEWS"}</span>
        <h3 style="margin: 6px 0; font-size: 16px; color: #ffffff;">${n.title}</h3>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #A3B8AA;">${n.excerpt}</p>
        <a href="https://www.themodelverse.in/news/${n.slug}" style="display: inline-block; padding: 6px 12px; background-color: #4ADE80; color: #0C120F; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 12px;">Read Full Story →</a>
      </div>
    `).join("");

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0C120F; color: #E2E8E4; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #121A15; border: 1px solid #243629; border-radius: 16px; padding: 24px;">
    <h1 style="margin: 0 0 4px 0; font-size: 20px; color: #ffffff;">📰 Modelverse Daily AI News Digest</h1>
    <p style="margin: 0 0 20px 0; font-size: 12px; color: #8C9E91;">${todayStr} • ${createdNews.length} new articles</p>
    ${newsRows}
    <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #5A6E60;">
      Modelverse Daily News Pipeline • <a href="https://www.themodelverse.in/news" style="color: #4ADE80;">themodelverse.in/news</a>
    </div>
  </div>
</body>
</html>`;

    fs.writeFileSync(DIGEST_PATH, htmlBody, "utf-8");
    if (process.env.GITHUB_ENV) {
      fs.appendFileSync(process.env.GITHUB_ENV, "NEW_NEWS_PUSHED=true\n");
      fs.appendFileSync(process.env.GITHUB_ENV, `NEWS_COUNT=${createdNews.length}\n`);
    }
  }

  // Summary
  console.log("\n📊 Ingestion Summary:");
  if (createdNews.length === 0) {
    console.log("✨ No new articles found in the last " + MAX_AGE_HOURS + " hours.");
    if (process.env.GITHUB_ENV) {
      fs.appendFileSync(process.env.GITHUB_ENV, "NEW_NEWS_PUSHED=false\n");
    }
  } else {
    console.log(`🎉 Published ${createdNews.length} new articles:`);
    createdNews.forEach((n) => console.log(`   - ${n.title}`));
  }

  console.log("⚡ Auto-compiling indexes...");
  require("./compile-models.js");
}

runDailyNewsIngestion();
