"use strict";

/**
 * tests/test-dispute-guard.test.js
 *
 * Policy contract for scripts/lib/verification-stamp.js — the single rule
 * every approval path (approveModel, approveModels, approveStaged) uses to
 * stamp models.verified / verification_status.
 *
 * Regression guard for the 2026-08-25 incident: the legacy editor's Approve
 * & Publish flipped an intentionally-DISPUTED model to LIKELY with one click,
 * re-listing a card the catalog had deliberately withheld. Run:
 *   node tests/test-dispute-guard.test.js
 */

const assert = require("assert");
const { resolveVerificationStamp } = require("../scripts/lib/verification-stamp");

let passed = 0;
function check(name, fn) {
  fn();
  passed++;
  console.log(`  ✅ ${name}`);
}

console.log("\n=== Dispute guard policy tests ===\n");

// --- The incident case: DISPUTED must survive approval, whatever the gate says ---
check("DISPUTED + failing gate (thin) stays DISPUTED, unverified", () => {
  const s = resolveVerificationStamp("DISPUTED", false, "thin");
  assert.strictEqual(s.verification_status, "DISPUTED");
  assert.strictEqual(s.verified, false);
  assert.strictEqual(s.disputePreserved, true);
});

check("DISPUTED + passing gate (indexed) STILL stays DISPUTED", () => {
  const s = resolveVerificationStamp("DISPUTED", false, "indexed");
  assert.strictEqual(s.verification_status, "DISPUTED");
  assert.strictEqual(s.verified, false);
  assert.strictEqual(s.disputePreserved, true);
});

check("DISPUTED preserves a pre-existing verified=true flag rather than clobbering", () => {
  const s = resolveVerificationStamp("DISPUTED", true, "thin");
  assert.strictEqual(s.verified, true);
  assert.strictEqual(s.verification_status, "DISPUTED");
});

// --- Normal promotion/demotion semantics for non-disputed models ---
check("LIKELY + gate indexed promotes to VERIFIED/verified", () => {
  const s = resolveVerificationStamp("LIKELY", false, "indexed");
  assert.strictEqual(s.verification_status, "VERIFIED");
  assert.strictEqual(s.verified, true);
  assert.strictEqual(s.disputePreserved, false);
});

check("LIKELY + gate thin stays LIKELY/unverified", () => {
  const s = resolveVerificationStamp("LIKELY", true, "thin");
  assert.strictEqual(s.verification_status, "LIKELY");
  assert.strictEqual(s.verified, false);
});

check("DRAFT + gate indexed promotes to VERIFIED", () => {
  const s = resolveVerificationStamp("DRAFT", false, "indexed");
  assert.strictEqual(s.verification_status, "VERIFIED");
  assert.strictEqual(s.verified, true);
});

// --- Edge shapes the DB actually holds ---
check("null status + gate thin falls back to LIKELY/unverified", () => {
  const s = resolveVerificationStamp(null, null, "thin");
  assert.strictEqual(s.verification_status, "LIKELY");
  assert.strictEqual(s.verified, false);
});

check("undefined status + gate indexed promotes to VERIFIED", () => {
  const s = resolveVerificationStamp(undefined, undefined, "indexed");
  assert.strictEqual(s.verification_status, "VERIFIED");
  assert.strictEqual(s.verified, true);
});

console.log(`\n=== ${passed} checks passed ===\n`);
