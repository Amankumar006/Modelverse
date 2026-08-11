---
name: ingestion-pipeline
description: Use this skill when working on anything in scripts/ — the Node.js ingestion and enrichment scripts that fetch RSS feeds, call Gemini/Groq for AI summarization, and sync external API data (HuggingFace, OpenRouter) into Supabase. Also use when debugging why a daily-news.yml or sync-source-snapshots.yml GitHub Actions run failed or produced bad data. Triggers on "ingestion", "scraper", "cron job", "daily news", "summarization", "hallucination", or a script filename under scripts/.
---

# Ingestion Pipeline — Modelverse

These scripts run unattended, daily, in production, triggered by GitHub Actions cron (`daily-news.yml`, `sync-source-snapshots.yml`). Nobody watches them run. Bugs here don't surface as an error a user sees — they either crash silently or, worse, write bad data straight into the production DB.

## Working on a script

1. Read the relevant workflow file in `.github/workflows/` first — understand exactly how and when the script runs (schedule, env vars, secrets passed in).
2. Every piece of externally-sourced data (RSS content, an LLM summary, a third-party API payload) must pass a Zod schema (`data/`) *before* it's written to Supabase. If no schema exists yet for that shape, write one as part of the change — don't trust the payload as-is.
3. AI-generated content (Gemini/Groq summaries) is the most likely source of bad data — treat model output as untrusted input, not ready-to-store content. Sanity-check length, required fields, and obviously malformed output (empty strings, repeated boilerplate, refusals) before persisting it.
4. Fail loud, not silent: on a validation failure or API error, log clearly and exit non-zero so the GitHub Actions run shows red. Don't swallow the error and continue — a broken feed will silently stop updating with no signal otherwise.
5. Prefer idempotent scripts (safe to re-run against the same day's data), since a cron job may need to be manually re-triggered after a fix.

## Testing before pushing

1. Run the script locally against `.env.local` pointed at a dev/local Supabase project (or a dry-run flag, if one exists) — never test an unverified script against prod data.
2. If no dry-run mode exists and one would help here, consider adding it — cheap insurance for a script nobody watches run.

## After merging

1. Confirm the relevant workflow runs cleanly at its next scheduled trigger, or run it manually via `workflow_dispatch` if you want to verify sooner.
