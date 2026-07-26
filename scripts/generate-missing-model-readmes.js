/**
 * scripts/generate-missing-model-readmes.js
 *
 * Generates rich, structured Markdown readmes for models in data/models/readme/${slug}.md.
 * Updates readmes with latest specifications, key features, context windows, and licenses.
 *
 * Usage:
 *   node scripts/generate-missing-model-readmes.js [--force]
 */

const fs = require("fs");
const path = require("path");

const MODELS_DIR = path.join(__dirname, "..", "data", "models");
const README_DIR = path.join(__dirname, "..", "data", "models", "readme");
const FORCE = process.argv.includes("--force");

if (!fs.existsSync(README_DIR)) {
  fs.mkdirSync(README_DIR, { recursive: true });
}

function getReadmePath(slug, id) {
  const candidates = [
    `${slug}.md`,
    `${id}.md`,
    slug.includes("-") ? `${slug.split("-").slice(1).join("-")}.md` : null,
    slug.includes("-") ? `${slug.split("-").slice(2).join("-")}.md` : null,
  ].filter(Boolean);

  for (const cand of candidates) {
    const full = path.join(README_DIR, cand);
    if (fs.existsSync(full)) {
      return full;
    }
  }
  return path.join(README_DIR, `${slug}.md`);
}

function generateMarkdown(m) {
  const paramStr = m.parameters !== "undisclosed" ? `${m.parameters}` : "Undisclosed";
  const contextStr = m.contextWindow !== "undisclosed" ? `${m.contextWindow}` : "Standard";
  const taskFormatted = (m.primaryTask || "general").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const typeFormatted = (m.type || "open-weights").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  let md = `# ${m.name}\n\n`;

  md += `## 📌 Model Overview\n\n`;
  md += `${m.description}\n\n`;
  md += `**${m.name}** is a **${typeFormatted}** model developed by **${m.developer}**, released on **${m.releaseDate}**. It is engineered primarily for **${taskFormatted}** workloads. Featuring a **${contextStr}** context window and **${paramStr}** parameter count, it offers robust performance for enterprise integration, developers, and researchers.\n\n`;

  md += `---\n\n`;
  md += `## ✨ Key Features & Capabilities\n\n`;
  md += `| Feature | Description |\n`;
  md += `|:---|:---|\n`;
  md += `| **Context Window** | ${contextStr} capacity for extended prompts and multi-turn workflows |\n`;
  md += `| **Primary Task** | Optimized for ${taskFormatted} |\n`;
  md += `| **Deployment** | ${m.deployment ? m.deployment.join(", ") : "API & Self-Hostable"} |\n`;
  md += `| **Modality** | ${m.modality ? m.modality.join(", ") : "text"} |\n`;

  if (m.keyFeatures && m.keyFeatures.length > 0) {
    for (const feat of m.keyFeatures) {
      const parts = feat.split(":");
      const title = parts.length > 1 ? parts[0] : "Capability";
      md += `| **${title.trim()}** | ${feat} |\n`;
    }
  }
  md += `\n---\n\n`;

  md += `## ⚙️ Technical Specifications\n\n`;
  md += `| Specification | Details |\n`;
  md += `|:---|:---|\n`;
  md += `| **Developer / Lab** | ${m.developer} |\n`;
  md += `| **Release Date** | ${m.releaseDate} |\n`;
  md += `| **Model Type** | ${typeFormatted} |\n`;
  md += `| **Parameters** | ${paramStr} |\n`;
  md += `| **Context Window** | ${contextStr} |\n`;
  md += `| **License** | ${m.license || "Proprietary / Custom"} |\n`;

  if (m.family) {
    md += `| **Model Family** | ${m.family} |\n`;
  }
  md += `\n---\n\n`;

  if (m.benchmarks && m.benchmarks.length > 0) {
    md += `## 📊 Benchmarks & Performance\n\n`;
    md += `| Benchmark | Score | Source |\n`;
    md += `|:---|:---:|:---|\n`;
    for (const b of m.benchmarks) {
      const src = b.sourceType === "vendor-reported" ? "Vendor Reported" : "Independent Eval";
      md += `| **${b.name}** | \`${b.score}\` | ${src} |\n`;
    }
    md += `\n---\n\n`;
  }

  if (m.pricing && m.pricing.length > 0) {
    md += `## 💰 Pricing\n\n`;
    md += `| Tier / Unit | Rate (${m.pricing[0].currency || "USD"}) |\n`;
    md += `|:---|:---:|\n`;
    for (const p of m.pricing) {
      const label = p.tier ? `${p.tier} (${p.unit})` : p.unit;
      md += `| **${label}** | \`$${p.amount}\` |\n`;
    }
    md += `\n---\n\n`;
  }

  if (m.links && Object.keys(m.links).length > 0) {
    md += `## 🔗 Resources & Links\n\n`;
    md += `| Resource | Link |\n`;
    md += `|:---|:---|\n`;
    for (const [key, url] of Object.entries(m.links)) {
      md += `| **${key}** | [${url}](${url}) |\n`;
    }
    md += `\n---\n\n`;
  }

  md += `## 📜 License & Usage\n\n`;
  md += `This model is governed by the **${m.license || "Developer"}** license. Please check official developer guidelines before commercial deployment.\n`;

  return md;
}

function main() {
  console.log("📝 Generating & Refreshing Model Documentation Readmes...\n");

  const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith(".json") && f !== "_index.json");
  let writtenCount = 0;

  for (const file of files) {
    const filePath = path.join(MODELS_DIR, file);
    const m = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const slug = m.slug || file.replace(".json", "");
    const targetPath = getReadmePath(slug, m.id);

    const exists = fs.existsSync(targetPath);
    if (!exists || FORCE) {
      const mdContent = generateMarkdown(m);
      fs.writeFileSync(targetPath, mdContent, "utf-8");
      writtenCount++;
    } else {
      // Check if existing content is minimal placeholder (< 500 bytes)
      const existingText = fs.readFileSync(targetPath, "utf-8");
      if (existingText.length < 500 || existingText.includes("## 📊 Quick Specs")) {
        const mdContent = generateMarkdown(m);
        fs.writeFileSync(targetPath, mdContent, "utf-8");
        writtenCount++;
      }
    }
  }

  console.log(`✅ Generated / Updated ${writtenCount} Markdown documentation readmes!`);
  console.log(`🎉 Total readmes in ${README_DIR}: ${fs.readdirSync(README_DIR).length}`);
}

main();
