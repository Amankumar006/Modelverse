# /add-model

Trigger the `add-model-entry` skill for one AI model.

Ask the user (if not already given) for:
- Model name and developer/org
- Release date (approximate is fine)
- Type: open-source / open-weights / closed-source / api-only /
  research-preview
- One-line description
- At least one source URL (official blog, HF, GitHub, or paper)

Then follow `add-model-entry` end to end: duplicate check, validation,
write file, update index, report summary.
