---
activation: always_on
---

# Data Integrity Rules

These are non-negotiable for any change under `data/models/`.

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
