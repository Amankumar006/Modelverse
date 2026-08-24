"use strict";

/**
 * scripts/lib/staged-write.js
 *
 * Staged-write layer: pipeline workers NEVER mutate live model content.
 * Proposed values land in models.staged_changes (keyed by field name), each
 * backed by provenance rows in model_evidence, and needs_review is raised so
 * a curator can approve or reject from /admin/review. Approval promotes
 * staged values to the live columns (see src/app/admin/actions.ts).
 *
 * Every AI-derived or researched value MUST flow through here — direct
 * models.update() of content columns from scripts bypasses human review.
 */

const ALLOWED_STAGED_FIELDS = new Set([
  // identity
  "developer", "release_date", "type", "vendor_api_status", "family", "tier",
  "previous_version", "base_model",
  // specs
  "parameters", "active_parameters", "context_window", "license", "modality",
  "deployment", "primary_task", "capabilities",
  // prose
  "description", "card_summary", "page_overview", "editorial_note",
  "key_features", "tags",
  // commercial / performance
  "pricing", "cost_tiers", "benchmarks", "api_availability",
  "chatgpt_availability",
  // provenance & presentation
  "links", "sources", "logo", "aliases", "field_confidence",
]);

/**
 * Merge proposed field changes into a model's staged_changes bucket and raise
 * needs_review. Idempotent per run: re-proposing an identical value simply
 * overwrites the staged entry (last proposal wins); evidence rows dedupe via
 * their (model_id, field_name, source_url) conflict target.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} db - service-role client
 * @param {string} modelId - models.id
 * @param {Record<string, unknown>} changes - { field_name: proposed_value }
 * @param {Array<object>} [evidenceRows] - model_evidence rows substantiating the changes
 * @returns {Promise<{staged: boolean, fields: string[]}>}
 */
async function stageChanges(db, modelId, changes, evidenceRows = []) {
  // Drop fields we never stage (bookkeeping columns like updated_at, etc.)
  const proposals = {};
  for (const [field, value] of Object.entries(changes || {})) {
    if (ALLOWED_STAGED_FIELDS.has(field) && value !== undefined) {
      proposals[field] = value;
    }
  }

  if (Object.keys(proposals).length === 0) {
    return { staged: false, fields: [] };
  }

  // Read-modify-write the staging bucket
  const { data: existing, error: fetchErr } = await db
    .from("models")
    .select("staged_changes")
    .eq("id", modelId)
    .single();

  if (fetchErr) {
    throw new Error(`stageChanges: failed to load model ${modelId}: ${fetchErr.message}`);
  }

  const merged = {
    ...((existing && existing.staged_changes) || {}),
    ...proposals,
  };

  const now = new Date().toISOString();
  const { error: updateErr } = await db
    .from("models")
    .update({
      staged_changes: merged,
      staged_at: now,
      needs_review: true,
      updated_at: now,
    })
    .eq("id", modelId);

  if (updateErr) {
    throw new Error(`stageChanges: failed to stage for ${modelId}: ${updateErr.message}`);
  }

  // Persist provenance for the proposal (best-effort: a failed evidence insert
  // must not fail the job whose DB mutation already applied).
  for (const evidence of evidenceRows) {
    if (!evidence || typeof evidence !== "object") continue;
    const row = {
      confidence: "LIKELY",
      extracted_at: now,
      updated_at: now,
      ...evidence,
      model_id: modelId,
      extracted_value: evidence.extracted_value ?? proposals[evidence.field_name] ?? null,
    };
    if (!row.field_name || !ALLOWED_STAGED_FIELDS.has(row.field_name)) continue;
    try {
      const { error: evErr } = await db
        .from("model_evidence")
        .upsert(row, { onConflict: "model_id,field_name,source_url" });
      if (evErr) {
        console.warn(`  ⚠️ Evidence note (${row.field_name}):`, evErr.message);
      }
    } catch (evEx) {
      console.warn(`  ⚠️ Evidence note (${row.field_name}):`, evEx.message);
    }
  }

  return { staged: true, fields: Object.keys(proposals) };
}

module.exports = { stageChanges, ALLOWED_STAGED_FIELDS };
