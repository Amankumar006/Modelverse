"use strict";

/**
 * scripts/news/generate-longform-article.js
 *
 * Longform Synthesis Generator:
 * 1. Takes candidate story + researched sources[] (>=2 distinct domains).
 * 2. Instructs LLM (Gemini / Groq / OpenRouter) to synthesize an in-depth 900-1300 word technical article.
 * 3. Enforces strict 5-part structure + mandatory "## Why This Matters" original analysis.
 * 4. Enforces strict copyright constraints (<15-word quotes, zero verbatim sentence copying).
 * 5. Runs isStructuralBoilerplate() gate on analysis prose; retries once if flagged.
 * 6. Formats canonical sources array + markdown citations section at bottom.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const https = require("https");
const { isStructuralBoilerplate } = require("../quality/score-content");

function postHttps(url, payload, customHeaders = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const bodyStr = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: urlObj.hostname,
        path: urlObj.pathname + (urlObj.search || ""),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(bodyStr),
          ...customHeaders,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP status ${res.statusCode}: ${data.slice(0, 150)}`));
          } else {
            resolve(data);
          }
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(35000, () => {
      req.destroy();
      reject(new Error("LLM synthesis request timed out"));
    });
    req.write(bodyStr);
    req.end();
  });
}

function buildSynthesisPrompt(story, sources, retryDirective = "") {
  const sourcesSummary = sources
    .map(
      (s, idx) => `SOURCE [${idx + 1}] (${s.sourceType.toUpperCase()} - ${s.domain}):
Title: ${s.title}
URL: ${s.url}
Excerpts:
${(s.fetchedText || "").slice(0, 2500)}`
    )
    .join("\n\n" + "=".repeat(40) + "\n\n");

  return `You are a principal AI systems research editor writing for Modelverse (https://themodelverse.in).
Synthesize the following ${sources.length} distinct-domain sources into a comprehensive, deeply technical longform news article (900-1300 words).

TOPIC TITLE: ${story.title}
PRIMARY LAB / ENTITY: ${story.lab || "Independent AI Research"}

${sourcesSummary}

${retryDirective ? `CRITICAL CONSTRAINT REVISION: ${retryDirective}` : ""}

STRICT EDITORIAL REQUIREMENTS:
1. SYNTHESIZE, DO NOT STITCH:
   - Integrate the facts, benchmark numbers, architectural changes, and industry reactions across all sources into ONE cohesive narrative.
   - Do NOT write repetitive "According to Source 1... while Source 2 stated...". Write with authoritative domain expertise.
2. ARTICLE STRUCTURE (MANDATORY 5 SECTIONS):
   - Section 1: Executive Lead Paragraph (What happened, key architectural or industry significance, plain technical terms).
   - Section 2: Technical Context & Background (Why this release or event matters right now, historical lineage, prior generation comparisons).
   - Section 3: Architecture, Benchmarks & Detailed Specifications (In-depth breakdown of parameters, evals, training methods, modalities, inference profiles, pricing/licensing). Use bulleted spec blocks where helpful.
   - Section 4: "## Why This Matters" (MANDATORY distinct section: 2-3 substantial paragraphs of original, evidence-grounded technical commentary evaluating engineering trade-offs, developer adoption hurdles, economic impact, and system design implications).
   - Section 5: "## What's Next" (Open research questions, roadmap expectations, ecosystem integrations).
3. STRICT COPYRIGHT & PLAGIARISM CONSTRAINTS:
   - NEVER copy full sentences verbatim from any source text.
   - Any direct quotation MUST be strictly under 15 words and clearly attributed to its speaker/source.
   - Do NOT mirror any single source's paragraph order.
4. LENGTH & TONE:
   - Target 900 to 1300 words of substantive technical depth. Avoid fluff and hyperbolic buzzwords ("groundbreaking", "game-changer", "revolutionary").
   - Output clean GitHub Flavored Markdown only (do not include "Here is your article:" or preamble).`;
}

async function callGeminiSynthesis(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 3500,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const responseJson = await postHttps(url, payload);
  const data = JSON.parse(responseJson);

  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error("Invalid response from Gemini synthesis API");
}

async function callGroqSynthesis(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.25,
    max_tokens: 3500,
  };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const url = "https://api.groq.com/openai/v1/chat/completions";
  const responseJson = await postHttps(url, payload, headers);
  const data = JSON.parse(responseJson);

  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    return data.choices[0].message.content.trim();
  }
  throw new Error("Invalid response from Groq synthesis API");
}

async function callOpenRouterSynthesis(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

  const payload = {
    model: "meta-llama/llama-3.3-70b-instruct",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.25,
    max_tokens: 3500,
  };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": "https://www.themodelverse.in",
    "X-Title": "Modelverse",
  };

  const url = "https://openrouter.ai/api/v1/chat/completions";
  const responseJson = await postHttps(url, payload, headers);
  const data = JSON.parse(responseJson);

  if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
    return data.choices[0].message.content.trim();
  }
  throw new Error("Invalid response from OpenRouter synthesis API");
}

async function synthesizeArticleProse(story, sources, retryDirective = "") {
  const prompt = buildSynthesisPrompt(story, sources, retryDirective);

  // 1. Try Gemini
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGeminiSynthesis(prompt);
    } catch (e) {
      console.warn(`    ⚠️ Gemini synthesis failed (${e.message}). Trying Groq...`);
    }
  }

  // 2. Try Groq
  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroqSynthesis(prompt);
    } catch (e) {
      console.warn(`    ⚠️ Groq synthesis failed (${e.message}). Trying OpenRouter...`);
    }
  }

  // 3. Try OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      return await callOpenRouterSynthesis(prompt);
    } catch (e) {
      console.warn(`    ⚠️ OpenRouter synthesis failed (${e.message}).`);
    }
  }

  throw new Error("No synthesis LLM providers succeeded.");
}

function formatSourcesSection(sources) {
  let section = "\n\n---\n\n### Sources & Citations\n\n";
  sources.forEach((s) => {
    const label = s.sourceName ? `${s.sourceName} (${s.domain})` : s.domain;
    section += `- [${s.title || label}](${s.url}) — *${s.sourceType === "official_primary" ? "Official Announcement" : "Independent Analysis"}*\n`;
  });
  return section;
}

async function generateLongformArticle(story, researchDossier) {
  const sources = researchDossier.sources || [];
  if (sources.length < 2) {
    throw new Error(`Cannot generate longform article with < 2 sources (found ${sources.length})`);
  }

  console.log(`\n✍️ [Longform Synthesis] Generating article across ${sources.length} sources for: "${story.title}"...`);

  // 1. First synthesis pass
  let body = await synthesizeArticleProse(story, sources);

  // 2. Extract analysis section for structural boilerplate check
  const analysisMatch = body.match(/##\s*Why This Matters[\s\S]*?(?=##|$)/i);
  const analysisText = analysisMatch ? analysisMatch[0] : "";

  let isBoilerplate = isStructuralBoilerplate(analysisText);
  if (isBoilerplate) {
    console.warn(`    ⚠️ Structural boilerplate detected in analysis section. Retrying with variation directive...`);
    body = await synthesizeArticleProse(
      story,
      sources,
      "The previous output was flagged for using repetitive structural phrases in the 'Why This Matters' section. Vary paragraph transitions completely and focus specifically on architectural trade-offs."
    );
    const retryAnalysisMatch = body.match(/##\s*Why This Matters[\s\S]*?(?=##|$)/i);
    isBoilerplate = isStructuralBoilerplate(retryAnalysisMatch ? retryAnalysisMatch[0] : "");
  }

  if (isBoilerplate) {
    throw new Error("Article analysis section failed anti-boilerplate verification on retry.");
  }

  // 3. Append formal sources & citations section
  const fullBody = body.trim() + formatSourcesSection(sources);
  const wordCount = fullBody.split(/\s+/).length;
  const readTimeMinutes = Math.max(4, Math.ceil(wordCount / 220));

  console.log(`    ✅ Successfully generated longform article (${wordCount} words, ~${readTimeMinutes} min read).`);

  const articlePayload = {
    slug: story.slug,
    title: story.title,
    category: "short-news", // Keep compatible with existing news category enum
    article_type: "longform",
    publish_date: story.publish_date || new Date().toISOString().split("T")[0],
    author: "Modelverse Research",
    read_time: `${readTimeMinutes} min read`,
    excerpt: story.description ? story.description.slice(0, 180) + "..." : body.slice(0, 180) + "...",
    body: fullBody,
    cover_image: story.cover_image || "/images/news/news_featured.jpg",
    status: "published",
    confidence_level: "confirmed",
    sources: sources.map((s) => ({
      url: s.url,
      domain: s.domain,
      title: s.title,
      sourceType: s.sourceType,
    })),
    external_sources: sources.map((s) => s.url),
    related_models: story.related_models || [],
    tags: ["ai-news", "technical-deep-dive", "multi-source-synthesis", ...(story.tags || [])],
  };

  return articlePayload;
}

module.exports = {
  generateLongformArticle,
  buildSynthesisPrompt,
  formatSourcesSection,
};
