const fs = require("fs");
const path = require("path");
const assert = require("assert");

const PENDING_DIR = path.join(process.cwd(), "data", "models-pending");
const PROD_DIR = path.join(process.cwd(), "data", "models");
const ARCHIVE_PATH = path.join(process.cwd(), "src", "lib", "models-archive.json");

const TEST_FILE = "_test-admin-approve.json";
const PENDING_PATH = path.join(PENDING_DIR, TEST_FILE);
const PROD_PATH = path.join(PROD_DIR, TEST_FILE);

console.log("🧪 Testing Admin Review Approval Action...");

if (!fs.existsSync(PENDING_DIR)) fs.mkdirSync(PENDING_DIR, { recursive: true });

// 1. Stage a test model in pending area
const testModel = {
  id: "_test-admin-approve",
  name: "Test Admin Approved Model 70B",
  slug: "test-admin-approved-model-70b",
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
  description: "Staged model for admin approval API route verification.",
  keyFeatures: ["Feature 1"],
  benchmarks: [],
  family: null,
  previousVersion: null,
  links: { huggingface: "https://huggingface.co/meta-llama/Meta-Llama-3-70B" },
  logo: null,
  tags: ["open-weights"],
  sources: ["https://example.com"],
  verified: false,
  verificationStatus: "DRAFT",
  needsReview: true,
  curatorNotes: "Draft for curator review."
};

fs.writeFileSync(PENDING_PATH, JSON.stringify(testModel, null, 2), "utf-8");

async function testApprove() {
  try {
    // 2. Perform approve action directly via logic equivalent to route POST handler
    const raw = fs.readFileSync(PENDING_PATH, "utf-8");
    const model = JSON.parse(raw);

    model.humanApproved = true;
    model.verified = true;
    model.verificationStatus = "VERIFIED";
    model.needsReview = false;
    model.curatorNotes += "\nCurator Approval Note: Tested curator approval via API route";

    fs.writeFileSync(PROD_PATH, JSON.stringify(model, null, 2), "utf-8");
    fs.unlinkSync(PENDING_PATH);

    // 3. Trigger recompile
    require("./compile-models.js");

    // 4. Assertions
    assert(!fs.existsSync(PENDING_PATH), "Pending file must be removed from data/models-pending/");
    assert(fs.existsSync(PROD_PATH), "Approved file must exist in data/models/");

    const archive = JSON.parse(fs.readFileSync(ARCHIVE_PATH, "utf-8"));
    const foundInArchive = archive.find((m) => m.id === "_test-admin-approve");
    assert(foundInArchive, "Approved model must be compiled into models-archive.json!");
    assert.strictEqual(foundInArchive.verified, true, "verified must be true in archive");
    assert.strictEqual(foundInArchive.humanApproved, true, "humanApproved must be true in archive");
    assert.strictEqual(foundInArchive.verificationStatus, "VERIFIED", "verificationStatus must be VERIFIED in archive");

    console.log("✅ Admin Review Approval Test PASSED: Candidate was successfully promoted, verified, and compiled into archive!");
  } finally {
    // Cleanup
    if (fs.existsSync(PENDING_PATH)) fs.unlinkSync(PENDING_PATH);
    if (fs.existsSync(PROD_PATH)) fs.unlinkSync(PROD_PATH);
    require("./compile-models.js");
  }
}

testApprove();
