"use strict";

const assert = require("assert");
const { scoreDeepDiveEligibility, isUnderDailyDeepDiveCap } = require("../scripts/news/deep-dive-gate");
const { buildExplainerPrompt, validateMermaidBlocks } = require("../scripts/news/generate-explainer-prompt");
const { scoreDeepDiveExtras, checkPedagogicalStructure, checkTakeawaysBulletCount, checkAnalogyPresence } = require("../scripts/quality/deep-dive-quality-checks");
const { scoreNewsArticle } = require("../scripts/quality/score-content");

async function runTests() {
  console.log("=== 1. TESTING DEEP-DIVE BREAKTHROUGH GATE ===");

  // Candidate 1: MLA Architecture Breakthrough from DeepSeek
  const mlaStory = {
    title: "DeepSeek Introduces Multi-Head Latent Attention (MLA) Architecture",
    lab: "DeepSeek",
    description: "DeepSeek unveils Multi-Head Latent Attention (MLA) and DeepSeekMoE with FP8 low-precision training to drastically reduce KV-cache memory during inference.",
  };
  const mlaResult = scoreDeepDiveEligibility(mlaStory, 9);
  console.log("MLA Story Gate Result:", mlaResult);
  assert.strictEqual(mlaResult.eligible, true, "MLA story must be eligible for deep-dive");
  assert(mlaResult.matchedSignals.includes("architecture"), "Must match architecture signal");
  assert(mlaResult.matchedSignals.includes("systems"), "Must match systems signal");

  // Candidate 2: Minor Patch (Should be rejected)
  const patchStory = {
    title: "Anthropic Releases Minor Bugfix and Pricing Update v2.1.3",
    lab: "Anthropic",
    description: "Minor patch fixing tokenizer error and pricing update.",
  };
  const patchResult = scoreDeepDiveEligibility(patchStory, 4);
  console.log("Patch Story Gate Result:", patchResult);
  assert.strictEqual(patchResult.eligible, false, "Patch story must be disqualified");

  console.log("\n=== 2. TESTING MERMAID BLOCK VALIDATION ===");

  const validMermaid = `
Here is the text:
\`\`\`mermaid
flowchart TD
  A[Input Tokens] --> B[Low-Rank Latent Compression]
  B --> C[Decoupled Rotary Position Embedding]
  C --> D[Multi-Head Latent KV Cache]
\`\`\`
More text...
`;
  const valResult = validateMermaidBlocks(validMermaid);
  console.log("Valid Mermaid Result:", valResult);
  assert.strictEqual(valResult.valid, true, "Valid flowchart must pass validation");
  assert.strictEqual(valResult.diagrams.length, 1);

  const brokenMermaid = `
\`\`\`mermaid
flowchart TD
  A[Input Tokens --> B(Unclosed bracket
\`\`\`
`;
  const brokenResult = validateMermaidBlocks(brokenMermaid);
  console.log("Broken Mermaid Result:", brokenResult);
  assert.strictEqual(brokenResult.valid, false, "Unbalanced bracket must fail validation");

  console.log("\n=== 3. TESTING PEDAGOGICAL STRUCTURE & SCORING ===");

  const sampleDeepDiveMarkdown = `
# DeepSeek Multi-Head Latent Attention: Demystifying the KV-Cache Compression Breakthrough

## The Intuitive Mental Model
Think of standard self-attention like a library where every student keeps a complete duplicate copy of every encyclopedia on their desk. Multi-Head Latent Attention (MLA) works like an ultra-efficient central index card catalog: instead of storing massive uncompressed key-value tensors for every token across all attention heads, it projects them into a compact latent subspace.

## The Traditional Bottleneck
Standard Multi-Head Attention (MHA) suffers from catastrophic memory expansion at 128k context lengths. The Key-Value (KV) cache grows linearly with sequence length and batch size, rapidly exhausting high-bandwidth GPU memory (HBM).

## Under the Hood: How It Actually Works
MLA compresses the keys and values into a shared low-rank latent vector before caching. During generation, queries are transformed to compute attention directly against the compressed representation.

\`\`\`mermaid
flowchart LR
  Input[Hidden State] --> Compress[Down-Projection Latent Vector]
  Compress --> Cache[(Compressed KV Cache)]
  Cache --> Decompress[Up-Projection Attention Heads]
\`\`\`

## Empirical Evidence
DeepSeek-V3 technical report demonstrates a 93.3% reduction in KV-cache memory consumption compared to standard MHA. On standard benchmarks, SWE-bench Verified reached 49.2% while inference throughput increased by 3.8x on H800 clusters.

## Engineering Trade-Offs
While MLA drastically reduces HBM capacity requirements, it introduces extra matrix multiplications during up-projection. For developers running open-weights locally, MLA models can fit long contexts onto consumer RTX 4090 GPUs without offloading to CPU memory.

## Key Takeaways
- MLA compresses KV-cache tensors by over 90% via low-rank latent projections without sacrificing reasoning capability.
- Decoupled RoPE enables rotary embeddings to be applied without expanding the compressed cache footprint.
- Developers can host 128k-context reasoning models on significantly smaller GPU clusters with 3.8x higher throughput.

---

### Sources & Citations
- [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437) — *Official Announcement*
- [SemiAnalysis DeepSeek Architecture Breakdown](https://semianalysis.com) — *Independent Analysis*
`.repeat(5); // Inflate to ~1,500 words

  const wordCount = sampleDeepDiveMarkdown.trim().split(/\s+/).length;
  console.log("Sample article word count:", wordCount);

  const mockDeepDiveArticle = {
    title: "DeepSeek Multi-Head Latent Attention",
    article_type: "deep-dive",
    body: sampleDeepDiveMarkdown,
    sources: [
      { url: "https://arxiv.org/abs/2412.19437", domain: "arxiv.org", sourceType: "official_primary" },
      { url: "https://semianalysis.com/deepseek", domain: "semianalysis.com", sourceType: "independent_coverage" },
    ],
    has_diagram: true,
  };

  const gateResult = scoreNewsArticle(mockDeepDiveArticle, [
    "DeepSeek technical report on Multi-Head Latent Attention. We introduce MLA to compress the KV cache.",
    "SemiAnalysis breakdown of DeepSeek MoE and MLA architectural innovations in frontier models.",
  ]);

  console.log("Quality Gate Score on Deep-Dive Article:", gateResult);
  assert(gateResult.score >= 55, `Score must be >= 55, got ${gateResult.score}`);
  assert.strictEqual(gateResult.status, "indexed", `Status must be indexed, got ${gateResult.status}`);

  console.log("\n✅ ALL DEEP-DIVE UNIT & INTEGRATION TESTS PASSED CLEANLY!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
