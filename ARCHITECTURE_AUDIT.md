# Modelverse Architecture Audit

## Executive Summary
*   **Fully File-Based, No Real Database:** There is absolutely no connection to Postgres, MongoDB, Firebase, Supabase, SQLite, or any other traditional database anywhere in the codebase. All data relies on static JSON files in `data/models/` and `data/news/`. 
*   **Ingestion Bypasses Human Review (Auto-Publishing):** The `.github/workflows/daily-ingestion.yml` workflow directly commits and pushes newly ingested models to the `main` branch. The script `verify-model-facts.js` automatically sets `verified: true` and moves models from `models-pending/` to `models/` if data sources agree, meaning automated scripts push "verified" models straight to production without a human curator step.
*   **No Actual "Curator Mode" or Gating:** There is no evidence of a `?curate=true` client-side flag, a `CuratorReviewBanner`, or any server-side curator authentication. Curator/admin capabilities are completely non-existent in the actual code; any such workflow mentioned in docs or planning is currently vaporware.
*   **API is Completely Unauthenticated & Static-Backed:** The `/api/models` route serves data purely by reading the pre-compiled `models-archive.json`. There is no rate-limiting, no API keys, and no authentication check of any kind on this endpoint.
*   **PR-Gate Doesn't Exist:** Despite expectations, there is no GitHub Action or script acting as a PR-gate that blocks bad data from merging. Ingestion commits to `main`, and verification operates pre-commit.
*   **Audit Script is Read-Only:** A script called `audit-database.js` exists, but it only reads the JSON files to generate a console report about missing benchmarks and invalid formats. It does not actively clean or touch/modify any files.
*   **Missing Provenance Tracking:** `sourceType` (e.g., vendor-reported vs. independent-eval) is defined in Zod schemas but is never actually populated or used during ingestion or verification. 

---

## 1. Repository Overview

### Directory Structure
*   `data/` — The true "database" of the application.
    *   `data/models/` — Production JSON files for each AI model.
    *   `data/models-pending/` — Staging area for ingested models awaiting verification.
    *   `data/news/` — Markdown/JSON hybrid files for news posts.
    *   `data/cache/` — Snapshots from external sources used for verification.
*   `src/` — The Next.js application.
    *   `src/app/` — App Router pages and API routes.
    *   `src/components/` — React UI components (Hero, Models, Timeline).
    *   `src/lib/` — Helper utilities, types, Zod schemas, and compiled `.json` outputs.
*   `scripts/` — Node.js ingestion and build scripts.
    *   `scripts/lib/` — Fetch logic for external data sources (HuggingFace, OpenRouter, etc.).
*   `.github/workflows/` — CI/CD automation pipelines for ingestion and deployment.

### Dependencies (from `package.json`)
*   **Framework/Runtime:** `next` (^16.3.0), `react` (19.2.4), `react-dom` (19.2.4)
*   **Data/DB Clients:** None (Relies strictly on `fs` and local JSON files)
*   **Auth Libraries:** None (No NextAuth, Clerk, Auth0, or custom JWT implementation)
*   **Validation:** `zod` (^4.4.3)
*   **Build Tooling/Styling:** `tailwindcss` (^4), `@tailwindcss/postcss` (^4), `@tailwindcss/typography` (^0.5.20), `typescript` (^5)
*   **Testing:** None (No Jest, Vitest, or Playwright configurations found)
*   **UI/Animation:** `framer-motion` (^12.42.2), `gsap` (^3.15.0), `@gsap/react` (^2.1.2), `lucide-react` (^1.24.0), `react-markdown` (^10.1.0), `fuse.js` (^7.4.2)

### Environment Variables
*   **`NEXT_PUBLIC_SITE_URL`**: Used in `src/lib/models.ts` and `src/app/models/upgrade/page.tsx` for generating canonical URLs and absolute links.
*   **`NEXT_PUBLIC_GA_ID`**: Present in `.env` and `.env.local` but no evidence of usage in the codebase.
*   **`VERCEL_OIDC_TOKEN`**: Present in `.env.local`, likely used by Vercel CLI, not explicitly referenced in application code.
*   **`ARTIFICIAL_ANALYSIS_API_KEY`**: Defined in `.env.local` and GitHub Actions secrets. Used by `scripts/ingest-trending-models.js` and `scripts/sync-source-snapshots.js` (via workflow env injection) for external data fetching.
*   **`CURATOR_SECRET`**: Present in `.env.local`, but there is zero evidence of it being used or checked anywhere in `src/` or `scripts/`.
*   **`DISCORD_WEBHOOK_URL`**: Injected via GitHub Actions, used by `scripts/post-to-discord.js`.
*   **`GMAIL_APP_PASSWORD`**: Injected via GitHub Actions, used by `dawidd6/action-send-mail@v3` for email notifications.

