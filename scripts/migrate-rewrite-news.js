const fs = require("fs");
const path = require("path");
const https = require("https");

const NEWS_DIR = path.join(process.cwd(), "data", "news");

const BLACKLISTED_PHRASES = [
  "cookie policy",
  "all rights reserved",
  "facebookinstagramx",
  "subscribe",
  "partner with us",
  "read our exclusive",
  "sign in",
  "log in",
  "search home",
  "recent posts"
];

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

async function rewriteArticleWithGemini(title, body) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `You are a professional AI technology editor at Modelverse (themodelverse.in).
Write a unique, original, and engaging summary of the following AI news or announcement.
Do NOT copy-paste the source sentences directly (avoid plagiarism).
Keep the narrative structured into 2-3 clean paragraphs (around 150-250 words total).
Do NOT rewrite or modify raw code blocks, mathematical equations, links, or specific benchmark scores. Keep them intact.
Focus on:
1. What was announced or released.
2. How the technology works.
3. Why it matters to developers and researchers.

Title: ${title}
Source Content:
${body}

Write the unique summary in Markdown (do not write any intro like "Here is your summary"):`;

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
  const prompt = `You are a professional AI technology editor at Modelverse (themodelverse.in).
Write a unique, original, and engaging summary of the following AI news or announcement.
Do NOT copy-paste the source sentences directly (avoid plagiarism).
Keep the narrative structured into 2-3 clean paragraphs (around 150-250 words total).
Do NOT rewrite or modify raw code blocks, mathematical equations, links, or specific benchmark scores. Keep them intact.
Focus on:
1. What was announced or released.
2. How the technology works.
3. Why it matters to developers and researchers.

Title: ${title}
Source Content:
${body}

Write the unique summary in Markdown (do not write any intro like "Here is your summary"):`;

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
  const prompt = `You are a professional AI technology editor at Modelverse (themodelverse.in).
Write a unique, original, and engaging summary of the following AI news or announcement.
Do NOT copy-paste the source sentences directly (avoid plagiarism).
Keep the narrative structured into 2-3 clean paragraphs (around 150-250 words total).
Do NOT rewrite or modify raw code blocks, mathematical equations, links, or specific benchmark scores. Keep them intact.
Focus on:
1. What was announced or released.
2. How the technology works.
3. Why it matters to developers and researchers.

Title: ${title}
Source Content:
${body}

Write the unique summary in Markdown (do not write any intro like "Here is your summary"):`;

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

  throw new Error("No configured LLM API keys succeeded during rewriting attempt.");
}

async function runMigration() {
  console.log("🚀 Starting existing articles migration & rewrite script...");
  const hasKeys = process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!hasKeys) {
    console.error("❌ Error: GEMINI_API_KEY, GROQ_API_KEY, and OPENROUTER_API_KEY environment variables are missing!");
    process.exit(1);
  }

  if (!fs.existsSync(NEWS_DIR)) {
    console.error("❌ Error: data/news directory not found!");
    process.exit(1);
  }

  const files = fs.readdirSync(NEWS_DIR).filter(
    (f) => f.endsWith(".json") && f !== "_index.json" && f !== "news-archive.json"
  );

  console.log(`   Found ${files.length} candidate files to check.`);
  let rewroteCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(NEWS_DIR, file);
    let data;

    try {
      data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (e) {
      console.error(`  ⚠️ Skipped malformed JSON [${file}]: ${e.message}`);
      skippedCount++;
      continue;
    }

    // --- Schema Auto-Healing Section ---
    let schemaHealed = false;
    if (!data.tags || !Array.isArray(data.tags)) {
      data.tags = ["ai-news"];
      schemaHealed = true;
    }
    if (!data.confidenceLevel) {
      data.confidenceLevel = "confirmed";
      schemaHealed = true;
    }
    if (!data.externalSources || !Array.isArray(data.externalSources)) {
      data.externalSources = [];
      schemaHealed = true;
    }
    if (!data.author) {
      data.author = "Modelverse Editorial";
      schemaHealed = true;
    }
    if (schemaHealed) {
      console.log(`     🔧 Healed missing schema tags/fields locally for: ${file}`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }

    const body = data.body || "";
    const bodyLower = body.toLowerCase();
    
    // Check if it has any boilerplate phrases
    let hasBoilerplate = false;
    for (const phrase of BLACKLISTED_PHRASES) {
      if (bodyLower.includes(phrase)) {
        hasBoilerplate = true;
        break;
      }
    }

    // Strip existing markdown footer attribution if present (locally, no API call needed!)
    let cleanedBody = body;
    if (body.includes("### Official Announcement")) {
      cleanedBody = body.split("### Official Announcement")[0].trim();
    }

    const wordCount = cleanedBody.split(/\s+/).filter(Boolean).length;
    const isAlreadySummary = wordCount < 350 && !hasBoilerplate;

    if (isAlreadySummary) {
      console.log(`  ⏭️  Cleaning metadata [${i+1}/${files.length}] (already summary): ${file}`);
      data.body = cleanedBody;
      data.author = "Modelverse Editorial";
      
      const newWordCount = cleanedBody.split(/\s+/).filter(Boolean).length;
      const newReadTime = Math.max(2, Math.ceil(newWordCount / 200));
      data.readTime = `${newReadTime} min read`;
      
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
      skippedCount++;
      continue;
    }

    // Needs rewrite!
    console.log(`  ✍️  Rewriting [${i+1}/${files.length}] (${wordCount} words): ${file}...`);
    
    let retries = 3;
    let success = false;
    const originalUrl = data.externalSources && data.externalSources[0] ? data.externalSources[0] : "https://www.themodelverse.in";
    const lab = (data.author || "Modelverse Editorial").split("/")[0].trim();

    while (retries > 0 && !success) {
      try {
        const rewrittenBody = await rewriteArticle(data.title, body, lab, originalUrl);

        data.body = rewrittenBody;
        data.author = "Modelverse Editorial";
        
        // Update read time based on the new word count
        const newWordCount = rewrittenBody.split(/\s+/).filter(Boolean).length;
        const newReadTime = Math.max(2, Math.ceil(newWordCount / 200));
        data.readTime = `${newReadTime} min read`;

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        console.log(`     ✅ Completed rewrite: ${newWordCount} words, ${newReadTime} min read.`);
        rewroteCount++;
        success = true;
      } catch (e) {
        retries--;
        console.error(`     ⚠️ Error rewriting: ${e.message}. Retries left: ${retries}`);
        if (retries > 0) {
          console.log("     Waiting 5 seconds before retrying...");
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }

    if (!success) {
      console.error(`  ❌ Failed to rewrite ${file} after all retries. Halting build to prevent partial corruption.`);
      process.exit(1);
    }

    // Sleep to prevent rate limits
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("\n📊 Migration Completed!");
  console.log(`   - Rewrote: ${rewroteCount} articles`);
  console.log(`   - Skipped: ${skippedCount} articles`);

  console.log("\n⚡ Auto-compiling indexes...");
  try {
    require("./compile-models.js");
    console.log("   ✅ Completed index compilation.");
  } catch (e) {
    console.error(`   ❌ Index compilation failed: ${e.message}`);
  }
  
  process.exit(0);
}

runMigration();
