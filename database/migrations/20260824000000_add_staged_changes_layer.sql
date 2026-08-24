-- 20260824000000_add_staged_changes_layer.sql
--
-- Phase 1: add a staged-changes layer so the pipeline can propose edits and
-- a human curator reviews them in /admin/review before they reach the public
-- model card. Until approved, the proposal lives in models.staged_changes;
-- approval promotes it to live columns, rejection discards it.
--
-- Also extends enrichment_jobs.action_type with the two new pipeline stages
-- that depend on this layer (research_gaps and quality_check).

ALTER TABLE public.models
  ADD COLUMN IF NOT EXISTS staged_changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS staged_at timestamptz;

CREATE INDEX IF NOT EXISTS models_staged_changes_neq_empty_idx
  ON public.models (updated_at DESC)
  WHERE staged_changes <> '{}'::jsonb;

-- Extend the existing action_type CHECK with research_gaps and quality_check.
-- The constraint name matches the one defined in
-- 20260822010000_pipeline_architecture_and_evidence.sql.
ALTER TABLE public.enrichment_jobs
  DROP CONSTRAINT IF EXISTS enrichment_jobs_action_type_check;

ALTER TABLE public.enrichment_jobs
  ADD CONSTRAINT enrichment_jobs_action_type_check
  CHECK (action_type = ANY (ARRAY[
    'discover_model'::text, 'scrape_source'::text,
    'lookup_specs'::text, 'lookup_pricing'::text,
    'lookup_benchmarks'::text, 'lookup_capabilities'::text,
    'lookup_providers'::text, 'collect_runtime'::text,
    'verify_facts'::text, 'run_evaluation'::text,
    'generate_editorial'::text, 'generate_quickstart'::text,
    'quality_check'::text,
    'research_gaps'::text
  ]));
