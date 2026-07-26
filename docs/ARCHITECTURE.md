# Modelverse System Architecture & Overview

Modelverse is a high-performance open-source database and comparative catalog of AI model specifications, benchmarks, pricing, and features.

---

## 🏛️ Directory Structure

```
Modelverse/
├── data/                      # Primary JSON data files
│   ├── models/                # 420+ individual model JSON specifications
│   │   └── readme/            # Markdown documentation readmes (1 per model)
│   ├── news/                  # AI news markdown & JSON posts
│   └── schema/                # Zod validation schemas
├── docs/                      # Comprehensive project documentation
│   ├── ARCHITECTURE.md        # Architecture overview (this file)
│   ├── INGESTION_AND_ENRICHMENT.md # Data pipeline, provenance, and Curator Review API
│   └── SCHEMA.md              # Model specification schema & Zod definitions
├── scripts/                   # Data compilation, ingestion, & enrichment tools
├── src/                       # Next.js 15 App Router frontend application
│   ├── app/                   # App Router pages and API endpoints
│   ├── components/            # UI components & Curator Review Banner
│   └── lib/                   # Models loader, search index, and TypeScript interfaces
└── public/                    # Static assets (logos, images, icons)
```

---

## ⚙️ Core Data & Compilation Flow

1. **Source Data (`data/models/*.json`)**: Individual, human-auditable JSON files representing every AI model in the catalog.
2. **Compilation Script (`scripts/compile-models.js`)**: Validates every JSON file against the Zod `ModelSchema`, aggregates entries into `src/lib/models-archive.json`, and generates `src/lib/search-index.json`.
3. **Frontend Resolution (`src/lib/models.ts`)**: Server components import `models-archive.json` for zero-latency server-side rendering (SSR) and search.

---

## 🎨 Technology Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Styling**: Vanilla TailwindCSS with dark glassmorphism design tokens
- **Validation**: Zod schema validation
- **Type Safety**: TypeScript 5+ (Strict Mode)
