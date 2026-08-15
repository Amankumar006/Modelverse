# Modelverse Worker & Queue Architecture

This document describes the decoupled, per-model, per-fact-type queue orchestration for the Modelverse model catalog.

---

## 1. Queue Schema (`enrichment_jobs`)

Jobs are persisted in Supabase in the `enrichment_jobs` table:

```sql
CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('scrape_source','lookup_benchmarks','lookup_pricing','lookup_specs')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed','skipped')),
  attempts INT NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  result_summary JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (model_id, action_type)
);

CREATE INDEX IF NOT EXISTS enrichment_jobs_status_idx ON enrichment_jobs(status, action_type);
CREATE INDEX IF NOT EXISTS enrichment_jobs_model_id_idx ON enrichment_jobs(model_id);
```

### Key Properties
- **Unique Constraint `(model_id, action_type)`**: Guarantees exactly one state machine record per model per fact dimension.
- **Independent Isolation**: A failure in pricing or benchmarks never blocks or pollutes other dimensions for that model.
- **Retryability**: Failed or stale jobs can be safely re-queued by the discovery orchestrator without duplicating rows.

---

## 2. Freshness Windows

When the Discovery Orchestrator (`scripts/discovery/discover-and-queue.js`) runs, it re-queues models based on domain-specific data volatility:

| Action Type | Freshness Window | Rationale |
| :--- | :--- | :--- |
| `lookup_pricing` | **30 Days** | Provider pricing and token cost tiers adjust frequently. |
| `lookup_specs` | **30 Days** | Context windows and quantization formats may be updated. |
| `lookup_benchmarks` | **90 Days** | Canonical evaluation scores (MMLU, HumanEval, etc.) remain stable. |
| `scrape_source` | **90 Days** | Official READMEs and research papers are generally immutable post-release. |

---

## 3. Worker Contracts

Each worker processes a bounded batch (default: 25) for its specific `action_type`. A single model failure is caught inside the loop and never aborts the batch.

```
┌────────────────────────────────────────────────────────┐
│               discover-and-queue.js                    │
│   (Fans out candidate models into enrichment_jobs)     │
└────────┬──────────────┬──────────────┬─────────────┬───┘
         │              │              │             │
         ▼              ▼              ▼             ▼
┌─────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  scrape-source  │ │lookup-pricing │ │ lookup-specs  │ │ lookup-bench  │
│  (Deep Crawler) │ │ (OpenRouter)  │ │(Deterministic)│ │ (Deterministic│
└────────┬────────┘ └───────┬───────┘ └───────┬───────┘ │   Extractor)  │
         │                  │                 │         └───────┬───────┘
         ▼                  │                 │                 │
┌─────────────────┐         │                 │                 │
│ data/cache/     │◄────────┼─────────────────┼─────────────────┘
│ snapshots/*.json│         │                 │
└────────┬────────┘         │                 │
         │                  │                 │
         └──────────┬───────┴─────────────────┘
                    ▼
       ┌───────────────────────────────┐
       │ compute-fact-completeness.js  │
       │ (>=2 verified facts & >=1 bm) │
       └────────────┬──────────────────┘
                    ▼
       ┌───────────────────────────────┐
       │    generate-editorial.js      │
       │ (Grounded LLM + Boilerplate   │
       │        Gate Check)            │
       └───────────────────────────────┘
```

### A. `scrape-source.js` (`action_type: scrape_source`)
- **Inputs**: `links.huggingface`, official blogs, papers, GitHub URLs.
- **Operation**: Crawls the deepest official primary sources (`crawlDeepOfficialSource`).
- **Outputs**: Writes raw crawled text to `data/cache/snapshots/<model_id>.json`.
- **Result Summary**: `{ crawledUrls: string[], byteCounts: number, timestamp: string }`.
- **Failure Mode**: Network timeout or unresolvable URLs -> records `status = 'failed'` with error description.

### B. `lookup-benchmarks.js` (`action_type: lookup_benchmarks`)
- **Inputs**: Reads snapshot from `data/cache/snapshots/<model_id>.json`.
- **Operation**:
  - If snapshot is missing -> re-queues job with note `"awaiting snapshot"` (never crawls inline).
  - Deterministically extracts table rows via `extractBenchmarksFromMarkdownTable`.
  - Validates score proximity with `verifyBenchmarkSubstantiation`.
  - Sanitizes and enforces write-layer guardrails with `sanitizeBenchmarksForWrite` via `verified-write.js`.
