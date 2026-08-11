# Data Ingestion, Enrichment, & Curation Pipeline

This document outlines the data ingestion, enrichment workflows, provenance boundaries, and human-in-the-loop verification gates in Modelverse.

---

## 🛡️ Data Provenance & Verification Rules

1. **Human Verification Gate (`verified: true`)**:
   - `verified: true` MUST ONLY be set manually by a human curator after reviewing primary sources.
   - Unverified models display a small amber indicator dot (`w-3 h-3 rounded-full border-2 border-amber-500`) in the UI.
   - Ingestion scripts and automated APIs MUST NEVER flip `verified: true` automatically.
   - All script-enriched data lands as `verified: false` and `needsReview: true`.

2. **Synthesized Prose Isolation (`descriptionDraft`, `keyFeaturesDraft`)**:
   - Generated summaries and candidate features are written **exclusively** to `descriptionDraft` and `keyFeaturesDraft`.
   - Production live fields (`description`, `keyFeatures`) are NEVER overwritten by scripts without human approval.

3. **News Ingestion & Agent Formatting**:
   - GitHub Actions (`.github/workflows/daily-news.yml`) trigger `scripts/ingest-daily-news.js` daily.
   - Summarization AI templates strictly use JavaScript interpolation to evaluate `rawBody` and `draftSummary` before prompting to prevent hallucination errors. 

---

## 🛠️ Ingestion & Enrichment Scripts

- **`scripts/ingest-daily-news.js`**: Fetches RSS feeds from Anthropic, HF, OpenAI, DeepMind, NVIDIA, TechCrunch, etc., evaluates relevance via Gemini, and generates Markdown summaries via Gemini/Groq/OpenRouter.
- **`scripts/enrich-skeleton-models.js`**: Enriches skeleton entries via Hugging Face API and inserts directly into Supabase.
- **`scripts/enrich-catalog-metadata.js`**: Upgrades skeleton default placeholders across tasks, context windows, licenses, and key features.
- **`scripts/generate-missing-model-readmes.js`**: Generates multi-section Markdown documentation readmes for catalog models.

---

## 🖐️ Curator Review UI & Verification API

- **Server Actions (`src/app/admin/actions.ts`)**:
   - Next.js Server Actions manage Supabase mutations instead of raw API endpoints.
   - Updating verification calls `revalidatePath('/admin/review')` and `revalidatePath('/models/[slug]')` to instantly update static App Router caches.
- **Curator Review Dashboard (`/admin/review`)**:
  - Allows side-by-side preview of Draft Prose vs. Live Specs, inspection of source links, and one-click verification approval.
  - Controls model public visibility and verification states (`VERIFIED`, `LIKELY`, `DRAFT`, `DISPUTED`).
