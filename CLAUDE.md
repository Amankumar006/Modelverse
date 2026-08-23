# CLAUDE.md — Modelverse

Rules for Claude Code working in this repository. This mirrors `AGENTS.md` — detailed, modular rules live in `.agents/rules/` and are imported below. Edit those files directly rather than duplicating their content here.

@./.agents/rules/project-context.md
@./.agents/rules/product-scope.md
@./.agents/rules/git-workflow.md
@./.agents/rules/testing-and-quality-gate.md
@./.agents/rules/security.md

## Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Manual diagnostic scripts: `node tests/<name>.test.js` (see `testing-and-quality-gate.md` — these are not wired into an automated suite yet)

## MCP servers (connected to this project)

- **supabase** — live connection to the production Supabase project. Inspect schema (`list_tables`, `list_migrations`), apply tracked migrations, check advisors and logs. Always follow the `supabase-migrations` skill before touching the schema.
- **vercel** — production deployments, runtime logs, and analytics for themodelverse.in. Use it to confirm a deploy is Ready when releasing, and to investigate prod errors.

## Skills

Project-specific step-by-step workflows live in `.claude/skills/` (auto-triggered by their descriptions):
- `git-commit-formatter` — writing Conventional Commit messages from an actual diff
- `open-pull-request` — opening a PR via `gh` with the right base branch, checklist, and description
- `supabase-migrations` — creating and applying safe, tracked DB migrations
- `release-to-main` — the develop → main → Vercel production release flow
- `ingestion-pipeline` — working safely on the daily AI ingestion/enrichment scripts
- `quality-gate` — runnable version of the pre-PR checklist (also `/quality-gate`)
- `debug-production` — diagnosing prod incidents via Vercel/Supabase MCP and gh CLI

Vendor skills are also installed (Supabase, Vercel, React/performance guidelines).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
