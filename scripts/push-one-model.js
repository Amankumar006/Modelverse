require("dotenv").config();
const fs = require("fs");
const supabase = require("../src/lib/supabase");

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

async function run() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node push-one-model.js <path-to-json>");
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

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
    verified: false,
    verification_status: "LIKELY",
    needs_review: true,
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
    metadata: { ...data },
  };

  const { error } = await supabase.from("models").upsert(row, { onConflict: "slug" });
  if (error) {
    console.error("Error upserting:", error);
    process.exit(1);
  }

  console.log("Successfully pushed", data.slug);
}

run();
