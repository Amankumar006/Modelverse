-- 20260825110000_normalize_empty_string_pricing.sql
--
-- models.pricing is jsonb and historically holds several shapes (array,
-- object, string, null). 25 rows carried pricing = '' (empty string) — junk
-- written before the staged-changes layer, and actively harmful: truthy with
-- a .length, so unguarded `pricing.length > 0` consumers passed and then
-- crashed on .map (this broke the production build while prerendering
-- /models/mira on 2026-08-25).
--
-- Normalize empty strings to NULL, the shape the UI already treats as
-- "no public pricing". Non-empty strings/objects are left untouched — the
-- Array.isArray guards shipped in the same hotfix render them safely, and
-- converting richer shapes belongs to a considered follow-up, not a hotfix.

UPDATE public.models
SET pricing = NULL,
    updated_at = now()
WHERE pricing IS NOT NULL
  AND jsonb_typeof(pricing) = 'string'
  AND pricing = '""'::jsonb;
