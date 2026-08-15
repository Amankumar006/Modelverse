const fs = require("fs");
const path = require("path");
const https = require("https");
const supabase = require("../src/lib/supabase");
const { scoreNewsArticle } = require("./quality/score-content");
const { findNearDuplicates, loadFingerprintIndex, appendFingerprint } = require("./quality/detect-duplicates");

const NEWS_DIR = path.join(process.cwd(), "data", "news");
const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");
const QUARANTINE_DIR = path.join(process.cwd(), "data", "quarantine", "news");

// ─── Configuration ──────────────────────────────────────────────────
const MAX_ARTICLES_PER_RUN = 10;    // Safety cap per ingestion run
const MAX_AGE_HOURS = 48;           // Only process articles from last 48h

if (!fs.existsSync(QUARANTINE_DIR)) {
  fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
}

function writeQualityReport(pipeline, counts) {
  const report = {
    generatedAt: new Date().toISOString(),
    pipeline,
    indexed: counts.indexed,
    unlistedOrThin: counts.unlistedOrThin,
    quarantined: counts.quarantined,
  };
  fs.writeFileSync(path.join(process.cwd(), "data", "quality-report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

function storyWorthiness(candidate, recentTitles = []) {
  const title = String(candidate?.title || "").toLowerCase();
  const lab = String(candidate?.lab || "").toLowerCase();
  let score = 3;
  const authority = ["anthropic", "openai", "hugging face", "google deepmind", "nvidia", "mit technology review"];
  if (authority.some((name) => lab.includes(name))) score += 2;
  if (/\b(model|release|launch|open.source|open.weight|benchmark|research|api|agent|reasoning|security|framework)\b/.test(title)) score += 3;
  if (/\b(gpt|claude|gemini|llama|mistral|qwen|kimi|deepseek)\b/.test(title)) score += 1;
  if (/\b(minor|patch|changelog|maintenance|bug fix|version \d+\.\d+\.\d+|v\d+\.\d+\.\d+)\b/.test(title)) score -= 4;
  const normalizedTitle = title.replace(/\W+/g, " ").trim();
  if (recentTitles.some((existing) => String(existing).toLowerCase().replace(/\W+/g, " ").trim() === normalizedTitle)) score -= 3;
  return Math.max(0, Math.min(10, score));
}

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
  "VentureBeat AI": [
    "/images/news/news_featured.jpg",
  ],
  "MIT Technology Review": [
    "/images/news/news_review.jpg",
  ],
  "MarkTechPost": [
    "/images/news/news_short.jpg",
  ],
  "default": [
    "/images/news/news_short.jpg",
    "/images/news/news_featured.jpg",
    "/images/news/news_review.jpg",
  ]
};

// ─── Automated Model Linking ──────────────────────────────────────────
function getModelList() {
  const modelsPath = path.join(process.cwd(), "src", "lib", "models-archive.json");
  if (fs.existsSync(modelsPath)) {
    try {
      return JSON.parse(fs.readFileSync(modelsPath, "utf-8"));
    } catch(e) {}
  }
  return [];
}

const ALL_MODELS = getModelList();

function detectRelatedModelSlugs(title, body, lab) {
  const textToMatch = `${title} ${body}`.toLowerCase();
  const matched = [];

  for (const m of ALL_MODELS) {
    if (matched.length >= 3) break;
    const nameLower = m.name.toLowerCase();
    if (nameLower.length >= 3 && textToMatch.includes(nameLower)) {
      matched.push(m.slug);
    } else if (m.family && m.family.length >= 3 && textToMatch.includes(m.family.toLowerCase())) {
      matched.push(m.slug);
    }
  }

  // Fallback if no specific model named: pick top model by lab
  if (matched.length === 0 && lab) {
    const labLower = lab.toLowerCase();
    const labModels = ALL_MODELS.filter(m => m.developer.toLowerCase().includes(labLower) || labLower.includes(m.developer.toLowerCase()));
    if (labModels.length > 0) {
      matched.push(labModels[0].slug);
    }
  }

  return [...new Set(matched)].slice(0, 3);
}

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

async function getHttps(url, retries = 3, backoff = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { "User-Agent": "Modelverse-Ingestion-Bot/1.1" } }, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            // Handle redirect (1 hop)
            const redirectUrl = new URL(res.headers.location, url).href;
            const redirReq = https.get(redirectUrl, { headers: { "User-Agent": "Modelverse-Ingestion-Bot/1.1" } }, (redirRes) => {
              let data = "";
              redirRes.on("data", (chunk) => (data += chunk));
              redirRes.on("end", () => resolve(data));
            });
            redirReq.on("error", reject);
            return;
          }
          if (res.statusCode >= 400 && res.statusCode !== 404) {
            // Reject on 5xx or 403, etc., but let 404s pass through or fail gracefully
            return reject(new Error(`HTTP status ${res.statusCode}`));
          }
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
    } catch (e) {
      if (attempt === retries) throw e;
      console.log(`      ⚠️ Network issue (${e.message}). Retrying in ${backoff * attempt}ms...`);
      await new Promise(r => setTimeout(r, backoff * attempt));
    }
  }
}

