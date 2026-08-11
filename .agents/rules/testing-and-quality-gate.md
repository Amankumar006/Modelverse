# Testing & Quality Gate

Modelverse has no test framework, no `npm test` script, and no CI workflow triggered on commits or pull requests (only the data-ingestion cron jobs exist). This is production software with a public domain and no second reviewer, so **this checklist replaces the automated gate that doesn't exist yet.** Treat it as mandatory, not optional.

## Before opening any PR

1. `npm run build` — must succeed with zero errors.
2. `npm run lint` — must be clean (no new warnings introduced by the change, ideally zero).
3. If the change touches logic covered by an existing script in `tests/`, run it by hand: `node tests/<name>.test.js`, and confirm it passes before including the change in the PR. Paste or summarize the output in the PR description (see `open-pull-request` skill).
4. If the change introduces new logic that's risky to get wrong (data validation, scoring/ranking logic, anything AI-output-facing, DB writes), and no `tests/` script covers it, write a small manual diagnostic script under `tests/` for it as part of the same change — even a quick assert-based script beats no verification for logic that runs unattended in production.
5. Manually exercise the changed UI/flow locally (`npm run dev`) — click through the actual page(s) affected, don't just trust that the build succeeded.

## Risk tiers — scale scrutiny to blast radius

**High risk (always do the full checklist above, no shortcuts):**
- Anything in `scripts/` (runs unattended, daily, in prod)
- Supabase schema/migrations (see `supabase-migrations` skill)
- Anything parsing or trusting AI-generated (Gemini/Groq) output
- API routes / Server Actions that write to the DB or call external APIs

**Lower risk (build + lint is usually enough, use judgment):**
- Pure UI/styling changes with no data or logic implications
- Documentation-only changes

## Near-term gaps worth closing (flag, don't silently skip)

- **No CI on PRs.** Recommend adding a `.github/workflows/ci.yml` triggered on `pull_request` to `develop` and `main` that runs `npm ci`, `npm run lint`, `npm run build` at minimum. This is the single highest-leverage addition — it turns this manual checklist into an enforced one. If asked to set this up, do it; don't add it unprompted to an unrelated PR.
- **No real test framework.** The `tests/` scripts are a reasonable stopgap but don't scale. If asked to introduce one, Vitest is the lowest-friction choice for a Next.js + TypeScript project of this size.

## Never

- Never merge a PR where build or lint failed "just this once."
- Never treat "it compiled" as "it works" for anything in the High risk tier above.
- Never silently skip a `tests/` script that covers the code you're changing — either run it, or explain in the PR why it no longer applies.
