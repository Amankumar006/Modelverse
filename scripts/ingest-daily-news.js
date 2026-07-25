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
  "Anthropic": [
    "/images/news/news_featured.jpg",
    "/images/news/claude-opus-5.jpg",
    "/images/news/anthropic_rupee_pricing_cover.jpg",
  ],
  "Hugging Face": [
    "/images/news/news_featured.jpg",
    "/images/news/news_review.jpg",
    "/images/news/diffusers_cover.jpg",
  ],
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
  "NVIDIA": [
    "/images/news/news_featured.jpg",
    "/images/news/news_short.jpg",
  ],
  "TechCrunch AI": [
    "/images/news/news_short.jpg",
    "/images/news/news_featured.jpg",
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

async function fetchAnthropicNews() {
  try {
    const html = await getHttps("https://www.anthropic.com/news");
    const articleRegex = /href="(\/news\/([^"]+))"/g;
    let match;
    const items = [];
    const seen = new Set();
    while ((match = articleRegex.exec(html)) !== null) {
      const slug = match[2];
      if (!seen.has(slug) && slug !== "rss.xml" && !slug.includes("page")) {
        seen.add(slug);
        const title = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
        items.push({
          title: title,
          link: `https://www.anthropic.com/news/${slug}`,
          description: `Official announcement from Anthropic: ${title}`,
          pubDate: new Date().toISOString(),
          parsedDate: new Date()
        });
      }
    }
    return items;
  } catch(e) {
    return [];
  }
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

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '—');
}

function parseRss(xmlText) {
  const items = [];
  const itemRegex = /<(?:item|entry)>([\s\S]*?)<\/(?:item|entry)>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(itemContent);
    const linkMatch = /<link[^>]*href="([^"]+)"/.exec(itemContent) || /<link>([\s\S]*?)<\/link>/.exec(itemContent);
    const descMatch = /<description>([\s\S]*?)<\/description>/.exec(itemContent) || /<summary>([\s\S]*?)<\/summary>/.exec(itemContent) || /<content[\s\S]*?>([\s\S]*?)<\/content>/.exec(itemContent);
    const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(itemContent) || /<published>([\s\S]*?)<\/published>/.exec(itemContent) || /<updated>([\s\S]*?)<\/updated>/.exec(itemContent) || /<dc:date>([\s\S]*?)<\/dc:date>/.exec(itemContent);
    
    if (titleMatch && linkMatch) {
      const rawTitle = decodeHtmlEntities(titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim());
      const rawLink = linkMatch[1] ? linkMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim() : '';
      const cleanDesc = decodeHtmlEntities(descMatch ? descMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : rawTitle);
      const rawDate = pubDateMatch ? pubDateMatch[1].trim() : null;
      
      if (rawTitle && rawLink) {
        items.push({
          title: rawTitle,
          link: rawLink,
          description: cleanDesc.slice(0, 500),
          pubDate: rawDate,
          parsedDate: rawDate ? new Date(rawDate) : null
        });
      }
    }
  }
  return items;
}

// ─── Date filtering: only keep recent articles ──────────────────────

