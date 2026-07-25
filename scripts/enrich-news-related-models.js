const fs = require("fs");
const path = require("path");

const NEWS_DIR = path.join(process.cwd(), "data", "news");
const MODELS_ARCHIVE_PATH = path.join(process.cwd(), "src", "lib", "models-archive.json");

const allModels = JSON.parse(fs.readFileSync(MODELS_ARCHIVE_PATH, "utf-8"));

function detectRelatedModelSlugs(title, body, author) {
  const textToMatch = `${title} ${body}`.toLowerCase();
  const matched = [];

  for (const m of allModels) {
    if (matched.length >= 3) break;
    const nameLower = m.name.toLowerCase();
    if (nameLower.length >= 3 && textToMatch.includes(nameLower)) {
      matched.push(m.slug);
    } else if (m.family && m.family.length >= 3 && textToMatch.includes(m.family.toLowerCase())) {
      matched.push(m.slug);
    }
  }

  // Fallback by author / developer name
  if (matched.length < 2 && author) {
    const authorLower = author.toLowerCase();
    const devModels = allModels.filter(m => authorLower.includes(m.developer.toLowerCase()));
    for (const dm of devModels) {
      if (!matched.includes(dm.slug)) {
        matched.push(dm.slug);
      }
      if (matched.length >= 3) break;
    }
  }

  // Fallback to featured models if still empty
  if (matched.length < 2) {
    const featured = allModels.filter(m => m.featured);
    for (const fm of featured) {
      if (!matched.includes(fm.slug)) {
        matched.push(fm.slug);
      }
      if (matched.length >= 3) break;
    }
  }

  return [...new Set(matched)].slice(0, 3);
}

const files = fs.readdirSync(NEWS_DIR).filter(f => f.endsWith(".json") && f !== "_index.json");
let updatedCount = 0;

for (const file of files) {
  const filePath = path.join(NEWS_DIR, file);
  try {
    const news = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const detected = detectRelatedModelSlugs(news.title, news.body || "", news.author || "");
    news.relatedModels = detected;
    fs.writeFileSync(filePath, JSON.stringify(news, null, 2), "utf-8");
    updatedCount++;
    console.log(`  ✅ ${news.slug}: relatedModels -> ${JSON.stringify(detected)}`);
  } catch(e) {
    console.error(`  ❌ Error processing ${file}:`, e.message);
  }
}

console.log(`\n🎉 Updated ${updatedCount} news files with related model links!`);
