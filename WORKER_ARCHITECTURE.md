# Modelverse Worker & Queue Architecture

This document describes the decoupled, per-model, per-fact-type queue orchestration for the Modelverse model catalog.

---

## 1. Queue Schema (`enrichment_jobs`)

Jobs are persisted in Supabase in the `enrichment_jobs` table:

```sql
CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'discover_model',
    'scrape_source',
    'lookup_specs',
    'lookup_pricing',
    'lookup_benchmarks',
    'lookup_capabilities',
    'lookup_providers',
    'collect_runtime',
    'verify_facts',
    'run_evaluation',
    'generate_editorial',
    'generate_quickstart',
    'quality_check'
  )),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued',
    'running',
    'waiting',
    'done',
    'failed',
    'blocked',
    'needs_review',
    'skipped'
  )),
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
- **Deadlock Prevention Protocol**: Workers check cross-job dependencies. If an upstream dependency (e.g. `scrape_source`) fails, the downstream worker (e.g. `lookup_benchmarks`) enters `blocked` or `skipped` rather than looping in `queued`.
- **Max Attempt Cap (5 Retries)**: Any job exceeding 5 attempts is automatically transitioned to `needs_review` with an alert.

---

## 2. Pipeline Execution Hierarchy

The data extraction and enrichment pipeline follows a strict priority order:

```
                            PIPELINE FLOW
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Model Discovery (HF Hub, OpenRouter, Official Feeds)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Factual Ingestion Layer (Parallel & Independent)                    │
│    ├── scrape_source        (Crawls official docs/READMEs)             │
│    ├── lookup_specs         (Parameters, Context, License)             │
│    ├── lookup_capabilities  (Vision, Tools, Reasoning, JSON Mode)      │
│    ├── lookup_pricing       (OpenRouter token rates & tiers)           │
│    └── collect_runtime      (TTFT, tokens/sec, P50/P95 Latency)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Derived Extraction Layer                                            │
│    └── lookup_benchmarks    (Requires scrape snapshot; max 5 attempts) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. Cross-Source Evidence Layer (`model_evidence`)                      │
│    └── verify_facts         (Substantiates values & sets confidence)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. Scoring Gate (`quality_check`)                                      │
│    └── Requires ≥2 verified facts & ≥1 benchmark to qualify for index  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 6. Grounded Editorial Layer (`generate_editorial`)                     │
│    └── Executed LAST using verified evidence to prevent hallucination  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Freshness Windows

| Action Type | Freshness Window | Rationale |
| :--- | :--- | :--- |
| `lookup_pricing` | **30 Days** | Provider pricing and token cost tiers adjust frequently. |
| `collect_runtime` | **14 Days** | Provider latency and throughput fluctuate with infrastructure. |
| `lookup_capabilities`| **60 Days** | Provider parameter updates and new modality features. |
| `lookup_specs` | **60 Days** | Context windows and quantization formats may be updated. |
| `lookup_benchmarks` | **90 Days** | Canonical evaluation scores (MMLU, HumanEval, etc.) remain stable. |
| `scrape_source` | **90 Days** | Official READMEs and research papers are generally immutable post-release. |

---

## 4. Evidence Layer (`model_evidence`)

Every extracted fact is substantiated with granular provenance:
- **`official_model_card`**: Directly extracted and validated from the author's primary repository.
- **`provider_api`**: Verified via live marketplace endpoints (e.g. OpenRouter).
- **`benchmark_paper`**: Academic research papers with table citation links.
- **`independent_eval`**: LMSYS Chatbot Arena, Artificial Analysis, or independent community runs.
- **`curator_verified`**: Manual inspection and approval by a Modelverse administrator.

---

## 5. Structured Capabilities

Modelverse tracks 14 first-class capabilities per model:
1. `vision_input`: Image understanding & multimodal parsing
2. `image_generation`: Diffusion/generative visual outputs
3. `audio_input`: Speech recognition / Whisper audio parsing
4. `audio_output`: Text-to-speech synthesis
5. `video_input`: Video reasoning and frame comprehension
6. `tool_calling`: Function calling and external API tools
7. `structured_outputs`: JSON schema compliance & structured output guarantees
8. `json_mode`: JSON output formatting
9. `reasoning`: Chain-of-thought & deep reasoning architecture
10. `computer_use`: GUI manipulation & OS action agents
11. `web_search`: Search grounding and live web retrieval
12. `prompt_caching`: Context and prefix caching support
13. `batch`: Asynchronous batch inference APIs
14. `fine_tuning`: Open weights or vendor fine-tuning availability

---

## 6. Observability (`queue-status.js`)

Run `node scripts/monitoring/queue-status.js` to inspect queue health across all action types:

```bash
node scripts/monitoring/queue-status.js
```
