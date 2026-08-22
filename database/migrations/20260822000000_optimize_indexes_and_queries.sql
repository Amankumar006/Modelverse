-- Migration: 20260822000000_optimize_indexes_and_queries.sql
-- Description: Adds high-impact partial and composite indexes, distinct aggregation RPCs, and RLS performance enhancements.

-- 1. High-Impact Partial & Composite Indexes for Models
CREATE INDEX IF NOT EXISTS idx_models_active_release_date
ON models (release_date DESC)
WHERE status != 'staged' AND (verification_status IS NULL OR verification_status != 'DISPUTED');

CREATE INDEX IF NOT EXISTS idx_models_developer_active
ON models (developer, release_date DESC)
WHERE status != 'staged';

CREATE INDEX IF NOT EXISTS idx_models_family_active
ON models (family, release_date DESC)
WHERE family IS NOT NULL AND status != 'staged';

CREATE INDEX IF NOT EXISTS idx_models_primary_task_active
ON models (primary_task, release_date DESC)
WHERE status != 'staged';

-- 2. Indexes for News Items
CREATE INDEX IF NOT EXISTS idx_news_items_published_date
ON news_items (publish_date DESC)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_news_items_category_published
ON news_items (category, publish_date DESC)
WHERE status = 'published';

-- 3. Foreign Key & Admin Audit Log Indexes
CREATE INDEX IF NOT EXISTS idx_community_submissions_submitted_by
ON community_submissions (submitted_by);

CREATE INDEX IF NOT EXISTS idx_audit_log_target_created
ON audit_log (target_type, target_id, created_at DESC);

-- 4. Fast Server-Side Aggregation RPCs for Developers and Families
CREATE OR REPLACE FUNCTION get_distinct_developers()
RETURNS TABLE (developer TEXT)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT m.developer
  FROM models m
  WHERE m.status != 'staged'
    AND (m.verification_status IS NULL OR m.verification_status != 'DISPUTED')
  ORDER BY m.developer ASC;
$$;

CREATE OR REPLACE FUNCTION get_distinct_families()
RETURNS TABLE (family TEXT)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT m.family
  FROM models m
  WHERE m.family IS NOT NULL
    AND m.status != 'staged'
    AND (m.verification_status IS NULL OR m.verification_status != 'DISPUTED')
  ORDER BY m.family ASC;
$$;
