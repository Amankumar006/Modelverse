---
name: add-model-entry
description: Use when adding a new AI model to the Modelverse directory, or updating an existing model's data (license, benchmarks, provider info, release date). Covers the JSON schema, sources requirement, and index update.
---

# Add / Update a Model Entry

## When to use this
Any task like "add [model name] to the directory," "update the license on [model],"
"add benchmark scores for [model]."

## Steps

1. **Branch first.** `feature/add-<model-slug>` or `fix/update-<model-slug>`.
2. **Research the model** from primary sources where possible: official model card,
   provider blog/announcement, official GitHub repo, or academic paper. Avoid
   secondary aggregators as the sole source when a primary one exists.
3. **Create/edit the JSON file** at `data/models/<model-slug>.json`, validated
   against the project's Zod schema. Required shape includes (check the current
   schema file for the authoritative list — don't hardcode from memory):
   - identity: name, provider, slug
   - modality, license, parameter count (if disclosed)
   - `sources: []` — every non-obvious field should trace to at least one source
     entry with a URL
   - `verified: false` on any field you couldn't confirm from a source
4. **Update the index file(s)** so the new entry surfaces in listing/search/filter.
5. **Logo asset (optional):** if adding one, follow the existing naming/sizing
   convention in the logos directory — check a recent entry for the pattern rather
   than assuming dimensions.
6. **Validate:** run the project's Zod validation script if one exists (check
   `scripts/`) before committing.
7. **Commit:** `feat(models): add <Model Name> entry` or `fix(models): update
   <Model Name> license info`.
8. **Open PR**, one model per PR, per the data-integrity and git-branching rules.

## Common mistakes to avoid
- Filling in a plausible parameter count or license without a source — mark
  `verified: false` instead.
- Bundling multiple model entries in one PR.
- Skipping the index update (entry exists but never renders anywhere).