---

## 2. Data Storage

### Read/Write Mechanisms
Data is exclusively file-based. 
*   **Runtime:** Reads from compiled `src/lib/models-archive.json`, `search-index.json`, and `news-archive.json`. The `getAllModelEntries()` function in `src/lib/models.ts` requires these JSONs (loading dynamically via `fs` in dev mode, and statically importing in production).
*   **Build time:** `scripts/compile-models.js` reads individual JSON files from `data/models/` and `data/news/`, validates them against Zod schemas, and bundles them into the large archive JSON files in `src/lib/`. 

### Core Data File Schema (`models-archive.json`)
As implemented and enforced by `ModelSchema` in `scripts/compile-models.js`:
*   **Base Fields:** `id` (string), `name` (string), `slug` (string), `developer` (string), `description` (string), `primaryTask` (PrimaryTaskEnum).
*   **Dates:** `releaseDate`, `updatedAt` (string regex: `YYYY-MM-DD`).
*   **Enums:** 
    *   `type`: "open-source", "open-weights", "closed-source", "api-only", "research-preview", "research"
    *   `status`: "active", "deprecated", "sunset" (defaults to "active")
    *   `vendorApiStatus`: "active", "deprecated", "sunset" (optional)
*   **Arrays:** `deployment` (DeploymentEnum array), `images` (string[]), `tags` (string[]), `sources` (any).
*   **Metrics:** `benchmarks` (array of `{name, score, verified, sourceType}`), `parameters` (any), `contextWindow` (any), `pricing` (any).
*   **Flags:** `verified` (boolean), `verificationStatus` (enum: "VERIFIED", "LIKELY", "DRAFT", "DISPUTED"), `humanApproved` (boolean), `needsReview` (boolean), `featured` (boolean, defaults to false), `boost` (number 1-5, defaults to 1).
*   **Other:** `fieldConfidence` (record of field to confidence enum), `curatorNotes` (string), `family`, `tier`, `institution`, `previousVersion`, `logo`, `links`.

**Zod Validation:** The `ModelSchema` strictly validates these during `npm run prebuild` (via `compile-models.js`).

### Database Confirmation
**Explicit Confirmation:** There is **no database** (Postgres, Mongo, SQLite, Supabase, Firebase, Prisma, etc.) referenced, wired up, or commented out anywhere in the codebase. All "database" operations are purely JSON file manipulation. 

---

## 3. Build/Ingestion Pipeline

### Pipeline Scripts
*   **`ingest-trending-models.js`**: Triggered by `.github/workflows/daily-ingestion.yml` (cron: every 6 hours). Reads HuggingFace trending API, writes new JSON entries to `data/models-pending/`, and generates markdown READMEs in `data/models/readme/`.
*   **`verify-model-facts.js`**: Triggered at the end of `ingest-trending-models.js`. Reads `data/models-pending/`, queries 3rd-party APIs (Artificial Analysis, OpenRouter, HF), compares metrics, and writes verified models directly into `data/models/`.
*   **`compile-models.js`**: Triggered by `npm run prebuild` and GitHub Actions. Reads all individual JSONs in `data/models/` and `data/news/`, validates them, and writes `models-archive.json`, `search-index.json`, and `news-archive.json` to `src/lib/`.

### Provenance Flags Tracing
*   **`needsReview`**: Set to `true` on creation in `ingest-trending-models.js`. Overwritten by `verify-model-facts.js`: `modelData.needsReview = (modelStatus === "DISPUTED" || modelStatus === "DRAFT" || !modelData.verified)`.
*   **`vendorApiStatus`**: Optional in schema, passed through `compile-models.js`. **It propagates end-to-end**: it is retained in the compiled `models-archive.json` and specifically exposed through the public API (`/api/models`) where it can be filtered against and is included in the sanitized response payload. However, no ingestion script currently sets this flag.
*   **`sourceType`**: Exists in the `BenchmarkSchema` inside `compile-models.js`, but there is zero evidence of any ingestion script populating this field. 
*   **`verified` (CRITICAL AUTOMATION LEAK):** Can an automated path set `verified: true` without human intervention? **YES**. `verify-model-facts.js` checks if independent sources agree on pricing, benchmarks, context window, and parameters. If enough sources match within tolerance, it sets `modelStatus = "VERIFIED"` and `modelData.verified = true`. It then deletes the pending file and writes it directly to the production `data/models/` folder. The GitHub Action subsequently commits this directly to `main`.

---

## 4. Git & CI Workflow

