/**
 * Cross-Source Verification Engine for Modelverse
 * 
 * Compares pending model entries in data/models-pending/ against independent sources:
 * - artificial-analysis.js (pricing, benchmarks)
 * - openrouter.js (pricing, contextWindow)
 * - huggingface.js (hub metadata + Open LLM Leaderboard)
 * 
 * Enforces per-field trust tiers:
 * - VERIFIED: 2+ independent sources agree (within tolerance), or humanApproved override
 * - LIKELY: 1 independent source confirmed
 * - DRAFT: 0 sources / unconfirmed draft data
 * - DISPUTED: 2+ sources actively disagree outside tolerance limits (BLOCKS auto-publish)
 */

const fs = require("fs");
const path = require("path");

const aaSource = require("./lib/sources/artificial-analysis");
const orSource = require("./lib/sources/openrouter");
const hfSource = require("./lib/sources/huggingface");

const PENDING_DIR = path.join(process.cwd(), "data", "models-pending");
const PROD_DIR = path.join(process.cwd(), "data", "models");

// Ensure directories exist
if (!fs.existsSync(PENDING_DIR)) fs.mkdirSync(PENDING_DIR, { recursive: true });
if (!fs.existsSync(PROD_DIR)) fs.mkdirSync(PROD_DIR, { recursive: true });

// ─── Tolerance Comparison Helpers ───

function isPricingWithinTolerance(val1, val2, tolerancePercent = 0.10) {
  if (val1 === null || val2 === null || val1 === undefined || val2 === undefined) return false;
  const n1 = parseFloat(val1);
  const n2 = parseFloat(val2);
  if (isNaN(n1) || isNaN(n2)) return false;
  if (n1 === 0 && n2 === 0) return true;
  const maxVal = Math.max(Math.abs(n1), Math.abs(n2));
  if (maxVal === 0) return true;
  const diffPercent = Math.abs(n1 - n2) / maxVal;
  return diffPercent <= tolerancePercent;
}

function isBenchmarkWithinTolerance(val1, val2, tolerancePts = 2.0) {
  if (val1 === null || val2 === null || val1 === undefined || val2 === undefined) return false;
  const n1 = parseFloat(val1);
  const n2 = parseFloat(val2);
  if (isNaN(n1) || isNaN(n2)) return false;
  return Math.abs(n1 - n2) <= tolerancePts;
}

function parseParamFloat(paramStr) {
  if (!paramStr) return null;
  const match = String(paramStr).match(/([\d\.]+)\s*([BMTbmt]?)/);
  if (!match) return null;
  let num = parseFloat(match[1]);
  const unit = (match[2] || "").toUpperCase();
  if (unit === "M") num = num * 1e6;
  if (unit === "B") num = num * 1e9;
  if (unit === "T") num = num * 1e12;
  return num;
}

function isParamWithinTolerance(val1, val2) {
  const p1 = parseParamFloat(val1);
  const p2 = parseParamFloat(val2);
  if (!p1 || !p2) return false;
  const maxVal = Math.max(p1, p2);
  return Math.abs(p1 - p2) / maxVal <= 0.15; // 15% tolerance for params (e.g. 70B vs 70.6B)
}

// ─── Per-Field Verification Engine ───

