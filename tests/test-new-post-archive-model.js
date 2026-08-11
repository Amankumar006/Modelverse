const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { verifyModelEntry } = require("./verify-model-facts");

console.log("🧪 Testing New Post-Archive Model Ingestion & Verification Fallback...");

async function testNewModelFallback() {
  // Candidate representing a newly released 2026 model not present in the archived HF leaderboard
  const newModelCandidate = {
    id: "_test-new-2026-model",
    name: "Brand New 2026 Model 70B",
    slug: "brand-new-2026-model-70b",
    developer: "DeepSeek",
    releaseDate: "2026-07-31",
    updatedAt: "2026-07-31",
    type: "open-weights",
    status: "active",
    modality: ["text"],
    primaryTask: "chat-reasoning",
    deployment: ["self-hostable"],
    license: "MIT",
    parameters: "671B",
    contextWindow: "128k",
    description: "Newly released 2026 model post-dating the HF Leaderboard archive.",
    keyFeatures: ["Feature 1"],
    benchmarks: [{ name: "GPQA", score: "55.0", verified: false }],
    pricing: [],
    links: { huggingface: "https://huggingface.co/deepseek-ai/DeepSeek-V3" },
    logo: null,
    tags: ["open-weights"],
    sources: ["https://huggingface.co/deepseek-ai/DeepSeek-V3"],
    verified: false,
    verificationStatus: "DRAFT"
  };

  const { modelData, modelStatus } = await verifyModelEntry(newModelCandidate);

  console.log("   Field Confidence:", modelData.fieldConfidence);
  console.log("   Overall Verification Status:", modelStatus);

  // Assertions
  assert(modelStatus === "DRAFT" || modelStatus === "LIKELY", "New model with uncorroborated benchmarks must sit at DRAFT/LIKELY");
  assert.strictEqual(modelData.verified, false, "verified flag must be false");
  assert.strictEqual(modelData.needsReview, true, "needsReview must be true to route candidate to /admin/review");

  console.log("✅ Soft-null Fallback Test PASSED: New post-archive model degraded gracefully and routed to /admin/review!");
}

testNewModelFallback();