### GitHub Actions Workflows
*   **`daily-ingestion.yml`**: Runs every 6 hours. Runs `ingest-trending-models.js`, `compile-models.js`, sends Discord/Email notifications, and then **force commits and pushes directly to `main`** (`git commit -m "... [skip ci]" && git push origin main`). 
*   **`sync-source-snapshots.yml`**: Runs daily. Executes `scripts/sync-source-snapshots.js` to refresh cache data from external APIs. Commits cache updates directly to `main`.
*   **`daily-news.yml`, `weekly-digest.yml`, `migrate-news.yml`**: Other cron jobs handling news aggregation and notifications.

### Branch Protection & PRs
Because the GitHub Actions use `git push origin main` directly, there is effectively **no branch protection** preventing automated pushes to `main`. 

### Curator Promotion Flow
**There is no functional curator promotion flow.**
There is no `CuratorReviewBanner` component. There is no code that opens a PR via the GitHub API, nor any code that merges from a branch. The "promotion" happens entirely in `verify-model-facts.js` when a Node script moves a `.json` file from one folder (`data/models-pending/`) to another (`data/models/`) locally on the runner, before pushing to `main`.

---

## 5. API Layer

### `/api/models`
*   **Path**: `src/app/api/models/route.ts`
*   **Method**: `GET`
*   **Data Source**: Calls `getAllModelEntries()` from `src/lib/models.ts`, which reads from the statically compiled `models-archive.json`.
*   **Auth/Rate-Limiting**: **None**. It is completely open to the public.
*   **Functionality**: Accepts URL query parameters (`status`, `vendorApiStatus`, `developer`, `type`, `modality`, `primaryTask`, `q`, `limit`, `offset`), filters the JSON array in memory, and returns a sanitized JSON list.

### `/api/models/[slug]`
*   **Path**: `src/app/api/models/[slug]/route.ts`
*   **Method**: `GET`
*   **Data Source**: Calls `getAllModelEntries()` and finds by slug/id.
*   **Auth/Rate-Limiting**: **None**.

---

## 6. Curator/Admin Gating

*   **Trigger/Check**: There is **no curator mode** implemented. No frontend components parse a `?curate=true` flag. 
*   **Server-Side Verification**: Completely absent. There is no session management, no middleware checking for cookies/tokens, and no Next.js auth integration. The `CURATOR_SECRET` in `.env.local` is entirely unused.
*   **Conclusion**: Any UI elements suggesting curator actions are mock elements or simply don't exist in the current codebase.

---

## 7. Frontend Data Flow

*   **Data Fetching**: The frontend uses standard Next.js App Router patterns, primarily relying on server components calling `getAllModelEntries()` or `getModelBySlug()` from `src/lib/models.ts`. In production, this imports the static `models-archive.json`. 
*   **Curator UI**: No real curator components are wired up. All data mutation (like approving a model) is currently missing from the UI/API layers and exists solely in local Node scripts (`verify-model-facts.js`).

---

## 8. Known-Gap Checklist

*   **Is there a PR-gate check in the ingestion pipeline that blocks bad data from merging?**
    *   **NO.** The ingestion workflow (`daily-ingestion.yml`) commits directly to `main`. There is no PR generation or gating mechanism.
*   **Is there any evidence, at the code/file level, of a completed status audit?**
    *   **NO (Modifying audit).** There is an `audit-database.js` script, but it only reads files and logs missing scores/pricing to the console. It does not touch, modify, or fix any JSON files. A separate `backfill-model-status.js` exists which explicitly wrote `status: "active"` to models missing it, but it's a one-off structural backfill, not a content audit.
*   **Does `?curate=true` have server-side enforcement anywhere, or is it purely a client-side flag?**
    *   **NEITHER.** It does not exist at all. There is no code parsing `curate` from the URL on the client or the server.

---

## 9. Discrepancies

1.  **"Curated" vs. Automated Push:** The footer claims Modelverse is an "exceptional, human-curated repository", but `.github/workflows/daily-ingestion.yml` and `verify-model-facts.js` allow automated scraping from HuggingFace to bypass human review entirely, marking models as `verified: true` and pushing them straight to production `main`.
2.  **Missing Curator Mode:** The `.env` contains a `CURATOR_SECRET`, implying an authenticated curator workflow, but absolutely no code uses this secret.
3.  **`vendorApiStatus` Propagation:** The schema supports `vendorApiStatus` and the API exposes it, but none of the ingestion scripts (`ingest-trending-models.js` or `verify-model-facts.js`) actually populate or verify this field from upstream sources.
4.  **Database Assumptions:** Any documentation assuming a database connection is false; the entire system is statically driven by `fs` module interactions with `data/*.json`.
