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

async function rewriteArticleWithOpenRouter(title, body, author, originalUrl) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not defined!");
  }

  // Deduce lab name from author string (e.g. "TechCrunch AI / Modelverse Editorial" -> "TechCrunch AI")
  const lab = author.split("/")[0].trim();

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
  try {
    const responseJson = await postHttps(url, payload, headers);
    const data = JSON.parse(responseJson);
    
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      let rewritten = data.choices[0].message.content.trim();
      
      // Clean up typical LLM intros if they slipped through
      rewritten = rewritten.replace(/^Here is a summary:|^Here's the summary:|^Summary:/i, "").trim();

      return rewritten;
    }
  } catch (e) {
    console.error(`  ⚠️ Failed to rewrite article using OpenRouter: ${e.message}`);
  }

  // Fallback
  return body;
}

async function runMigration() {
  console.log("🚀 Starting existing articles migration & rewrite script...");
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("❌ Error: OPENROUTER_API_KEY environment variable is missing!");
    console.error("   Run export OPENROUTER_API_KEY='your-key' before running this script.");
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

    // Check if already rewritten (has clean summary structure and has official announcement link)
    const wordCount = body.split(/\s+/).filter(Boolean).length;
    const isAlreadySummary = wordCount < 350 && body.includes("### Official Announcement");

    if (isAlreadySummary && !hasBoilerplate) {
      console.log(`  ⏭️  Skipping [${i+1}/${files.length}] (already summary): ${file}`);
      skippedCount++;
      continue;
    }

    // Needs rewrite!
    console.log(`  ✍️  Rewriting [${i+1}/${files.length}] (${wordCount} words): ${file}...`);
    
    let retries = 3;
    let success = false;

    const originalUrl = data.externalSources && data.externalSources[0] ? data.externalSources[0] : "https://www.themodelverse.in";

    while (retries > 0 && !success) {
      try {
        const rewrittenBody = await rewriteArticleWithOpenRouter(
          data.title,
          body,
          data.author || "Modelverse Editorial",
          originalUrl
        );

        data.body = rewrittenBody;
        
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
        console.error(`     ⚠️ Error: ${e.message}. Retries left: ${retries}`);
        if (retries > 0) {
          console.log("     Waiting 5 seconds before retrying...");
          await new Promise(r => setTimeout(r, 5000));
        }
      }
    }

    if (!success) {
      console.error(`  ❌ Failed to migrate ${file} after all retries. Halting migration to prevent partial corruption.`);
      process.exit(1);
    }

    // Sleep to prevent rate limits
    await new Promise((r) => setTimeout(r, 1500));
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
