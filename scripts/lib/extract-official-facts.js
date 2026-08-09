const https = require("https");

const PROMPT = `You are an expert AI researcher analyzing a raw Markdown file from a new AI model release.
Your job is to extract exact facts about the model.
You MUST output ONLY valid, raw JSON. Do NOT output markdown formatting like \`\`\`json.
Ensure the keys match this exact format (use null if a value is not found):
{
  "parameters": "8B", // String (e.g. 8B, 70B, 405B).
  "contextWindow": "128000", // String, exact integer format (e.g. 8192, 128000).
  "benchmarks": {
    "mmlu": "68.4", // String, percentage score out of 100
    "humanEval": "70.1", // String, percentage score
    "gpqa": "34.5", // String, percentage score
    "math": "52.3", // String, percentage score
    "gsm8k": "82.1" // String, percentage score
  },
  "trainingTokens": "15T", // String, e.g. 15T, 2T
  "license": "Apache 2.0" // String
}`;

async function extractWithGemini(markdown) {
  const apiKey = process.env.GEMINI_API_KEY;
  const payload = {
    contents: [{
      parts: [
        { text: PROMPT },
        { text: `\n\n--- SOURCE MARKDOWN ---\n${markdown}` }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error(`Gemini HTTP Error: ${response.status}`);
  const data = await response.json();
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content) {
    const text = data.candidates[0].content.parts[0].text.trim();
    return JSON.parse(text);
  }
  throw new Error("Invalid response from Gemini API");
}

async function extractWithGroq(markdown) {
  const apiKey = process.env.GROQ_API_KEY;
  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: `--- SOURCE MARKDOWN ---\n${markdown}` }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  };

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error(`Groq HTTP Error: ${response.status}`);
  const data = await response.json();
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return JSON.parse(data.choices[0].message.content.trim());
  }
  throw new Error("Empty or malformed completion response from Groq");
}

async function extractWithOpenRouter(markdown) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const payload = {
    model: "anthropic/claude-3.5-sonnet:beta", // High intelligence for extraction
    messages: [
      { role: "system", content: PROMPT },
      { role: "user", content: `--- SOURCE MARKDOWN ---\n${markdown}` }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  };

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://www.themodelverse.in"
    },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) throw new Error(`OpenRouter HTTP Error: ${response.status}`);
  const data = await response.json();
  
  if (data.choices && data.choices[0] && data.choices[0].message) {
    const content = data.choices[0].message.content.trim();
    // Claude via OpenRouter sometimes still wraps in markdown blocks despite instructions
    const cleanContent = content.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleanContent);
  }
  throw new Error("Empty or malformed completion response from OpenRouter");
}

async function extractOfficialFacts(markdown) {
  if (!markdown || markdown.trim() === "") return null;

  // Truncate massively large markdowns to fit context windows efficiently
  // 30,000 chars is usually enough to capture the specs of a model card.
  const safeMarkdown = markdown.slice(0, 30000);

  // Try Gemini first (Free tier usually)
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log("   🧠 Using Gemini API for fact extraction...");
      return await extractWithGemini(safeMarkdown);
    } catch (e) {
      console.warn(`   ⚠️ Gemini API failed: ${e.message}. Falling back...`);
    }
  }

  // Try Groq second (Fast, good for extraction)
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("   🧠 Using Groq API for fact extraction...");
      return await extractWithGroq(safeMarkdown);
    } catch (e) {
      console.warn(`   ⚠️ Groq API failed: ${e.message}. Falling back...`);
    }
  }

  // Try OpenRouter third
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log("   🧠 Using OpenRouter API for fact extraction...");
      return await extractWithOpenRouter(safeMarkdown);
    } catch (e) {
      console.warn(`   ⚠️ OpenRouter API failed: ${e.message}. Falling back...`);
    }
  }

  console.warn("   ⚠️ No LLM API keys succeeded. Cannot extract official facts.");
  return null;
}

module.exports = { extractOfficialFacts };

// CLI execution for testing
if (require.main === module) {
  require("dotenv").config(); // Load .env for testing
  const fs = require("fs");
  const markdown = fs.existsSync("test-readme.md") ? fs.readFileSync("test-readme.md", "utf-8") : "Model release: Llama-4-70B. Context window: 128000. MMLU: 88.4. License: Llama 4 License.";
  console.log("Extracting facts from markdown...");
  extractOfficialFacts(markdown).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });
}
