"use strict";

// The migration workflow historically referenced this script but it was not
// present in the repository. It intentionally annotates local archive JSON
// only; it never deletes or unpublishes an existing Supabase article.

const fs = require("fs");
const path = require("path");
const { scoreNewsArticle } = require("./quality/score-content");
const { findNearDuplicates, loadFingerprintIndex, appendFingerprint } = require("./quality/detect-duplicates");

const NEWS_DIR = path.join(process.cwd(), "data", "news");
const QUARANTINE_DIR = path.join(process.cwd(), "data", "quarantine", "news");

function writeReport(counts) {
  fs.writeFileSync(
    path.join(process.cwd(), "data", "quality-report.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), pipeline: "news-migration", indexed: counts.indexed, unlistedOrThin: counts.unlistedOrThin, quarantined: counts.quarantined }, null, 2)}\n`
  );
}

function migrateNewsQuality() {
  if (!fs.existsSync(NEWS_DIR)) return;
  fs.mkdirSync(QUARANTINE_DIR, { recursive: true });
  const index = loadFingerprintIndex();
  const counts = { indexed: 0, unlistedOrThin: 0, quarantined: 0 };
  const files = fs.readdirSync(NEWS_DIR).filter((file) => file.endsWith(".json") && !file.startsWith("_"));

  for (const file of files) {
    const filePath = path.join(NEWS_DIR, file);
    try {
      const article = JSON.parse(fs.readFileSync(filePath, "utf8"));
      article.sources = article.sources || article.externalSources || article.external_sources || [];
      const sourceTexts = Array.isArray(article.sourceTexts) ? article.sourceTexts : (article.rawSourceText ? [article.rawSourceText] : []);
      const gate = scoreNewsArticle(article, sourceTexts);
      const duplicate = findNearDuplicates(article, index.entries);
      if (duplicate) {
        gate.status = "unlisted";
        gate.reasons.push(`near duplicate of ${duplicate.slug} (${duplicate.similarity})`);
      }
      article.qualityStatus = gate.status;
      article.qualityScore = gate.score;
      article.qualityReasons = gate.reasons;
      article.qualityCheckedAt = new Date().toISOString();
      const fingerprint = appendFingerprint(article);
      if (fingerprint) index.entries[article.slug] = fingerprint;

      // Preserve the local archive in place (the gate applies forward), while
      // keeping a copy of the bottom tier for curator inspection.
      fs.writeFileSync(filePath, `${JSON.stringify(article, null, 2)}\n`);
      if (gate.score < 25) {
        fs.writeFileSync(path.join(QUARANTINE_DIR, file), `${JSON.stringify(article, null, 2)}\n`);
        counts.quarantined += 1;
      } else if (gate.status === "indexed") counts.indexed += 1;
      else counts.unlistedOrThin += 1;
    } catch (error) {
      console.error(`  ⚠️ Could not quality-check ${file}: ${error.message}`);
      fs.writeFileSync(
        path.join(QUARANTINE_DIR, `${file}.error.json`),
        `${JSON.stringify({ file, qualityStatus: "unlisted", qualityScore: 0, qualityReasons: ["malformed input", error.message], qualityCheckedAt: new Date().toISOString() }, null, 2)}\n`
      );
      counts.quarantined += 1;
    }
  }

  writeReport(counts);
  console.log("📊 Migration quality summary:");
  console.log(`Published (indexed): ${counts.indexed}`);
  console.log(`Published (unlisted/thin): ${counts.unlistedOrThin}`);
  console.log(`Quarantined: ${counts.quarantined}`);
}

if (require.main === module) migrateNewsQuality();

module.exports = { migrateNewsQuality };
