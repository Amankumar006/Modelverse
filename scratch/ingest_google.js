const fs = require('fs');
const path = require('path');

const googleModelsPath = path.join(__dirname, '..', 'help', 'google_models.json');
const modelsDir = path.join(__dirname, '..', 'data', 'models');

const rawData = JSON.parse(fs.readFileSync(googleModelsPath, 'utf-8'));

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\./g, '-')       // replace dots with hyphens
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_]+/g, '-')   // replace spaces/underscores with hyphens
    .replace(/-+/g, '-');      // remove duplicate hyphens
}

let ingestedCount = 0;

for (const model of rawData) {
  const slug = slugify(model.name);
  const id = `google-deepmind-${slug}`;
  const filePath = path.join(modelsDir, `${id}.json`);

  if (fs.existsSync(filePath)) {
    console.log(`Skipping existing model: ${id}`);
    continue;
  }

  // Map links
  const links = {};
  if (model.website) links.website = model.website;
  if (model.paper) links.paper = model.paper;
  if (model.github) links.github = model.github;
  if (model.huggingFace) links.huggingface = model.huggingFace;
  if (model.blogPost) links.blogpost = model.blogPost;

  // Map previousVersion
  let previousVersion = null;
  if (model.previousVersion && model.previousVersion.trim() !== '') {
    previousVersion = `google-deepmind-${slugify(model.previousVersion)}`;
  }

  const transformed = {
    id: id,
    name: model.name,
    slug: id,
    developer: model.developer || "Google DeepMind",
    releaseDate: model.releaseDate,
    updatedAt: model.releaseDate, // default to releaseDate
    type: model.type || "closed-source",
    modality: model.modality || ["text"],
    primaryTask: model.primaryTask || "multimodal-general",
    deployment: model.deployment || ["api-only"],
    license: model.license || "Proprietary",
    parameters: model.parameters || "undisclosed",
    contextWindow: model.contextWindow || "undisclosed",
    description: model.description || "",
    keyFeatures: model.keyFeatures || [],
    benchmarks: model.benchmarks || [],
    family: model.family || null,
    tier: model.tier || undefined,
    previousVersion: previousVersion,
    links: links,
    logo: "/logos/google.svg",
    tags: model.tags || [],
    sources: model.sources || [],
    verified: model.verified !== undefined ? model.verified : true,
    featured: model.featured || false,
    boost: model.boost || 1,
    curatorNotes: model.curatorNotes || ""
  };

  fs.writeFileSync(filePath, JSON.stringify(transformed, null, 2) + '\n');
  console.log(`Ingested: ${id} (${model.name})`);
  ingestedCount++;
}

console.log(`\nSuccessfully ingested ${ingestedCount} Google models.`);
