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
  "search-retrieval", "other"
]);

const DeploymentEnum = z.enum(["api-only", "self-hostable", "on-device"]);

const BenchmarkSchema = z.object({
  name: z.string(),
  score: z.string(),
  verified: z.boolean()
});

const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  developer: z.string(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(["open-source", "open-weights", "closed-source", "api-only", "research-preview"]),
  modality: z.array(z.string()).min(1),
  primaryTask: PrimaryTaskEnum,
  deployment: z.array(DeploymentEnum).min(1),
  license: z.string(),
  parameters: z.string(),
  contextWindow: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  benchmarks: z.array(BenchmarkSchema),
  family: z.string().nullable(),
  tier: z.string().optional(),
  previousVersion: z.string().nullable(),
  costTiers: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional()
  })).optional(),
  links: z.record(z.string(), z.string()),
  logo: z.string().nullable(),
  tags: z.array(z.string()),
  sources: z.array(z.string()).min(1),
  verified: z.boolean(),
  featured: z.boolean().default(false),
  boost: z.number().min(1).max(5).default(1),
  curatorNotes: z.string().default("")
});

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

/* ── 1. Compile Models ──────────────────────────────────────── */

const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.json') && f !== '_index.json');

const fullEntries = [];
const searchIndex = [];

for (const file of files) {
  const filePath = path.join(modelsDir, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const result = ModelSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    console.error(`\n❌ Schema validation failed for ${file}:\n${errors}\n`);
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

/* ── 2. Compile News ────────────────────────────────────────── */

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
