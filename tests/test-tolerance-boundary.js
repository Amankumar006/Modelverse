const fs = require("fs");
const path = require("path");
const assert = require("assert");
const {
  isPricingWithinTolerance,
  isBenchmarkWithinTolerance,
  verifyModelEntry
} = require("../scripts/verify-model-facts");

console.log("🧪 Testing Tolerance Boundary Cases (Edge of Band)...");

// 1. Pricing Boundary Checks (±10% band)
assert.strictEqual(isPricingWithinTolerance(0.50, 0.54), true, "0.50 vs 0.54 (8% diff) MUST pass within tolerance");
assert.strictEqual(isPricingWithinTolerance(0.50, 0.56), false, "0.50 vs 0.56 (12% diff) MUST fail tolerance & trigger DISPUTED");

// 2. Benchmark Boundary Checks (±2.0 pts band)
assert.strictEqual(isBenchmarkWithinTolerance(84.0, 85.8), true, "84.0 vs 85.8 (1.8 pts diff) MUST pass within tolerance");
assert.strictEqual(isBenchmarkWithinTolerance(84.0, 86.2), false, "84.0 vs 86.2 (2.2 pts diff) MUST fail tolerance & trigger DISPUTED");

// 3. Dual-source tolerance boundary checks (8% gap vs 12% gap)
assert.strictEqual(isPricingWithinTolerance(0.50, 0.54), true, "8% gap ($0.50 vs $0.54) is within 10% tolerance -> VERIFIED");
assert.strictEqual(isPricingWithinTolerance(0.50, 0.56), false, "12% gap ($0.50 vs $0.56) exceeds 10% tolerance -> DISPUTED");

console.log("✅ Tolerance Boundary Cases Test PASSED cleanly!");
