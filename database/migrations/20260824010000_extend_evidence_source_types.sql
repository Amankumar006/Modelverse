-- 20260824010000_extend_evidence_source_types.sql
--
-- Extends model_evidence.source_type with:
--   'web_research'    — values found via Gemini google_search grounding by the
--                       research_gaps worker; each row must cite a real URL.
--   'machine_backfill' — honest provenance for deterministic pipeline output
--                       that historically was mislabeled curator_verified
--                       (Phase 4 relabels the 990 existing fake rows).
--
-- Additive only: no existing rows change meaning, no column changes.

ALTER TABLE public.model_evidence
  DROP CONSTRAINT IF EXISTS model_evidence_source_type_check;

ALTER TABLE public.model_evidence
  ADD CONSTRAINT model_evidence_source_type_check
  CHECK (source_type = ANY (ARRAY[
    'official_model_card'::text,
    'provider_api'::text,
    'benchmark_paper'::text,
    'independent_eval'::text,
    'curator_verified'::text,
    'live_telemetry'::text,
    'web_research'::text,
    'machine_backfill'::text,
    'other'::text
  ]));

-- Guard against a recurrence of the fake-curator-evidence problem: once the
-- historical rows are relabeled (Phase 4), only rows attributed to a real
-- curator may carry source_type = 'curator_verified'.
-- NOTE: intentionally added in the Phase 4 reconciliation PR, AFTER the data
-- conforms — enabling it now would fail on the existing 990 rows.