async function verifyModelEntry(modelData) {
  console.log(`\n🔍 Verifying pending model: ${modelData.name} (${modelData.id})...`);

  // Fetch facts from all sources concurrently
  const [aaData, orData, hfData] = await Promise.all([
    aaSource.fetchModel(modelData.name, modelData.developer),
    orSource.fetchModel(modelData.name, modelData.developer),
    hfSource.fetchModel(modelData.name, modelData.developer, modelData.links?.huggingface?.replace("https://huggingface.co/", "")),
  ]);

  const fieldConfidence = modelData.fieldConfidence || {};
  let overallDisputed = false;

  // 1. Pricing Verification
  if (modelData.pricing && modelData.pricing.length > 0) {
    const draftPrice = modelData.pricing[0]?.amount;
    const sourcesWithPricing = [];

    if (aaData?.pricing?.inputPricePerM != null) sourcesWithPricing.push({ name: "artificial-analysis", val: aaData.pricing.inputPricePerM });
    if (orData?.pricing?.inputPricePerM != null) sourcesWithPricing.push({ name: "openrouter", val: orData.pricing.inputPricePerM });

    if (sourcesWithPricing.length >= 2) {
      const match = isPricingWithinTolerance(sourcesWithPricing[0].val, sourcesWithPricing[1].val);
      if (match) {
        fieldConfidence.pricing = "VERIFIED";
      } else {
        fieldConfidence.pricing = "DISPUTED";
        overallDisputed = true;
      }
    } else if (sourcesWithPricing.length === 1) {
      const match = draftPrice != null ? isPricingWithinTolerance(draftPrice, sourcesWithPricing[0].val) : true;
      fieldConfidence.pricing = match ? "LIKELY" : "DISPUTED";
      if (!match) overallDisputed = true;
    } else {
      fieldConfidence.pricing = modelData.humanApproved ? "VERIFIED" : "DRAFT";
    }
  }

  // 2. Benchmarks Verification
  if (modelData.benchmarks && modelData.benchmarks.length > 0) {
    const aaBm = aaData?.benchmarks?.gpqa || aaData?.benchmarks?.humanEval;
    const hfBm = hfData?.benchmarks?.gpqa || hfData?.benchmarks?.mmlu;

    if (aaBm != null && hfBm != null) {
      const match = isBenchmarkWithinTolerance(aaBm, hfBm);
      fieldConfidence.benchmarks = match ? "VERIFIED" : "DISPUTED";
      if (!match) overallDisputed = true;
    } else if (aaBm != null || hfBm != null) {
      fieldConfidence.benchmarks = "LIKELY";
    } else {
      // Base Model Derivative Inheritance Check (Exact Lookup Only)
      let inheritedFromBase = false;
      const baseSlug = modelData.baseModel || modelData.previousVersion;
      if (baseSlug) {
        const prodFiles = fs.existsSync(PROD_DIR) ? fs.readdirSync(PROD_DIR) : [];
        for (const file of prodFiles) {
          if (!file.endsWith(".json")) continue;
          try {
            const baseData = JSON.parse(fs.readFileSync(path.join(PROD_DIR, file), "utf-8"));
            const isExactMatch = baseData.slug === baseSlug || baseData.id === baseSlug;
            const isVerifiedParent = baseData.verified === true && 
              (baseData.verificationStatus === "VERIFIED" || baseData.humanApproved === true || baseData.isLegacyCurated === true);

            if (isExactMatch && isVerifiedParent) {
              inheritedFromBase = true;
              break;
            }
          } catch (e) {}
        }
      }

      if (inheritedFromBase) {
        fieldConfidence.benchmarks = "LIKELY";
        modelData.curatorNotes = (modelData.curatorNotes || "") + `\n[Auto-Inherit] Benchmark score tier set to LIKELY derived from verified base model (${baseSlug}).`;
      } else {
        fieldConfidence.benchmarks = modelData.humanApproved ? "VERIFIED" : "DRAFT";
      }
    }
  }

  // 3. Context Window Verification
  if (modelData.contextWindow && modelData.contextWindow !== "unknown") {
    const orCw = orData?.contextWindow;
    const aaCw = aaData?.contextWindow;
    if (orCw && aaCw) {
      fieldConfidence.contextWindow = (orCw === aaCw) ? "VERIFIED" : "DISPUTED";
      if (orCw !== aaCw) overallDisputed = true;
    } else if (orCw || aaCw) {
      fieldConfidence.contextWindow = "LIKELY";
    } else {
      fieldConfidence.contextWindow = modelData.humanApproved ? "VERIFIED" : "DRAFT";
    }
  }

  // 4. Parameters Verification
  if (modelData.parameters) {
    const hfParams = hfData?.parameters;
    if (hfParams) {
      const match = isParamWithinTolerance(modelData.parameters, hfParams);
      fieldConfidence.parameters = match ? "LIKELY" : "DISPUTED"; // HF is single source for params, so LIKELY max unless human-approved
      if (modelData.humanApproved) fieldConfidence.parameters = "VERIFIED";
    } else {
      fieldConfidence.parameters = modelData.humanApproved ? "VERIFIED" : "DRAFT";
    }
  }

  // Override: If human approved, human retains final authority
  if (modelData.humanApproved) {
    for (const key of Object.keys(fieldConfidence)) {
      if (fieldConfidence[key] !== "DISPUTED") {
        fieldConfidence[key] = "VERIFIED";
      }
    }
  }

  // Overall Model Status Determination
  const statuses = Object.values(fieldConfidence);
  let modelStatus = "DRAFT";
  if (overallDisputed || statuses.includes("DISPUTED")) {
    modelStatus = "DISPUTED";
  } else if (statuses.length > 0 && statuses.every((s) => s === "VERIFIED")) {
    modelStatus = "VERIFIED";
  } else if (statuses.includes("LIKELY") || statuses.includes("VERIFIED")) {
    modelStatus = "LIKELY";
  }

  modelData.fieldConfidence = fieldConfidence;
  modelData.verificationStatus = modelStatus;
  modelData.verified = (modelStatus === "VERIFIED" || modelData.humanApproved === true);
  modelData.needsReview = (modelStatus === "DISPUTED" || modelStatus === "DRAFT" || !modelData.verified);

  return { modelData, modelStatus };
}

