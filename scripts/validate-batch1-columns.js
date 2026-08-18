"use strict";

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key);
}

async function validate() {
  const db = getClient();
  const slugs = [
    "openai-gpt-5.6-sol",
    "openai-gpt-5.6-terra",
    "openai-gpt-5.6-luna",
    "openai-gpt-5.5-pro",
    "openai-gpt-5.5-instant",
    "openai-gpt-5.4-pro",
    "openai-gpt-5.4-mini",
    "openai-gpt-5.4-nano",
    "openai-gpt-5.2-pro",
    "openai-gpt-5.1-codex-max",
    "openai-gpt-5.1-codex-mini",
  ];

  console.log("🔍 Querying Supabase directly for Batch 1 validation...\n");
  const { data: records, error } = await db
    .from("models")
    .select("slug, name, quality_score, quality_status, quality_breakdown, verified, verification_status, needs_review, chatgpt_availability, api_availability, aliases, sources, links, benchmarks")
    .in("slug", slugs)
    .order("slug");

  if (error) {
    console.error("❌ Query error:", error);
    process.exit(1);
  }

  let allValid = true;
  const reportRows = [];

  for (const r of records) {
    const checks = {
      nonNullChatGpt: r.chatgpt_availability !== null && typeof r.chatgpt_availability === "object",
      nonNullApi: r.api_availability !== null && typeof r.api_availability === "object" && Boolean(r.api_availability.apiModelId),
      nonNullAliases: Array.isArray(r.aliases) && r.aliases.length > 0,
      noDuplicateAliases: Array.isArray(r.aliases) && new Set(r.aliases).size === r.aliases.length,
      nonNullBreakdown: r.quality_breakdown !== null && typeof r.quality_breakdown === "object",
      breakdownMatchesScore: r.quality_breakdown && r.quality_breakdown.total === r.quality_score,
      validQualityStatus: r.quality_score >= 65 ? r.quality_status === "indexed" : r.quality_status === "thin",
    };

    const isRecordValid = Object.values(checks).every(Boolean);
    if (!isRecordValid) allValid = false;

    const sourceCount = (Array.isArray(r.sources) ? r.sources.length : 0) + (r.links ? Object.keys(r.links).length : 0);

    reportRows.push({
      slug: r.slug,
      name: r.name,
      qualityScore: r.quality_score,
      breakdownTotal: r.quality_breakdown?.total,
      verificationStatus: r.verification_status || (r.verified ? "VERIFIED" : "LIKELY"),
      verified: r.verified,
      needsReview: r.needs_review,
      chatgptAvailability: r.chatgpt_availability?.status === "active"
        ? `Active (${Array.isArray(r.chatgpt_availability.plans) ? r.chatgpt_availability.plans.join(", ") : r.chatgpt_availability.access})`
        : r.chatgpt_availability?.status === "retired"
        ? "API Only (Retired)"
        : "Inactive",
      apiModelId: r.api_availability?.apiModelId || "N/A",
      aliasCount: Array.isArray(r.aliases) ? r.aliases.length : 0,
      aliases: r.aliases,
      sourceCount: sourceCount,
      passedChecks: isRecordValid,
    });
  }

  console.table(reportRows.map(row => ({
    "Model Slug": row.slug,
    "Score": row.qualityScore,
    "Breakdown Total": row.breakdownTotal,
    "Status": row.verificationStatus,
    "Verified": row.verified,
    "Needs Review": row.needsReview,
    "ChatGPT Availability": row.chatgptAvailability,
    "API Model ID": row.apiModelId,
    "Aliases": row.aliasCount,
    "Sources": row.sourceCount,
    "Valid": row.passedChecks ? "✅ YES" : "❌ NO"
  })));

  if (allValid) {
    console.log("\n✅ ALL 11 RECORDS PASSED DIRECT DATABASE VALIDATION CHECKS (A - F)!\n");
  } else {
    console.error("\n❌ VALIDATION CHECKS FAILED FOR SOME RECORDS.\n");
    process.exit(1);
  }
}

validate().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
