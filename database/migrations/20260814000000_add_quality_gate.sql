-- Quality gate persistence for the Supabase-backed ingestion pipelines.
-- This is additive and safe to apply to production before deploying the code.

ALTER TABLE models
  ADD COLUMN IF NOT EXISTS quality_status TEXT,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  ADD COLUMN IF NOT EXISTS quality_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quality_checked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS card_summary TEXT,
  ADD COLUMN IF NOT EXISTS page_overview TEXT,
  ADD COLUMN IF NOT EXISTS editorial_note TEXT;

ALTER TABLE news_items
  ADD COLUMN IF NOT EXISTS sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quality_status TEXT,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  ADD COLUMN IF NOT EXISTS quality_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS quality_checked_at TIMESTAMPTZ;

ALTER TABLE models
  DROP CONSTRAINT IF EXISTS models_quality_status_check;
ALTER TABLE models
  ADD CONSTRAINT models_quality_status_check CHECK (quality_status IS NULL OR quality_status IN ('indexed', 'thin'));

ALTER TABLE news_items
  DROP CONSTRAINT IF EXISTS news_items_quality_status_check;
ALTER TABLE news_items
  ADD CONSTRAINT news_items_quality_status_check CHECK (quality_status IS NULL OR quality_status IN ('indexed', 'unlisted'));

CREATE INDEX IF NOT EXISTS models_quality_status_idx ON models (quality_status);
CREATE INDEX IF NOT EXISTS news_items_quality_status_idx ON news_items (quality_status);
