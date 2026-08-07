/**
 * Compiles all individual model JSON files into:
 * 1. src/lib/models-archive.json - The full model entries database
 * 2. src/lib/search-index.json - Lightweight index for search
 * 
 * Enforces Zod schema validation during compilation.
 */
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

// We need a lightweight JS-native copy of ModelSchema validation to run in Node environment
const PrimaryTaskEnum = z.enum([
  "chat-reasoning", "code-generation", "image-generation", "video-generation",
  "audio-speech", "embedding", "agentic", "multimodal-general", "translation",
  "search-retrieval", "other", "speech-to-text", "image-to-editable-design"
]);

const DeploymentEnum = z.enum(["api-only", "self-hostable", "self-hosted", "on-device", "on-premise", "cloud", "edge (CPU/GPU)", "research"]);

const BenchmarkSchema = z.object({
  name: z.string(),
  score: z.any(),
  verified: z.boolean().optional(),
  sourceType: z.enum(["vendor-reported", "independent-eval"]).optional()
}).passthrough();

const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  developer: z.string(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["open-source", "open-weights", "closed-source", "api-only", "research-preview", "research"]),
  status: z.enum(["active", "deprecated", "sunset"]).default("active"),
  vendorApiStatus: z.enum(["active", "deprecated", "sunset"]).optional(),
  modality: z.any(),
  primaryTask: PrimaryTaskEnum,
  deployment: z.array(DeploymentEnum).min(1),
  license: z.any(),
  parameters: z.any().optional(),
  contextWindow: z.any().optional(),
  description: z.string(),
  descriptionDraft: z.string().optional(),
  templatedDescription: z.boolean().optional(),
  keyFeatures: z.any().optional(),
  keyFeaturesDraft: z.any().optional(),
  benchmarks: z.any().optional(),
  family: z.string().nullable().optional(),
  tier: z.string().optional(),
  institution: z.string().optional(),
  previousVersion: z.string().nullable().optional(),
  costTiers: z.any().optional(),
  pricing: z.any().optional(),
  pricingLastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  links: z.any().optional(),
  logo: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sources: z.any().optional(),
  verified: z.boolean().optional(),
  verificationStatus: z.enum(["VERIFIED", "LIKELY", "DRAFT", "DISPUTED"]).optional(),
  fieldConfidence: z.record(z.string(), z.enum(["VERIFIED", "LIKELY", "DRAFT", "DISPUTED"])).optional(),
  humanApproved: z.boolean().optional(),
  needsReview: z.boolean().optional(),
  featured: z.boolean().default(false),
  boost: z.number().min(1).max(5).default(1),
  curatorNotes: z.string().default("")
}).passthrough();

const NewsCategory = z.enum(["weekly-news", "short-news", "model-review", "other"]);

const NewsPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  category: NewsCategory,
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  author: z.string(),
  readTime: z.string(),
  excerpt: z.string(),
  body: z.string(),
  coverImage: z.string(),
  issueNumber: z.number().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  confidenceLevel: z.enum(["confirmed", "reported", "rumor", "community-discussion"]).default("confirmed"),
  externalSources: z.array(z.string()).optional(),
  relatedModels: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

const modelsDir = path.join(__dirname, '..', 'data', 'models');
const newsDir = path.join(__dirname, '..', 'data', 'news');
const archivePath = path.join(__dirname, '..', 'src', 'lib', 'models-archive.json');
const indexPath = path.join(__dirname, '..', 'src', 'lib', 'search-index.json');
const newsArchivePath = path.join(__dirname, '..', 'src', 'lib', 'news-archive.json');

const supabase = require('../src/lib/supabase');

