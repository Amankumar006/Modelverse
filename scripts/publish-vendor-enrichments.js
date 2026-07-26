/**
 * scripts/publish-vendor-enrichments.js
 *
 * Runs the enrichment engine per vendor, creates isolated feature branches,
 * verifies build/types, and opens PRs on GitHub for human review.
 *
 * Usage:
 *   node scripts/publish-vendor-enrichments.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");

const VENDORS = [
  "Alibaba",
  "Google DeepMind",
  "OpenAI",
  "NVIDIA",
  "DeepSeek",
  "Meta",
  "MiniMax",
  "Moonshot AI",
  "Sakana AI",
  "Microsoft",
  "Tencent",
];

function run(cmd) {
  return execSync(cmd, { cwd: ROOT_DIR, encoding: "utf-8", stdio: "pipe" });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function main() {
  console.log("🚀 Running Batch Vendor Metadata Enrichment & Opening PRs...\n");

  const prResults = [];

  for (const vendor of VENDORS) {
    const slug = slugify(vendor);
    const branchName = `feature/enrich-models-${slug}`;

    console.log(`==================================================`);
    console.log(`Processing Vendor: ${vendor} → Branch: ${branchName}`);
    console.log(`==================================================`);

    try {
      // 1. Ensure clean main
      run("git checkout main");

      // 2. Create/checkout feature branch
      run(`git checkout -B ${branchName}`);

      // 3. Run enrichment engine
      const enrichOutput = run(`node scripts/enrich-skeleton-models.js --vendor=${JSON.stringify(vendor)}`);
      console.log(`  ${enrichOutput.trim().split("\n").join("\n  ")}`);

      // 4. Check git status for modified model files
      const statusOutput = run("git status --porcelain data/models/");
      if (!statusOutput.trim()) {
        console.log(`  ℹ️ No models were enriched for ${vendor} (all verified or no HF match).`);
        run("git checkout main");
        continue;
      }

      const modifiedCount = statusOutput.trim().split("\n").length;
      console.log(`  📦 Staging ${modifiedCount} enriched model files...`);

      // 5. Verify compile & type-check
      run("node scripts/compile-models.js");
      run("npx tsc --noEmit");
      console.log(`  ✅ Verified compilation & type-check (0 errors)`);

      // 6. Commit changes
      run("git add data/models/");
      const commitMsg = `feat(enrich): metadata enrichment for ${modifiedCount} ${vendor} models with draft fields and verification gates`;
      run(`git commit -m ${JSON.stringify(commitMsg)}`);

      // 7. Push to origin
      run(`git push -u origin ${branchName}`);

      // 8. Create PR via GitHub CLI
      const prTitle = `feat(enrich): metadata enrichment for ${modifiedCount} ${vendor} models`;
      const prBody = `## ${vendor} Metadata Enrichment

Enriches ${modifiedCount} ${vendor} models adhering strictly to provenance tiers and human review boundaries:

- **Bucket A (Structured Facts)**: Parameter counts and licenses pulled from canonical Hugging Face API endpoints; exact API URLs attached to \`sources[]\`.
- **Bucket C (Synthesized Prose Isolation)**: Generated summaries written **exclusively** to \`descriptionDraft\` and \`keyFeaturesDraft\` — live \`description\` and \`keyFeatures\` are 100% untouched.
- **Human Verification Gate**: All modified files carry \`verified: false\` and \`needsReview: true\`. Zero script auto-verification.

### Verification Results
- \`node scripts/compile-models.js\`: Passed
- \`npx tsc --noEmit\`: Passed (0 errors)`;

      const prCmd = `gh pr create --head ${branchName} --base main --title ${JSON.stringify(prTitle)} --body ${JSON.stringify(prBody)}`;
      const prUrl = run(prCmd).trim();
      console.log(`  ✅ Raised PR: ${prUrl}`);

      prResults.push({ vendor, count: modifiedCount, branch: branchName, prUrl, status: "OPEN_FOR_REVIEW" });
    } catch (err) {
      console.error(`❌ Error processing ${vendor}:`, err.stderr || err.stdout || err.message);
      prResults.push({ vendor, status: "FAILED", error: err.message });
    }
  }

  // Checkout main at end
  run("git checkout main");

  console.log("\n==================================================");
  console.log("📊 Vendor Enrichment PR Summary");
  console.log("==================================================");
  for (const r of prResults) {
    console.log(`  ${r.status === "OPEN_FOR_REVIEW" ? "✅" : "❌"} ${r.vendor} (${r.count} models) → ${r.prUrl || r.error}`);
  }
}

main();
