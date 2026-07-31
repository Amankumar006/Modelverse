const fs = require("fs");
const path = require("path");

const NEWS_DIR = path.join(process.cwd(), "data", "news");

const REQUIRED_KEYS = [
  "id",
  "slug",
  "title",
  "category",
  "publishDate",
  "author",
  "readTime",
  "excerpt",
  "body",
  "coverImage",
  "status",
  "confidenceLevel",
  "externalSources",
  "relatedModels",
  "tags"
];

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

const MODELS_DIR = path.join(process.cwd(), "data", "models");

function getValidModelSlugs() {
  const slugs = new Set();
  if (!fs.existsSync(MODELS_DIR)) return slugs;
  const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), "utf-8"));
      if (data.slug) slugs.add(data.slug);
      if (data.id) slugs.add(data.id);
    } catch (e) {}
  }
  return slugs;
}

function verifyNewsArticles() {
  console.log("🔍 Running news articles quality & truthfulness validation checker...");
  
  if (!fs.existsSync(NEWS_DIR)) {
    console.error("❌ Error: data/news directory does not exist!");
    process.exit(1);
  }

  const validModelSlugs = getValidModelSlugs();
  const files = fs.readdirSync(NEWS_DIR).filter(
    (f) => f.endsWith(".json") && f !== "_index.json" && f !== "news-archive.json"
  );

  console.log(`   Found ${files.length} articles to check.`);
  let failedCount = 0;

  for (const file of files) {
    const filePath = path.join(NEWS_DIR, file);
    let data;

    // 1. JSON parsing check
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      data = JSON.parse(content);
    } catch (e) {
      console.error(`❌ [${file}]: Invalid JSON format! - ${e.message}`);
      failedCount++;
      continue;
    }

    const errors = [];

    // 2. Schema check: Required keys
    for (const key of REQUIRED_KEYS) {
      if (data[key] === undefined || data[key] === null) {
        errors.push(`Missing required field: "${key}"`);
      }
    }

    // If critical fields are missing, skip detailed validation to prevent crashes
    if (errors.length > 0) {
      console.error(`❌ [${file}] Schema failures:\n   - ${errors.join("\n   - ")}`);
      failedCount++;
      continue;
    }

    // 3. Status & HOLD_FOR_REVIEW check
    if (data.status === "draft" || data.needsReview || data.holdForReview) {
      console.log(`ℹ️ [${file}] Article is currently on HOLD_FOR_REVIEW / draft mode.`);
    }

    // 4. Cover image check
    const img = data.coverImage;
    if (typeof img !== "string" || img.trim() === "") {
      errors.push("coverImage is empty or not a string");
    } else if (!img.startsWith("http://") && !img.startsWith("https://") && !img.startsWith("/")) {
      errors.push(`coverImage has invalid format: "${img}" (must be URL or starting with '/')`);
    }

    // 5. Body length check
    const body = data.body;
    if (typeof body !== "string" || body.trim() === "") {
      errors.push("body is empty or not a string");
    } else {
      const wordCount = body.split(/\s+/).filter(Boolean).length;
      if (wordCount < 80) {
        errors.push(`body is too short: ${wordCount} words (should be at least 80 words)`);
      }
    }

    // 6. Readability / Boilerplate check
    if (typeof body === "string") {
      const bodyLower = body.toLowerCase();
      for (const phrase of BLACKLISTED_PHRASES) {
        if (bodyLower.includes(phrase)) {
          errors.push(`body contains scraper/navigation boilerplate: "${phrase}"`);
        }
      }
    }

    // 7. Basic formatting check
    if (data.slug !== file.replace(".json", "")) {
      errors.push(`slug "${data.slug}" does not match file name "${file}"`);
    }

    // 8. Related-model link verification
    if (Array.isArray(data.relatedModels) && data.relatedModels.length > 0) {
      for (const modelSlug of data.relatedModels) {
        if (!validModelSlugs.has(modelSlug)) {
          errors.push(`relatedModel "${modelSlug}" does not exist in production data/models/`);
        }
      }
    }

    // 9. Numeric claim spot-check against raw source text (if available)
    if (data.rawSourceText && typeof data.rawSourceText === "string") {
      const numbersInBody = (data.body + " " + data.excerpt).match(/\b\d+(\.\d+)?(%|B|M|T|\$)?\b/g) || [];
      const missingNumbers = [];
      for (const num of numbersInBody) {
        // Skip common formatting integers like 2024, 2025, 2026
        if (["2024", "2025", "2026"].includes(num)) continue;
        if (!data.rawSourceText.includes(num.replace(/[\$\%]/g, ""))) {
          missingNumbers.push(num);
        }
      }
      if (missingNumbers.length > 2) {
        errors.push(`Numeric claim spot-check failed: Numbers [${missingNumbers.join(", ")}] in body/excerpt not found in raw source text.`);
      }
    }

    if (errors.length > 0) {
      console.error(`❌ [${file}] Quality validation failed:\n   - ${errors.join("\n   - ")}`);
      failedCount++;
    }
  }

  if (failedCount > 0) {
    console.error(`\n🚨 Validation Failed: ${failedCount} articles failed quality & truthfulness checks!`);
    process.exit(1);
  } else {
    console.log("\n✅ All news articles passed the quality and truthfulness checks successfully!");
    process.exit(0);
  }
}

verifyNewsArticles();
