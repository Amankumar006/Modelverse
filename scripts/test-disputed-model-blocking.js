const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { verifyModelEntry, runVerificationPipeline } = require("./verify-model-facts");

const PENDING_DIR = path.join(process.cwd(), "data", "models-pending");
const PROD_DIR = path.join(process.cwd(), "data", "models");
const TEST_FILE = "_test-disputed-model.json";
const PENDING_PATH = path.join(PENDING_DIR, TEST_FILE);
const PROD_PATH = path.join(PROD_DIR, TEST_FILE);

console.log("🧪 Running End-to-End DISPUTED Model Blocking Test...");

// Create candidate with conflicting pricing data (inputPrice: $0.50 vs mock source $50.00)
const candidateModel = {
  id: "_test-disputed-model",
  name: "Test Disputed Model 70B",
  slug: "test-disputed-model-70b",
  developer: "Meta",
  releaseDate: "2026-07-31",
  updatedAt: "2026-07-31",
  type: "open-weights",
  status: "active",
  modality: ["text"],
  primaryTask: "chat-reasoning",
  deployment: ["self-hostable"],
  license: "MIT",
  parameters: "70B",
  contextWindow: "128k",
  description: "Test disputed model for end-to-end blocking verification.",
  keyFeatures: ["Test feature"],
  benchmarks: [{ name: "GPQA", score: "50.0", verified: false }],
  pricing: [{ tier: "standard", unit: "1M tokens", amount: 0.50, currency: "USD" }],
  links: { huggingface: "https://huggingface.co/meta-llama/Llama-3-70b" },
  logo: null,
  tags: ["open-weights"],
  sources: ["https://example.com"],
  verified: false,
  verificationStatus: "DRAFT",
  needsReview: true,
  curatorNotes: "Automated test model for DISPUTED status."
};

fs.writeFileSync(PENDING_PATH, JSON.stringify(candidateModel, null, 2), "utf-8");

async function runTest() {
  try {
    await runVerificationPipeline();

    // 1. Assert that the disputed file stays in data/models-pending/
    assert(fs.existsSync(PENDING_PATH), "Disputed model should remain in data/models-pending/");

    // 2. Assert that the file was NEVER created in production data/models/
    assert(!fs.existsSync(PROD_PATH), "Disputed model MUST NOT be promoted to data/models/");

    // 3. Read back pending file and check verificationStatus
    const updated = JSON.parse(fs.readFileSync(PENDING_PATH, "utf-8"));
    assert.strictEqual(updated.verified, false, "verified flag must remain false");
    assert.strictEqual(updated.needsReview, true, "needsReview must be true for DISPUTED item");

    console.log("✅ End-to-end DISPUTED blocking test PASSED: Disputed model was blocked from production!");
  } finally {
    if (fs.existsSync(PENDING_PATH)) fs.unlinkSync(PENDING_PATH);
    if (fs.existsSync(PROD_PATH)) fs.unlinkSync(PROD_PATH);
  }
}

runTest();
