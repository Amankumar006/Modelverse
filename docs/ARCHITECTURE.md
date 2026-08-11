# Modelverse System Architecture & Overview

Modelverse is a high-performance open-source database and comparative catalog of AI model specifications, benchmarks, pricing, and features.

---

## 🏛️ Directory Structure

```text
Modelverse/
├── data/                      # Legacy data or static archives (moved to Supabase)
├── docs/                      # Comprehensive project documentation
│   ├── ARCHITECTURE.md        # Architecture overview (this file)
│   ├── INGESTION_AND_ENRICHMENT.md # Data pipeline, provenance, and Curator Review
│   └── SCHEMA.md              # Model specification schema definitions
├── scripts/                   # Data compilation, ingestion, & enrichment tools
├── src/                       # Next.js 15 App Router frontend application
│   ├── app/                   # App Router pages (including /admin dashboards)
│   ├── components/            # UI components (e.g., Unverified amber dot UI)
│   └── lib/                   # Supabase client, models API, and TypeScript interfaces
└── public/                    # Static assets (logos, images, icons)
```

---

## ⚙️ Core Data & Compilation Flow

1. **Source Data (Supabase PostgreSQL)**: Individual, human-auditable records representing every AI model in the catalog are stored in the Supabase `models` table.
2. **Data Fetching (`src/lib/models.ts`)**: Server components fetch directly from Supabase, utilizing the Supabase Service Role Key for static generation and caching.
3. **Frontend Resolution & SEO**: Pages use Next.js App Router for zero-latency server-side rendering (SSR) and dynamic routing (`/models/[slug]`). Model pages leverage `SoftwareApplication` JSON-LD schema for SEO.

---

## 🎨 Technology Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Vanilla TailwindCSS with dark glassmorphism design tokens
- **Type Safety**: TypeScript 5+ (Strict Mode)
- **Pipelines**: GitHub Actions (Daily News Ingestion with Gemini/Groq/OpenRouter)
