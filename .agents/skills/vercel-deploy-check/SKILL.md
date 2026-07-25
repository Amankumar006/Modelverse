---
name: vercel-deploy-check
description: Use before merging any PR to main, or when asked to check deploy readiness, verify a Vercel preview, or investigate a failed/broken production deploy at themodelverse.in.
---

# Vercel Deploy Readiness Check

## When to use this
Before any merge to `main`; when asked "is this ready to ship," "check the preview,"
"why is the deploy failing," or "is the site down."

## Pre-merge checklist
1. Run `next build` locally — confirm zero type errors and zero failed pages.
2. Confirm the branch has a Vercel Preview deployment and it's green (not still
   building, not errored).
3. If the PR touches `data/models/`: confirm the new/changed entries render
   correctly on the preview (card layout, filters, detail page) — don't just trust
   that valid JSON means valid rendering.
4. If the PR touches `vercel.json`, `next.config.*`, env-var usage, or anything
   under routing/redirects: flag this explicitly and confirm with the user before
   proceeding — per the Vercel deployment rule, this is not an autonomous-merge
   situation.
5. Confirm no `.env` or secret values are present in the diff.

## Investigating a failed or broken deploy
1. Pull the actual build log for the failed deployment (Vercel dashboard or
   `vercel logs` / `vercel inspect` via CLI if available) rather than guessing from
   the local diff.
2. Check whether the failure is a build-time error (type/lint/build) vs a
   runtime error (works locally, breaks in production — often an env var missing
   in the Vercel dashboard, or a Node/edge runtime mismatch).
3. If themodelverse.in is fully down: check Vercel's status page and the project's
   deployment history for the last known-good deployment before making changes —
   consider whether a rollback to the last good deployment is faster than
   forward-fixing, and say so to the user as an option.