function postHttps(url, payload, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(payload);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + (urlObj.search || ""),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(bodyStr),
        ...customHeaders
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP status ${res.statusCode}: ${data}`));
        } else {
          resolve(data);
        }
      });
    });
    req.on("error", reject);
    req.write(bodyStr);
    req.end();
  });
}

const GENERATOR_PROMPT = `You are a technical AI research analyst writing for a highly technical audience at Modelverse (themodelverse.in).
Write a unique, original summary of the following AI news or announcement.
Do NOT copy-paste the source sentences directly (avoid plagiarism).
Structure your response into 2-3 clean paragraphs (150-250 words total). Add a final ## Why this matters section with one clearly-labelled, evidence-grounded editorial analysis paragraph; distinguish inference from source facts. Use a bulleted list for technical specs or key takeaways if applicable.
Do NOT use marketing buzzwords like 'revolutionize', 'groundbreaking', or 'game-changer'. Focus heavily on architectural changes, benchmark scores, context window sizes, and licensing.
Do NOT rewrite or modify raw code blocks, mathematical equations, links, or specific benchmark scores. Keep them intact.

Title: \${title}
Source Content:
\${body}

Write the unique summary in Markdown (do not write any intro like "Here is your summary"):`;

async function scoreArticleRelevance(title, body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return 7; // Default pass if no key
  
  const prompt = `You are a strict tech editor filtering noise from a high-quality AI news aggregator.
Score the following raw article from 1 to 10 based on its relevance to AI model developers, researchers, and enterprises.
10 = Major foundation model release, major benchmark breakthrough, major framework update.
7-9 = New finetunes, useful tools, significant research paper.
4-6 = Corporate drama, minor feature updates, generic opinions.
1-3 = Completely irrelevant, non-AI news, generic clickbait.
Return ONLY a single integer between 1 and 10.

Title: ${title}
Content:
${body}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 5 }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  try {
    const responseJson = await postHttps(url, payload);
    const data = JSON.parse(responseJson);
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const scoreStr = data.candidates[0].content.parts[0].text.trim();
      const score = parseInt(scoreStr.replace(/[^0-9]/g, ''));
      return isNaN(score) ? 5 : score;
    }
  } catch(e) {
    console.warn(`   ⚠️ Scoring API failed: ${e.message}`);
  }
  return 5;
}

