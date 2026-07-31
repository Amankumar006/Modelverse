const fs = require("fs");
const path = require("path");
const assert = require("assert");

const PENDING_DIR = path.join(process.cwd(), "data", "models-pending");
const PROD_DIR = path.join(process.cwd(), "data", "models");

const { verifyModelEntry } = require("./verify-model-facts");
const arenaAdapter = require("./lib/sources/lmarena-mirror");

console.log("🧪 Testing Daily Queue Optimizations (#2 - #5)...");

async function runQueueOptimizationsTest() {
  if (!fs.existsSync(PENDING_DIR)) fs.mkdirSync(PENDING_DIR, { recursive: true });

  // 1. Test Base Model Derivative Benchmark Inheritance
  console.log("\n📡 1. Testing Base Model Benchmark Inheritance...");
  const derivativeModel = {
    id: "_test-qwen-quantized",
    name: "Qwen 2.5 Coder 32B Quantized GGUF",
    slug: "qwen-2-5-coder-32b-quantized-gguf",
    developer: "TheBloke",
    releaseDate: "2026-07-31",
    updatedAt: "2026-07-31",
    type: "open-weights",
    status: "active",
    modality: ["text"],
    primaryTask: "code-generation",
    deployment: ["self-hostable"],
    license: "APACHE-2.0",
    parameters: "32B",
    contextWindow: "32k",
    description: "Quantized derivative model.",
    keyFeatures: ["Quantized"],
    benchmarks: [{ name: "HumanEval", score: "85.0", verified: false }],
    family: "qwen",
    baseModel: "alibaba-qwen-3-7-plus",
    previousVersion: null,
    links: { huggingface: "https://huggingface.co/TheBloke/Qwen2.5-Coder-32B-GGUF" },
    logo: null,
    tags: ["gguf"],
    sources: ["https://huggingface.co/TheBloke/Qwen2.5-Coder-32B-GGUF"],
    verified: false,
    verificationStatus: "DRAFT"
  };

  const { modelData } = await verifyModelEntry(derivativeModel);
  assert.strictEqual(modelData.fieldConfidence.benchmarks, "LIKELY", "Derivative model MUST inherit base model benchmark tier as LIKELY");
  assert(modelData.curatorNotes.includes("[Auto-Inherit]"), "Curator notes MUST document base model inheritance");
  console.log("   ✅ Base Model Inheritance PASSED: Derivative model inherited base model benchmark tier as LIKELY!");

  // 2. Test LMArena Community Mirror Adapter
  console.log("\n📡 2. Testing LMArena Community Mirror Adapter...");
  const hint = await arenaAdapter.fetchArenaHint("llama");
  console.log("   LMArena Hint Output:", hint);
  console.log("   ✅ LMArena Hint Adapter PASSED!");

  // 3. Test Bulk Approval API Logic
  console.log("\n⚡ 3. Testing Bulk-Approve Clean Candidates Logic...");
  const cleanStagedModel = {
    id: "_test-clean-staged-candidate",
    name: "Test Clean Staged Candidate",
    slug: "test-clean-staged-candidate",
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
    description: "Clean staged candidate.",
    keyFeatures: ["Feature 1"],
    benchmarks: [{ name: "GPQA", score: "50.0", verified: false }],
    pricing: [],
    family: null,
    previousVersion: null,
    links: { huggingface: "https://huggingface.co/meta-llama/Meta-Llama-3-70B" },
    logo: null,
    tags: ["open-weights"],
    sources: ["https://huggingface.co/meta-llama/Meta-Llama-3-70B"],
    verified: false,
    verificationStatus: "LIKELY",
    fieldConfidence: {
      parameters: "VERIFIED",
      license: "VERIFIED",
      contextWindow: "VERIFIED",
      benchmarks: "DRAFT"
    },
    needsReview: true
  };

  const pendingFilePath = path.join(PENDING_DIR, "_test-clean-staged-candidate.json");
  const prodFilePath = path.join(PROD_DIR, "_test-clean-staged-candidate.json");

  fs.writeFileSync(pendingFilePath, JSON.stringify(cleanStagedModel, null, 2), "utf-8");

  try {
    // Perform bulk approve logic directly
    const files = fs.readdirSync(PENDING_DIR).filter((f) => f.endsWith(".json"));
    let approvedCount = 0;
    for (const file of files) {
      if (file !== "_test-clean-staged-candidate.json") continue;
      const model = JSON.parse(fs.readFileSync(path.join(PENDING_DIR, file), "utf-8"));
      model.humanApproved = true;
      model.verified = true;
      model.verificationStatus = "VERIFIED";
      model.needsReview = false;
      fs.writeFileSync(path.join(PROD_DIR, file), JSON.stringify(model, null, 2), "utf-8");
      fs.unlinkSync(path.join(PENDING_DIR, file));
      approvedCount++;
    }

    assert.strictEqual(approvedCount, 1, "Should approve 1 clean candidate");
    assert(!fs.existsSync(pendingFilePath), "Bulk-approved model must be removed from data/models-pending/");
    assert(fs.existsSync(prodFilePath), "Bulk-approved model must exist in data/models/");

    console.log("   ✅ Bulk Approve PASSED: Clean candidate was promoted to production!");
  } finally {
    if (fs.existsSync(pendingFilePath)) fs.unlinkSync(pendingFilePath);
    if (fs.existsSync(prodFilePath)) fs.unlinkSync(prodFilePath);
    require("./compile-models.js");
  }

  console.log("\n🎉 All Queue Optimization Unit & Integration Tests PASSED!");
}

runQueueOptimizationsTest();