function filterRecentArticles(items, maxAgeHours) {
  const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
  
  return items.filter(item => {
    if (!item.parsedDate || isNaN(item.parsedDate.getTime())) {
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

  // 1. Fetch Anthropic Official News
  try {
    const anthropicItems = await fetchAnthropicNews();
    console.log(`  🟧 Anthropic Official: ${anthropicItems.length} items`);
    anthropicItems.forEach((item) => allCandidates.push({ ...item, lab: "Anthropic" }));
  } catch (e) {
    console.error("  ❌ Failed fetching Anthropic feed:", e.message);
  }

  // 2. Fetch Hugging Face Blog RSS
  try {
    const hfXml = await getHttps("https://huggingface.co/blog/feed.xml");
    const allItems = parseRss(hfXml);
    console.log(`  🤗 Hugging Face RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  🤗 Hugging Face RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "Hugging Face" }));
  } catch (e) {
    console.error("  ❌ Failed fetching Hugging Face feed:", e.message);
  }
  
  // 3. Fetch OpenAI RSS
  try {
    const openaiXml = await getHttps("https://openai.com/news/rss.xml");
    const allItems = parseRss(openaiXml);
    console.log(`  🟢 OpenAI RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  🟢 OpenAI RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "OpenAI" }));
  } catch (e) {
    console.error("  ❌ Failed fetching OpenAI feed:", e.message);
  }

  // 4. Fetch DeepMind RSS
  try {
    const deepmindXml = await getHttps("https://deepmind.google/blog/rss.xml");
    const allItems = parseRss(deepmindXml);
    console.log(`  🔴 DeepMind RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  🔴 DeepMind RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "Google DeepMind" }));
  } catch (e) {
    console.error("  ❌ Failed fetching DeepMind feed:", e.message);
  }

  // 5. Fetch NVIDIA AI Blog RSS
  try {
    const nvidiaXml = await getHttps("https://blogs.nvidia.com/feed/");
    const allItems = parseRss(nvidiaXml);
    console.log(`  💚 NVIDIA AI RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  💚 NVIDIA AI RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "NVIDIA" }));
  } catch (e) {
    console.error("  ❌ Failed fetching NVIDIA feed:", e.message);
  }

  // 6. Fetch TechCrunch AI RSS
  try {
    const tcXml = await getHttps("https://techcrunch.com/category/artificial-intelligence/feed/");
    const allItems = parseRss(tcXml);
    console.log(`  ⚡ TechCrunch AI RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  ⚡ TechCrunch AI RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "TechCrunch AI" }));
  } catch (e) {
    console.error("  ❌ Failed fetching TechCrunch feed:", e.message);
  }

  // Sort by date (newest first) and cap
  allCandidates.sort((a, b) => {
    const da = a.parsedDate ? a.parsedDate.getTime() : 0;
    const db = b.parsedDate ? b.parsedDate.getTime() : 0;
    return db - da;
  });

  const candidates = allCandidates.slice(0, MAX_ARTICLES_PER_RUN);
  console.log(`\n  📋 Processing ${candidates.length} candidates (capped from ${allCandidates.length})`);

async function extractOgImage(url) {
  if (!url) return null;
  try {
    const html = await getHttps(url);
    const ogMatch = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i.exec(html) ||
                    /<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i.exec(html) ||
                    /<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i.exec(html) ||
                    /<meta[^>]+content="([^"]+)"[^>]+name="twitter:image"/i.exec(html);
    if (ogMatch && ogMatch[1]) {
      let imgUrl = ogMatch[1].replace(/&amp;/g, "&").trim();
      if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
      return imgUrl;
    }
  } catch(e) {}
  return null;
}

async function extractFullArticleBody(url, fallbackDesc, lab) {
  if (!url) {
    return `${fallbackDesc}\n\n### Official Announcement\nRead the full update directly from the official source at [${lab} News](${url}).\n\nStay tuned to [Modelverse](https://www.themodelverse.in) for real-time model analysis and benchmark coverage.`;
  }
  try {
    const html = await getHttps(url);
    const paragraphs = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match;

    while ((match = pRegex.exec(html)) !== null) {
      let text = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      text = decodeHtmlEntities(text);

      if (
        text.length > 50 &&
        !text.toLowerCase().includes("subscribe") &&
        !text.toLowerCase().includes("cookie policy") &&
        !text.toLowerCase().includes("all rights reserved") &&
        !text.toLowerCase().includes("terms of service") &&
        !text.toLowerCase().includes("privacy policy")
      ) {
        paragraphs.push(text);
      }
    }

    if (paragraphs.length >= 2) {
      return paragraphs.slice(0, 8).join("\n\n") + `\n\n### Official Announcement\nRead the full update directly from the official source at [${lab} News](${url}).\n\nStay tuned to [Modelverse](https://www.themodelverse.in) for real-time model analysis and benchmark coverage.`;
    }
  } catch(e) {}

  return `${fallbackDesc}\n\n### Official Announcement\nRead the full update directly from the official source at [${lab} News](${url}).\n\nStay tuned to [Modelverse](https://www.themodelverse.in) for real-time model analysis and benchmark coverage.`;
}

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

    // Extract real OG cover image from original article page, fallback to rotated lab poster
    let coverImage = await extractOgImage(candidate.link);
    if (!coverImage) {
      coverImage = getPosterImage(candidate.lab, posterIndex);
    }

    // Extract full article paragraphs
    const bodyContent = await extractFullArticleBody(candidate.link, candidate.description, candidate.lab);
    const wordCount = bodyContent.split(/\s+/).length;
    const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 200));

    const newsJson = {
      id: newsSlug,
      slug: newsSlug,
      title: candidate.title,
      category: "short-news",
      isTrending: true,
      publishDate: articleDate,
      author: `${candidate.lab} / Modelverse Editorial`,
      readTime: `${readTimeMinutes} min read`,
      excerpt: candidate.description.slice(0, 180) + (candidate.description.length > 180 ? "..." : ""),
      body: bodyContent,
      coverImage: coverImage,
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
    console.log(`  ✅ Published (${readTimeMinutes} min read): ${candidate.title.slice(0, 60)}`);
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
