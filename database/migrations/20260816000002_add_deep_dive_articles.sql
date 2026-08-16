-- Migration: Deep-Dive Explainer Support
-- ---------------------------------------------------------------

DO $$
DECLARE
  is_enum boolean;
  constraint_name text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'article_type'
  ) INTO is_enum;

  IF is_enum THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum
      WHERE enumlabel = 'deep-dive'
      AND enumtypid = (SELECT oid FROM pg_type where typname = 'article_type')
    ) THEN
      ALTER TYPE article_type ADD VALUE 'deep-dive';
    END IF;
  ELSE
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.news_items'::regclass
      AND pg_get_constraintdef(oid) ILIKE '%article_type%';

    IF constraint_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.news_items DROP CONSTRAINT %I', constraint_name);
    END IF;

    ALTER TABLE public.news_items
      ADD CONSTRAINT news_items_article_type_check
      CHECK (article_type IN ('brief', 'longform', 'deep-dive'));
  END IF;
END $$;

ALTER TABLE public.news_items
  ADD COLUMN IF NOT EXISTS deep_dive_score numeric,
  ADD COLUMN IF NOT EXISTS read_time_minutes int,
  ADD COLUMN IF NOT EXISTS has_diagram boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS mermaid_diagrams jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS curator_reviewed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS breakthrough_signals jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_news_items_deep_dive_daily
  ON public.news_items (article_type, publish_date)
  WHERE article_type = 'deep-dive';
