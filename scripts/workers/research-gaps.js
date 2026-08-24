"use strict";

/**
 * scripts/workers/research-gaps.js
 *
 * Worker: research_gaps
 * Closes per-model data gaps using Gemini web-search grounding (goal: every
 * model card carries its rubric-required data without manual human edits).
 *
 * 1. Claims a batch of 'queued' research_gaps jobs (requeues stale failures,
 *    self-enqueues thin candidates when the queue is empty).
 * 2. Orders candidates by traffic signal: featured > boost > release_date
 *    (--wave=featured restricts to featured models; --wave=all sweeps the tail).
 * 3. Computes gaps from the SAME deterministic rubric the scorer rewards
 *    (computeMissingFields — never parses reason strings).
 * 4. Stage A (free): pulls reference context from the model's own source URLs.
 * 5. Stage B (grounded): asks Gemini ONLY for the missing fields via google_search,
 *    demanding per-field source URLs.
 * 6. Validates through Zod-backed sanitizeResearchResults: unsourced or
 *    placeholder values are DROPPED, never staged.
 * 7. Writes exclusively via stageChanges() with model_evidence rows
 *    (source_type 'web_research') — curator approval required to go live.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
 * Args: --wave=featured|all  --batch-size N  --max N  --dry-run
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");
const { markJobFailure } = require("../lib/job-lifecycle");
const { stageChanges } = require("../lib/staged-write");
const { computeMissingFields } = require("../quality/score-content");
const { sanitizeResearchResults } = require("../../data/schemas/research-gap-result.schema");
const { researchModelFields } = require("../lib/research-client");
const { fetchPageText } = require("../lib/verify-citation-content");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const ACTION_TYPE = "research_gaps";
const FRESHNESS_DAYS = 14;      // skip models researched within this window
const MAX_CONTEXT_URLS = 2;     // free-tier reference fetches per model
const CONTEXT_CHARS = 3500;     // truncation per fetched page
const MAX_GROUNDED_CALLS = 40;  // hard cost ceiling per run

function parseArgs() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const numArg = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const waveArg = getArg("--wave") || process.env.WAVE || "featured";
  const maxArg = numArg(getArg("--max")) || numArg(getArg("--batch-size"))
    || parseInt(process.env.BATCH_SIZE || "", 10) || 10;

  return {
    wave: waveArg === "all" ? "all" : "featured",
    max: Math.min(maxArg, 50),
    dryRun: args.includes("--dry-run"),
  };
}

function isValidUrl(value) {
  try {
    const parsed = new URL(String(value));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Traffic-signal ordering: featured > boost > newest release. */
function compareCandidates(a, b) {
  if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
  const boostDelta = (b.boost ?? 0) - (a.boost ?? 0);
  if (boostDelta !== 0) return boostDelta;
  return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
}

async function requeueStaleFailures() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("enrichment_jobs")
    .update({ status: "queued", updated_at: new Date().toISOString() })
    .eq("action_type", ACTION_TYPE)
    .eq("status", "failed")
    .lt("attempts", 5)
    .lt("updated_at", cutoff)
    .select("id");

  if (error) {
    console.warn(`⚠️ Could not requeue stale failed research jobs: ${error.message}`);
    return 0;
  }
  return (data || []).length;
}

