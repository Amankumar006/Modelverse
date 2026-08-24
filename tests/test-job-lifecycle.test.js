// Manual diagnostic: enrichment-job failure lifecycle (OFFLINE).
// Run: node tests/test-job-lifecycle.test.js
// Verifies markJobFailure() transitions jobs to terminal 'needs_review' past
// the attempt cap instead of looping failed->queued forever (Aug 2026 incident:
// scrape_source reached 27 attempts against a documented cap of 5).
const assert = require("assert");
const { markJobFailure, MAX_ATTEMPTS } = require("../scripts/lib/job-lifecycle");

// Fake supabase client capturing the last update payload.
function fakeDb() {
  const captured = {};
  return {
    captured,
    from() {
      return {
        update(payload) {
          captured.payload = payload;
          return { eq() { return Promise.resolve({ error: null }); } };
        },
      };
    },
  };
}

(async () => {
  assert.strictEqual(MAX_ATTEMPTS, 5, "documented cap is 5 retries");

  // Early attempts stay 'failed' so discovery re-queues them
  for (const attempt of [1, 3]) {
    const db = fakeDb();
    const capped = await markJobFailure(db, "job-1", "boom", attempt);
    assert.strictEqual(capped, false, `attempt ${attempt} should not be capped`);
    assert.strictEqual(db.captured.payload.status, "failed", `attempt ${attempt} -> failed`);
    assert.strictEqual(db.captured.payload.error, "boom");
    assert.ok(!db.captured.payload.result_summary, "no reason payload below cap");
  }

  // At the cap the job goes terminal: discovery must never resurrect it
  const db = fakeDb();
  const capped = await markJobFailure(db, "job-2", "still boom", 5);
  assert.strictEqual(capped, true, "attempt 5 should be capped");
  assert.strictEqual(db.captured.payload.status, "needs_review", "capped -> needs_review");
  assert.strictEqual(db.captured.payload.error, "still boom", "error message preserved");
  assert.deepStrictEqual(
    db.captured.payload.result_summary,
    { reason: "max_attempts_exceeded" },
    "cap reason recorded for diagnosability"
  );

  // Beyond the cap stays capped (idempotent terminal state)
  const db3 = fakeDb();
  assert.strictEqual(await markJobFailure(db3, "job-3", "x", 27), true, "27 attempts still capped");
  assert.strictEqual(db3.captured.payload.status, "needs_review");

  console.log("✅ All job-lifecycle assertions passed.");
})().catch((e) => {
  console.error("❌ FAILED:", e.message);
  process.exit(1);
});
