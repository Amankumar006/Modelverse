# Modelverse - Project Context & Handoff

*Use this document to quickly bring a new AI assistant up to speed in a fresh chat session.*

## 1. Project Overview
- **Name:** Modelverse
- **Description:** A comprehensive directory of released AI models.
- **Live Site:** `https://www.themodelverse.in/`
- **Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion.
- **Database:** Supabase (PostgreSQL).
- **Deployment:** Vercel (Auto-deploys on every merge to `main`).

## 2. Core Architecture & Workflows
- **Database is the Source of Truth:** The site relies on Supabase for serving models (e.g., via `getAllModelEntries()` in `src/lib/models.ts`). 
- **Model Ingestion Pipeline:** 
  - Scripts under `scripts/` (e.g., `push-one-model.js` or daily cron jobs) insert new models into the database.
  - **Security Rule:** Automated inserts must set `needs_review: true` and `verified: false`.
  - **Review Queue:** The database has strict Row Level Security (RLS) and triggers. **Only an authenticated human curator** can verify a model. 
  - **Publishing:** The public frontend (like `page.tsx`) explicitly filters for `verified: true`. Once an admin approves a model in the Admin Dashboard (`/admin/review`), it becomes visible on the live site.
- **Reddit Bot Integration:** A Reddit Devvit app (`themodelversebot`) is linked to the project and interacts with Reddit's developer platform. 

## 3. Recent Updates (As of August 11, 2026)
- **Legal Documents:** Updated `Privacy`, `Security`, and `Terms of Service` pages to reflect the current effective date (August 11, 2026) and changed attributions to reflect a "dedicated team" rather than an individual.
- **Model Ingestion:** Successfully scraped and ingested the **Upstage Solar Pro 4** model into the production Supabase database.
- **Reddit Devvit Bot:** Resolved HTTP Fetch Policy rejections by updating the bot's `readme.md` to clarify its data sources and APIs.

## 4. Golden Rules for AI Agents
1. **Never push directly to `main` for WIP features.** `main` = production. Branch off `develop` for features, build/lint locally, and merge only when fully verified.
2. **No Secrets:** Never commit `.env`, Supabase service role keys, or Groq/Gemini API keys. Ensure `.env.local` is `.gitignore`d.
3. **Admin Verification:** If a user complains "I cannot see the newly ingested model on the site", remind them to log into the `/admin/review` queue to manually approve it. Scripts cannot bypass the database trigger for `auth.uid()`.
4. **Strict Types & Static Builds:** Next.js builds are sensitive to strict TypeScript types. Run `npm run build` and `npm run lint` before any merges.

## 5. Next Steps / Pending Items
- **Reddit Bot:** Monitor the Devvit app submission for final approval.
- **Content Expansion:** Continue ingesting new foundation models using the established ingestion scripts.
