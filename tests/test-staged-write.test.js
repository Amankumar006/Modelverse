// Manual diagnostic: stagedChanges merge + field-allowlist logic (OFFLINE).
// Run: node tests/test-staged-write.test.js
// The stageChanges() function merges into models.staged_changes, but writing
// to model_evidence requires a live DB. We test the pure merge logic here by
// re-implementing it from the helper and asserting the contract.
const assert = require("assert");
const { ALLOWED_STAGED_FIELDS } = require("../scripts/lib/staged-write");

// Mirrors the merge step inside stageChanges(). Pulled out so we can unit-test
// it without a database.
function mergeStaged(existing, proposed) {
  const proposals = {};
  for (const [k, v] of Object.entries(proposed || {})) {
    if (ALLOWED_STAGED_FIELDS.has(k) && v !== undefined) proposals[k] = v;
  }
  return { ...(existing || {}), ...proposals };
}

// Identity
assert.ok(ALLOWED_STAGED_FIELDS.has("developer"), "developer is stageable");
assert.ok(ALLOWED_STAGED_FIELDS.has("release_date"));
assert.ok(ALLOWED_STAGED_FIELDS.has("context_window"));

// Content / prose
assert.ok(ALLOWED_STAGED_FIELDS.has("description"));
assert.ok(ALLOWED_STAGED_FIELDS.has("card_summary"));
assert.ok(ALLOWED_STAGED_FIELDS.has("page_overview"));
assert.ok(ALLOWED_STAGED_FIELDS.has("editorial_note"));

// Presentation (written by lookup-logos-and-media)
assert.ok(ALLOWED_STAGED_FIELDS.has("logo"));
assert.ok(ALLOWED_STAGED_FIELDS.has("images"));

// Bookkeeping fields must NEVER be stageable (curator-only)
assert.ok(!ALLOWED_STAGED_FIELDS.has("updated_at"), "updated_at must not be stageable");
assert.ok(!ALLOWED_STAGED_FIELDS.has("verified"), "verified is curator-only");
assert.ok(!ALLOWED_STAGED_FIELDS.has("verification_status"));
assert.ok(!ALLOWED_STAGED_FIELDS.has("quality_score"));
assert.ok(!ALLOWED_STAGED_FIELDS.has("reviewed_by"));
assert.ok(!ALLOWED_STAGED_FIELDS.has("id"));
assert.ok(!ALLOWED_STAGED_FIELDS.has("slug"));

// Empty / undefined values dropped
assert.deepStrictEqual(
  mergeStaged({}, { description: "x", release_date: undefined }),
  { description: "x" },
  "undefined values are dropped from the proposal"
);

// Last-write-wins on conflict
assert.deepStrictEqual(
  mergeStaged({ description: "old", primary_task: "chat-reasoning" },
              { description: "new" }),
  { description: "new", primary_task: "chat-reasoning" },
  "later proposal overwrites earlier"
);

// Unknown fields silently dropped
assert.deepStrictEqual(
  mergeStaged({}, { description: "x", not_a_field: "y", verified: true }),
  { description: "x" },
  "unknown + protected fields are dropped before merge"
);

// Empty proposals are a no-op (caller skips the DB write)
const empty = mergeStaged({ description: "stays" }, {});
assert.deepStrictEqual(empty, { description: "stays" });
assert.strictEqual(Object.keys(empty).length, 1);

console.log("✅ All staged-write assertions passed.");
