-- Enrichment jobs table for per-model, per-fact-type queue orchestration.
-- Additive and idempotent migration.

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

ALTER TABLE enrichment_jobs ENABLE ROW LEVEL SECURITY;
