const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

function mapRowToModelEntry(row) {
  const base = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    releaseDate: row.release_date,
    type: row.type,
    status: row.status,
    vendorApiStatus: row.vendor_api_status,
    featured: row.featured,
    boost: row.boost,
    family: row.family,
    tier: row.tier,
    institution: row.institution,
    updatedAt: row.updated_at,
    modality: row.modality || [],
    primaryTask: row.primary_task,
    deployment: row.deployment || [],
    license: row.license,
    parameters: row.parameters,
    activeParameters: row.active_parameters,
    contextWindow: row.context_window,
    description: row.description,
    descriptionDraft: row.description_draft,
    keyFeatures: row.key_features || [],
    keyFeaturesDraft: row.key_features_draft,
    benchmarks: row.benchmarks || [],
    previousVersion: row.previous_version,
    baseModel: row.base_model,
    links: row.links || {},
    logo: row.logo,
    images: row.images || [],
    tags: row.tags || [],
    sources: row.sources || [],
    verified: row.verified,
    needsReview: row.needs_review,
    curatorNotes: row.curator_notes,
    isLegacyCurated: row.is_legacy_curated,
    verificationStatus: row.verification_status,
    verifiedAt: row.reviewed_at,
    fieldConfidence: row.field_confidence,
    costTiers: row.cost_tiers,
    pricing: row.pricing,
    pricingLastVerified: row.pricing_last_verified,
    qualityStatus: row.quality_status,
    qualityScore: row.quality_score,
    qualityReasons: row.quality_reasons || [],
    qualityCheckedAt: row.quality_checked_at,
    cardSummary: row.card_summary,
    pageOverview: row.page_overview,
    editorialNote: row.editorial_note,
    customSections: row.metadata?.custom_sections || row.metadata?.customSections || row.custom_sections || [],
    quickstart: row.metadata?.quickstart || row.quickstart || undefined,
    metadata: row.metadata || {},
  };
  if (row.metadata) {
    return { ...row.metadata, ...base };
  }
  return base;
}

function mapRowToModelIndex(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    releaseDate: row.release_date,
    type: row.type,
    status: row.status,
    vendorApiStatus: row.vendor_api_status,
    featured: row.featured,
    boost: row.boost,
    family: row.family,
    tier: row.tier,
    institution: row.institution,
    verified: row.verified,
    verificationStatus: row.verification_status,
    qualityStatus: row.quality_status,
    description: row.description || row.metadata?.description || "",
    parameters: row.parameters || row.metadata?.parameters || "",
    contextWindow: row.context_window || row.metadata?.context_window || "",
    primaryTask: row.primary_task || row.metadata?.primary_task || "",
    previousVersion: row.previous_version || row.metadata?.previous_version || undefined,
    metadata: row.metadata || {},
  };
}

async function getAllModels() {
  const { data } = await supabase
    .from("models")
    .select("id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution, verified, verification_status, quality_status, description, parameters, context_window, primary_task, previous_version, metadata")
    .neq("status", "staged")
    .order("release_date", { ascending: false });
  return (data || [])
    .filter((m) => m.verification_status !== "DISPUTED" && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
    .map(mapRowToModelIndex);
}

async function getAllModelEntries() {
  const { data } = await supabase
    .from("models")
    .select("*")
    .neq("status", "staged")
    .order("release_date", { ascending: false });
  return (data || [])
    .filter((m) => m.verification_status !== "DISPUTED" && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
    .map(mapRowToModelEntry);
}

async function getModelBySlug(slug) {
  const { data } = await supabase
    .from("models")
    .select("*")
    .eq("slug", slug)
    .single();
  if (!data) return null;
  return mapRowToModelEntry(data);
}

async function runTests() {
  console.log("Running Model Redirect & Sitemap Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // Test 1: getModelBySlug for duplicate entry finds redirect_to
  const dupModel = await getModelBySlug("nvidia-nemotron-3-ultra");
  assert(dupModel !== null, "getModelBySlug retrieves duplicate model 'nvidia-nemotron-3-ultra'");
  assert(
    dupModel && (dupModel.metadata?.redirect_to === "nvidia-nemotron-3-ultra-550b-a55b" || dupModel.redirect_to === "nvidia-nemotron-3-ultra-550b-a55b"),
    "Duplicate model contains metadata.redirect_to = 'nvidia-nemotron-3-ultra-550b-a55b'"
  );

  // Test 2: getModelBySlug for target canonical model
  const canonicalModel = await getModelBySlug("nvidia-nemotron-3-ultra-550b-a55b");
  assert(canonicalModel !== null, "getModelBySlug retrieves canonical model 'nvidia-nemotron-3-ultra-550b-a55b'");
  assert(canonicalModel && canonicalModel.status === "active", "Canonical model has status='active'");

  // Test 3: getAllModels excludes duplicate/redirected slug
  const allModels = await getAllModels();
  const dupInAllModels = allModels.some((m) => m.slug === "nvidia-nemotron-3-ultra");
  const canonicalInAllModels = allModels.some((m) => m.slug === "nvidia-nemotron-3-ultra-550b-a55b");
  assert(!dupInAllModels, "getAllModels() excludes 'nvidia-nemotron-3-ultra'");
  assert(canonicalInAllModels, "getAllModels() includes 'nvidia-nemotron-3-ultra-550b-a55b'");

  // Test 4: getAllModelEntries excludes duplicate/redirected slug
  const allEntries = await getAllModelEntries();
  const dupInAllEntries = allEntries.some((m) => m.slug === "nvidia-nemotron-3-ultra");
  const canonicalInAllEntries = allEntries.some((m) => m.slug === "nvidia-nemotron-3-ultra-550b-a55b");
  assert(!dupInAllEntries, "getAllModelEntries() excludes 'nvidia-nemotron-3-ultra'");
  assert(canonicalInAllEntries, "getAllModelEntries() includes 'nvidia-nemotron-3-ultra-550b-a55b'");

  // Test 5: Sitemap indexing filter check
  const indexedEntries = allEntries.filter(
    (entry) =>
      entry.qualityStatus === "indexed" &&
      entry.status !== "sunset" &&
      !entry.metadata?.redirect_to &&
      !entry.metadata?.redirectTo
  );
  const dupInSitemap = indexedEntries.some((e) => e.slug === "nvidia-nemotron-3-ultra");
  assert(!dupInSitemap, "Sitemap indexedEntries excludes 'nvidia-nemotron-3-ultra'");

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
