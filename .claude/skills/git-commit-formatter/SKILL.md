---
name: git-commit-formatter
description: Use this skill whenever committing changes in the Modelverse repo, or when the user asks to "commit", "write a commit message", "commit this", or similar. Formats commit messages using Conventional Commits based on the actual staged diff, never from a description of what was intended.
---

# Git Commit Formatter — Modelverse

## Steps

1. Run `git status` and `git diff --staged` (or `git diff` if nothing is staged yet). Read the actual diff — never write a commit message purely from memory of what the task was supposed to do. If the diff contains more than one logical change, stop and split it into separate commits instead of writing one message that covers unrelated changes.
2. Before staging anything, scan the diff for secrets (API keys, `.env` values, service role keys) — see `.agents/rules/security.md`. If found, unstage and fix before committing.
3. Determine `type` from what actually changed:
   - `feat` — new user-facing capability
   - `fix` — bug fix
   - `docs` — documentation only
   - `chore` — deps, tooling, config, no behavior change
   - `refactor` — code change with no behavior change
   - `test` — adding/editing anything in `tests/`
   - `ci` — GitHub Actions workflow changes
   - `perf` — performance improvement
   - `style` — formatting only, no logic change
4. Determine `scope` from the directory/area touched:
   - `ui` — `src/` (components, pages, styling)
   - `api` — `src/app/api` or Server Actions
   - `scripts` — `scripts/`
   - `db` — Supabase migrations/schema
   - `ci` — `.github/workflows/`
   - `docs` — `docs/`
   - Omit scope if the change genuinely spans everything (rare — usually a sign it should be split).
5. Write the message:
   - Subject: `type(scope): imperative summary`, lowercase after the colon, no trailing period, under ~72 characters. "add curator flag to model cards", not "Added curator flag" or "Adds curator flag".
   - Body (optional, for anything non-trivial): why the change was made, not just what — the diff already shows what.
   - Footer (only if relevant): `BREAKING CHANGE:` for breaking changes, or a reference to an issue/task.

## Examples

```
feat(ui): add curator review dashboard
fix(scripts): correct LLM prompt template interpolation
fix(db): add missing RLS policy on model_cards
docs: update schema documentation for curator_flag
chore: bump next.js to 15.x
test: add validation script for model fact accuracy
ci: add lint and build checks on pull_request
```

## Never

- Never invent a commit message before looking at the diff.
- Never bundle unrelated changes (e.g. a schema fix and an unrelated UI tweak) into one commit — split them.
- Never include secret values in a commit message, even redacted-looking ones, when describing what was fixed.
