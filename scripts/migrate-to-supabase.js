require("dotenv").config();
const fs = require("fs");
const path = require("path");
const supabase = require("../src/lib/supabase");

const PROD_DIR = path.join(process.cwd(), "data", "models");

async function runMigration() {
  console.log("🚀 Starting migration to Supabase...");
  if (!fs.existsSync(PROD_DIR)) {
    console.error(`Directory not found: ${PROD_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PROD_DIR).filter((f) => f.endsWith(".json") && f !== "_index.json");
  console.log(`📂 Found ${files.length} model files to migrate.`);

  const batchSize = 50;
  let migratedCount = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batchFiles = files.slice(i, i + batchSize);
    const rowsToInsert = [];

    for (const file of batchFiles) {
      try {
        const raw = fs.readFileSync(path.join(PROD_DIR, file), "utf-8");
        const data = JSON.parse(raw);

        // Transform to schema
        const row = {
          slug: data.slug,
          name: data.name,
          developer: data.developer,
          description: data.description || null,
          primary_task: data.primaryTask || null,
          type: data.type || null,
          status: data.status || "active",
          vendor_api_status: data.vendorApiStatus || null,
          deployment: data.deployment || null,
          release_date: data.releaseDate || null,
          family: data.family || null,
          tier: data.tier || null,
          institution: data.institution || null,
          previous_version: data.previousVersion || null,
          logo: data.logo || null,
          images: data.images || null,
          tags: data.tags || null,
          links: data.links || null,
          sources: data.sources || null,
          pricing: data.pricing || null,
          parameters: data.parameters || null,
          context_window: data.contextWindow || null,
          benchmarks: data.benchmarks || null,
          field_confidence: data.fieldConfidence || null,
          featured: data.featured || false,
          boost: data.boost || 1,
          verified: false, // Reset unconditionally
          verification_status: "LIKELY", // Reset to LIKELY
          needs_review: true, // Needs review
          curator_notes: data.curatorNotes || null,
        };

        rowsToInsert.push(row);
      } catch (e) {
        console.error(`❌ Failed to parse ${file}: ${e.message}`);
      }
    }

    if (rowsToInsert.length > 0) {
      const { data, error } = await supabase
        .from("models")
        .upsert(rowsToInsert, { onConflict: "slug" });

      if (error) {
        console.error(`❌ Error inserting batch:`, error.message);
      } else {
        migratedCount += rowsToInsert.length;
        console.log(`✅ Migrated batch of ${rowsToInsert.length} models. Total: ${migratedCount}`);
      }
    }
  }

  console.log(`\n🎉 Migration Complete! Successfully migrated ${migratedCount} models to Supabase.`);
}

runMigration().catch(console.error);
