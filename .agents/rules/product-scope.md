# Product Scope

> Confirmed with the project owner on 2026-08-22. This file directly shapes what an agent treats as in-scope vs. a scope-creeping feature.

## What Modelverse is

Modelverse is an AI-model directory / news site: it ingests AI-related news via RSS daily, uses an LLM (Gemini/Groq) to summarize it, syncs model metadata from external sources (HuggingFace, OpenRouter), and presents this as browsable model cards, with a curator review dashboard for quality control before content goes live.

- **Target users:** both general AI-curious readers and ML practitioners. Content must stay accessible to non-technical readers while model metadata stays accurate enough for practitioners to compare models.
- **Core value prop:** the fastest, most accurate place to see what's new across AI models — freshness and speed of coverage is the differentiator.
- **Monetization / business model:** ads, live via Google AdSense (`src/components/third-party/AdUnit.tsx`, `GoogleAdsense.tsx`). Keep ad slots isolated from content rendering paths; ad scripts must never block or alter core page rendering.
- **Primary user flows to protect above all else:** homepage, model card pages, search, and the news feed.

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
