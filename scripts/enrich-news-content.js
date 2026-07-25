const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const NEWS_DIR = path.join(process.cwd(), "data", "news");

function getHttp(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, { headers: { 
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(getHttp(res.headers.location));
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "-")
    .replace(/&#8212;/g, "—");
}

function extractFullArticleText(html) {
  const paragraphs = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = pRegex.exec(html)) !== null) {
    let text = match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    text = decodeHtmlEntities(text);

    // Skip short tags, navigations, ads, cookie warnings
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

  // Cap to first 8 quality paragraphs max to keep articles readable
  return paragraphs.slice(0, 8);
}

async function enrichAllNewsArticles() {
  console.log("📰 Enriching full article body content for news posts...\n");

  const files = fs.readdirSync(NEWS_DIR).filter(f => f.endsWith(".json") && !f.endsWith("_index.json") && !f.endsWith("news-archive.json"));
  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(NEWS_DIR, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch(e) { continue; }

    const src = data.externalSources && data.externalSources[0];
    
    // Only attempt web fetch if it's an external news link (not an internal weekly digest)
    if (src && src.startsWith("http") && !src.includes("themodelverse.in") && data.category !== "weekly-news") {
      console.log(`  🔍 Fetching full article body for: ${data.slug}`);
      try {
        const html = await getHttp(src);
        const paragraphs = extractFullArticleText(html);

        if (paragraphs.length >= 2) {
          // Re-build rich multi-paragraph body
          const formattedBody = paragraphs.join("\n\n") + `\n\n### Official Source\nRead the full original update directly at [${data.author || "Official Source"}](${src}).\n\nStay tuned to [Modelverse](https://www.themodelverse.in) for real-time model analysis, benchmark coverage, and AI news.`;

          data.body = formattedBody;
          data.readTime = `${Math.max(2, Math.ceil(paragraphs.join(" ").split(" ").length / 200))} min read`;
          
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
          console.log(`  ✅ Successfully enriched ${paragraphs.length} paragraphs for: ${data.slug}`);
          updatedCount++;
        } else {
          console.log(`  ⚠️  Not enough paragraphs found for: ${data.slug}`);
        }
      } catch(e) {
        console.log(`  ❌ Could not fetch ${src}: ${e.message}`);
      }
    }
  }

  console.log(`\n🎉 Total articles enriched with full body text: ${updatedCount}`);

  if (updatedCount > 0) {
    console.log("⚡ Re-compiling news & search indexes...");
    require("./compile-models.js");
  }
}

enrichAllNewsArticles();
