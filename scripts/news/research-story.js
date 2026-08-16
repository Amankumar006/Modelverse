"use strict";

/**
 * scripts/news/research-story.js
 *
 * Multi-Source News Research Step:
 * 1. Queries existing configured RSS/API endpoints for matching keyword/entity coverage (48-72h window).
 * 2. Queries GNews API (primary) or SerpApi (secondary fallback) within rate/quota budgets.
 * 3. Fetches full article text for up to 4 distinct domains using well-behaved, identified bot requests.
 * 4. Deduplicates by domain and classifies source types (official_primary vs independent_coverage).
 * 5. Caches research dossiers to data/cache/news-research/<slug>.json.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const https = require("https");

const CACHE_DIR = path.join(process.cwd(), "data", "cache", "news-research");
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const BOT_UA = "Modelverse-Bot/1.0 (+https://themodelverse.in; contact@themodelverse.in)";

// Per-run search API budget counter
const API_CALL_BUDGET = {
  gnewsMax: 5,
  gnewsUsed: 0,
  serpApiMax: 3,
  serpApiUsed: 0,
};

const OFFICIAL_DOMAINS = new Set([
  "anthropic.com",
  "openai.com",
  "deepmind.google",
  "google.com",
  "huggingface.co",
  "blogs.nvidia.com",
  "nvidia.com",
  "meta.com",
  "ai.meta.com",
  "mistral.ai",
  "x.ai",
  "deepseek.com",
  "moonshot.cn",
  "qwenlm.github.io",
]);

function getDomain(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function classifySourceType(domain) {
  if (OFFICIAL_DOMAINS.has(domain)) {
    return "official_primary";
  }
  return "independent_coverage";
}

function fetchHttp(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const req = https.get(
        urlObj,
        {
          headers: {
            "User-Agent": BOT_UA,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
          },
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, url).href;
            return resolve(fetchHttp(redirectUrl, timeoutMs));
          }
          if (res.statusCode >= 400) {
            return resolve(null); // Respect 403/404/WAF block without evasion
          }
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        }
      );
      req.on("error", () => resolve(null));
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

function extractArticleText(html) {
  if (!html) return "";
  let clean = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const paragraphs = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;
  while ((match = pRegex.exec(clean)) !== null) {
    let text = match[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (
      text.length > 50 &&
      !text.toLowerCase().includes("subscribe") &&
      !text.toLowerCase().includes("cookie policy") &&
      !text.toLowerCase().includes("terms of service") &&
      !text.toLowerCase().includes("privacy policy") &&
      !text.toLowerCase().includes("all rights reserved")
    ) {
      paragraphs.push(text);
    }
  }

  return paragraphs.slice(0, 10).join("\n\n");
}

function extractKeywords(title) {
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "by", "from",
    "is", "are", "was", "were", "of", "new", "announces", "releases", "launches", "unveils"
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  return words.slice(0, 4);
}

async function searchGNews(query) {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey) return [];
  if (API_CALL_BUDGET.gnewsUsed >= API_CALL_BUDGET.gnewsMax) {
    console.log("    ⚠️ GNews API per-run budget reached. Skipping further GNews queries.");
    return [];
  }

  try {
    API_CALL_BUDGET.gnewsUsed++;
    console.log(`    🔍 Querying GNews API (${API_CALL_BUDGET.gnewsUsed}/${API_CALL_BUDGET.gnewsMax}): "${query}"`);

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=5&apikey=${apiKey}`;
    const raw = await fetchHttp(url, 6000);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const articles = parsed.articles || [];

    return articles.map((a) => ({
      title: a.title,
      url: a.url,
      description: a.description,
      publishedAt: a.publishedAt,
      sourceName: a.source?.name || "GNews Source",
      domain: getDomain(a.url),
    }));
  } catch (e) {
    console.warn(`    ⚠️ GNews search error: ${e.message}`);
    return [];
  }
}

async function searchSerpApi(query) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) return [];
  if (API_CALL_BUDGET.serpApiUsed >= API_CALL_BUDGET.serpApiMax) {
    console.log("    ⚠️ SerpApi per-run budget reached. Skipping further SerpApi queries.");
    return [];
  }

  try {
    API_CALL_BUDGET.serpApiUsed++;
    console.log(`    🔍 Querying SerpApi News (${API_CALL_BUDGET.serpApiUsed}/${API_CALL_BUDGET.serpApiMax}): "${query}"`);

    const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query)}&gl=us&hl=en&api_key=${apiKey}`;
    const raw = await fetchHttp(url, 7000);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    const newsResults = parsed.news_results || [];

    return newsResults.map((item) => ({
      title: item.title,
      url: item.link,
      description: item.snippet,
      publishedAt: item.date,
      sourceName: item.source?.name || "SerpApi Source",
      domain: getDomain(item.link),
    }));
  } catch (e) {
    console.warn(`    ⚠️ SerpApi search error: ${e.message}`);
    return [];
  }
}

function matchCrossFeedCandidates(story, feedCandidates = []) {
  const storyKeywords = extractKeywords(story.title);
  if (storyKeywords.length === 0) return [];

  const matched = [];
  const originDomain = getDomain(story.link);

  for (const item of feedCandidates) {
    if (!item.link || item.link === story.link) continue;
    const itemDomain = getDomain(item.link);
    if (itemDomain === originDomain) continue; // Dedupe same publisher domain

    const itemTitle = (item.title || "").toLowerCase();
    const matchCount = storyKeywords.filter((k) => itemTitle.includes(k)).length;

    if (matchCount >= 2 || (storyKeywords.length === 1 && matchCount === 1)) {
      matched.push({
        title: item.title,
        url: item.link,
        description: item.description,
        publishedAt: item.pubDate || new Date().toISOString(),
        sourceName: item.lab || itemDomain,
        domain: itemDomain,
      });
    }
  }

  return matched;
}

async function researchStory(story, allDiscoveredCandidates = [], options = {}) {
  const slug = story.slug || story.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80);
  const cachePath = path.join(CACHE_DIR, `${slug}.json`);

  // Check cache first
  if (!options.forceRefresh && fs.existsSync(cachePath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
      if (Date.now() - new Date(cached.researchedAt).getTime() < 24 * 60 * 60 * 1000) {
        console.log(`    📁 Loaded cached research dossier for: ${story.title.slice(0, 45)}...`);
        return cached;
      }
    } catch {}
  }

  console.log(`\n🔎 [Multi-Source Research] Researching story: "${story.title}"...`);

  const primaryDomain = getDomain(story.link);
  const sourcesByDomain = new Map();

  // 1. Add primary discovery source
  const primaryText = story.rawBody || extractArticleText(await fetchHttp(story.link));
  sourcesByDomain.set(primaryDomain, {
    url: story.link,
    domain: primaryDomain,
    title: story.title,
    publishedAt: story.pubDate || new Date().toISOString(),
    sourceType: classifySourceType(primaryDomain),
    sourceName: story.lab || primaryDomain,
    fetchedText: primaryText || story.description || "",
    isPrimary: true,
  });

  // 2. Query other feed candidates (cross-feed discovery)
  const crossMatches = matchCrossFeedCandidates(story, allDiscoveredCandidates);
  for (const match of crossMatches) {
    if (!sourcesByDomain.has(match.domain) && sourcesByDomain.size < 4) {
      const text = extractArticleText(await fetchHttp(match.url));
      if (text && text.length > 80) {
        sourcesByDomain.set(match.domain, {
          url: match.url,
          domain: match.domain,
          title: match.title,
          publishedAt: match.publishedAt,
          sourceType: classifySourceType(match.domain),
          sourceName: match.sourceName,
          fetchedText: text,
          isPrimary: false,
        });
      }
    }
  }

  // 3. Query External News APIs if more sources needed
  const keywords = extractKeywords(story.title).join(" ");
  if (sourcesByDomain.size < 3 && keywords.length >= 4) {
    // Try GNews first
    const gnewsResults = await searchGNews(keywords);
    for (const result of gnewsResults) {
      if (result.domain && !sourcesByDomain.has(result.domain) && sourcesByDomain.size < 4) {
        const text = extractArticleText(await fetchHttp(result.url));
        if (text && text.length > 80) {
          sourcesByDomain.set(result.domain, {
            url: result.url,
            domain: result.domain,
            title: result.title,
            publishedAt: result.publishedAt,
            sourceType: classifySourceType(result.domain),
            sourceName: result.sourceName,
            fetchedText: text,
            isPrimary: false,
          });
        }
      }
    }

    // Fallback to SerpApi if still under target
    if (sourcesByDomain.size < 2) {
      const serpResults = await searchSerpApi(keywords);
      for (const result of serpResults) {
        if (result.domain && !sourcesByDomain.has(result.domain) && sourcesByDomain.size < 4) {
          const text = extractArticleText(await fetchHttp(result.url));
          if (text && text.length > 80) {
            sourcesByDomain.set(result.domain, {
              url: result.url,
              domain: result.domain,
              title: result.title,
              publishedAt: result.publishedAt,
              sourceType: classifySourceType(result.domain),
              sourceName: result.sourceName,
              fetchedText: text,
              isPrimary: false,
            });
          }
        }
      }
    }
  }

  const finalSources = Array.from(sourcesByDomain.values());
  const distinctDomainCount = finalSources.length;
  const hasOfficialPrimary = finalSources.some((s) => s.sourceType === "official_primary");
  const hasIndependentCoverage = finalSources.some((s) => s.sourceType === "independent_coverage");

  const dossier = {
    storySlug: slug,
    title: story.title,
    researchedAt: new Date().toISOString(),
    distinctDomainCount,
    eligibleForLongform: distinctDomainCount >= 2,
    hasOfficialPrimary,
    hasIndependentCoverage,
    sources: finalSources,
    apiUsage: { ...API_CALL_BUDGET },
  };

  fs.writeFileSync(cachePath, JSON.stringify(dossier, null, 2), "utf-8");

  console.log(`    📊 Found ${distinctDomainCount} distinct-domain sources (Official: ${hasOfficialPrimary}, Independent: ${hasIndependentCoverage})`);
  return dossier;
}

module.exports = {
  researchStory,
  API_CALL_BUDGET,
  classifySourceType,
};
