---
activation: always_on
description: Applies to any task touching data/models/. Mirrors .agents/rules/01-data-integrity.md — sources, no fabrication, one-PR-per-entry, schema changes are architect-tier.
---

# Rule: Data Integrity for Model Entries

Also see scope-policy.md for what counts as in-scope before adding any entry.

This dataset's entire value is accuracy and completeness. Treat it like a
reference work, not a blog.

- Every model entry MUST validate against `/data/schema/model.schema.ts`
  (Zod). Never write a JSON file that doesn't pass validation.
- Every entry MUST include a `sources` array with at least one URL. If the
  only source is a YouTube video, include the video URL AND try to find one
  primary source (official blog post, HuggingFace/GitHub page, paper) before
  marking the entry complete. If no primary source exists yet, set
  `"verified": false` and note why in `curatorNotes`.
- Never fabricate benchmark numbers, parameter counts, or license terms. If
  a video states a number but it can't be corroborated, store it with
  `"verified": false` rather than omitting it or guessing differently.
- Check `/data/models/_index.json` (or run the dedupe check) before adding
  an entry — do not create duplicate entries for the same model under
  slightly different names. If a model has multiple versions
  (e.g. v1, v1.5, v2), each version gets its own entry linked via
  `previousVersion` / `family` fields, not overwritten in place.
- Closed-source/API-only models still get full entries — "closed source"
  is a `type` field value, not a reason to skip documenting a model.
- Any edit to an EXISTING entry's factual fields (not typo fixes) should be
  called out explicitly to the user before saving, since this is a
  historical record.