async function verifyAndRefineArticle(title, rawBody, draftSummary) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return draftSummary; // bypass if no key
  
  const prompt = `You are the strict Senior Editor (Verifier Agent) for Modelverse news.
Your job is to audit a drafted summary of an AI news article against the original raw text.

Original Raw Text:
${rawBody}

Draft Summary to Audit:
${draftSummary}

Task:
1. Hallucination Check: Are there any facts, numbers, or claims in the draft that do NOT appear in the original text? If so, remove them.
2. Tone Check: Remove marketing fluff, buzzwords (e.g. "game-changer", "revolutionize", "groundbreaking"), and subjective opinions. Make it sound like an objective, highly technical AI researcher wrote it.
3. Formatting Check: Preserve a concise ## Why this matters section when it is grounded in the source. Clearly label inference as analysis rather than source fact.

Return ONLY the final, polished, verified markdown text. Do not include introductory notes or explanations of what you changed.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  try {
    const responseJson = await postHttps(url, payload);
    const data = JSON.parse(responseJson);
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch(e) {
    console.warn(`   ⚠️ Verifier API failed: ${e.message}`);
  }
  return draftSummary;
}

async function rewriteArticleWithGemini(title, body) {
  const apiKey = process.env.GEMINI_API_KEY;
  let prompt = GENERATOR_PROMPT.replace('${title}', title).replace('${body}', body);

  const payload = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 0.2
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const responseJson = await postHttps(url, payload);
  const data = JSON.parse(responseJson);
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error("Invalid response from Gemini API");
}

async function rewriteArticleWithGroq(title, body) {
  const apiKey = process.env.GROQ_API_KEY;
  let prompt = GENERATOR_PROMPT.replace('${title}', title).replace('${body}', body);

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2
  };

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const responseJson = await postHttps(url, payload, headers);
  const data = JSON.parse(responseJson);
  
  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    return data.choices[0].message.content.trim();
  }
  throw new Error("Empty or malformed completion response from Groq");
}

async function rewriteArticleWithOpenRouter(title, body, lab, originalUrl) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  let prompt = GENERATOR_PROMPT.replace('${title}', title).replace('${body}', body);

  const payload = {
    model: "nvidia/nemotron-3-super-120b-a12b:free",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.2
  };

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "HTTP-Referer": "https://www.themodelverse.in",
    "X-Title": "Modelverse"
  };

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const responseJson = await postHttps(url, payload, headers);
  const data = JSON.parse(responseJson);
  
  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    return data.choices[0].message.content.trim();
  }
  throw new Error("Empty or malformed completion response from OpenRouter");
}

async function rewriteArticle(title, body, lab, originalUrl) {
  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("   Using Gemini API for rewrite...");
      return await rewriteArticleWithGemini(title, body);
    } catch (e) {
      console.warn(`   ⚠️ Gemini API failed: ${e.message}. Falling back...`);
    }
  }

  // Try Groq second
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("   Using Groq API for rewrite...");
      return await rewriteArticleWithGroq(title, body);
    } catch (e) {
      console.warn(`   ⚠️ Groq API failed: ${e.message}. Falling back...`);
    }
  }

  // Try OpenRouter third
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log("   Using OpenRouter API for rewrite...");
      return await rewriteArticleWithOpenRouter(title, body, lab, originalUrl);
    } catch (e) {
      console.warn(`   ⚠️ OpenRouter API failed: ${e.message}. Falling back...`);
    }
  }

  // Final fallback (returns raw text if no keys succeed)
  console.warn("   ⚠️ No API keys succeeded or available. Storing raw scraped text.");
  return body;
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
  try {
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
  } catch (e) {
    console.error(`  ⚠️ XML Parse Error: ${e.message}`);
    return [];
  }
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

async function getExistingNewsSlugs() {
  const slugs = new Set();
  try {
    const { data, error } = await supabase.from("news_items").select("slug");
    if (!error && data) {
      data.forEach(item => slugs.add(item.slug));
    }
  } catch (e) {
    console.error("Failed to fetch existing slugs from Supabase:", e.message);
  }
  return slugs;
}

// ─── Main ingestion ─────────────────────────────────────────────────

async function runDailyNewsIngestion() {
  console.log("📰 Starting Daily Short News Pipeline...");
  console.log(`   Config: max ${MAX_ARTICLES_PER_RUN} articles, age cutoff: ${MAX_AGE_HOURS}h`);
  const existingSlugs = await getExistingNewsSlugs();
  const createdNews = [];
  const qualityCounts = { indexed: 0, unlistedOrThin: 0, quarantined: 0 };
  const fingerprintIndex = loadFingerprintIndex();

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

  // 7. Fetch VentureBeat AI RSS
  try {
    const vbXml = await getHttps("https://venturebeat.com/category/ai/feed/");
    const allItems = parseRss(vbXml);
    console.log(`  🚀 VentureBeat AI RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  🚀 VentureBeat AI RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "VentureBeat AI" }));
  } catch (e) {
    console.error("  ❌ Failed fetching VentureBeat AI feed:", e.message);
  }

  // 8. Fetch MIT Technology Review AI RSS
  try {
    const mitXml = await getHttps("https://www.technologyreview.com/topic/artificial-intelligence/feed");
    const allItems = parseRss(mitXml);
    console.log(`  🎓 MIT Tech Review AI RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  🎓 MIT Tech Review AI RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "MIT Technology Review" }));
  } catch (e) {
    console.error("  ❌ Failed fetching MIT Tech Review AI feed:", e.message);
  }

  // 9. Fetch MarkTechPost RSS
  try {
    const mtpXml = await getHttps("https://www.marktechpost.com/feed/");
    const allItems = parseRss(mtpXml);
    console.log(`  🛠️ MarkTechPost RSS: ${allItems.length} total items`);
    const recent = filterRecentArticles(allItems, MAX_AGE_HOURS);
    console.log(`  🛠️ MarkTechPost RSS: ${recent.length} items within ${MAX_AGE_HOURS}h window`);
    recent.forEach((item) => allCandidates.push({ ...item, lab: "MarkTechPost" }));
  } catch (e) {
    console.error("  ❌ Failed fetching MarkTechPost feed:", e.message);
  }

  // Filter out already published articles before sorting and capping
  const newCandidates = allCandidates.filter(c => !existingSlugs.has(slugify(c.title)));

  // Sort by date (newest first) and cap
  newCandidates.sort((a, b) => {
    const da = a.parsedDate ? a.parsedDate.getTime() : 0;
    const db = b.parsedDate ? b.parsedDate.getTime() : 0;
    return db - da;
  });

  const candidates = newCandidates.slice(0, MAX_ARTICLES_PER_RUN);
  console.log(`\n  📋 Processing ${candidates.length} candidates (capped from ${newCandidates.length} new articles out of ${allCandidates.length} total)`);

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
  if (!url) return fallbackDesc;
  try {
    let html = await getHttps(url);
    
    // Strip script and style tags completely so their contents don't bleed into the text
    html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    html = html.replace(/<!--[\s\S]*?-->/g, ""); // also strip HTML comments

    // Slice HTML to extract ONLY the main article block, discarding headers, footers, and sidebars
    let startIndex = 0;
    const articleStartRegex = /<article[^>]*>|<div[^>]+(?:class|id)="[^"]*(?:entry-content|post-content|article-body|article-content|td-post-content|pf-content)[^"]*"[^>]*>/i;
    const startMatch = articleStartRegex.exec(html);
    if (startMatch) {
      startIndex = startMatch.index + startMatch[0].length;
    }

    let endIndex = html.length;
    const articleEndRegex = /<\/article>|<footer[^>]*>|<div[^>]+(?:class|id)="[^"]*(?:sidebar|related-posts|comments-area|post-comments|footer-content|related_posts)[^"]*"[^>]*>/i;
    const endMatch = articleEndRegex.exec(html.slice(startIndex));
    if (endMatch) {
      endIndex = startIndex + endMatch.index;
    }

    const cleanHtml = html.slice(startIndex, endIndex);

    const paragraphs = [];
    const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    let match;

    while ((match = pRegex.exec(cleanHtml)) !== null) {
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
      return paragraphs.slice(0, 8).join("\n\n");
    }
  } catch(e) {}

  return fallbackDesc;
}

  const todayStr = new Date().toISOString().split("T")[0];
  let posterIndex = 0;

  for (const candidate of candidates) {
    try {
    if (!candidate.title || !candidate.link) {
      console.log(`  ⚠️  Skipping malformed candidate: missing title or link`);
      continue;
    }
    const newsSlug = slugify(candidate.title);
    if (!newsSlug) {
      console.log(`  ⚠️  Skipping malformed candidate: unable to generate slug for "${candidate.title.slice(0,30)}"`);
      continue;
    }
    if (existingSlugs.has(newsSlug)) {
      console.log(`  ⏭️  Skipping (exists): ${candidate.title.slice(0, 60)}...`);
      continue;
    }

    const recentTitles = [
      ...createdNews.map((item) => item.title),
      ...Object.values(fingerprintIndex.entries).map((entry) => entry?.title).filter(Boolean),
    ];
    const worthiness = storyWorthiness(candidate, recentTitles);
    if (worthiness < 6) {
      console.log(`  ⏭️  Skipping (Low story-worthiness ${worthiness}/10): ${candidate.title.slice(0, 60)}`);
      existingSlugs.add(newsSlug);
      continue;
    }
    console.log(`  ⭐ Story-worthiness ${worthiness}/10: ${candidate.title.slice(0, 60)}`);

    // Use article's actual publication date if available
    const articleDate = candidate.parsedDate && !isNaN(candidate.parsedDate.getTime())
      ? candidate.parsedDate.toISOString().split("T")[0]
      : todayStr;

    // Extract real OG cover image from original article page, fallback to rotated lab poster
    let coverImage = await extractOgImage(candidate.link);
    if (!coverImage) {
      coverImage = getPosterImage(candidate.lab, posterIndex);
    }

    // Relevance Scoring Phase
    const rawBody = await extractFullArticleBody(candidate.link, candidate.description, candidate.lab);
    const relevanceScore = await scoreArticleRelevance(candidate.title, rawBody);
    
    if (relevanceScore < 6) {
      console.log(`  ⏭️  Skipping (Low Score ${relevanceScore}/10): ${candidate.title.slice(0, 40)}...`);
      existingSlugs.add(newsSlug); // prevent reprocessing next run
      continue;
    } else {
      console.log(`  ⭐  Scored ${relevanceScore}/10: ${candidate.title.slice(0, 40)}...`);
    }

    const rewritten = await rewriteArticle(candidate.title, rawBody, candidate.lab, candidate.link);
    const bodyContent = await verifyAndRefineArticle(candidate.title, rawBody, rewritten);
    
    const wordCount = bodyContent.split(/\s+/).length;
    const readTimeMinutes = Math.max(2, Math.ceil(wordCount / 200));

    const newsJson = {
      slug: newsSlug,
      title: candidate.title,
      category: "short-news",
      publish_date: articleDate,
      author: "Modelverse Editorial",
      read_time: `${readTimeMinutes} min read`,
      excerpt: candidate.description.slice(0, 180) + (candidate.description.length > 180 ? "..." : ""),
      body: bodyContent,
      cover_image: coverImage,
      status: "published",
      confidence_level: "confirmed",
      external_sources: [candidate.link],
      sources: [candidate.link],
      related_models: detectRelatedModelSlugs(candidate.title, bodyContent, candidate.lab),
      tags: ["ai-news", "breaking", slugify(candidate.lab)]
    };

    const gate = scoreNewsArticle(newsJson, [rawBody]);
    const duplicate = findNearDuplicates(newsJson, fingerprintIndex.entries);
    if (duplicate) {
      gate.status = "unlisted";
      gate.reasons.push(`near duplicate of ${duplicate.slug} (${duplicate.similarity})`);
    }
    newsJson.quality_status = gate.status;
    newsJson.quality_score = gate.score;
    newsJson.quality_reasons = gate.reasons;
    newsJson.quality_checked_at = new Date().toISOString();

    // Always record the fingerprint, including unlisted and quarantined items.
    const fingerprint = appendFingerprint(newsJson);
    if (fingerprint) fingerprintIndex.entries[newsSlug] = fingerprint;

    if (gate.score < 25) {
      fs.writeFileSync(path.join(QUARANTINE_DIR, `${newsSlug}.json`), `${JSON.stringify(newsJson, null, 2)}\n`, "utf-8");
      qualityCounts.quarantined += 1;
      existingSlugs.add(newsSlug);
      console.warn(`  🚧 Quarantined (quality ${gate.score}/100): ${candidate.title.slice(0, 60)}`);
      continue;
    }
    const { error: dbError } = await supabase.from('news_items').upsert(newsJson, { onConflict: 'slug' });
    
    if (dbError) {
      console.error(`  ❌ Failed to insert to DB: ${candidate.title.slice(0, 30)} - ${dbError.message}`);
      fs.writeFileSync(path.join(QUARANTINE_DIR, `${newsSlug}.json`), `${JSON.stringify(newsJson, null, 2)}\n`, "utf-8");
      qualityCounts.quarantined += 1;
      continue;
    }
    
    if (gate.status === "indexed") qualityCounts.indexed += 1;
    else qualityCounts.unlistedOrThin += 1;
    existingSlugs.add(newsSlug);
    createdNews.push(newsJson);
    posterIndex++;
    console.log(`  ✅ Published (${readTimeMinutes} min read): ${candidate.title.slice(0, 60)}`);
    } catch (error) {
      const failedSlug = slugify(candidate?.title || `malformed-news-${Date.now()}`);
      const failedItem = {
        ...candidate,
        slug: failedSlug,
        quality_status: "unlisted",
        quality_score: 0,
        quality_reasons: ["malformed input", error.message],
        quality_checked_at: new Date().toISOString(),
      };
      fs.writeFileSync(path.join(QUARANTINE_DIR, `${failedSlug}.json`), `${JSON.stringify(failedItem, null, 2)}\n`, "utf-8");
      appendFingerprint(failedItem);
      qualityCounts.quarantined += 1;
      console.error(`  ⚠️ Quarantined failed candidate ${failedSlug}: ${error.message}`);
    }
  }

  // Generate Email Digest
  if (createdNews.length > 0) {
    fs.writeFileSync(path.join(INGESTION_DIR, "new-articles.json"), JSON.stringify(createdNews, null, 2));

    let htmlDigest = `<h2>📰 Modelverse Daily News Digest</h2><p><strong>Quality gate:</strong> ${qualityCounts.indexed} indexed, ${qualityCounts.unlistedOrThin} unlisted, ${qualityCounts.quarantined} quarantined.</p><ul>`;
    createdNews.forEach(n => {
      htmlDigest += `<li><strong>${n.title}</strong> (${n.read_time})<br/><em>${n.excerpt}</em><br/><a href="https://www.themodelverse.in/news/${n.slug}">Read on Modelverse</a></li><br/>`;
    });
    htmlDigest += `</ul><p><small>Automated by Modelverse Ingestion Bot</small></p>`;
    fs.writeFileSync(path.join(INGESTION_DIR, "latest-news-digest.html"), htmlDigest);

    if (process.env.GITHUB_ENV) {
      fs.appendFileSync(process.env.GITHUB_ENV, "NEW_NEWS_PUSHED=true\n");
      fs.appendFileSync(process.env.GITHUB_ENV, `NEWS_COUNT=${createdNews.length}\n`);
    }
  }

  // Summary
  console.log("\n📊 Ingestion Summary:");
  console.log(`Published (indexed): ${qualityCounts.indexed}`);
  console.log(`Published (unlisted/thin): ${qualityCounts.unlistedOrThin}`);
  console.log(`Quarantined: ${qualityCounts.quarantined}`);
  writeQualityReport("news", qualityCounts);
  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, `QUALITY_INDEXED=${qualityCounts.indexed}\n`);
    fs.appendFileSync(process.env.GITHUB_ENV, `QUALITY_UNLISTED=${qualityCounts.unlistedOrThin}\n`);
    fs.appendFileSync(process.env.GITHUB_ENV, `QUALITY_QUARANTINED=${qualityCounts.quarantined}\n`);
  }
  if (createdNews.length === 0) {
    console.log("✨ No new articles found in the last " + MAX_AGE_HOURS + " hours.");
    if (process.env.GITHUB_ENV) {
      fs.appendFileSync(process.env.GITHUB_ENV, "NEW_NEWS_PUSHED=false\n");
    }
    if (allCandidates.length === 0) {
      console.error("🚨 All feeds failed to fetch or parsed zero items; recorded a zero-item quality report without failing the pipeline.");
    }
  } else {
    console.log(`🎉 Published ${createdNews.length} new articles:`);
    createdNews.forEach((n) => console.log(`   - ${n.title}`));
  }

  // We no longer compile files locally since we migrated to Supabase
  // console.log("⚡ Auto-compiling indexes...");
  // require("./compile-models.js");
}

runDailyNewsIngestion();
