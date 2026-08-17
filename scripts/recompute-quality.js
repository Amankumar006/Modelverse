"use strict";

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");
const { scoreModelPage } = require("./quality/score-content");

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key);
}

function modelForScore(row) {
  return {
    ...(row.metadata || {}),
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    releaseDate: row.release_date,
    parameters: row.parameters,
    contextWindow: row.context_window,
    license: row.license,
    description: row.description,
    descriptionDraft: row.description_draft,
    benchmarks: row.benchmarks,
    cardSummary: row.card_summary,
    pageOverview: row.page_overview,
    editorialNote: row.editorial_note,
    links: row.links || row.resources || {},
    keyFeatures: row.key_features || [],
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const isAll = args.includes("--all");

  const slugs = [];
  for (const arg of args) {
    if (arg.startsWith("--slug=")) {
      slugs.push(arg.slice("--slug=".length));
    } else if (arg.startsWith("--slugs=")) {
      slugs.push(...arg.slice("--slugs=".length).split(",").map((s) => s.trim()).filter(Boolean));
    } else if (!arg.startsWith("--")) {
      slugs.push(arg.trim());
    }
  }

  if (slugs.length === 0 && !isAll) {
    console.log("Usage:");
    console.log("  npm run recompute-quality -- --slug=<slug>");
    console.log("  npm run recompute-quality -- --slugs=slug1,slug2");
    console.log("  npm run recompute-quality -- <slug1> <slug2>");
    console.log("  npm run recompute-quality -- --all");
    console.log("  (Append --dry-run to test without updating the database)\n");
    process.exit(0);
  }

  const db = getClient();

  console.log(`\n🔍 Recomputing quality score for ${isAll ? "ALL models" : slugs.join(", ")} ${dryRun ? "[DRY RUN]" : ""}...\n`);

  let query = db.from("models").select("*");
  if (!isAll) {
    query = query.in("slug", slugs);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error("❌ Database query error:", error.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log("⚠️ No matching model rows found.");
    process.exit(0);
  }

  let updatedCount = 0;

  for (const row of rows) {
    const formatted = modelForScore(row);
    const gate = scoreModelPage(formatted);

    const prevScore = row.quality_score ?? "null";
    const prevStatus = row.quality_status ?? "null";

    console.log(`📌 Model: ${row.name} (${row.slug})`);
    console.log(`   Quality Score : ${prevScore} ➔ ${gate.score}`);
    console.log(`   Quality Status: ${prevStatus} ➔ ${gate.status}`);
    if (gate.reasons && gate.reasons.length > 0) {
      console.log(`   Gate Feedback : ${gate.reasons.join("; ")}`);
    }

    if (!dryRun) {
      const { error: updateError } = await db
        .from("models")
        .update({
          quality_status: gate.status,
          quality_score: gate.score,
          quality_reasons: gate.reasons,
          quality_checked_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateError) {
        console.error(`   ❌ Failed to update ${row.slug}:`, updateError.message);
      } else {
        console.log(`   ✅ Database updated successfully.`);
        updatedCount++;
      }
    }
    console.log("");
  }

  console.log(`✨ Recomputation complete. (${updatedCount}/${rows.length} rows updated)\n`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
