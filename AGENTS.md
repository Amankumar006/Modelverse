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
