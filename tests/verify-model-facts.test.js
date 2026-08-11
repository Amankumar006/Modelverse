const assert = require("assert");
const {
  isPricingWithinTolerance,
  isBenchmarkWithinTolerance,
  isParamWithinTolerance,
} = require("./verify-model-facts");

console.log("🧪 Running unit tests for verification engine tolerance bands...");

// 1. Pricing Tolerance Tests (±10%)
assert.strictEqual(isPricingWithinTolerance(0.50, 0.52), true, "$0.50 vs $0.52 (4% diff) should be within tolerance");
assert.strictEqual(isPricingWithinTolerance(0.50, 0.54), true, "$0.50 vs $0.54 (7.4% diff) should be within tolerance");
assert.strictEqual(isPricingWithinTolerance(0.50, 0.75), false, "$0.50 vs $0.75 (33% diff) should fail tolerance and trigger DISPUTED");

// 2. Benchmark Score Tolerance Tests (±2.0 pts)
assert.strictEqual(isBenchmarkWithinTolerance(84.5, 85.8), true, "84.5 vs 85.8 (1.3 pts diff) should be within tolerance");
assert.strictEqual(isBenchmarkWithinTolerance(84.5, 88.0), false, "84.5 vs 88.0 (3.5 pts diff) should trigger DISPUTED");

// 3. Parameter Count Tolerance Tests (±15%)
assert.strictEqual(isParamWithinTolerance("70B", "70.6B"), true, "70B vs 70.6B should be within tolerance");
assert.strictEqual(isParamWithinTolerance("70B", "8B"), false, "70B vs 8B should trigger DISPUTED");

console.log("✅ All tolerance band unit tests passed successfully!");
