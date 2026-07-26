/**
 * scripts/create-import-branches.js
 *
 * Automates Phase 4 of the models.dev bulk import:
 * For each developer (or a specified developer):
 *   1. Switches to git branch `feature/import-models-dev-<developer-slug>` off `main`
 *   2. Copies generated net-new JSON files from `scripts/.import-cache/net-new/` into `data/models/`
 *   3. Runs `node scripts/compile-models.js`
 *   4. Runs `npx tsc --noEmit`
 *   5. Commits the changes with Conventional Commits message
 *
 * Usage:
 *   node scripts/create-import-branches.js --all
 *   node scripts/create-import-branches.js --developer="Cohere"
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const NET_NEW_DIR = path.join(__dirname, ".import-cache", "net-new");
const MODELS_DIR = path.join(__dirname, "..", "data", "models");
const ROOT_DIR = path.join(__dirname, "..");

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT_DIR, encoding: "utf-8", stdio: "pipe", ...opts });
}

function slugifyDev(devName) {
  return devName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getNetNewFilesByDeveloper() {
  if (!fs.existsSync(NET_NEW_DIR)) {
    console.error("❌ net-new directory not found. Run node scripts/import-models-dev.js first.");
    process.exit(1);
  }

  const files = fs.readdirSync(NET_NEW_DIR).filter(f => f.endsWith(".json"));
  const byDev = {};

  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(NET_NEW_DIR, f), "utf-8"));
    const dev = data.developer;
    if (!byDev[dev]) byDev[dev] = [];
    byDev[dev].push({ filename: f, id: data.id, name: data.name });
  }

  return byDev;
}

function processDeveloper(developer, models) {
  const devSlug = slugifyDev(developer);
  const branchName = `feature/import-models-dev-${devSlug}`;

  console.log(`\n==================================================`);
  console.log(`🚀 Processing ${developer} (${models.length} models) → Branch: ${branchName}`);
  console.log(`==================================================`);

  // Ensure clean state on main
  run("git checkout main");

  // Create/checkout branch
  try {
    run(`git checkout -B ${branchName}`);
  } catch (err) {
    console.error(`❌ Failed to checkout branch ${branchName}:`, err.message);
    return false;
  }

  // Copy net-new model files to data/models/
  const addedFiles = [];
  for (const m of models) {
    const src = path.join(NET_NEW_DIR, m.filename);
    const dest = path.join(MODELS_DIR, m.filename);
    fs.copyFileSync(src, dest);
    addedFiles.push(m.filename);
  }
  console.log(`  Copied ${addedFiles.length} model JSON files into data/models/`);

  // Run compilation
  try {
    const compileOutput = run("node scripts/compile-models.js");
    console.log(`  ${compileOutput.trim()}`);
  } catch (err) {
    console.error(`❌ Compilation failed for ${developer}:`, err.stderr || err.message);
    run("git checkout main");
    return false;
  }

  // Run type-check
  try {
    run("npx tsc --noEmit");
    console.log(`  ✅ Type check passed (tsc --noEmit)`);
  } catch (err) {
    console.error(`❌ Type check failed for ${developer}:`, err.stdout || err.stderr || err.message);
    run("git checkout main");
    return false;
  }

  // Git add & commit
  try {
    run("git add data/models/");
    const commitMsg = `feat(import): add ${models.length} net-new ${developer} models from models.dev backfill\n\n- Backfill snapshot date: 2026-07-26\n- Source: https://github.com/anomalyco/models.dev\n- Entries set to verified: false with curator notes for review.`;
    run(`git commit -m ${JSON.stringify(commitMsg)}`);
    console.log(`  ✅ Committed to branch ${branchName}`);
  } catch (err) {
    console.error(`❌ Git commit failed for ${developer}:`, err.message);
    run("git checkout main");
    return false;
  }

  return true;
}

function main() {
  const args = process.argv.slice(2);
  const byDev = getNetNewFilesByDeveloper();

  const devArg = args.find(a => a.startsWith("--developer="));
  const targetDev = devArg ? devArg.split("=")[1] : null;
  const isAll = args.includes("--all");

  if (!isAll && !targetDev) {
    console.log("Usage:");
    console.log("  node scripts/create-import-branches.js --developer=\"Cohere\"");
    console.log("  node scripts/create-import-branches.js --all\n");
    console.log("Available developers with net-new models:");
    for (const [dev, list] of Object.entries(byDev).sort((a, b) => b[1].length - a[1].length)) {
      console.log(`  - ${dev} (${list.length} models)`);
    }
    return;
  }

  const devsToProcess = targetDev ? [targetDev] : Object.keys(byDev).sort((a, b) => byDev[b].length - byDev[a].length);

  const results = [];
  for (const dev of devsToProcess) {
    if (!byDev[dev]) {
      console.error(`❌ Developer "${dev}" not found in net-new import cache.`);
      continue;
    }
    const success = processDeveloper(dev, byDev[dev]);
    results.push({ developer: dev, count: byDev[dev].length, success, branch: `feature/import-models-dev-${slugifyDev(dev)}` });
  }

  // Switch back to main
  run("git checkout main");

  console.log("\n==================================================");
  console.log("📊 Branch Creation Summary");
  console.log("==================================================");
  for (const r of results) {
    console.log(`  ${r.success ? "✅" : "❌"} ${r.developer} (${r.count} models) → ${r.branch}`);
  }
}

main();
