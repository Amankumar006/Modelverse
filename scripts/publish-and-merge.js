/**
 * scripts/publish-and-merge.js
 *
 * Pushes feature branches to GitHub, opens PRs via `gh`, and merges them into `main`.
 *
 * Usage:
 *   node scripts/publish-and-merge.js
 */

const { execSync } = require("child_process");
const ROOT_DIR = require("path").join(__dirname, "..");

const BRANCHES = [
  { branch: "feature/enrich-existing-models", title: "feat(models): enrich 106 existing models with pricing, logos, and max output tokens", desc: "Enriches 106 existing models in data/models/ with missing pricing, logos, and max output token limits extracted from models.dev data snapshot." },
  { branch: "feature/import-models-dev-google-deepmind", title: "feat(import): add 38 net-new Google DeepMind models from models.dev backfill", desc: "Imports 38 net-new Google DeepMind model records from models.dev snapshot. All entries include context windows, max output tokens, pricing, logos, and verified: false provenance." },
  { branch: "feature/import-models-dev-alibaba", title: "feat(import): add 33 net-new Alibaba models from models.dev backfill", desc: "Imports 33 net-new Alibaba model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-openai", title: "feat(import): add 22 net-new OpenAI models from models.dev backfill", desc: "Imports 22 net-new OpenAI model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-nvidia", title: "feat(import): add 20 net-new NVIDIA models from models.dev backfill", desc: "Imports 20 net-new NVIDIA model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-mistral-ai", title: "feat(import): add 18 net-new Mistral AI models from models.dev backfill", desc: "Imports 18 net-new Mistral AI model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-cohere", title: "feat(import): add 11 net-new Cohere models from models.dev backfill", desc: "Imports 11 net-new Cohere model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-minimax", title: "feat(import): add 6 net-new MiniMax models from models.dev backfill", desc: "Imports 6 net-new MiniMax model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-deepseek", title: "feat(import): add 5 net-new DeepSeek models from models.dev backfill", desc: "Imports 5 net-new DeepSeek model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-xai", title: "feat(import): add 5 net-new xAI models from models.dev backfill", desc: "Imports 5 net-new xAI model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-meta", title: "feat(import): add 3 net-new Meta models from models.dev backfill", desc: "Imports 3 net-new Meta model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-moonshot-ai", title: "feat(import): add 3 net-new Moonshot AI models from models.dev backfill", desc: "Imports 3 net-new Moonshot AI model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-sakana-ai", title: "feat(import): add 2 net-new Sakana AI models from models.dev backfill", desc: "Imports 2 net-new Sakana AI model records from models.dev snapshot." },
  { branch: "feature/import-models-dev-anthropic", title: "feat(import): add 1 net-new Anthropic model from models.dev backfill", desc: "Imports 1 net-new Anthropic model record from models.dev snapshot." },
  { branch: "feature/import-models-dev-microsoft", title: "feat(import): add 1 net-new Microsoft model from models.dev backfill", desc: "Imports 1 net-new Microsoft model record from models.dev snapshot." },
  { branch: "feature/import-models-dev-tencent", title: "feat(import): add 1 net-new Tencent model from models.dev backfill", desc: "Imports 1 net-new Tencent model record from models.dev snapshot." },
];

function run(cmd) {
  return execSync(cmd, { cwd: ROOT_DIR, encoding: "utf-8", stdio: "pipe" });
}

function main() {
  console.log("🚀 Publishing and Merging Import Branches to GitHub...\n");

  const results = [];

  for (const item of BRANCHES) {
    const { branch, title, desc } = item;
    console.log(`--------------------------------------------------`);
    console.log(`Processing: ${branch}`);

    try {
      // 1. Push branch to origin
      run(`git push -u origin ${branch}`);
      console.log(`  ✓ Pushed ${branch} to origin`);

      // 2. Create PR via GitHub CLI
      const prCmd = `gh pr create --head ${branch} --base main --title ${JSON.stringify(title)} --body ${JSON.stringify(desc)}`;
      const prUrl = run(prCmd).trim();
      console.log(`  ✓ Created PR: ${prUrl}`);

      // 3. Merge PR via GitHub CLI
      const mergeCmd = `gh pr merge ${prUrl} --merge --delete-branch`;
      run(mergeCmd);
      console.log(`  ✓ Merged PR & deleted remote branch`);

      results.push({ branch, status: "SUCCESS", prUrl });
    } catch (err) {
      console.error(`❌ Error processing ${branch}:`, err.stderr || err.stdout || err.message);
      results.push({ branch, status: "FAILED", error: err.message });
    }
  }

  // Pull latest main after all merges
  try {
    run("git checkout main && git pull origin main");
    run("node scripts/compile-models.js");
    console.log("\n✅ Main branch updated and compiled successfully.");
  } catch (err) {
    console.error("⚠️ Error updating main post-merge:", err.message);
  }

  console.log("\n==================================================");
  console.log("📊 PR & Merge Summary");
  console.log("==================================================");
  for (const r of results) {
    console.log(`  ${r.status === "SUCCESS" ? "✅" : "❌"} ${r.branch} → ${r.prUrl || r.error}`);
  }
}

main();
