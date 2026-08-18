-- Enforce database-level invariant between benchmarks and quality_breakdown statistics
-- Migration: 20260818000001_enforce_benchmark_breakdown_invariant.sql

CREATE OR REPLACE FUNCTION fn_calculate_model_benchmark_counts(
  p_benchmarks JSONB,
  p_sources TEXT[],
  p_field_confidence JSONB,
  p_links JSONB
)
RETURNS TABLE (
  perf_count INT,
  tech_count INT,
  econ_count INT,
  rank_count INT,
  avail_count INT
)
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  elem JSONB;
  m_type TEXT;
  is_numeric BOOLEAN;
  is_verified_sourced BOOLEAN;
  score_text TEXT;
  has_model_source BOOLEAN;
BEGIN
  perf_count := 0;
  tech_count := 0;
  econ_count := 0;
  rank_count := 0;
  avail_count := 0;

  IF p_benchmarks IS NULL OR jsonb_typeof(p_benchmarks) <> 'array' THEN
    RETURN NEXT;
    RETURN;
  END IF;

  has_model_source := (p_sources IS NOT NULL AND cardinality(p_sources) > 0)
    OR (p_field_confidence IS NOT NULL AND (p_field_confidence->>'benchmarks' IN ('VERIFIED', 'OFFICIAL')))
    OR (p_links IS NOT NULL AND p_links <> '{}'::jsonb);

  FOR elem IN SELECT * FROM jsonb_array_elements(p_benchmarks)
  LOOP
    m_type := LOWER(TRIM(COALESCE(elem->>'metricType', 'performance')));
    
    score_text := TRIM(COALESCE(elem->>'score', ''));
    -- Check if parseable as numeric (allowing commas, decimals, percentages)
    is_numeric := (score_text ~ '^-?[0-9]+(\.[0-9]+)?%?$');

    is_verified_sourced := is_numeric AND (
      (elem ? 'source' AND elem->>'source' ~* '^https?://')
      OR (elem ? 'citation' AND elem->>'citation' ~* '^https?://')
      OR (elem ? 'sources' AND jsonb_typeof(elem->'sources') = 'array' AND jsonb_array_length(elem->'sources') > 0)
      OR has_model_source
    );

    IF m_type = 'performance' THEN
      IF is_verified_sourced THEN
        perf_count := perf_count + 1;
      END IF;
    ELSIF m_type = 'technical' THEN
      tech_count := tech_count + 1;
    ELSIF m_type = 'economic' THEN
      econ_count := econ_count + 1;
    ELSIF m_type = 'ranking' THEN
      rank_count := rank_count + 1;
    ELSIF m_type = 'availability' THEN
      avail_count := avail_count + 1;
    END IF;
  END LOOP;

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION fn_enforce_benchmark_breakdown_invariant()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_perf INT;
  v_tech INT;
  v_econ INT;
  v_rank INT;
  v_avail INT;
  v_meets_gate BOOLEAN;
BEGIN
  IF NEW.quality_breakdown IS NOT NULL AND jsonb_typeof(NEW.quality_breakdown) = 'object' THEN
    SELECT perf_count, tech_count, econ_count, rank_count, avail_count
    INTO v_perf, v_tech, v_econ, v_rank, v_avail
    FROM fn_calculate_model_benchmark_counts(NEW.benchmarks, NEW.sources, NEW.field_confidence, NEW.links);

    v_meets_gate := (v_perf >= 2);

    NEW.quality_breakdown := NEW.quality_breakdown || jsonb_build_object(
      'performanceBenchmarkCount', v_perf,
      'technicalMetricCount', v_tech,
      'economicMetricCount', v_econ,
      'rankingMetricCount', v_rank,
      'availabilityMetricCount', v_avail,
      'meetsTwoPerformanceBenchmarkGate', v_meets_gate
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_benchmark_breakdown_invariant ON models;

CREATE TRIGGER trg_enforce_benchmark_breakdown_invariant
  BEFORE INSERT OR UPDATE OF benchmarks, sources, field_confidence, links, quality_breakdown
  ON models
  FOR EACH ROW
  EXECUTE FUNCTION fn_enforce_benchmark_breakdown_invariant();
