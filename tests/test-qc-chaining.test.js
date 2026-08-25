// Manual diagnostic: quality_check stage chaining (OFFLINE).
// Run: node tests/test-qc-chaining.test.js
// Verifies queueQualityCheck() — the hook fact workers call after completing a
// job so a model's deterministic quality gate re-scores against fresh facts.
// Guards the three ways this could silently strand or clobber queue state:
//   - a done/blocked/skipped QC row must be re-queued (revive path)
//   - an absent QC row must be inserted idempotently (unique-constraint safe)
//   - queued/running/needs_review rows must NEVER be touched, and chaining
//     must never throw into the worker's catch block (which would mark an
//     already-completed job as failed)
const assert = require("assert");
const { queueQualityCheck } = require("../scripts/lib/job-lifecycle");

const MODEL_ID = "11111111-1111-1111-1111-111111111111";

// Fake supabase client recording builder calls. `qcStatus` simulates any
// existing quality_check row; `null` means none exists.
function fakeDb(qcStatus) {
  const calls = { revivedViaUpdate: null, upserts: [] };
  return {
    calls,
    from(table) {
      assert.strictEqual(table, "enrichment_jobs", "chaining only touches enrichment_jobs");
      return {
        update(payload) {
          return {
            eq(col, val) {
              if (col === "model_id") assert.strictEqual(val, MODEL_ID);
              return {
                eq(col, val) {
                  if (col === "action_type") assert.strictEqual(val, "quality_check");
                  return {
                    in(col, statuses) {
                      if (col === "status") {
                        // Revive path only fires for terminal-but-reusable rows.
                        if (qcStatus && statuses.includes(qcStatus)) {
                          calls.revivedViaUpdate = payload;
                          return {
                            select() {
                              return Promise.resolve({ data: [{ id: "job-1" }], error: null });
                            },
                          };
                        }
                        return {
                          select() {
                            return Promise.resolve({ data: [], error: null });
                          },
                        };
                      }
                      throw new Error(`unexpected .in(${col})`);
                    },
                  };
                },
              };
            },
          };
        },
        upsert(rows, opts) {
          calls.upserts.push({ rows, opts });
          // Simulate the (model_id, action_type) unique constraint absorbing
          // duplicates the way ignoreDuplicates does.
          return Promise.resolve({ data: qcStatus ? [] : [{ id: "new-job" }], error: null });
        },
      };
    },
  };
}

(async () => {
  // 1. Done QC row -> revived to queued, no redundant insert.
  {
    const db = fakeDb("done");
    assert.strictEqual(await queueQualityCheck(db, MODEL_ID), true, "revive succeeds");
    assert.strictEqual(db.calls.revivedViaUpdate.status, "queued", "done row re-queued");
    assert.strictEqual(db.calls.upserts.length, 0, "no insert when a row was revived");
  }

  // 2. Blocked and skipped rows revive too.
  for (const status of ["blocked", "skipped"]) {
    const db = fakeDb(status);
    assert.strictEqual(await queueQualityCheck(db, MODEL_ID), true, `${status} revives`);
    assert.ok(db.calls.revivedViaUpdate, `${status} row re-queued`);
    assert.strictEqual(db.calls.upserts.length, 0);
  }

  // 3. No existing row -> single idempotent insert.
  {
    const db = fakeDb(null);
    assert.strictEqual(await queueQualityCheck(db, MODEL_ID), true, "insert path succeeds");
    assert.strictEqual(db.calls.revivedViaUpdate, null, "nothing to revive");
    assert.strictEqual(db.calls.upserts.length, 1, "exactly one upsert");
    assert.deepStrictEqual(db.calls.upserts[0].rows, [
      { model_id: MODEL_ID, action_type: "quality_check", status: "queued" },
    ]);
    assert.strictEqual(db.calls.upserts[0].opts.onConflict, "model_id,action_type");
    assert.strictEqual(db.calls.upserts[0].opts.ignoreDuplicates, true, "races are absorbed");
  }

  // 4. Live rows (queued/running) and capped needs_review stay untouched:
  //    revive list misses them, and the fallback upsert no-ops on duplicates.
  for (const status of ["queued", "running", "needs_review"]) {
    const db = fakeDb(status);
    assert.strictEqual(await queueQualityCheck(db, MODEL_ID), true, `${status} left alone is success`);
    assert.strictEqual(db.calls.upserts[0].opts.ignoreDuplicates, true, `${status} survives via ignoreDuplicates`);
  }

  // 5. DB failure must not throw — workers call this after marking 'done',
  //    so an exception would fall into their catch and mislabel the job failed.
  {
    const broken = {
      from() {
        return {
          update() {
            return {
              eq: () => ({ eq: () => ({ in: () => ({ select: () => Promise.reject(new Error("network down")) }) }) }),
            };
          },
        };
      },
    };
    assert.strictEqual(await queueQualityCheck(broken, MODEL_ID), false, "failure reported, not thrown");
  }

  console.log("✅ all queueQualityCheck chaining assertions passed");
})().catch((err) => {
  console.error("❌ test-qc-chaining failed:", err.message);
  process.exit(1);
});
