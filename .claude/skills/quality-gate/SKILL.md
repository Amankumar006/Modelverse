---
name: quality-gate
description: Run this skill before opening a PR, before merging, when asked to "run the quality gate", "check if this is ready", "pre-merge checks", or after completing any code change in the Modelverse repo. Executes the manual quality checklist that stands in for missing CI — build, lint, relevant test scripts, and a secret scan — then reports a pass/fail summary.
---

# Quality Gate — Modelverse

There is no CI on commits or PRs (see `.agents/rules/testing-and-quality-gate.md`) and no second reviewer. This skill executes that checklist mechanically, so "the gate passed" means something.

## Steps (run in order)

1. **Lint** — `npm run lint`. Must be clean; any warning newly introduced by the working-tree changes is a fail.
2. **Build** — `npm run build`. Must succeed with zero errors.
3. **Tests** — list `tests/*.test.js` and run every script whose subject relates to the changed files (`node tests/<name>.test.js`). If the diff touches risky logic (data validation, scoring/ranking, AI-output handling, DB writes) and no script covers it, flag that gap explicitly instead of passing silently.
4. **Secret scan** — scan `git diff` (staged + unstaged) for anything resembling an API key, token, `.env` value, or Supabase service-role key. Any hit is an automatic fail.
5. **Risk tier** — classify the change per the tiers in `.agents/rules/testing-and-quality-gate.md`: high risk = `scripts/`, Supabase migrations, parsing AI-generated output, or API routes/Server Actions writing to the DB or external APIs. High-risk changes get no shortcuts on steps 1–3.

## Report format

One line per check: ✅ or ❌, what ran, result summary. Then an overall verdict:

- All green → "Quality gate passed — ready for PR."
- Any failure → what failed, the relevant output, and that it must be fixed before opening a PR (don't open it as a draft to fix later).

## Never

- Never report the gate as passed with skipped steps — a skipped step is a fail with a stated reason.
- Never "fix" failures by weakening lint rules or deleting tests to make them pass.