- **Outputs**: Writes verified benchmark objects to `models.benchmarks` with provenance URLs.
- **Result Summary**: `{ benchmarksFound: number, substantiated: number, rejected: object[], timestamp: string }`.

### C. `lookup-pricing.js` (`action_type: lookup_pricing`)
- **Inputs**: Live OpenRouter catalog (`https://openrouter.ai/api/v1/models`).
- **Operation**: Matches model by name/slug and extracts exact prompt/completion pricing and context limit.
- **Outputs**: Updates `models.pricing`, `models.context_window`, and tags `sources: ["https://openrouter.ai/api/v1/models"]`. Sets `field_confidence.pricing = 'VERIFIED'`.
- **Result Summary**: `{ matched: boolean, openRouterId: string|null, pricing: object, contextWindow: string, timestamp: string }`.

### D. `lookup-specs.js` (`action_type: lookup_specs`)
- **Inputs**: Model `name`, `slug`, `developer`, `type`.
- **Operation**: Deterministic regex extraction of parameters (e.g. `8x7B`, `70B`), context window normalization (`128K tokens`, `1M tokens`), license inference (`Apache-2.0`, `MIT`, `Proprietary`), and open vs closed classification.
- **Guarantees**: Zero LLM dependencies, zero network requests. Always deterministically evaluates model specs.
- **Outputs**: Updates `models.parameters`, `models.context_window`, `models.license`, `models.type`.
- **Result Summary**: `{ parameters: string, contextWindow: string, license: string, type: string, timestamp: string }`.

---

## 4. Precondition Fact Gate (`compute-fact-completeness.js`)

Before invoking any LLM for editorial generation, `computeFactCompleteness()` evaluates the model's factual verification state:

$$\text{Eligible} \iff (\text{verifiedFactCount} \ge 2) \land (\text{verifiedBenchmarksCount} \ge 1)$$

- **`verifiedFactCount`**: Count of fields (`parameters`, `contextWindow`, `pricing`, `license`, `benchmarks`, `hfHub`) with `field_confidence IN ('VERIFIED', 'OFFICIAL')`.
- **`verifiedBenchmarksCount`**: Count of substantiated numeric benchmarks with valid HTTP citation URLs.
- **Ineligible models**: Skipped with zero LLM spend; left as clean unverified/thin rows without synthetic filler.

---

## 5. Editorial Worker (`generate-editorial.js`)

1. **Grounded Context**: Passes the verified benchmark numbers and parameters into the prompt.
2. **Structural Boilerplate Gate**: Runs `isStructuralBoilerplate()` (Jaccard 4-shingle similarity against synthetic templates).
3. **Retry Protocol**:
   - If boilerplate is detected, retries **once** with an explicit structure-variation directive.
   - If boilerplate is still detected on retry, **marks failed and leaves fields null** (never writes boilerplate).
4. **Final Scoring**: Evaluates the model with `scoreModelPage()` and updates `quality_status` and `quality_score`.

---

## 6. Observability (`queue-status.js`)

Run `node scripts/monitoring/queue-status.js` at any time to inspect queue health:

```
==================== ENRICHMENT QUEUE STATUS ====================
Action Type             Done   Failed   Running   Queued   Skipped    Total
---------------------------------------------------------------------------
scrape_source             25        0         0       75         0      100
lookup_benchmarks         25        0         0       75         0      100
lookup_pricing            25        0         0       75         0      100
lookup_specs              25        0         0       75         0      100
---------------------------------------------------------------------------
Total Tracked Jobs in Queue: 400
```

---

## 7. CI/CD Orchestration Schedule

| Workflow | Schedule | Command |
| :--- | :--- | :--- |
| `discovery.yml` | Every 6 hours (`0 */6 * * *`) | `node scripts/discovery/discover-and-queue.js` |
| `worker-scrape-source.yml` | Hourly at :05 (`5 * * * *`) | `node scripts/workers/scrape-source.js --batch-size 25` |
| `worker-lookup-specs.yml` | Hourly at :10 (`10 * * * *`) | `node scripts/workers/lookup-specs.js --batch-size 50` |
| `worker-lookup-benchmarks.yml` | Hourly at :15 (`15 * * * *`) | `node scripts/workers/lookup-benchmarks.js --batch-size 25` |
| `worker-lookup-pricing.yml` | Every 2h at :20 (`20 */2 * * *`) | `node scripts/workers/lookup-pricing.js --batch-size 25` |
| `merge-and-editorial.yml` | Hourly at :30 (`30 * * * *`) | `node scripts/workers/generate-editorial.js --batch-size 15` |
