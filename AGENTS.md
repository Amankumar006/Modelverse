# AGENTS.md — Modelverse

Rules for AI agents (Antigravity CLI and others) working in this repository. Place this file at the project root and commit it to git.

## Project Context

- **Solo project.** No team, no second-person PR review — "review" and "approval" below mean self-review, not another human.
- **Closed source.**
- **Live in production** at https://www.themodelverse.in/, auto-deployed from `main` via Vercel on every merge. There is no staging environment. Treat every merge to `main` as an immediate production release.
- Full architecture/branching context: see `docs/` and the project spec doc in the repo.

## Tech Stack

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- Supabase (PostgreSQL) as the database
- Node.js scripts in `scripts/` for ingestion/enrichment, run daily via GitHub Actions cron
- Zod for schema validation
- Gemini / Groq APIs for AI summarization

## Golden Rules

1. Never push directly to `main`. Even solo, `main` = prod. Branch, build, self-review, then merge.
2. `develop` is the integration branch. `main` is release-only.
3. Never commit secrets — Supabase service role key, Gemini/Groq API keys, or any `.env*` file. Before any commit touching env handling, confirm `.env.local` is gitignored.
4. Before merging into `main`: `npm run build` and `npm run lint` must both pass locally, or CI must be green. No exceptions — there's no second reviewer to catch a bad merge.
5. Any Supabase schema change goes through a tracked migration (Supabase CLI `migration new`, or Supabase MCP `apply_migration`) — never hand-edit the prod schema via the dashboard SQL editor without also producing a migration file, or the repo's migration history and the real prod schema silently drift apart.
6. After any migration that touches prod, check Supabase advisors (security + performance) before considering the change done.
7. Ingestion scripts run unattended, daily, in production. Validate all external/AI-generated data with Zod before it touches the DB. Fail loudly (non-zero exit, clear log) rather than silently writing bad data or swallowing an error.
8. Follow Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `docs: ...`, `chore: ...`.

## Branching

- `feature/*`, `bugfix/*`, `docs/*` → branch off `develop`, merge back into `develop`.
- `hotfix/*` → branch off `main` for urgent prod fixes, merge to `main`, **then immediately back-merge into `develop`** so the fix isn't lost or reintroduced later.
- Never open a feature branch/PR directly against `main`.

## Environments & Secrets

- Local: `.env.local` (gitignored, never committed).
- Prod: Vercel project environment variables.
- CI (used by the ingestion cron workflows): GitHub Actions repository secrets.
- If a task needs a new secret, say so explicitly and stop. Don't hardcode a placeholder key or add a silent fallback that disables a feature instead.

## Commands

- Build: `npm run build`
- Lint: `npm run lint`
- (Add typecheck/test commands here once they exist in the repo.)

## Do Not

- ❌ Push directly to `main` or `develop`
- ❌ Commit `.env*` files, the Supabase service role key, or any LLM API key
- ❌ Bypass CI checks
- ❌ Hand-edit the production Supabase schema outside of a tracked migration
- ❌ Merge to `main` with a failing build or lint

## Skills

See `.agents/skills/` for detailed step-by-step workflows:
- `supabase-migrations` — creating and applying safe, tracked DB migrations
- `release-to-main` — the develop → main → Vercel production release flow
- `ingestion-pipeline` — working safely on the daily AI ingestion/enrichment scripts