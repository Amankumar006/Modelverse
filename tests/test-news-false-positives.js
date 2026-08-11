const fs = require("fs");
const path = require("path");
const assert = require("assert");

const NEWS_DIR = path.join(process.cwd(), "data", "news");
const TEST_FILE = path.join(NEWS_DIR, "_test-valid-article.json");

console.log("🧪 Testing News Spot-Checker for False Positives...");

// Get an existing valid model slug
const MODELS_DIR = path.join(process.cwd(), "data", "models");
const firstModel = fs.readdirSync(MODELS_DIR).find((f) => f.endsWith(".json") && !f.startsWith("_"));
const validModelSlug = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, firstModel), "utf-8")).slug;

// Create a valid article with legitimate numbers & valid relatedModel
const validArticle = {
  id: "_test-valid-article",
  slug: "_test-valid-article",
  title: "Test Valid Paraphrased Article",
  category: "short-news",
  publishDate: "2026-07-31",
  author: "Test Suite",
  readTime: "2 min read",
  excerpt: "Legitimate news update about 70B parameter model pricing at $0.05 per 1M tokens.",
  body: `This is a legitimate test article body discussing AI model releases. The model features 70B parameters and costs $0.05 per 1M tokens in production environments. All numbers in this body paragraph match the raw source text exactly or correspond to standard date formatting. We are testing that valid articles do not get erroneously flagged with false positives by the numeric claim checker. Adding more filler text to ensure word count easily exceeds the eighty word minimum requirement for valid article verification tests in production. Additional text to ensure word count is comfortably above 90 words.`,
  coverImage: "https://themodelverse.in/images/news/test.jpg",
  status: "published",
  confidenceLevel: "confirmed",
  externalSources: ["https://example.com"],
  relatedModels: [validModelSlug],
  tags: ["test"],
  rawSourceText: "Official announcement: Meta releases 70B parameter model with API pricing set at $0.05 per 1M tokens in 2026."
};

fs.writeFileSync(TEST_FILE, JSON.stringify(validArticle, null, 2), "utf-8");

try {
  const { execSync } = require("child_process");
  const output = execSync("node scripts/verify-news.js", { cwd: process.cwd(), encoding: "utf-8" });
  assert(output.includes("All news articles passed"), "Valid article should pass without false positive errors!");
  console.log("✅ False Positive Test PASSED: Legitimate paraphrased article passed verify-news.js cleanly!");
} finally {
  if (fs.existsSync(TEST_FILE)) fs.unlinkSync(TEST_FILE);
}
