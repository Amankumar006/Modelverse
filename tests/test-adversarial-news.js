const fs = require("fs");
const path = require("path");
const assert = require("assert");

const NEWS_DIR = path.join(process.cwd(), "data", "news");
const TEST_FILE = path.join(NEWS_DIR, "_test-bad-article.json");

console.log("🧪 Running Adversarial Test for verify-news.js...");

// 1. Create a bad article with hallucinated numbers & invalid related model
const badArticle = {
  id: "test-bad-article",
  slug: "_test-bad-article",
  title: "Test Adversarial News Article",
  category: "short-news",
  publishDate: "2026-07-31",
  author: "Test Suite",
  readTime: "2 min read",
  excerpt: "Fabricated claim excerpt claiming 999999 tokens for $99.99.",
  body: "This is a test article body containing hallucinated numbers like $99999.99 per million tokens and 888888B parameters which do not exist in the source text. It is longer than 80 words so it passes the word count check easily. We want to verify that numeric claim spot checking catches this discrepancy between body text and rawSourceText. Adding more filler text to meet word count requirement for valid article structure test.",
  coverImage: "https://themodelverse.in/images/news/test.jpg",
  status: "published",
  confidenceLevel: "confirmed",
  externalSources: ["https://example.com"],
  relatedModels: ["non-existent-model-slug-xyz"],
  tags: ["test"],
  rawSourceText: "Original source text mentions $0.05 per million tokens and 70B parameters."
};

fs.writeFileSync(TEST_FILE, JSON.stringify(badArticle, null, 2), "utf-8");

try {
  // Execute verify-news.js via child process to check exit code & error output
  const { execSync } = require("child_process");
  let output = "";
  try {
    output = execSync("node scripts/verify-news.js", { cwd: process.cwd(), encoding: "utf-8" });
    assert.fail("verify-news.js should have failed exit status on bad article!");
  } catch (err) {
    const stderr = err.stdout + "\n" + err.stderr;
    assert(stderr.includes("relatedModel \"non-existent-model-slug-xyz\" does not exist"), "Should flag missing relatedModel");
    assert(stderr.includes("Numeric claim spot-check failed"), "Should flag hallucinated numbers");
    console.log("✅ Adversarial test PASSED: verify-news.js correctly caught hallucinated numbers and invalid model link!");
  }
} finally {
  // Cleanup test file
  if (fs.existsSync(TEST_FILE)) {
    fs.unlinkSync(TEST_FILE);
  }
}
