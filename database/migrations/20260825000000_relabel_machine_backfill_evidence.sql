-- 20260825000000_relabel_machine_backfill_evidence.sql
--
-- Phase 4 reconciliation (part 1 of the hygiene backlog):
--
-- 1. Relabel historical fake curator verification. ~990 model_evidence rows
--    carry source_type='curator_verified' with verified_by IS NULL — machine
--    output mislabeled as human-verified during earlier backfills. Every such
--    row becomes 'machine_backfill', the honest provenance label added in
--    20260824010000_extend_evidence_source_types.sql.
--
-- 2. Make recurrence structurally impossible: only rows attributed to a real
--    curator may claim curator_verified. Safe ONLY because step 1 first
--    brought the data into conformance (this ordering was deliberately
--    deferred from the Phase 2 migration for exactly that reason).

-- Step 1: honest relabel (reversible: filter is exactly verified_by IS NULL).
UPDATE public.model_evidence
SET source_type = 'machine_backfill',
    updated_at = now()
WHERE source_type = 'curator_verified'
  AND verified_by IS NULL;

-- Step 2: integrity constraint going forward.
ALTER TABLE public.model_evidence
  ADD CONSTRAINT model_evidence_curator_verified_requires_human
  CHECK (source_type <> 'curator_verified' OR verified_by IS NOT NULL);
