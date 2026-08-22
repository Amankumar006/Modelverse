-- Migration: 20260822010000_pipeline_architecture_and_evidence.sql
-- Description: Expand enrichment_jobs state machine, add model_evidence and model_runtime_metrics tables,
-- add structured capabilities to models, and clear legacy benchmark deadlock jobs.

-- 1. Expand enrichment_jobs action_type and status constraints safely
DO $$
BEGIN
  -- Drop existing check constraints if they exist
  ALTER TABLE enrichment_jobs DROP CONSTRAINT IF EXISTS enrichment_jobs_action_type_check;
  ALTER TABLE enrichment_jobs DROP CONSTRAINT IF EXISTS enrichment_jobs_status_check;

  -- Add updated check constraints
  ALTER TABLE enrichment_jobs ADD CONSTRAINT enrichment_jobs_action_type_check
    CHECK (action_type IN (
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
    ));

  ALTER TABLE enrichment_jobs ADD CONSTRAINT enrichment_jobs_status_check
    CHECK (status IN (
      'queued',
      'running',
      'waiting',
      'done',
      'failed',
      'blocked',
      'needs_review',
      'skipped'
    ));
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint update on enrichment_jobs completed or already applied: %', SQLERRM;
END $$;

-- 2. Add capabilities JSONB column to models table
ALTER TABLE models ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_models_capabilities ON models USING gin (capabilities);

-- 3. Create model_evidence table for cross-source fact verification
CREATE TABLE IF NOT EXISTS model_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'official_model_card',
    'provider_api',
    'benchmark_paper',
    'independent_eval',
    'curator_verified',
    'live_telemetry',
    'other'
  )),
  source_url TEXT NOT NULL,
  extracted_value JSONB NOT NULL,
  confidence TEXT NOT NULL DEFAULT 'LIKELY' CHECK (confidence IN (
    'OFFICIAL',
    'VERIFIED',
    'LIKELY',
    'DISPUTED',
    'UNVERIFIED'
  )),
  verification_notes TEXT,
  verified_by UUID REFERENCES auth.users(id),
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (model_id, field_name, source_url)
);

CREATE INDEX IF NOT EXISTS idx_model_evidence_model_id ON model_evidence(model_id);
CREATE INDEX IF NOT EXISTS idx_model_evidence_field_name ON model_evidence(field_name);
CREATE INDEX IF NOT EXISTS idx_model_evidence_source_type ON model_evidence(source_type);
CREATE INDEX IF NOT EXISTS idx_model_evidence_confidence ON model_evidence(confidence);

ALTER TABLE model_evidence ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'model_evidence' AND policyname = 'Public read model_evidence'
  ) THEN
    CREATE POLICY "Public read model_evidence" ON model_evidence FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'model_evidence' AND policyname = 'Curators can modify model_evidence'
  ) THEN
    CREATE POLICY "Curators can modify model_evidence" ON model_evidence
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM curator_profiles
          WHERE curator_profiles.id = auth.uid()
        )
      );
  END IF;
END $$;

-- 4. Create model_runtime_metrics table for live performance tracking
CREATE TABLE IF NOT EXISTS model_runtime_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  ttft_ms NUMERIC,
  tokens_per_sec NUMERIC,
  p50_latency_ms NUMERIC,
  p95_latency_ms NUMERIC,
  throughput_tps NUMERIC,
  error_rate NUMERIC,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_runtime_metrics_model_provider ON model_runtime_metrics(model_id, provider);
CREATE INDEX IF NOT EXISTS idx_runtime_metrics_measured_at ON model_runtime_metrics(measured_at DESC);

ALTER TABLE model_runtime_metrics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'model_runtime_metrics' AND policyname = 'Public read model_runtime_metrics'
  ) THEN
    CREATE POLICY "Public read model_runtime_metrics" ON model_runtime_metrics FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'model_runtime_metrics' AND policyname = 'Curators can modify model_runtime_metrics'
  ) THEN
    CREATE POLICY "Curators can modify model_runtime_metrics" ON model_runtime_metrics
      FOR ALL TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM curator_profiles
          WHERE curator_profiles.id = auth.uid()
        )
      );
  END IF;
END $$;

-- 5. Clear benchmark retry deadlock jobs
UPDATE enrichment_jobs
SET status = 'needs_review',
    error = 'Awaiting scrape_source snapshot (exceeded max retries in deadlock)'
WHERE action_type = 'lookup_benchmarks'
  AND status = 'queued'
  AND attempts >= 5;
