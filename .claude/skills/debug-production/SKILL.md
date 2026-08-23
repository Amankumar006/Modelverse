---
name: debug-production
description: Use this skill when production at themodelverse.in appears broken, stale, or shows bad data. Triggers include "site is down", "prod is broken", "bad data in prod", "news not updating", "deployment failed", investigating Vercel deploy errors, or diagnosing why a daily ingestion cron produced wrong output. Uses the connected Vercel and Supabase MCP servers plus the gh CLI to find root cause before changing anything.
---

# Debug Production — Modelverse

Production is `main` auto-deployed via Vercel, fed daily by unattended ingestion crons. Diagnose before touching anything — most incidents are either a bad deploy or bad cron data, and each has a different correct response.

## 1. Establish the blast radius

- Which protected flows are affected (homepage, model cards, search, news feed)? Or only one route?
- Since when? Correlate onset with recent merges to `main` (`git log origin/main`) and recent deployments.

## 2. Check the deploy path first (most common cause)

- Vercel MCP: latest production deployment status, then build/runtime logs filtered to errors around the onset time.
- If a deploy failed or a successful deploy introduced the regression → go straight to the revert rule below.

## 3. Check the data path

- Cron health: `gh run list` for `daily-news.yml` / `sync-source-snapshots.yml` — look for recent failures *and* runs that "succeeded" suspiciously fast or wrote nothing.
- Supabase MCP `query_logs` (postgres/edge sources) for errors around the onset time.
- Inspect suspect tables directly (e.g. today's news rows): missing, duplicated, empty summaries, malformed content.

## 4. Classify and act

| Cause | Action |
|---|---|
| Bad deploy | Revert-first rule below; never debug live on `main` |
| Bad data from ingestion | Patch the bad rows carefully, fix the script + Zod gap (follow the `ingestion-pipeline` skill), re-run the workflow manually via `workflow_dispatch` |
| External API down (HuggingFace/OpenRouter/Gemini/Groq) | The site should degrade gracefully — verify it did; wait/retry rather than hotfix |
| Infra / Supabase outage | Check status pages and logs; no code changes |

## Revert-first rule

For anything deploy-caused: `git revert` the merge commit on `main` and push immediately to restore the last known-good deploy. Fix forward offline afterwards, and back-merge the fix into `develop` (see the `release-to-main` skill).

## Never

- Never push experimental fixes directly to `main` to "test in prod".
- Never delete or overwrite bad rows without first recording exactly what was wrong (and confirming a backup/PITR window exists if the change is destructive).
