const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "models");

// 1. Define explicit mappings
const UPDATES = {
  // OpenAI Models
  "codex-mini.json": { family: "codex" },
  "gpt-3-5-turbo.json": { family: "gpt-3-5" },
  "gpt-4-1.json": { family: "gpt-4" },
  "gpt-oss-120b.json": { family: "gpt-oss" },
  "gpt-oss-20b.json": { family: "gpt-oss" },
  "omni-moderation.json": { family: "openai-moderation" },
  "text-moderation-stable.json": { family: "openai-moderation" },
  "text-moderation.json": { family: "openai-moderation" },
  "text-embedding-ada-002.json": { family: "openai-embeddings" },
  "openai-text-embedding-3-large.json": { family: "openai-embeddings" },
  "text-embedding-3-small.json": { family: "openai-embeddings" },
  "cohere-embed-english-v3.0.json": { family: "cohere-embeddings" },
  "tts-1.json": { family: "openai-tts" },
  "whisper-1.json": { family: "whisper" },
  "openai-whisper-large-v3.json": { family: "whisper" },
  "openai-gpt-4v.json": { previousVersion: "gpt-4" },

  // Google Models
  "google-deepmind-gemini-1-0-ultra.json": { family: "gemini-1-0" },
  "google-deepmind-gemini-1-5-pro.json": { family: "gemini-1-5", previousVersion: null },
  "google-deepmind-gemini-2-5-pro.json": { family: "gemini-2-5" },
  "google-deepmind-gemini-3-1-flash-lite.json": { family: "gemini-3-1" },
  "google-deepmind-gemini-3-1-pro.json": { family: "gemini-3-1" },
  "google-deepmind-gemini-3-5-flash.json": { family: "gemini-3-5" },
  "google-deepmind-gemini-3-deep-think.json": { family: "gemini-3" }
};

let updatedCount = 0;

for (const [filename, changes] of Object.entries(UPDATES)) {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filename}`);
    continue;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  let changed = false;
  for (const [key, val] of Object.entries(changes)) {
    if (data[key] !== val) {
      data[key] = val;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    console.log(`Updated ${filename}:`, changes);
    updatedCount++;
  }
}

console.log(`\nSuccessfully updated ${updatedCount} model JSON files.`);
