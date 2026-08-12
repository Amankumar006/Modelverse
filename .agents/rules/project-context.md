# Project Context

- **Solo project.** No team, no second-person PR review — "review"/"approval" language elsewhere means self-review via checklist, not another human.
- **Closed source.**
- **Live in production** at https://www.themodelverse.in/, auto-deployed from `main` via Vercel on every merge. No staging environment. Every merge to `main` is an immediate production release.
- **Product scope:** see `product-scope.md`.

## Tech Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- Supabase (PostgreSQL) as the database
- Node.js scripts in `scripts/` for ingestion/enrichment, run daily via GitHub Actions cron
- Zod for schema validation
- Gemini / Groq APIs for AI summarization
- `gh` CLI for GitHub operations (PRs opened via `gh`, not the web UI)

## Repository Structure

```text
Modelverse/
├── src/               # Next.js Application (UI, API routes, Server Actions)
├── scripts/           # Node.js Ingestion & Enrichment Scripts
├── docs/              # Architecture and Schema Documentation
├── data/              # CI/CD artifacts, Zod schemas, and API cache
├── tests/             # Manual diagnostic scripts (assert-based, run by hand — not an automated suite)
└── .github/
    └── workflows/     # GitHub Actions: daily-news.yml, daily-ingestion.yml (data cron only — no PR/CI checks currently)
```

## Current Known Gaps (don't assume otherwise)

- No test framework installed (no Jest/Vitest/Cypress/Playwright, no `npm test` script).
- No CI workflow runs on commits or pull requests — the only workflows that exist are the daily cron ingestion jobs. Lint/build are **not** automatically enforced by GitHub; they must be run locally before every merge (see `testing-and-quality-gate.md`).
- `tests/*.test.js` scripts exist but must be run manually with `node tests/<name>.test.js` — they don't run automatically anywhere.

If you add a `pull_request`-triggered CI workflow, a real test framework, or wire `tests/` into an automated runner, update this file and `testing-and-quality-gate.md` in the same change so these rules don't go stale.
