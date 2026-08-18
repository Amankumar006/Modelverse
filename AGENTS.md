# AGENTS.md — Modelverse

Rules for AI agents (Antigravity CLI and others) working in this repository. Place this file at the project root and commit it to git.

This file is the entry point. Detailed, modular rules live in `.agents/rules/` and are imported below — edit those files directly rather than duplicating their content here.

@./.agents/rules/project-context.md
@./.agents/rules/product-scope.md
@./.agents/rules/git-workflow.md
@./.agents/rules/testing-and-quality-gate.md
@./.agents/rules/security.md

## Commands

- Build: `npm run build`
- Lint: `npm run lint`
- Manual diagnostic scripts: `node tests/<name>.test.js` (see `testing-and-quality-gate.md` — these are not wired into an automated suite yet)

## Skills

See `.agents/skills/` for detailed step-by-step workflows:
- `git-commit-formatter` — writing Conventional Commit messages from an actual diff
- `open-pull-request` — opening a PR via `gh` with the right base branch, checklist, and description
- `supabase-migrations` — creating and applying safe, tracked DB migrations
- `release-to-main` — the develop → main → Vercel production release flow
- `ingestion-pipeline` — working safely on the daily AI ingestion/enrichment scripts

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
