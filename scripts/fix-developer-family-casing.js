const fs = require("fs");
const path = require("path");

const PROD_DIR = path.join(process.cwd(), "data", "models");

const DEV_NORM_MAP = {
  microsoft: "Microsoft",
  nvidia: "NVIDIA",
  moonshotai: "Moonshot AI",
  thinkingmachines: "Thinking Machines",
  "prism-ml": "PrismML",
  "academic/research": "Academic Research",
};

const FAMILY_NORM_MAP = {
  qwen: "Qwen",
  deepseek: "DeepSeek",
  gemini: "Gemini",
  gemma: "Gemma",
  veo: "Veo",
  llama: "Llama",
  nemotron: "Nemotron",
  "dall-e": "DALL-E",
  sora: "Sora",
  grok: "Grok",
};

function normalizeCatalogEntries() {
  const files = fs.readdirSync(PROD_DIR).filter((f) => f.endsWith(".json"));
  let updatedCount = 0;

  for (const file of files) {
    const filePath = path.join(PROD_DIR, file);
    try {
      const model = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      let changed = false;

      if (model.developer && DEV_NORM_MAP[model.developer.toLowerCase()]) {
        model.developer = DEV_NORM_MAP[model.developer.toLowerCase()];
        changed = true;
      }

      if (model.family && FAMILY_NORM_MAP[model.family.toLowerCase()]) {
        model.family = FAMILY_NORM_MAP[model.family.toLowerCase()];
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(filePath, JSON.stringify(model, null, 2), "utf-8");
        updatedCount++;
      }
    } catch (e) {}
  }

  console.log(`✅ Normalized developer & family casing across ${updatedCount} model files!`);
}

normalizeCatalogEntries();
