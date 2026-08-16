-- Migration: Deep-Dive Explainer Support
-- ---------------------------------------------------------------
-- ASSUMPTIONS (verify against real schema before applying):
--   - Table `news_items` exists in `public` schema
--   - `article_type` is either a text column with a CHECK constraint,
--     or a Postgres enum type. This migration handles both by checking
--     pg_type first. If your setup differs, adjust the DO block below.
--   - RLS is already enabled on news_items (per your security.md rules
--     for public-facing tables) — this migration does not touch policies,
--     since the new columns are read-only additions to an existing row
--     and inherit whatever SELECT policy already exists.
--
-- Run this with Supabase:apply_migration once MCP is authorized, or via
-- `supabase migration new deep_dive_articles` + paste + `supabase db push`.
-- ---------------------------------------------------------------

begin;

-- 1. Extend article_type to include 'deep-dive'
--    Handles both enum-based and CHECK-constraint-based article_type columns.
do $$
declare
  is_enum boolean;
  constraint_name text;
begin
  select exists (
    select 1 from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    where t.typname = 'article_type'
  ) into is_enum;

  if is_enum then
    -- Enum path
    if not exists (
      select 1 from pg_enum
      where enumlabel = 'deep-dive'
      and enumtypid = (select oid from pg_type where typname = 'article_type')
    ) then
      alter type article_type add value 'deep-dive';
    end if;
  else
    -- CHECK-constraint path: drop and recreate the constraint if it exists
    select conname into constraint_name
    from pg_constraint
    where conrelid = 'public.news_items'::regclass
      and pg_get_constraintdef(oid) ilike '%article_type%';

    if constraint_name is not null then
      execute format('alter table public.news_items drop constraint %I', constraint_name);
    end if;

    alter table public.news_items
      add constraint news_items_article_type_check
      check (article_type in ('brief', 'longform', 'deep-dive'));
  end if;
end $$;

-- 2. New columns for deep-dive metadata
alter table public.news_items
  add column if not exists deep_dive_score numeric,               -- breakthrough-gate composite score
  add column if not exists read_time_minutes int,                 -- for the reading-time badge
  add column if not exists has_diagram boolean default false,     -- whether a validated Mermaid diagram exists
  add column if not exists mermaid_diagrams jsonb default '[]'::jsonb, -- validated diagram code blocks
  add column if not exists curator_reviewed boolean default false, -- gate before public visibility (see notes)
  add column if not exists breakthrough_signals jsonb default '[]'::jsonb; -- which novelty keywords matched, for debugging/tuning

-- 3. Index to support the daily-cap check (see deep-dive-gate.js)
create index if not exists idx_news_items_deep_dive_daily
  on public.news_items (article_type, published_at)
  where article_type = 'deep-dive';

-- 4. Optional: enforce curator review before an unreviewed deep-dive can be
--    surfaced as 'indexed'. This mirrors your existing quality_status gate
--    but adds a human checkpoint specific to the new article type.
--    Uncomment once you're ready to enforce it at the DB level; until then
--    it's enforced in application code (score-explainer path).
-- alter table public.news_items
--   add constraint deep_dive_requires_review
--   check (article_type != 'deep-dive' or curator_reviewed = true or quality_status != 'indexed');

commit;
