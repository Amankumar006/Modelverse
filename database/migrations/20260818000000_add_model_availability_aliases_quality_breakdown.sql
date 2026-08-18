-- Add model availability, canonical aliases, and granular quality breakdown
-- Migration: 20260818000000_add_model_availability_aliases_quality_breakdown.sql

ALTER TABLE models
  ADD COLUMN IF NOT EXISTS chatgpt_availability JSONB,
  ADD COLUMN IF NOT EXISTS api_availability JSONB,
  ADD COLUMN IF NOT EXISTS aliases TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  ADD COLUMN IF NOT EXISTS quality_breakdown JSONB;

-- GIN index on aliases for fast lookup and deduplication
CREATE INDEX IF NOT EXISTS models_aliases_gin_idx ON models USING GIN (aliases);
