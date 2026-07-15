# Rule: Model Inclusion Scope

This site indexes *notable released models* and *notable research previews*, not every model that exists —
that distinction is what keeps the catalog useful and maintainable instead
of trying to replicate Hugging Face's firehose of 800,000+ uploads.

## In Scope

1. **Notable foundation/base model releases** from known labs/companies.
2. **Major official variants** from the same release (e.g. a "mini", "flash", "pro", or size-variant tier announced alongside a flagship model).
3. **Significant open-source/open-weight releases** with real community adoption or notable technical distinction.
4. **Notable Research Previews (`research-preview` type)**. To prevent low-traction or non-notable papers from flooding the catalog, research-preview entries are subjected to the following test (applied in order):
   - **Criterion 1 (Affiliation)**: Affiliated with a recognized lab/company research team (e.g., NVIDIA, Google DeepMind, Meta, Apple, Microsoft, OpenAI, Anthropic, Tencent, Alibaba, Stability AI, etc., even if published as an academic-style paper) → Include.
   - **Criterion 2 (Independent Academic)**: Independent/university research with a live demo or released weights/code, AND either meaningful community traction (GitHub stars, Hugging Face downloads, citation count) OR coverage by a recognized AI-news source → Include. Log the traction details (stars, citations, etc.) in `curatorNotes` for auditability.
   - **Criterion 3 (Low-traction Independent)**: Independent/university research with neither traction nor recognized affiliation → Exclude by default. A curator can override with explicit reasoning in `curatorNotes` if it represents a significant breakthrough, but this should be the exception.

## Out of Scope (do not add without explicit user confirmation)

- **Community fine-tunes, LoRAs, and quantizations** of an already-catalogued model, unless the user specifically asks for one to be added.
- **Minor point releases / bugfix updates** that don't represent a real new capability (note these in `curatorNotes` on the existing entry instead of creating a new entry).
- **Research-paper-only models** with no public release, weights, code, or API access.
- **Non-model products** (hardware, computer chips, non-AI developer tools) → Always exclude (e.g. RTX Spark, Majorana 2).

## When in Doubt
Ask the user before adding a borderline entry rather than silently including or excluding it. State which criterion above it's borderline on.
