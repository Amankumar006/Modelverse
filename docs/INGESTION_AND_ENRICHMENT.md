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

4. **Index Status Promotion (`quality_status: 'indexed'`)** — *updated 2026-08-26*:
   - `quality_status` is a **deterministic, derived value** from `scripts/quality/score-content.js` (`scoreModelPage` / `scoreNewsArticle`). It is not human verification and never implies `verified: true`.
   - **Models:** the `quality_check` worker auto-promotes a thin card to `'indexed'` when its recomputed gate score passes, when `AUTO_PROMOTE_MODELS=true` (repo variable; on in production). Promotions are capped at `PROMOTION_CAP` per day (default 25), keep `needs_review: true` as a post-hoc curator audit signal, and are audit-logged via `enrichment_jobs.result_summary.promoted`. Demotion on regression remains automatic and immediate.
   - **News:** articles that fail the ingestion-time gate are published as `'unlisted'`; the scheduled re-scoring pass (`scripts/rescore-news.js`, run inside `daily-news.yml`) recomputes them against the current gate and promotes passers, optionally regenerating a grounded analysis section for recent near-misses first. Demotions from re-scoring require full-trust evidence (see below).
   - **Source-text archive (`data/news-sources/<slug>.json`)** — *added 2026-08-26*: `ingest-daily-news.js` archives the exact source texts each article was scored against at birth, and the workflow commits them to `main`. Re-scoring is only fully trusted (promote AND demote) when this archive exists; without it, an article's originality can't be re-verified, so already-indexed articles are left untouched and unlisted ones may only promote with positive stored evidence that the birth-time gate ran and passed originality (`assumeOriginalityPass` in `scoreNewsArticle`). Never delete this archive retroactively — it is what keeps future demotions honest.
   - The rules above (human-only `verified`, prose isolation) are unchanged by this policy.

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
