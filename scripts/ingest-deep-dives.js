const fs = require("fs");
const path = require("path");
const https = require("https");
const supabase = require("../src/lib/supabase");

// ─── Configuration ──────────────────────────────────────────────────
const DAYS_BACK = 7;
const DEEP_DIVE_COVER = "/images/news/news_featured.jpg";

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
    .slice(0, 80);
}

async function fetchRecentNews(days) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const { data, error } = await supabase
    .from("news_items")
    .select("title, excerpt, body, publish_date, related_models, external_sources")
    .eq("category", "short-news")
    .gte("publish_date", cutoff.toISOString())
    .order("publish_date", { ascending: false })
    .limit(10);
    
  if (error) throw error;
  return data;
}

async function generateDeepDive(newsItems) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for deep dives.");

  const sourceContext = newsItems.map((item, index) => {
    return `--- Article ${index + 1} ---\nTitle: ${item.title}\nDate: ${item.publish_date}\nContent:\n${item.body}\n`;
  }).join("\n");

  const prompt = `You are a Senior AI Architecture Analyst for Modelverse (themodelverse.in).
Your task is to synthesize the top AI news from the past week into a comprehensive "Deep Dive" essay.
Do NOT just list the articles one by one. Identify the overarching themes (e.g. open-source vs closed-source, context window scaling, reasoning breakthroughs) and weave them into a cohesive narrative.

Target length: ~1000 words.
Tone: Highly technical, objective, and analytical. No marketing fluff.

Source Articles from the week:
${sourceContext}

Structure your essay with:
1. An engaging introduction summarizing the week's biggest shifts.
2. 2-3 main thematic sections with bold headers (e.g., "### The MoE Revolution Accelerates").
3. A conclusion on what this means for developers in the coming months.

Return ONLY the Markdown content for the article body.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3 }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const responseJson = await postHttps(url, payload);
  const data = JSON.parse(responseJson);
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error("Invalid response from Gemini API");
}

async function runDeepDiveGeneration() {
  console.log("🌊 Starting Weekly Deep Dive Pipeline...");
  
  try {
    const recentNews = await fetchRecentNews(DAYS_BACK);
    if (!recentNews || recentNews.length < 3) {
      console.log(`  ⏭️  Not enough news this week to warrant a deep dive (${recentNews ? recentNews.length : 0} found). Exiting.`);
      return;
    }
    
    console.log(`  📋 Synthesizing ${recentNews.length} articles into a deep dive...`);
    const deepDiveBody = await generateDeepDive(recentNews);
    
    const today = new Date();
    const title = `Modelverse Deep Dive: AI Advancements for the Week of ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const slug = slugify(title);
    
    // Auto-extract all related models from the source articles
    const allModels = new Set();
    const allSources = new Set();
    recentNews.forEach(item => {
      if (item.related_models) item.related_models.forEach(m => allModels.add(m));
      if (item.external_sources) item.external_sources.forEach(s => allSources.add(s));
    });

    const excerpt = deepDiveBody.split("\n").find(p => p.trim().length > 50) || "A comprehensive deep dive into this week's top AI developments.";
    const wordCount = deepDiveBody.split(/\s+/).length;
    const readTimeMinutes = Math.max(3, Math.ceil(wordCount / 200));

    const payload = {
      slug: slug,
      title: title,
      category: "deep-dive",
      publish_date: today.toISOString().split("T")[0],
      author: "Modelverse Synthesis Engine",
      read_time: `${readTimeMinutes} min read`,
      excerpt: excerpt.slice(0, 180) + (excerpt.length > 180 ? "..." : ""),
      body: deepDiveBody,
      cover_image: DEEP_DIVE_COVER,
      status: "published",
      confidence_level: "confirmed",
      external_sources: Array.from(allSources),
      related_models: Array.from(allModels),
      tags: ["deep-dive", "weekly-recap", "ai-analysis"]
    };

    const { error: dbError } = await supabase.from('news_items').upsert(payload, { onConflict: 'slug' });
    
    if (dbError) {
      console.error(`  ❌ Failed to save Deep Dive to DB: ${dbError.message}`);
    } else {
      console.log(`  ✅ Successfully published Deep Dive: ${title}`);
    }
    
  } catch (error) {
    console.error("  ❌ Deep Dive Pipeline failed:", error);
  }
}

runDeepDiveGeneration();