// ─── Main Verification & Staging Processing ───

async function runVerificationPipeline() {
  console.log("🚀 Starting Cross-Source Verification Engine...");

  const pendingFiles = fs.readdirSync(PENDING_DIR).filter((f) => f.endsWith(".json"));
  console.log(`📂 Found ${pendingFiles.length} pending models in data/models-pending/`);

  let promotedCount = 0;
  let disputedCount = 0;
  let pendingCount = 0;

  for (const file of pendingFiles) {
    const pendingPath = path.join(PENDING_DIR, file);
    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(pendingPath, "utf-8"));
    } catch (e) {
      console.error(`❌ Failed parsing JSON ${file}:`, e.message);
      continue;
    }

    const { modelData, modelStatus } = await verifyModelEntry(raw);

    if (modelStatus === "VERIFIED" || modelData.humanApproved) {
      // Move to production data/models/
      const prodPath = path.join(PROD_DIR, file);
      fs.writeFileSync(prodPath, JSON.stringify(modelData, null, 2), "utf-8");
      fs.unlinkSync(pendingPath);
      promotedCount++;
      console.log(`✅ PROMOTED to Production: ${modelData.name} -> data/models/${file}`);
    } else {
      // Save back to pending staging area
      fs.writeFileSync(pendingPath, JSON.stringify(modelData, null, 2), "utf-8");
      if (modelStatus === "DISPUTED") {
        disputedCount++;
        console.warn(`🚨 DISPUTED (Blocked): ${modelData.name} has conflicting source facts!`);
      } else {
        pendingCount++;
        console.log(`⏳ STAGED (Needs Verification/Review): ${modelData.name} [Status: ${modelStatus}]`);
      }
    }
  }

  console.log("\n📊 Verification Pipeline Summary:");
  console.log(` - Promoted to Live Production: ${promotedCount}`);
  console.log(` - Disputed (Flagged & Blocked): ${disputedCount}`);
  console.log(` - Pending Staging: ${pendingCount}`);
}

// Allow CLI execution or module import
if (require.main === module) {
  runVerificationPipeline().catch((err) => {
    console.error("❌ Verification Engine Error:", err);
    process.exit(1);
  });
}

module.exports = {
  verifyModelEntry,
  runVerificationPipeline,
  isPricingWithinTolerance,
  isBenchmarkWithinTolerance,
  isParamWithinTolerance,
};