async function recentlyResearchedModelIds() {
  const cutoff = new Date(Date.now() - FRESHNESS_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from("enrichment_jobs")
    .select("model_id")
    .eq("action_type", ACTION_TYPE)
    .eq("status", "done")
    .gt("updated_at", cutoff);

  if (error) return new Set();
  return new Set((data || []).map((r) => r.model_id));
}

/**
 * When no jobs are queued, fan out to thin models directly so this worker
 * also functions standalone before Phase 3 wires discovery fan-out.
 */
async function selfEnqueue(limit, wave, freshSkip) {
  let query = db
    .from("models")
    .select("id")
    .neq("status", "staged")
    .neq("verification_status", "DISPUTED");

  if (wave === "featured") {
    query = query.eq("featured", true);
  }

  const { data: candidates, error } = await query
    .order("featured", { ascending: false })
    .order("boost", { ascending: false })
    .order("release_date", { ascending: false })
    .limit(limit * 3);

  if (error) {
    console.warn(`⚠️ Self-enqueue candidate query failed: ${error.message}`);
    return 0;
  }

  const targets = (candidates || [])
    .filter((m) => !freshSkip.has(m.id))
    .slice(0, limit);

  if (targets.length === 0) return 0;

  const rows = targets.map((m) => ({
    model_id: m.id,
    action_type: ACTION_TYPE,
    status: "queued",
  }));

  const { error: insertErr } = await db
    .from("enrichment_jobs")
    .upsert(rows, { onConflict: "model_id,action_type", ignoreDuplicates: true });

  if (insertErr) {
    console.warn(`⚠️ Self-enqueue insert failed: ${insertErr.message}`);
    return 0;
  }
  return rows.length;
}

function buildReferenceContext(model) {
  const candidates = [];
  if (Array.isArray(model.sources)) candidates.push(...model.sources);
  if (model.links && typeof model.links === "object") candidates.push(...Object.values(model.links));

  return [...new Set(candidates.filter((u) => typeof u === "string" && isValidUrl(u)))];
}

async function fetchContextSnippet(urls) {
  const texts = await Promise.all(
    urls.slice(0, MAX_CONTEXT_URLS).map(async (url) => {
      const text = await fetchPageText(url);
      return text ? text.slice(0, CONTEXT_CHARS) : null;
    }),
  );
  return texts.filter(Boolean).join("\n\n---\n\n").slice(0, CONTEXT_CHARS * MAX_CONTEXT_URLS);
}

/** Append-merge arrays so staging never destroys existing curated content. */
function mergeArrayField(existing, incoming) {
  const base = Array.isArray(existing) ? existing.map(String) : [];
  return [...new Set([...base, ...incoming])];
}

async function runResearchGapsWorker() {
  const { wave, max, dryRun } = parseArgs();
  console.log(`🚀 [Worker: ${ACTION_TYPE}] wave=${wave} max=${max}${dryRun ? " (DRY RUN)" : ""}`);

  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ Missing GEMINI_API_KEY — web-grounded research unavailable.");
    process.exit(1);
  }

  const requeued = await requeueStaleFailures();
  if (requeued > 0) console.log(`♻️  Requeued ${requeued} stale failed research job(s).`);

  // 1. Claim queued jobs (over-fetch so post-filtering still fills the batch)
  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", ACTION_TYPE)
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(max * 4);

  if (error) {
    console.error("❌ Failed to query queued jobs:", error.message);
    process.exit(1);
  }

  const freshSkip = await recentlyResearchedModelIds();

  let claimedJobs = jobs || [];
  if (claimedJobs.length === 0 && !dryRun) {
    const enqueued = await selfEnqueue(max, wave, freshSkip);
    if (enqueued > 0) {
      console.log(`📥 Queue was empty — self-enqueued ${enqueued} thin model(s).`);
      const { data: freshJobs } = await db
        .from("enrichment_jobs")
        .select("id, model_id, attempts")
        .eq("action_type", ACTION_TYPE)
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(max * 2);
      claimedJobs = freshJobs || [];
    }
  }

  if (claimedJobs.length === 0) {
    console.log("✨ No research_gaps candidates.");
    return { done: 0, failed: 0, skipped: 0 };
  }

  // 2. Hydrate + prioritize models
  const modelIds = [...new Set(claimedJobs.map((j) => j.model_id))];
  const { data: modelRows, error: modelsErr } = await db
    .from("models")
    .select("*")
    .in("id", modelIds);

  if (modelsErr) {
    console.error("❌ Failed to load models:", modelsErr.message);
    process.exit(1);
  }

  const modelsById = new Map((modelRows || []).map((m) => [m.id, m]));
  const jobsByModel = new Map();
  for (const job of claimedJobs) {
    // keep the OLDEST job row per model
    if (!jobsByModel.has(job.model_id)) jobsByModel.set(job.model_id, job);
  }

  const ordered = [...jobsByModel.entries()]
    .map(([modelId, job]) => ({ job, model: modelsById.get(modelId) }))
    .filter(({ model }) => Boolean(model))
    .sort((a, b) => compareCandidates(a.model, b.model));

  let processed = 0;
  let doneCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  let groundedCalls = 0;

  for (const { job, model } of ordered) {
    if (processed >= max || groundedCalls >= MAX_GROUNDED_CALLS) break;
    if (freshSkip.has(model.id)) {
      skippedCount++;
      continue;
    }
    if (wave === "featured" && !model.featured) {
      // Featured wave reached its boundary — leave remaining jobs queued.
      break;
    }

    processed++;

    if (dryRun) {
      const gaps = computeMissingFields(model);
      console.log(`\n🔍 [DRY] ${model.name}: factGaps=[${gaps.factGaps.join(", ") || "none"}] benchmarksNeeded=${gaps.benchmarksNeeded} proseGaps=[${gaps.proseGaps.join(", ") || "none"}]`);
      if (!gaps.hasFactGaps) skippedCount++;
      continue;
    }

    // Claim the job
    await db.from("enrichment_jobs").update({
      status: "running",
      attempts: (job.attempts || 0) + 1,
      last_run_at: new Date().toISOString(),
    }).eq("id", job.id);

    const attemptNo = (job.attempts || 0) + 1;

    try {
      const gaps = computeMissingFields(model);

      if (!gaps.hasFactGaps) {
        await db.from("enrichment_jobs").update({
          status: "done",
          error: null,
          result_summary: { reason: "no_fact_gaps", proseGaps: gaps.proseGaps },
          updated_at: new Date().toISOString(),
        }).eq("id", job.id);
        doneCount++;
        console.log(`  ✅ ${model.name}: no fact gaps — nothing to research.`);
        continue;
      }

      console.log(`\n🔎 Researching ${model.name}: gaps=[${gaps.factGaps.join(", ")}]`);

      // Stage A — free local context from the model's own URLs
      const contextSnippet = await fetchContextSnippet(buildReferenceContext(model));

      // Stage B — grounded research for ONLY the missing fields
      const requestedScalarFields = gaps.factGaps.filter((f) => f !== "benchmarks" && f !== "sources");
      const wantsSources = gaps.factGaps.includes("sources");
      const wantsBenchmarks = gaps.benchmarksNeeded > 0;

      groundedCalls++;
      const research = await researchModelFields({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: model.name,
        developer: model.developer,
        slug: model.slug,
        missingFields: wantsSources ? [...requestedScalarFields, "sources"] : requestedScalarFields,
        benchmarksNeeded: wantsBenchmarks ? gaps.benchmarksNeeded : 0,
        contextSnippet: contextSnippet || undefined,
      });

      if (!research.ok) {
        throw new Error(research.error);
      }

      // Validate — unsourced/placeholder/malformed proposals die here.
      const requested = [
        ...gaps.factGaps.filter((f) => f !== "benchmarks"),
      ];
      const { sanitized, benchmarks, dropped } = sanitizeResearchResults(research.results, {
        requestedFields: requested,
        allowBenchmarks: wantsBenchmarks,
      });

      // Merge-with-live semantics for cumulative fields
      const proposals = {};
      for (const [field, value] of Object.entries(sanitized)) {
        if (field === "sources") continue;
        if (["tags", "key_features", "aliases", "modality", "deployment"].includes(field)) {
          const current = field === "key_features" ? model.key_features : model[field];
          proposals[field] = mergeArrayField(current, value);
        } else {
          proposals[field] = value;
        }
      }

      if (sanitized.sources) {
        proposals.sources = mergeArrayField(
          [...(Array.isArray(model.sources) ? model.sources : []), ...(research.groundingUrls || [])],
          sanitized.sources,
        );
      } else if ((research.groundingUrls || []).length > 0) {
        proposals.sources = [...new Set([
          ...(Array.isArray(model.sources) ? model.sources : []),
          ...research.groundingUrls,
        ])];
      }

      // Benchmarks append with dedupe against live entries
      const existingBenchmarks = Array.isArray(model.benchmarks) ? model.benchmarks : [];
      const newBenchmarks = benchmarks.filter(
        (nb) => !existingBenchmarks.some((eb) => String(eb?.name || "").toLowerCase() === nb.name.toLowerCase()),
      );
      if (newBenchmarks.length > 0) {
        proposals.benchmarks = [...existingBenchmarks, ...newBenchmarks];
      }

      if (Object.keys(proposals).length === 0) {
        await db.from("enrichment_jobs").update({
          status: "done",
          error: null,
          result_summary: { reason: "no_verifiable_values", dropped },
          updated_at: new Date().toISOString(),
        }).eq("id", job.id);
        doneCount++;
        console.log(`  ⚠️ ${model.name}: research returned nothing verifiable (dropped: ${Object.keys(dropped).join(", ") || "n/a"}).`);
        continue;
      }

      // Evidence rows — one per proposed field, citing where it came from.
      const evidenceRows = [];
      for (const [field, value] of Object.entries(proposals)) {
        const citedUrls = field === "benchmarks"
          ? []
          : (research.results?.[field]?.sourceUrls || []).filter(isValidUrl);
        evidenceRows.push({
          field_name: field,
          source_type: "web_research",
          source_url: citedUrls[0]
            || (research.groundingUrls || [])[0]
            || `https://themodelverse.in/models/${model.slug}`,
          extracted_value: { value },
          confidence: "LIKELY",
          verification_notes: citedUrls.length > 0
            ? `Web-grounded research (${research.model}); corroborating URLs: ${citedUrls.slice(0, 3).join(", ")}`
            : `Web-grounded research (${research.model})`,
        });
      }
      for (const b of newBenchmarks) {
        evidenceRows.push({
          field_name: `benchmarks.${b.name.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`,
          source_type: "web_research",
          source_url: b.sources[0],
          extracted_value: { score: b.score, name: b.name },
          confidence: "LIKELY",
          verification_notes: `Web-grounded benchmark find via ${research.model}`,
        });
      }

      const { staged, fields } = await stageChanges(db, model.id, proposals, evidenceRows);

      await db.from("enrichment_jobs").update({
        status: "done",
        error: null,
        result_summary: {
          staged,
          stagedFields: fields,
          benchmarksAdded: newBenchmarks.length,
          dropped,
          groundedModel: research.model,
        },
        updated_at: new Date().toISOString(),
      }).eq("id", job.id);

      doneCount++;
      console.log(`  🎉 ${model.name}: staged ${fields.length} field(s) [${fields.join(", ")}] (+${newBenchmarks.length} benchmarks)`);
    } catch (err) {
      console.error(`  ❌ Research failed for ${model.name}:`, err.message);
      await markJobFailure(db, job.id, err.message, attemptNo);
      failedCount++;
    }
  }

  console.log(`\n=== WORKER (${ACTION_TYPE}) COMPLETED ===`);
  console.log(`Done: ${doneCount} | Failed: ${failedCount} | Skipped: ${skippedCount} | Grounded calls: ${groundedCalls}`);
  return { done: doneCount, failed: failedCount, skipped: skippedCount };
}

if (require.main === module) {
  runResearchGapsWorker().catch((err) => {
    console.error("Research-gaps worker error:", err);
    process.exit(1);
  });
}

module.exports = { runResearchGapsWorker };
