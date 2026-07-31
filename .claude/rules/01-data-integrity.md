---
activation: always_on
---

# Data Integrity Rules

These are non-negotiable for any change under `data/models/` and `data/models-pending/`.

1. **Never delete or silently overwrite an existing model record.** If a change
   conflicts with existing data, stop and flag it for explicit user review instead
   of resolving it yourself.
2. **Every model entry must carry a `sources[]` array** tracking data provenance
   (URL + what it supports, e.g. license, release date, benchmark numbers).
3. **Never guess a field.** If a parameter, license, or spec can't be verified from
   a source, set `"verified": false` on that field rather than filling in a
   plausible-looking value.
4. **One model = one PR-sized change.** A single model addition/update is: one JSON
   file under `data/models/` + the corresponding index update + an optional logo
   asset. Don't bundle unrelated model changes into one PR — it breaks reviewability
   and makes `git bisect` useless if a bad entry ships.
5. **Schema changes are Architect-tier.** If a task requires changing the Zod schema
   itself (not just adding data that fits the existing schema), treat it as a
   breaking-change candidate: check what existing entries would fail validation,
   and call that out before making the change.
6. **One-Time External Imports:** `models.dev` was used for a one-time backfill on 2026-07-26 (source citation: https://github.com/anomalyco/models.dev) — it is NOT a live data source, and no ongoing sync pipeline exists. All imported entries carry `verified: false` and must be verified against primary sources before being marked verified.
7. **Pending Staging Separation:** Unverified auto-ingested candidate models must always be written to `data/models-pending/` with `verified: false` and `needsReview: true`. Only models meeting `VERIFIED` status (2+ independent sources matching within tolerance) or explicitly approved via human curator (`humanApproved: true`) may be promoted to production `data/models/`.
8. **Per-Field Confidence & Disputed Block:** Track verification per field in `fieldConfidence`. Any field with conflicting data outside numeric tolerance (±10% pricing, ±2.0pt benchmarks) MUST be assigned `DISPUTED` status and strictly block auto-publishing.
9. **Local Cache First:** Ingestion and verification steps must inspect local snapshots in `data/cache/` before falling back to live network calls.
