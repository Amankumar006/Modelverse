const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '..', 'data', 'models');

const DEVELOPERS = [
  "OpenAI", "Anthropic", "Google DeepMind", "Meta", "Mistral AI",
  "Cohere", "DeepSeek", "xAI", "Stability AI", "Alibaba",
  "Microsoft", "Black Forest Labs", "Midjourney", "Runway",
  "Kuaishou", "Suno", "ByteDance", "Tencent", "Other",
];

const LICENSES = [
  "Apache 2.0", "MIT", "Proprietary", "Llama Community License",
  "Gemma Terms of Use", "Stability AI Community License", "Other/Custom",
];

const VALID_TYPES = ["open-source", "open-weights", "closed-source", "api-only", "research-preview"];
const VALID_TASKS = [
  "chat-reasoning", "code-generation", "image-generation", "video-generation",
  "audio-speech", "embedding", "agentic", "multimodal-general", "translation",
  "search-retrieval", "other",
];
const VALID_DEPLOYMENTS = ["api-only", "self-hostable", "on-device"];

const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.json') && f !== '_index.json');

const issues = [];
const stats = {
  developers: new Set(),
  licenses: new Set(),
  types: new Set(),
  tasks: new Set(),
  missingFields: {},
};

for (const file of files) {
  const filePath = path.join(modelsDir, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const id = raw.id || file;

  const requiredFields = ['id', 'name', 'slug', 'developer', 'releaseDate', 'updatedAt', 'type', 'modality',
    'primaryTask', 'deployment', 'license', 'description', 'keyFeatures', 'benchmarks',
    'links', 'tags', 'sources', 'verified', 'parameters', 'contextWindow'];
  
  for (const field of requiredFields) {
    if (raw[field] === undefined || raw[field] === null) {
      if (!stats.missingFields[field]) stats.missingFields[field] = [];
      stats.missingFields[field].push(file);
    }
  }

  if (raw.developer) {
    stats.developers.add(raw.developer);
    if (!DEVELOPERS.includes(raw.developer)) {
      issues.push(`[DEV] ${file}: unknown developer "${raw.developer}"`);
    }
  }

  if (raw.license) {
    stats.licenses.add(raw.license);
    if (!LICENSES.includes(raw.license)) {
      issues.push(`[LIC] ${file}: unknown license "${raw.license}"`);
    }
  }

  if (raw.type) {
    stats.types.add(raw.type);
    if (!VALID_TYPES.includes(raw.type)) {
      issues.push(`[TYPE] ${file}: unknown type "${raw.type}"`);
    }
  }

  if (raw.primaryTask) {
    stats.tasks.add(raw.primaryTask);
    if (!VALID_TASKS.includes(raw.primaryTask)) {
      issues.push(`[TASK] ${file}: unknown primaryTask "${raw.primaryTask}"`);
    }
  }

  if (raw.deployment && Array.isArray(raw.deployment)) {
    for (const d of raw.deployment) {
      if (!VALID_DEPLOYMENTS.includes(d)) {
        issues.push(`[DEPLOY] ${file}: unknown deployment "${d}"`);
      }
    }
  }

  if (raw.releaseDate && !/^\d{4}-\d{2}-\d{2}$/.test(raw.releaseDate)) {
    issues.push(`[DATE] ${file}: bad releaseDate "${raw.releaseDate}"`);
  }
  if (raw.updatedAt && !/^\d{4}-\d{2}-\d{2}$/.test(raw.updatedAt)) {
    issues.push(`[DATE] ${file}: bad updatedAt "${raw.updatedAt}"`);
  }
}

console.log("=== UNIQUE VALUES ===");
console.log("Developers:", [...stats.developers].sort());
console.log("Licenses:", [...stats.licenses].sort());
console.log("Types:", [...stats.types].sort());
console.log("Tasks:", [...stats.tasks].sort());

console.log("\n=== MISSING FIELDS ===");
for (const [field, files] of Object.entries(stats.missingFields)) {
  console.log(`${field}: ${files.length} files missing`);
  if (files.length <= 10) console.log(`  -> ${files.join(', ')}`);
}

console.log("\n=== ISSUES ===");
if (issues.length === 0) {
  console.log("No issues found!");
} else {
  for (const issue of issues) {
    console.log(issue);
  }
}
console.log(`\nTotal: ${files.length} files, ${issues.length} issues`);
