# Data Ingestion, Enrichment, & Curation Pipeline

This document outlines the data ingestion, enrichment workflows, provenance boundaries, and human-in-the-loop verification gates in Modelverse.

---

## 🛡️ Data Provenance & Verification Rules

1. **Human Verification Gate (`verified: true`)**:
   - `verified: true` MUST ONLY be set manually by a human curator after reviewing primary sources.
   - Ingestion scripts and automated APIs MUST NEVER flip `verified: true` automatically.
   - All script-enriched data lands as `verified: false` and `needsReview: true`.

2. **Synthesized Prose Isolation (`descriptionDraft`, `keyFeaturesDraft`)**:
   - Generated summaries and candidate features are written **exclusively** to `descriptionDraft` and `keyFeaturesDraft`.
   - Production live fields (`description`, `keyFeatures`) are NEVER overwritten by scripts without human approval.

3. **Canonical Repository Lookups**:
   - Parameter counts and open licenses are pulled from confirmed Hugging Face API endpoints (`https://huggingface.co/api/models/{org}/{repo}`).
   - Exact API source URLs are attached to `sources[]`.

---

## 🛠️ Ingestion & Enrichment Scripts

- **`scripts/import-models-dev.js`**: Initial snapshot import from `models.dev`. Maps raw TOML entries into Modelverse JSON schema.
- **`scripts/enrich-skeleton-models.js`**: Enriches skeleton entries via Hugging Face API (safetensors parameters, open licenses, draft prose).
- **`scripts/enrich-catalog-metadata.js`**: Upgrades skeleton default placeholders across tasks, context windows, licenses, and key features.
- **`scripts/generate-missing-model-readmes.js`**: Generates multi-section Markdown documentation readmes (`data/models/readme/*.md`) for catalog models.
- **`scripts/compile-models.js`**: Validates JSON specifications against Zod schema and generates search & archive bundles.

---

## 🖐️ Curator Review UI & Verification API

- **API Endpoint (`POST /api/models/verify`)**:
  - Receives `{ slug: string, promoteDraft?: boolean }`.
  - Sets `"verified": true`, `"needsReview": false`, and updates `"updatedAt"`.
  - Promotes `descriptionDraft` -> `description` if requested.
  - Re-compiles model archives and invalidates Next.js route caches.
- **UI Banner (`src/components/CuratorReviewBanner.tsx`)**:
  - Rendered on `/models/[slug]` when `needsReview === true` or `?curate=true` is present in the URL.
  - Allows side-by-side preview of Draft Prose vs. Live Specs, inspection of source links, and one-click verification approval.
