"use strict";

/**
 * scripts/workers/generate-editorial.js
 *
 * Worker: generate_editorial
 * 1. Hard Gate: Evaluates candidate models via computeFactCompleteness().
 *    (Only models with verifiedFactCount >= 2 and >= 1 verified numeric benchmark are processed).
 * 2. Ineligible models: Left untouched (null editorial fields), never wasted on LLM calls.
 * 3. Eligible models: Generates grounded editorial prose (cardSummary, pageOverview, editorialNote).
 * 4. Structural Boilerplate Gate: Runs isStructuralBoilerplate() before staging.
 *    Retries once with structural variation directive; leaves null if still templated.
 * 5. Stages the prose via staged-write — curator approval required before it
 *    reaches live columns (projected score computed for the review panel).
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const https = require("https");
const { createClient } = require("@supabase/supabase-js");
const { computeFactCompleteness } = require("../merge/compute-fact-completeness");
const { isStructuralBoilerplate, scoreModelPage } = require("../quality/score-content");
const { stageChanges } = require("../lib/staged-write");
const { markJobFailure } = require("../lib/job-lifecycle");
const { parseEditorialOutput } = require("../../data/schemas/editorial-output.schema");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

function parseBatchSize() {
  const argIdx = process.argv.indexOf("--batch-size");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    const parsed = parseInt(process.argv[argIdx + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  const envSize = parseInt(process.env.BATCH_SIZE || "", 10);
  if (!isNaN(envSize) && envSize > 0) return envSize;
  return 15; // Controlled batch size for LLM generation
}

function callOpenAiCompatible(endpoint, apiKey, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const body = JSON.stringify(payload);

    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "Modelverse-EditorialWorker/1.0",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode >= 400) {
              return reject(new Error(`API HTTP ${res.statusCode}: ${data.slice(0, 150)}`));
            }
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.message?.content;
            if (!content) return reject(new Error("Empty response from LLM"));
            resolve(content);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error("LLM request timed out"));
    });

    req.write(body);
    req.end();
  });
}

function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            if (res.statusCode >= 400) {
              return reject(new Error(`Gemini HTTP ${res.statusCode}: ${data.slice(0, 150)}`));
            }
            const parsed = JSON.parse(data);
            const rawText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText) return reject(new Error("Empty response from Gemini"));
            resolve(rawText);
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(25000, () => {
      req.destroy();
      reject(new Error("Gemini request timed out"));
    });

    req.write(payload);
    req.end();
  });
}

async function generateEditorialWithLlm(model, verifiedFacts, retryInstruction = "") {
  const benchmarkSummary = (verifiedFacts.benchmarks || [])
    .map((b) => `${b.name}: ${b.score}`)
    .join(", ");

  const prompt = `You are a senior AI systems benchmark editor for Modelverse (https://themodelverse.in).
Generate high-fidelity, non-templated editorial analysis for the following AI model using ONLY verified factual grounding:

MODEL SPECS:
- Name: ${model.name} (${model.slug})
- Developer: ${model.developer || "Independent"}
- Release Date: ${model.release_date || "Recent"}
- Parameters: ${model.parameters || "Undisclosed"}
- Context Window: ${model.context_window || "128K tokens"}
- License: ${model.license || "Proprietary"}
- Modality: ${(model.modality || ["text"]).join(", ")}
- Primary Task: ${model.primary_task || "chat-reasoning"}
- Verified Benchmarks: ${benchmarkSummary || "None"}
- Base Description: ${model.description || ""}

${retryInstruction ? `CRITICAL CONSTRAINT REVISION: ${retryInstruction}` : ""}

INSTRUCTIONS:
1. Return a JSON object with 3 keys:
   - "cardSummary": 1-2 sentence concise overview (max 150 chars) highlighting primary task and key strength.
   - "pageOverview": 2-3 paragraph distinct overview detailing architectural capabilities, verified benchmark performance, and deployment profile.
   - "editorialNote": 1-2 paragraph analytical commentary (>160 chars) evaluating real-world trade-offs, developer personas, and verified strengths.
2. DO NOT use generic boilerplate clichés like:
   - "is an advanced model by engineered for high performance"
   - "delivers specialized capabilities across with a native context window"
   - "balancing inference memory footprint response quality and multi domain reasoning"
3. Reference the actual benchmark names (${benchmarkSummary || "benchmarks"}) and specifications directly in the prose.

Output valid JSON with keys: "cardSummary", "pageOverview", "editorialNote".`;

  let responseJson = null;

  // LLM output is untrusted input (security.md): every provider response goes
  // through the Zod-backed parse — malformed or injected payloads are treated
  // as a provider failure and fall through to the next provider.
  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const raw = await callGemini(process.env.GEMINI_API_KEY, prompt);
      const parsed = parseEditorialOutput(raw);
      if (!parsed.ok) throw new Error(parsed.error);
      responseJson = parsed.data;
    } catch (e) {
      console.warn(`  ⚠️ Gemini call failed (${e.message}); falling back...`);
    }
  }

  // Fallback to Groq
  if (!responseJson && process.env.GROQ_API_KEY) {
    try {
      const raw = await callOpenAiCompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        process.env.GROQ_API_KEY,
        {
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt + "\nOutput strictly valid JSON." }],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }
      );
      const parsed = parseEditorialOutput(raw);
      if (!parsed.ok) throw new Error(parsed.error);
      responseJson = parsed.data;
    } catch (e) {
      console.warn(`  ⚠️ Groq call failed (${e.message}); falling back...`);
    }
  }

  // Fallback to OpenRouter
  if (!responseJson && process.env.OPENROUTER_API_KEY) {
    try {
      const raw = await callOpenAiCompatible(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY,
        {
          model: "meta-llama/llama-3.3-70b-instruct",
          messages: [{ role: "user", content: prompt + "\nOutput strictly valid JSON." }],
          temperature: 0.7,
        }
      );
      const parsed = parseEditorialOutput(raw);
      if (!parsed.ok) throw new Error(parsed.error);
      responseJson = parsed.data;
    } catch (e) {
      console.warn(`  ⚠️ OpenRouter call failed: ${e.message}`);
    }
  }

  return responseJson;
}

async function runEditorialWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: generate_editorial] Starting editorial pipeline (batch size: ${batchSize})...`);

  // Claim queued generate_editorial jobs (discovery fans these out; the
  // quality_check worker queues them when a card crosses into eligibility).
  const { data: jobs, error } = await db
    .from("enrichment_jobs")
    .select("id, model_id, attempts")
    .eq("action_type", "generate_editorial")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(batchSize * 2);

  if (error) {
    console.error("❌ Failed to query queued jobs:", error.message);
    process.exit(1);
  }

  if (!jobs || jobs.length === 0) {
    console.log("✨ No queued jobs for generate_editorial.");
    return { processedCount: 0, ineligibleCount: 0, boilerplateRejectedCount: 0 };
  }

  const modelIds = [...new Set(jobs.map((j) => j.model_id))];
  const { data: models, error: modelsErr } = await db
    .from("models")
    .select("*")
    .in("id", modelIds);

  if (modelsErr) {
    console.error("❌ Failed to load models:", modelsErr.message);
    process.exit(1);
  }

  const modelsById = new Map((models || []).map((m) => [m.id, m]));
  const work = [];
  for (const job of jobs) {
    const model = modelsById.get(job.model_id);
    if (model) work.push({ job, model });
  }

  console.log(`📥 Claimed ${work.length} job(s) to evaluate against factual completeness gate.`);

  let processedCount = 0;
  let eligibleCount = 0;
  let ineligibleCount = 0;
  let boilerplateRejectedCount = 0;

  const markJob = (id, payload) =>
    db.from("enrichment_jobs").update(payload).eq("id", id);

  for (const { job, model } of work) {
    if (processedCount >= batchSize) break;

    await markJob(job.id, {
      status: "running",
      attempts: (job.attempts || 0) + 1,
      last_run_at: new Date().toISOString(),
    });
    const attemptNo = (job.attempts || 0) + 1;

    // Task 4 Hard Gate: Check fact completeness
    const completeness = computeFactCompleteness(model);

    if (!completeness.eligible) {
      ineligibleCount++;
      // Park rather than fail: facts may still arrive (research_gaps +
      // approval), and the quality_check worker re-queues this job when the
      // card crosses into eligibility.
      await markJob(job.id, {
        status: "blocked",
        blocked_reason: "fact_completeness_gate",
        result_summary: {
          verifiedFacts: completeness.verifiedFactCount ?? null,
          verifiedBenchmarks: completeness.verifiedBenchmarksCount ?? null,
        },
        updated_at: new Date().toISOString(),
      });
      continue;
    }

    eligibleCount++;
    console.log(`\n✍️ Processing eligible model: ${model.name} (${model.slug})...`);
    console.log(`  Facts verified: ${completeness.verifiedFactCount}, Benchmarks: ${completeness.verifiedBenchmarksCount}`);

    try {
      // 1. Initial generation
      let editorial = await generateEditorialWithLlm(model, completeness.verifiedFacts);

      if (!editorial) {
        // All providers came back empty — likely transient, so burn an
        // attempt via the normal failure path rather than parking the job.
        throw new Error("all LLM providers returned empty responses");
      }

      // 2. Structural boilerplate detection
      let isPoBoilerplate = isStructuralBoilerplate(editorial.pageOverview, model);
      let isEnBoilerplate = isStructuralBoilerplate(editorial.editorialNote, model);

      if (isPoBoilerplate || isEnBoilerplate) {
        console.warn(`  ⚠️ Structural boilerplate detected on 1st attempt. Retrying with variation directive...`);

        editorial = await generateEditorialWithLlm(
          model,
          completeness.verifiedFacts,
          "The previous response matched a repetitive synthetic sentence structure. Use entirely fresh syntax, distinctive opening statements, and analyze the benchmark deltas specifically."
        );

        isPoBoilerplate = isStructuralBoilerplate(editorial?.pageOverview, model);
        isEnBoilerplate = isStructuralBoilerplate(editorial?.editorialNote, model);
      }

      if (isPoBoilerplate || isEnBoilerplate) {
        console.warn(`  ❌ Retry failed structural boilerplate check for ${model.name}. Leaving editorial fields null.`);
        boilerplateRejectedCount++;
        // Completed evaluation with a negative result — mark done with the
        // reason so the job doesn't strand in 'running'; discovery will
        // naturally re-examine after its freshness window.
        await markJob(job.id, {
          status: "done",
          error: null,
          result_summary: { reason: "boilerplate_rejected" },
          updated_at: new Date().toISOString(),
        });
        continue;
      }

      // 3. Stage the generated prose for curator approval — AI-generated text
      // never reaches live columns directly (product rule: unreviewed AI
      // content must not render publicly). The quality gate re-runs at
      // approval time on the merged model.
      const proposals = {
        ...(editorial.cardSummary ? { card_summary: editorial.cardSummary } : {}),
        ...(editorial.pageOverview ? { page_overview: editorial.pageOverview } : {}),
        ...(editorial.editorialNote ? { editorial_note: editorial.editorialNote } : {}),
      };

      const mergedPreview = {
        ...model,
        card_summary: proposals.card_summary || model.card_summary,
        page_overview: proposals.page_overview || model.page_overview,
        editorial_note: proposals.editorial_note || model.editorial_note,
        parameters: model.parameters,
        contextWindow: model.context_window,
        license: model.license,
        benchmarks: model.benchmarks || [],
        fieldConfidence: model.field_confidence || {},
        keyFeatures: model.key_features || [],
      };
      const previewGate = scoreModelPage(mergedPreview);

      await stageChanges(db, model.id, proposals, [
        {
          field_name: "editorial",
          source_type: "other",
          source_url: (Array.isArray(model.sources) && model.sources[0]) || `https://themodelverse.in/models/${model.slug}`,
          extracted_value: {
            generator: "generate-editorial",
            fields: Object.keys(proposals),
            projected_quality_score: previewGate.score,
            projected_quality_status: previewGate.status,
          },
          confidence: "LIKELY",
          verification_notes: "LLM-generated editorial prose grounded in verified facts — pending curator review",
        },
      ]);

      await markJob(job.id, {
        status: "done",
        error: null,
        result_summary: {
          stagedFields: Object.keys(proposals),
          projectedQualityScore: previewGate.score,
          projectedQualityStatus: previewGate.status,
          timestamp: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      });

      processedCount++;
      console.log(`  🎉 Staged editorial for ${model.name} (${Object.keys(proposals).length} fields) -> projected quality ${previewGate.score}/100 (${previewGate.status}, live after approval)`);
    } catch (err) {
      console.error(`  ❌ Editorial generation failed for ${model.name}:`, err.message);
      await markJobFailure(db, job.id, err.message, attemptNo);
    }
  }

  console.log(`\n=== EDITORIAL WORKER SUMMARY ===`);
  console.log(`Eligible Processed:     ${processedCount}`);
  console.log(`Ineligible Gated:       ${ineligibleCount}`);
  console.log(`Boilerplate Rejections: ${boilerplateRejectedCount}`);
  return { processedCount, ineligibleCount, boilerplateRejectedCount };
}

if (require.main === module) {
  runEditorialWorker().catch((err) => {
    console.error("Editorial worker error:", err);
    process.exit(1);
  });
}

module.exports = { runEditorialWorker };
