---
name: release-to-main
description: Use this skill when preparing to merge develop into main, or whenever the user asks to "release", "deploy", "ship", "push to prod", or "merge to main". main auto-deploys to Vercel production at themodelverse.in, so this is the final gate before real users see the change.
---

# Release to `main` — Modelverse

`main` is wired to auto-deploy to Vercel at https://www.themodelverse.in/. There is no staging environment and no second human reviewer — this checklist is the entire safety net before a change goes live.

## Pre-flight checklist (all of these, before merging)

1. `develop` is up to date, and the branch being released is up to date with `develop`.
2. `npm run build` succeeds locally with no errors.
3. `npm run lint` is clean.
4. If the release includes a Supabase migration, it has already been applied and verified against prod (see the `supabase-migrations` skill) — don't bundle an unapplied migration with code that depends on it.
5. CI (`ci.yml`) is green on the branch.
6. Scan the diff for anything resembling a secret, API key, or `.env` value before merging.
7. Self-review the full diff once, specifically for: broken imports, leftover debug/`console.log` code, and anything touching `scripts/` — those run unattended in prod via cron, so a bug there fails silently until the next scheduled run.

## Merge

1. Merge `develop` → `main`.
2. Push, then watch the Vercel deployment until it's marked Ready.
3. Smoke-check https://www.themodelverse.in/ — load the homepage and the specific page(s)/route(s) the change affects.

## If something breaks in prod

1. Don't debug live — revert first: `git revert` the merge commit on `main` and push immediately to restore the last known-good deploy.
2. Branch off `main` as `hotfix/<short-description>`, fix, verify locally, merge back into `main`, **and** back-merge the same fix into `develop` so it isn't lost or reintroduced later.
