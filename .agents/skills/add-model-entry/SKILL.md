---
name: add-model-entry
description: Adds a single new AI model (open-source, closed-source, API-only, or research-preview) to the site's dataset as a validated JSON entry. Use this whenever the user wants to add, register, or document a specific released AI model, or hands over structured details about one model to be entered into the catalog.
---

# Add Model Entry

## When to use this skill
- The user gives you details about one specific AI model release and wants
  it added to the site.
- The `extract-from-youtube` skill has produced a draft entry that needs to
  be finalized and written to disk.

## How to use it

1. **Check for duplicates.** Search `/data/models/*.json` for the same
   `name`/`developer`/`family` before creating a new file. If it already
   exists, ask the user whether this is a correction/update or a genuinely
   different version, per the data-integrity rule. Before creating a new
   entry, check scope-policy.md — if the model is a fine-tune/quantization/minor
   point release of an existing entry, flag this to the user instead of
   proceeding automatically.

2. **Gather required fields.** At minimum: `name`, `developer`,
   `releaseDate`, `type`, `modality`, `primaryTask`, `deployment`, `description`,
   at least one entry in `sources`. If the user hasn't given you enough to fill
   required fields, ask — don't guess factual details (see data-integrity rule).
   It's fine to guess/derive non-factual fields like `slug` and `id`.

3. **Derive `id` and `slug`** as kebab-case from `developer` + `name`
   (e.g. "Mistral AI" + "Mixtral 8x22B" -> `mistral-mixtral-8x22b`).

4. **Validate.** Write the entry, then run:
   ```
   npx tsx scripts/validate-model.ts data/models/<id>.json
   ```
   (see `references/validate-model.ts` for the script if it doesn't exist
   yet — create it under `/scripts` once, then reuse it.) Fix any schema
   errors before proceeding.

5. **Write the file** to `/data/models/<id>.json`, pretty-printed, 2-space
   indent, following the field order in `data/schema/model.schema.ts`.

6. **Update the index.** Append `{ id, name, slug, developer, releaseDate,
   type }` to `/data/models/_index.json` (create it if missing) so list/grid
   views don't need to read every file to render a table.

7. **Report back** with a short summary: what was added, what fields are
   `verified: false` and why, and a diff-style preview of the JSON.

## Field notes
- `parameters`: use "undisclosed" rather than omitting the field for
  closed-source models — it's informative that it's unknown.
- `releaseDate`: if only a month is known, use the 1st of that month and
  note the imprecision in `curatorNotes`.
- Full field reference: `references/model-entry-example.json`.
