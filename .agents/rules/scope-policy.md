# Rule: Model Inclusion Scope

This site indexes *notable released models*, not every model that exists —
that distinction is what keeps the catalog useful and maintainable instead
of trying to replicate Hugging Face's firehose of 800,000+ uploads.

## In scope
- Notable foundation/base model releases from known labs/companies.
- Major official variants from the same release (e.g. a "mini", "flash",
  "pro", or size-variant tier announced alongside a flagship model).
- Significant open-source/open-weight releases with real community
  adoption or notable technical distinction.

## Out of scope (do not add without explicit user confirmation)
- Community fine-tunes, LoRAs, and quantizations of an already-catalogued
  model, unless the user specifically asks for one to be added.
- Minor point releases / bugfix updates that don't represent a real new
  capability (note these in `curatorNotes` on the existing entry instead of
  creating a new entry).
- Research-paper-only models with no public release, weights, or API
  access (these belong in a future "research" section if we build one —
  not in the main model catalog).

## When in doubt
Ask the user before adding a borderline entry rather than silently
including or excluding it. State which criterion above it's borderline on.
