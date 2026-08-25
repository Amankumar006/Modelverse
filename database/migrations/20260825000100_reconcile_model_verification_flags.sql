-- 20260825000100_reconcile_model_verification_flags.sql
--
-- Phase 4 reconciliation (part 2): align models.verified / verification_status
-- with their actual provenance. The Aug 2026 audit found:
--   - 13 models stamped verification_status='VERIFIED' with reviewed_by IS NULL
--     (machine output carrying a human-only label)
--   - 4 models with verified=true while verification_status <> 'VERIFIED'
--
-- Rules applied (all reversible, condition-scoped):
--   1. Only humans confer VERIFIED. Machine-stamped ones drop to LIKELY with
--      verified=false — cards may leave indexed feeds; that is the honest state.
--   2. The boolean `verified` may never contradict verification_status.
--
-- NOT touched deliberately: needs_review=true rows that also carry
-- reviewed_at/reviewed_by. Under the staged-changes flow (#78) that pattern
-- means "reviewed once, re-flagged by new pipeline activity since" — normal,
-- and wiping the reviewer attribution would erase real history.

-- Rule 1: machine-stamped VERIFIED -> LIKELY, unverified.
UPDATE public.models
SET verification_status = 'LIKELY',
    verified = false,
    updated_at = now()
WHERE verification_status = 'VERIFIED'
  AND reviewed_by IS NULL;

-- Rule 2: verified flag must agree with verification_status.
UPDATE public.models
SET verified = false,
    updated_at = now()
WHERE verified = true
  AND verification_status <> 'VERIFIED';
