"use strict";

/**
 * Manual diagnostic script for the /models/[slug] quick-facts derivation
 * layer (src/lib/model-sections.ts). Run by hand:
 *
 *   node tests/model-facts.test.js
 *
 * Node >= 23.6 strips TypeScript types natively, so this CJS script can
 * dynamic-import the TS module directly.
 */

const assert = require("assert");
const { register } = require("node:module");
const { pathToFileURL } = require("node:url");
const path = require("node:path");

// Teach Node's ESM resolver to find extensionless .ts imports inside the
// TypeScript sources this script loads (see tests/helpers/resolve-ts-hooks.mjs).
register(
  pathToFileURL(path.join(__dirname, "helpers", "resolve-ts-hooks.mjs"))
);

// Minimal ModelEntry-shaped fixture (only fields the derivations read).
function makeModel(overrides = {}) {
  return {
    id: "m1",
    slug: "test-model",
    name: "Test Model",
    developer: "Test Labs",
    releaseDate: "2025-06-01",
    type: "api-only",
    status: "active",
    featured: false,
    boost: 0,
    family: null,
    modality: [],
    primaryTask: "chat",
    deployment: [],
    license: "Proprietary",
    parameters: "70B",
    contextWindow: "128k",
    description: "A test model.",
    keyFeatures: [],
    benchmarks: [],
    links: {},
    logo: null,
    tags: [],
    sources: [],
    verified: true,
    curatorNotes: "",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

let passed = 0;

async function main() {
  const {
    buildSectionGroups,
    flattenSections,
    CAPABILITY_TAXONOMY,
    groupCapabilities,
    deriveAlwaysOnFacts,
    deriveContextualFacts,
    deriveTopBenchmarks,
    derivePricingHighlights,
    findCheapestPricingIndices,
    formatContextWindow,
  } = await import("../src/lib/model-sections.ts");
  const { normalizePricing } = await import("../src/lib/model-normalization.ts");

  function check(name, fn) {
    try {
      fn();
      passed += 1;
      console.log(`✅ ${name}`);
    } catch (err) {
      console.error(`❌ ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  /* ---------------- buildSectionGroups ---------------- */

  check("buildSectionGroups includes all sections when every flag is true", () => {
    const groups = buildSectionGroups({
      hasKeyFeatures: true,
      hasEditorial: true,
      hasComparable: true,
      hasQuickstart: true,
      hasCustomSections: true,
      hasReadme: true,
      hasEvidence: true,
      hasSources: true,
    });
    const ids = flattenSections(groups).map((s) => s.id);
    assert.deepStrictEqual(ids, [
      "overview",
      "key-features",
      "editorial-analysis",
      "lineage-spec",
      "capabilities",
      "comparable-models",
      "benchmarks",
      "pricing",
      "getting-started",
      "custom-sections",
      "readme-docs",
      "provenance",
      "sources",
    ]);
  });

  check("buildSectionGroups omits flag-gated sections and drops empty groups", () => {
    // Everything gated off leaves only always-present sections; the
    // Understand group still has overview so it survives.
    const sparse = buildSectionGroups({
      hasKeyFeatures: false,
      hasEditorial: false,
      hasComparable: false,
      hasQuickstart: false,
      hasCustomSections: false,
      hasReadme: false,
      hasEvidence: false,
      hasSources: false,
    });
    assert.deepStrictEqual(
      flattenSections(sparse).map((s) => s.id),
      ["overview", "lineage-spec", "capabilities", "benchmarks", "pricing"]
    );
    // Group titles must stay in reading order.
    assert.deepStrictEqual(
      sparse.map((g) => g.title),
      ["Understand", "Evaluate"]
    );
  });

  check("buildSectionGroups keeps anchor ids stable across flag permutations", () => {
    const ids = new Set(
      flattenSections(
        buildSectionGroups({
          hasKeyFeatures: true,
          hasEditorial: false,
          hasComparable: true,
          hasQuickstart: true,
          hasCustomSections: false,
          hasReadme: false,
          hasEvidence: true,
          hasSources: true,
        })
      ).map((s) => s.id)
    );
    for (const id of ids) assert.match(id, /^[a-z-]+$/);
  });

  /* ---------------- capability taxonomy ---------------- */

  check("capability taxonomy has exactly 13 unique keys in 3 categories", () => {
    assert.strictEqual(CAPABILITY_TAXONOMY.length, 13);
    const keys = new Set(CAPABILITY_TAXONOMY.map((d) => d.key));
    assert.strictEqual(keys.size, 13);
    const categories = new Set(CAPABILITY_TAXONOMY.map((d) => d.category));
    assert.deepStrictEqual([...categories].sort(), [
      "Core Intelligence",
      "Developer & System",
      "Multimodal",
    ]);
  });

  check("groupCapabilities counts supported flags per category", () => {
    const capabilities = { reasoning: true, vision_input: true, tool_calling: true };
    const groups = groupCapabilities(capabilities);
    const byCategory = Object.fromEntries(groups.map((g) => [g.category, g]));
    assert.strictEqual(byCategory["Core Intelligence"].supported, 1);
    assert.strictEqual(byCategory["Multimodal"].supported, 1);
    assert.strictEqual(byCategory["Developer & System"].supported, 1);
    assert.strictEqual(
      groups.reduce((sum, g) => sum + g.total, 0),
      13
    );
  });

  check("groupCapabilities handles missing/empty records", () => {
    for (const empty of [undefined, {}, null]) {
      const groups = groupCapabilities(empty);
      assert.strictEqual(groups.length, 3);
      assert.ok(groups.every((g) => g.supported === 0 && g.total > 0));
    }
  });

  /* ---------------- deriveTopBenchmarks ---------------- */

  const bench = (name, score, extra = {}) => ({
    name,
    score,
    verified: true,
    metricType: "performance",
    ...extra,
  });

  check("deriveTopBenchmarks picks best verified performance scores first", () => {
    const top = deriveTopBenchmarks([
      bench("Weak", 10),
      bench("Strong", 96.4),
      bench("Mid", 55),
      bench("Unverified strong", 99, { verified: false }),
      bench("Technical high", 88, { metricType: "technical" }),
    ]);
    assert.deepStrictEqual(top, [
      { name: "Strong", score: "96.4" },
      { name: "Mid", score: "55" },
      { name: "Weak", score: "10" },
    ]);
  });

  check("deriveTopBenchmarks falls back to other verified metrics when no performance rows exist", () => {
    const top = deriveTopBenchmarks([
      bench("Cost rank", 2, { metricType: "economic" }),
      bench("Latency", 120, { metricType: "technical" }),
    ]);
    assert.deepStrictEqual(top, [
      { name: "Latency", score: "120" },
      { name: "Cost rank", score: "2" },
    ]);
  });

  check("deriveTopBenchmarks skips string-only scores and respects the limit", () => {
    const top = deriveTopBenchmarks(
      [
        bench("A", 90),
        bench("B", "N/A"),
        bench("C", 80),
        bench("D", 70),
        bench("E", 60),
      ],
      3
    );
    assert.strictEqual(top.length, 3);
    assert.deepStrictEqual(top.map((t) => t.name), ["A", "C", "D"]);
  });

  check("deriveTopBenchmarks is total over empty and missing inputs", () => {
    assert.deepStrictEqual(deriveTopBenchmarks([]), []);
    assert.deepStrictEqual(deriveTopBenchmarks(undefined), []);
  });

  check("deriveTopBenchmarks trims float noise in scores", () => {
    const top = deriveTopBenchmarks([bench("Noisy", 84.50000000001)]);
    assert.strictEqual(top[0].score, "84.5");
  });

  /* ---------------- derivePricingHighlights ---------------- */

  check("derivePricingHighlights finds cheapest input/output from array pricing", () => {
    const highlights = derivePricingHighlights([
      { unit: "1M input tokens", amount: 3, currency: "USD" },
      { unit: "1M input tokens", amount: 1.5, currency: "USD", tier: "Batch" },
      { unit: "1M output tokens", amount: 15, currency: "USD" },
      { unit: "1M cached input tokens", amount: 0.3, currency: "USD" },
    ]);
    assert.match(highlights.input.value, /^\$1\.50 \/ 1M input tokens$/);
    assert.match(highlights.output.value, /^\$15\.00 \/ 1M output tokens$/);
    assert.strictEqual(highlights.blended, null);
    // Cached-hit rows must never surface as headline rates.
    assert.ok(!JSON.stringify(highlights).includes("cached"));
  });

  check("derivePricingHighlights supports the DB object shape {inputPricePerM,...}", () => {
    const highlights = derivePricingHighlights({
      inputPricePerM: "3",
      cachedInputPricePerM: 0.75,
      outputPricePerM: 15,
    });
    assert.match(highlights.input.value, /^\$3\.00 \/ 1M input tokens$/);
    assert.match(highlights.output.value, /^\$15\.00 \/ 1M output tokens$/);
  });

  check("derivePricingHighlights falls back to blended rate for generic units", () => {
    const highlights = derivePricingHighlights([
      { unit: "1M tokens", amount: 5, currency: "USD" },
      { unit: "1M tokens", amount: 9, currency: "USD" },
    ]);
    assert.match(highlights.blended.value, /^\$5\.00 \/ 1M tokens$/);
    assert.strictEqual(highlights.input, null);
    assert.strictEqual(highlights.output, null);
  });

  check("derivePricingHighlights is total over unpriced models", () => {
    for (const empty of [undefined, null, [], {}, "free"]) {
      const highlights = derivePricingHighlights(empty);
      assert.deepStrictEqual(highlights, { input: null, output: null, blended: null });
    }
  });

  /* ---------------- findCheapestPricingIndices ---------------- */

  check("findCheapestPricingIndices returns cheapest row indices, skipping cached", () => {
    const items = normalizePricing([
      { unit: "1M input tokens", amount: 3, currency: "USD" },
      { unit: "1M input tokens", amount: 1.5, currency: "USD" },
      { unit: "1M cached input tokens", amount: 0.01, currency: "USD" },
      { unit: "1M output tokens", amount: 15, currency: "USD" },
      { unit: "1M output tokens", amount: 12.5, currency: "USD" },
    ]);
    assert.deepStrictEqual(findCheapestPricingIndices(items), { input: 1, output: 4 });
  });

  check("findCheapestPricingIndices handles absent classes and ties (first wins)", () => {
    const items = normalizePricing([
      { unit: "1M tokens", amount: 5, currency: "USD" },
      { unit: "1M input tokens", amount: 2, currency: "USD" },
      { unit: "1M input tokens", amount: 2, currency: "USD" },
    ]);
    const { input } = findCheapestPricingIndices(items);
    assert.strictEqual(input, 1);
  });

  /* ---------------- formatContextWindow ---------------- */

  check("formatContextWindow renders native counts with locale separators", () => {
    assert.strictEqual(formatContextWindow({ native: 200000 }), "200,000 tokens");
    assert.strictEqual(formatContextWindow({ native: 0 }), '{"native":0}');
    assert.strictEqual(formatContextWindow({}), "{}");
    assert.strictEqual(formatContextWindow("1M tokens"), "1M tokens");
    assert.strictEqual(formatContextWindow(undefined), "Undisclosed");
  });

  /* ---------------- deriveAlwaysOnFacts ---------------- */

  check("deriveAlwaysOnFacts reports price-from, context, params, capability count", () => {
    const facts = deriveAlwaysOnFacts(
      makeModel({
        pricing: [{ unit: "1M input tokens", amount: 3, currency: "USD" }],
        contextWindow: { native: 200000 },
        capabilities: { reasoning: true, tool_calling: true, vision_input: false },
      })
    );
    assert.strictEqual(facts.priceFrom, "$3.00 / 1M input tokens");
    assert.strictEqual(facts.contextWindow, "200,000 tokens");
    assert.strictEqual(facts.parameters, "70B");
    assert.strictEqual(facts.capabilitiesSupported, 2);
    assert.strictEqual(facts.capabilitiesTotal, 13);
  });

  check("deriveAlwaysOnFacts omits price and capabilities gracefully", () => {
    const facts = deriveAlwaysOnFacts(makeModel({}));
    assert.strictEqual(facts.priceFrom, null);
    assert.strictEqual(facts.capabilitiesSupported, null);
    assert.strictEqual(facts.contextWindow, "128k");
  });

  /* ---------------- deriveContextualFacts ---------------- */

  check("deriveContextualFacts keys facts by section id", () => {
    const evidence = [
      { confidence: "OFFICIAL" },
      { confidence: "VERIFIED" },
      { confidence: "LIKELY" },
    ];
    const facts = deriveContextualFacts(
      makeModel({
        benchmarks: [bench("GSM8K", 96.8)],
        pricing: [{ unit: "1M input tokens", amount: 3, currency: "USD" }],
        capabilities: { reasoning: true },
        previousVersion: "test-model-1",
      }),
      evidence
    );
    assert.deepStrictEqual(facts.benchmarks, [{ label: "GSM8K", value: "96.8" }]);
    assert.ok(facts.pricing.length >= 1);
    assert.strictEqual(facts.capabilities[0].value, "1 of 13");
    assert.ok(facts["lineage-spec"].some((f) => f.label === "Released"));
    assert.ok(facts["lineage-spec"].some((f) => f.value === "test-model-1"));
    assert.strictEqual(facts.provenance[0].value, "3");
    assert.ok(facts.provenance.some((f) => f.label === "Official sources"));
  });

  check("deriveContextualFacts is total over degenerate records", () => {
    // No benchmarks/pricing/capabilities/read-date/evidence → no facts at all.
    assert.deepStrictEqual(
      deriveContextualFacts(makeModel({ releaseDate: "" }), []),
      {}
    );
  });
}

main()
  .then(() => {
    console.log(`\n${passed} checks passed`);
    if (process.exitCode) {
      console.error("SOME CHECKS FAILED");
    } else {
      console.log("All model-facts checks passed.");
    }
  })
  .catch((err) => {
    console.error("Failed to load model-sections module:", err);
    process.exitCode = 1;
  });
