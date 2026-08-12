# Product Scope

> Drafted from what's inferable about Modelverse from the repo/spec so far. **Confirm and edit the bracketed parts** — this file directly shapes what an agent treats as in-scope vs. a scope-creeping feature, so it's worth getting right.

## What Modelverse is (best current understanding)

Modelverse is an AI-model directory / news site: it ingests AI-related news via RSS daily, uses an LLM (Gemini/Groq) to summarize it, syncs model metadata from external sources (HuggingFace, OpenRouter), and presents this as browsable model cards, with a curator review dashboard for quality control before content goes live.

- **Target users:** [who is this for — ML practitioners, general AI-curious readers, both?]
- **Core value prop:** [e.g. "the fastest, most accurate place to see what's new across AI models" — confirm/replace]
- **Monetization / business model:** [none yet / ads / subscription / other — fill in, since it affects how cautious to be with anything touching payments or user accounts]
- **Primary user flows to protect above all else:** [e.g. homepage load, model card pages, search — list the pages/flows that must never break]

## In scope

- Ingesting and summarizing AI news (`scripts/`, `daily-news.yml`)
- Syncing/caching external model metadata (HuggingFace, OpenRouter) (`sync-source-snapshots.yml` / `daily-ingestion.yml`)
- Model card presentation and browsing (`src/`)
- Curator review workflow for content quality before publish
- [add more as they become clear]

## Out of scope (unless explicitly requested)

- User accounts / auth beyond curator access, unless the user asks for it
- Payments/billing
- [add more]

## Non-negotiable product behaviors

- AI-generated summaries must never be presented as unreviewed fact if the curator pipeline is meant to gate them — check `docs/` for whether curation is required-before-publish or a post-hoc quality pass, and don't change that gate without being asked.
- The public site must degrade gracefully if an external API (HuggingFace, OpenRouter, Gemini, Groq) is down or rate-limited — a failed ingestion run should not take down or corrupt already-published content.