async function compileModels() {
  /* ── 1. Compile Models ──────────────────────────────────────── */
  const { data: modelsData, error } = await supabase
    .from('models')
    .select('*')
    .in('verification_status', ['VERIFIED', 'LIKELY']);

  if (error) {
    console.error(`❌ Failed to fetch models from Supabase:`, error);
    process.exit(1);
  }

  const fullEntries = [];
  const searchIndex = [];

  for (const row of modelsData) {
    const raw = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      developer: row.developer,
      releaseDate: row.release_date ? row.release_date.substring(0, 10) : null,
      updatedAt: row.updated_at ? row.updated_at.substring(0, 10) : (row.release_date ? row.release_date.substring(0, 10) : null),
      type: row.type,
      status: row.status,
      vendorApiStatus: row.vendor_api_status,
      modality: null, // missing from DB schema, Zod expects it
      primaryTask: row.primary_task,
      deployment: row.deployment,
      license: null, // missing from DB schema, Zod expects it
      description: row.description,
      family: row.family,
      tier: row.tier,
      institution: row.institution,
      previousVersion: row.previous_version,
      logo: row.logo,
      images: row.images,
      tags: row.tags,
      links: row.links,
      sources: row.sources,
      pricing: row.pricing,
      parameters: row.parameters,
      contextWindow: row.context_window,
      benchmarks: row.benchmarks,
      fieldConfidence: row.field_confidence,
      featured: row.featured,
      boost: row.boost,
      verified: row.verified,
      verificationStatus: row.verification_status,
      needsReview: row.needs_review,
      curatorNotes: row.curator_notes,
    };

    // Remove null values so Zod uses defaults or optionals correctly
    for (const key in raw) {
      if (raw[key] === null && key !== 'modality' && key !== 'license') {
        delete raw[key];
      }
    }

    const result = ModelSchema.safeParse(raw);
    if (!result.success) {
      const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
      console.error(`\n❌ Schema validation failed for ${row.slug}:\n${errors}\n`);
      process.exit(1);
    }

    const validated = result.data;
    fullEntries.push(validated);

    searchIndex.push({
      id: validated.id,
      name: validated.name,
      slug: validated.slug,
      developer: validated.developer,
      type: validated.type
    });
  }

  // Sort full entries newest-first
  fullEntries.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  // Sort search index alphabetically
  searchIndex.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(archivePath, JSON.stringify(fullEntries, null, 2));
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));

  console.log(`✅ Compiled ${fullEntries.length} models into models-archive.json and search-index.json`);
}

/* ── 2. Compile News ────────────────────────────────────────── */

function compileNews() {
  const newsFiles = fs.readdirSync(newsDir).filter(f => f.endsWith('.json') && f !== '_index.json');
  const tempEntries = [];

  for (const file of newsFiles) {
    const filePath = path.join(newsDir, file);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const result = NewsPostSchema.safeParse(raw);
    if (!result.success) {
      const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
      console.error(`\n❌ News validation failed for ${file}:\n${errors}\n`);
      process.exit(1);
    }

    tempEntries.push(result.data);
  }

  // Filter out draft entries - only compile published articles
  const publishedEntries = tempEntries.filter(e => e.status === "published");

  // Auto-increment issueNumber for weekly-news category (chronological oldest to newest)
  const weeklyNews = publishedEntries.filter(e => e.category === 'weekly-news');
  weeklyNews.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
  weeklyNews.forEach((entry, idx) => {
    entry.issueNumber = entry.issueNumber ?? (idx + 1);
  });

  const newsEntries = [];
  const newsIndex = [];

  for (const validated of publishedEntries) {
    newsEntries.push(validated);

    // Lightweight news index entry (excluding 'body')
    const { body, ...lightweight } = validated;
    newsIndex.push(lightweight);
  }

  // Sort news entries newest-first (by date string)
  newsEntries.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
  newsIndex.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  fs.writeFileSync(newsArchivePath, JSON.stringify(newsEntries, null, 2));
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'lib', 'news-index.json'), JSON.stringify(newsIndex, null, 2));
  fs.writeFileSync(path.join(newsDir, '_index.json'), JSON.stringify(newsIndex, null, 2));

  console.log(`✅ Compiled ${newsEntries.length} news posts into news-archive.json, src/lib/news-index.json, and data/news/_index.json`);
}

async function run() {
  await compileModels();
  compileNews();
}

run().catch(console.error);
