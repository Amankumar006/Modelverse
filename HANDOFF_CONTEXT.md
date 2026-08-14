# Modelverse - Project Context & Handoff

*Use this document to quickly bring a new AI assistant up to speed in a fresh chat session.*

## 1. Project Overview
- **Name:** Modelverse
- **Description:** A comprehensive directory of released AI models.
- **Live Site:** `https://www.themodelverse.in/`
- **Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, GSAP.
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

## 3. Recent Updates (As of August 14, 2026)
- **Performance & CWV Optimization:** Removed `framer-motion` to shave bundle size, self-hosted fonts (`next/font/google`), added `priority` to LCP images, and migrated tracking tags to `@next/third-parties`.
- **UI & Aesthetic Polish:** Integrated seamless `gsap/ScrollTrigger` staggered fade animations, implemented fluid typography variables in Tailwind v4, added glassmorphism to ModelCards, and resolved `ThemeProvider` hydration mismatch for Next Themes.
- **ISR & Edge Data Caching:** Drastically minimized continuous database reads by implementing Edge Data Caching on the Supabase client (`next: { revalidate: 3600 }`). Admin actions now utilize `revalidatePath` for on-demand cache invalidation. Prevented aggressive prefetching by adding `prefetch={false}` to all listing card `Link` components.

## 4. Golden Rules for AI Agents
1. **Never push directly to `main` for WIP features.** `main` = production. Branch off `develop` for features, build/lint locally, and merge only when fully verified.
2. **No Secrets:** Never commit `.env`, Supabase service role keys, or Groq/Gemini API keys. Ensure `.env.local` is `.gitignore`d.
3. **Admin Verification:** If a user complains "I cannot see the newly ingested model on the site", remind them to log into the `/admin/review` queue to manually approve it. Scripts cannot bypass the database trigger for `auth.uid()`.
4. **Strict Types & Static Builds:** Next.js builds are sensitive to strict TypeScript types. Run `npm run build` and `npm run lint` before any merges.

## 5. Next Steps / Pending Items
- **Feature Development:** With the platform heavily optimized, we are ready to move on to developing new features, expanding the dataset, or building user-facing tooling.
