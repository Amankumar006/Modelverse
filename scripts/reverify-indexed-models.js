"use strict";

/**
 * scripts/reverify-indexed-models.js
 *
 * Maintenance pipeline: Re-verifies all currently INDEXED models in Supabase.
 * Checks:
 * 1. That every URL in sources[] still resolves (HTTP 200 OK).
 * 2. That the page content still substantiates each claimed benchmark score.
 *
 * If provenance rots or links break, automatically downgrades to 'thin' (noindex)
 * and records the exact failure reason in quality_reasons.
 */

const { createClient } = require("@supabase/supabase-js");
const { scoreModelPage } = require("./quality/score-content");
const { verifyCitationUrlForBenchmark, fetchPageText } = require("./lib/verify-citation-content");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zmfyclrjbiewmwqiswqk.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptZnljbHJqYmlld213cWlzd3FrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjAwODUzNiwiZXhwIjoyMTAxNTg0NTM2fQ.tsPoYBo5oetneR7-vJG0GuZoV13YQwyd1jobMeG5d9Y";

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

async function reverifyIndexedModels() {
  console.log("🔍 Starting Scheduled Re-Verification of Indexed Models...");

  const { data: models, error } = await db.from("models").select("*").eq("quality_status", "indexed");
  if (error) throw error;

  console.log(`Auditing ${models.length} currently indexed models for provenance rot...`);

  let confirmed = 0;
  let decayed = 0;

  for (const m of models) {
    let hasRot = false;
    const rotReasons = [];

    // 1. Check Source URLs
    const sources = Array.isArray(m.sources) ? m.sources : [];
    if (sources.length === 0) {
      hasRot = true;
      rotReasons.push("zero citation sources attached");
    }

    for (const src of sources) {
      const text = await fetchPageText(src);
      if (!text) {
        hasRot = true;
        rotReasons.push(`citation URL unreachable: ${src}`);
      }
    }

    // 2. Check Benchmarks Substantiation
    const benchmarks = Array.isArray(m.benchmarks) ? m.benchmarks : [];
    for (const b of benchmarks) {
      const benchmarkSources = (Array.isArray(b.sources) && b.sources.length > 0) ? b.sources : sources;
      let substantiated = false;

      for (const bSrc of benchmarkSources) {
        const sub = await verifyCitationUrlForBenchmark(bSrc, b.name, b.score);
        if (sub.substantiated) {
          substantiated = true;
          break;
        }
      }

      if (!substantiated) {
        hasRot = true;
        rotReasons.push(`benchmark '${b.name}: ${b.score}' no longer substantiated by sources`);
      }
    }

    if (hasRot) {
      decayed++;
      console.warn(`⚠️ [ROT DETECTED] ${m.name} (${m.slug}): ${rotReasons.join(", ")}`);
      
      const payload = { ...m, quality_status: "thin" };
      const gate = scoreModelPage(payload);
      
      await db.from("models").update({
        quality_status: "thin",
        quality_score: Math.min(gate.score, 50),
        quality_reasons: [...new Set([...gate.reasons, ...rotReasons])],
        quality_checked_at: new Date().toISOString()
      }).eq("id", m.id);
    } else {
      confirmed++;
      console.log(`✅ [CONFIRMED] ${m.name.padEnd(30)} | All citations verified.`);
    }
  }

  console.log("\n=== RE-VERIFICATION SUMMARY ===");
  console.log(`Total Audited: ${models.length}`);
  console.log(`Confirmed Healthy: ${confirmed}`);
  console.log(`Rot Decayed (noindexed): ${decayed}`);
}

reverifyIndexedModels().catch(console.error);
