"use strict";

/**
 * scripts/workers/generate-editorial.js
 *
 * Worker: generate_editorial
 * 1. Hard Gate: Evaluates candidate models via computeFactCompleteness().
 *    (Only models with verifiedFactCount >= 2 and >= 1 verified numeric benchmark are processed).
 * 2. Ineligible models: Left untouched (null editorial fields), never wasted on LLM calls.
 * 3. Eligible models: Generates grounded editorial prose (cardSummary, pageOverview, editorialNote).
 * 4. Structural Boilerplate Gate: Runs isStructuralBoilerplate() before write.
 *    Retries once with structural variation directive; leaves null if still templated.
 * 5. Runs scoreModelPage() and updates Supabase models table.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const https = require("https");
const { createClient } = require("@supabase/supabase-js");
const { computeFactCompleteness } = require("../merge/compute-fact-completeness");
const { isStructuralBoilerplate, scoreModelPage } = require("../quality/score-content");

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

  // Try Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      const raw = await callGemini(process.env.GEMINI_API_KEY, prompt);
      responseJson = JSON.parse(raw);
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
      responseJson = JSON.parse(raw);
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
      responseJson = JSON.parse(raw);
    } catch (e) {
      console.warn(`  ⚠️ OpenRouter call failed: ${e.message}`);
    }
  }

  return responseJson;
}

async function runEditorialWorker() {
  const batchSize = parseBatchSize();
  console.log(`🚀 [Worker: generate_editorial] Starting editorial pipeline (batch size: ${batchSize})...`);

  // Query models that either have thin status or are missing editorial fields
  const { data: models, error } = await db
    .from("models")
    .select("*")
    .or("editorial_note.is.null,page_overview.is.null")
    .order("boost", { ascending: false })
    .order("release_date", { ascending: false })
    .limit(batchSize * 3);

  if (error) {
    console.error("❌ Failed to query candidate models:", error.message);
    process.exit(1);
  }

  console.log(`📋 Loaded ${models.length} candidate models to evaluate against factual completeness gate.`);

  let processedCount = 0;
  let eligibleCount = 0;
  let ineligibleCount = 0;
  let boilerplateRejectedCount = 0;

  for (const model of models) {
    if (processedCount >= batchSize) break;

    // Task 4 Hard Gate: Check fact completeness
    const completeness = computeFactCompleteness(model);

    if (!completeness.eligible) {
      ineligibleCount++;
      continue;
    }

    eligibleCount++;
    console.log(`\n✍️ Processing eligible model: ${model.name} (${model.slug})...`);
    console.log(`  Facts verified: ${completeness.verifiedFactCount}, Benchmarks: ${completeness.verifiedBenchmarksCount}`);

    try {
      // 1. Initial generation
      let editorial = await generateEditorialWithLlm(model, completeness.verifiedFacts);

      if (!editorial) {
        console.warn(`  ⚠️ LLM generation returned empty response for ${model.name}. Skipping.`);
        continue;
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
        continue;
      }

      // 3. Prepare payload and score
      const updatedPayload = {
        ...model,
        cardSummary: editorial.cardSummary || model.card_summary,
        pageOverview: editorial.pageOverview || model.page_overview,
        editorialNote: editorial.editorialNote || model.editorial_note,
        parameters: model.parameters,
        contextWindow: model.context_window,
        license: model.license,
        benchmarks: model.benchmarks || [],
        fieldConfidence: model.field_confidence || {},
        keyFeatures: model.key_features || [],
      };

      const gate = scoreModelPage(updatedPayload);

      await db
        .from("models")
        .update({
          card_summary: updatedPayload.cardSummary,
          page_overview: updatedPayload.pageOverview,
          editorial_note: updatedPayload.editorialNote,
          quality_status: gate.status,
          quality_score: gate.score,
          quality_reasons: gate.reasons,
          quality_checked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", model.id);

      processedCount++;
      console.log(`  🎉 Successfully generated editorial for ${model.name} -> Quality Score: ${gate.score}/100 (${gate.status})`);
    } catch (err) {
      console.error(`  ❌ Editorial generation failed for ${model.name}:`, err.message);
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
