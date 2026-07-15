const fs = require("fs");
const path = require("path");
const https = require("https");

const SEEN_POSTS_PATH = path.join(process.cwd(), "data", "ingestion", "seen-posts.json");

function getHttps(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

function cleanXmlEntities(str) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
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
        title: cleanXmlEntities(titleMatch[1].trim()),
        link: linkMatch[1].trim(),
        pubDate: pubDateMatch ? pubDateMatch[1].trim() : ""
      });
    }
  }
  return items;
}

function isReleaseShaped(title) {
  const lower = title.toLowerCase();
  if (lower.startsWith("introducing")) return true;
  if (lower.includes("system card")) return true;
  
  // version-like tokens
  if (lower.includes("gpt-")) return true;
  if (lower.includes("gemini")) return true;
  if (lower.includes("gemma")) return true;
  if (lower.includes("claude")) return true;
  
  // number-dot pattern like 3.5, 5.6
  if (/\b\d+\.\d+\b/.test(title)) return true;
  
  return false;
}

async function run() {
  console.log("Fetching Tier A RSS Feeds...");
  
  let openaiFeed = "";
  let deepmindFeed = "";
  
  try {
    openaiFeed = await getHttps("https://openai.com/news/rss.xml");
  } catch (err) {
    console.error("Failed to fetch OpenAI feed:", err.message);
  }
  
  try {
    deepmindFeed = await getHttps("https://deepmind.google/blog/rss.xml");
  } catch (err) {
    console.error("Failed to fetch DeepMind feed:", err.message);
  }
  
  const openaiItems = parseRss(openaiFeed).map(item => ({ ...item, lab: "OpenAI" }));
  const deepmindItems = parseRss(deepmindFeed).map(item => ({ ...item, lab: "Google DeepMind" }));
  
  const allItems = [...openaiItems, ...deepmindItems];
  console.log(`Fetched ${allItems.length} raw feed items (OpenAI: ${openaiItems.length}, DeepMind: ${deepmindItems.length})`);
  
  // Filter for release-shaped titles
  const releaseItems = allItems.filter(item => isReleaseShaped(item.title));
  console.log(`Filtered down to ${releaseItems.length} release-shaped items.`);
  
  // Load seen posts
  let seenPosts = [];
  if (fs.existsSync(SEEN_POSTS_PATH)) {
    try {
      seenPosts = JSON.parse(fs.readFileSync(SEEN_POSTS_PATH, "utf-8"));
    } catch (err) {
      console.error("Failed to load seen-posts.json:", err.message);
    }
  }
  
  const seenLinks = new Set(seenPosts.map(p => p.link));
  
  // Diff to find candidates
  const newCandidates = releaseItems.filter(item => !seenLinks.has(item.link));
  
  console.log("\n--- TIER A NEW CANDIDATES ---");
  if (newCandidates.length === 0) {
    console.log("No new model release candidates found in Tier A RSS feeds.");
  } else {
    newCandidates.forEach(c => {
      // Format date beautifully
      let dateStr = c.pubDate;
      try {
        const d = new Date(c.pubDate);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split("T")[0];
        }
      } catch (e) {}
      console.log(`[${c.lab}] "${c.title}" — ${dateStr} — ${c.link}`);
    });
  }
  
  console.log("\n--- TIER B MANUAL-CHECK REMINDERS ---");
  console.log("No RSS feed for Anthropic — check https://www.anthropic.com/news yourself.");
  console.log("No RSS feed for Meta AI — check https://ai.meta.com/blog/ yourself.");
  console.log("No RSS feed for Mistral — check https://mistral.ai/news/ yourself.");
  
  // If candidates found, ask curator if they want to seen-mark them or add any
  if (newCandidates.length > 0) {
    console.log("\nTo seen-mark these candidates (saving to seen-posts.json), write them.");
    // Save candidates to seen-posts.json
    const updatedSeen = [...seenPosts];
    const nowStr = new Date().toISOString();
    newCandidates.forEach(c => {
      updatedSeen.push({
        lab: c.lab,
        link: c.link,
        firstSeenAt: nowStr
      });
    });
    
    fs.writeFileSync(SEEN_POSTS_PATH, JSON.stringify(updatedSeen, null, 2));
    console.log(`\nUpdated seen-posts.json with ${newCandidates.length} new entries so they are not re-surfaced next time.`);
  }
}

run();
