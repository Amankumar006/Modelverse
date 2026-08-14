"use strict";

const assert = require("assert");
const { scoreModelPage, scoreNewsArticle } = require("../scripts/quality/score-content");
const { findNearDuplicates } = require("../scripts/quality/detect-duplicates");

const model = {
  id: "example-model",
  slug: "example-model",
  name: "Example Model",
  parameters: "7B",
  contextWindow: "128k",
  license: "Apache-2.0",
  developer: "Example Labs",
  releaseDate: "2026-08-14",
  description: "A concise card summary for Example Model.",
  pageOverview: "This reviewed overview explains the architecture, deployment trade-offs, and intended users.",
  editorialNote: "This deliberately long reviewed note gives readers context beyond generated catalogue copy. It discusses the provenance of available evaluation results and the practical caveats teams should consider before adopting the model in a production workflow.",
  benchmarks: [{ name: "MMLU", score: 82.1 }, { name: "GPQA", score: "61.4" }],
};

const scoredModel = scoreModelPage(model);
assert.equal(scoredModel.status, "indexed");
assert.ok(scoredModel.score >= 65);
assert.equal(scoreModelPage({}).status, "thin");

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

const duplicate = findNearDuplicates(
  { slug: "new", body: "one two three four five six seven eight nine ten" },
  [{ slug: "old", shingles: ["one two three four five", "two three four five six", "three four five six seven", "four five six seven eight", "five six seven eight nine", "six seven eight nine ten"] }],
  { threshold: 0.75 }
);
assert.equal(duplicate.slug, "old");

console.log("quality gate tests passed");
