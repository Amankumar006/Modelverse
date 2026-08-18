"use strict";

const assert = require("assert");
const { scoreModelPage, scoreNewsArticle, isStructuralBoilerplate } = require("../scripts/quality/score-content");
const { findNearDuplicates } = require("../scripts/quality/detect-duplicates");

// 1. Valid Flagship Model (>=2 verified benchmarks, unique description, links)
const model = {
  id: "example-model",
  slug: "example-model",
  name: "Example Model",
  parameters: "7B",
  contextWindow: "128k",
  modality: ["text"],
  deployment: ["api", "cloud"],
  primaryTask: "chat-reasoning",
  license: "Apache-2.0",
  developer: "Example Labs",
  family: "example-family",
  tier: "7B",
  type: "open-source",
  releaseDate: "2026-08-14",
  description: "A comprehensive model designed for agentic reasoning and tool use in production workflows.",
  cardSummary: "A concise card summary for Example Model in search and cards.",
  pageOverview: "This reviewed overview explains the architecture, deployment trade-offs, and intended users across enterprise production workloads without repetitive boilerplate text.",
  editorialNote: "This deliberately long reviewed note gives readers context beyond generated catalogue copy. It discusses the provenance of available evaluation results and the practical caveats teams should consider before adopting the model in a production workflow.",
  benchmarks: [
    { name: "MMLU", score: 82.1, metricType: "performance", verified: true, source: "https://example.com/eval" },
    { name: "GPQA", score: "61.4", metricType: "performance", verified: true, source: "https://example.com/eval" },
  ],
  pricing: [{ tier: "Standard", unit: "1M tokens", amount: 0.5, currency: "USD" }],
  sources: ["https://example.com/announcement", "https://example.com/paper"],
  links: { huggingface: "https://huggingface.co/example/model" },
  keyFeatures: ["Native 128k context", "Tool use support"],
  tags: ["reasoning", "tool-use"],
};

const scoredModel = scoreModelPage(model);
assert.equal(scoredModel.status, "indexed");
assert.ok(scoredModel.score >= 65);
assert.equal(scoreModelPage({}).status, "thin");

// 2. Unbenchmarked / Thin Model (Complete metadata but 0 benchmarks -> must be 'thin')
const unbenchmarkedModel = {
  ...model,
  id: "unbenchmarked-model",
  slug: "unbenchmarked-model",
  benchmarks: [],
};
const scoredUnbenchmarked = scoreModelPage(unbenchmarkedModel);
assert.equal(scoredUnbenchmarked.status, "thin");
assert.ok(scoredUnbenchmarked.reasons.some((r) => r.includes("missing verified numeric")));

// 2b. Unsourced Benchmarks Rejection (Benchmarks present, but no source URL or verified confidence)
const unsourcedModel = {
  ...model,
  id: "unsourced-model",
  slug: "unsourced-model",
  links: {},
  sources: [],
  benchmarks: [{ name: "MMLU", score: 85.0 }, { name: "GPQA", score: 65.0 }],
};
const scoredUnsourced = scoreModelPage(unsourcedModel);
assert.equal(scoredUnsourced.status, "thin");
assert.ok(scoredUnsourced.reasons.some((r) => r.includes("missing verified numeric")));

// 3. Cross-Page Template Detection (Synthetic boilerplate must be rejected)
const templatedModel = {
  ...model,
  id: "templated-model",
  slug: "templated-model",
  pageOverview: "Powered by 7B parameters, Example Model delivers specialized capabilities across chat reasoning with a native context window of 128K tokens. Built by Example Labs, the architecture prioritizes low-latency throughput, dependable reasoning fidelity, and flexible deployment across enterprise APIs and local hardware environments.",
  editorialNote: "Modelverse Editorial Analysis: Example Model represents a capable milestone in chat reasoning. Developed by Example Labs, it serves as an accessible open-weight foundation balancing inference memory footprint, response quality, and multi-domain reasoning. Recommended for developers evaluating modern frontier architectures for scalable production workloads.",
};
assert.ok(isStructuralBoilerplate(templatedModel.pageOverview, templatedModel));
assert.ok(isStructuralBoilerplate(templatedModel.editorialNote, templatedModel));
const scoredTemplated = scoreModelPage(templatedModel);
assert.equal(scoredTemplated.status, "thin");
assert.ok(scoredTemplated.reasons.some((r) => r.includes("templated / boilerplate")));

// 4. News Scorer Test
const article = {
  slug: "example-news",
  title: "Example Labs releases a new model",
  body: "Example Labs released a new model for structured reasoning and tool use. The announcement describes deployment details and evaluation methodology.\n\n## Why this matters\nThis suggests teams may have another option when they need predictable tool use, although published results should still be independently validated before a production rollout.\n\nThe release includes documentation for developers and researchers evaluating the system across practical workflows.",
  sources: ["https://example.com/announcement", "https://research.example.org/report"],
};

const scoredArticle = scoreNewsArticle(article, ["A completely unrelated source document with different vocabulary and structure."]);
assert.equal(scoredArticle.status, "indexed");
assert.ok(scoredArticle.score >= 55);
assert.ok(!scoredArticle.reasons.includes("not a multi-source synthesis"));

// 5. Duplicate Detection Test
const duplicate = findNearDuplicates(
  { slug: "new", body: "one two three four five six seven eight nine ten" },
  [{ slug: "old", body: "one two three four five six seven eight nine ten" }],
  { threshold: 0.75 }
);
assert.ok(duplicate);
assert.equal(duplicate.slug, "old");

console.log("quality gate tests passed");
