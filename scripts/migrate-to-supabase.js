require("dotenv").config();
const fs = require("fs");
const path = require("path");
const supabase = require("../src/lib/supabase");

const PROD_DIR = path.join(process.cwd(), "legacy_local_data", "models");

function getModalities(mod) {
  if (Array.isArray(mod)) return mod;
  if (typeof mod === "object" && mod !== null) {
    const allMods = new Set();
    if (mod.input && Array.isArray(mod.input)) {
      mod.input.forEach(m => allMods.add(m));
    }
    if (mod.output && Array.isArray(mod.output)) {
      mod.output.forEach(m => allMods.add(m));
    }
    return Array.from(allMods);
  }
  return null;
}


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
          modality: getModalities(data.modality),
          license: data.license || null,
          active_parameters: data.activeParameters || null,
          description_draft: data.descriptionDraft || null,
          key_features: data.keyFeatures || null,
          key_features_draft: data.keyFeaturesDraft || null,
          base_model: data.baseModel || null,
          is_legacy_curated: data.isLegacyCurated || false,
          cost_tiers: data.costTiers || null,
          pricing_last_verified: data.pricingLastVerified || null,
          curator_notes: data.curatorNotes || null,
          metadata: { ...data }, // Store entire raw payload for any unmapped fields
        };

        // Remove mapped keys from metadata to save space (optional, but clean)
        [
          "slug", "name", "developer", "description", "primaryTask", "type", "status",
          "vendorApiStatus", "deployment", "releaseDate", "family", "tier", "institution",
          "previousVersion", "logo", "images", "tags", "links", "sources", "pricing",
          "parameters", "contextWindow", "benchmarks", "fieldConfidence", "featured",
          "boost", "curatorNotes", "modality", "license", "activeParameters",
          "descriptionDraft", "keyFeatures", "keyFeaturesDraft", "baseModel",
          "isLegacyCurated", "costTiers", "pricingLastVerified"
        ].forEach(k => delete row.metadata[k]);

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
