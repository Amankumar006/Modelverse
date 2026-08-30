-- Baseline schema snapshot of live Supabase database
-- Generated on 2026-08-30

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Models Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    developer TEXT,
    institution TEXT,
    family TEXT,
    type TEXT,
    primary_task TEXT,
    status TEXT DEFAULT 'active',
    vendor_api_status TEXT DEFAULT 'COMMUNITY_HOSTED',
    deployment JSONB DEFAULT '[]'::jsonb,
    release_date DATE,
    previous_version TEXT,
    tier TEXT DEFAULT 'general',
    logo TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    links JSONB DEFAULT '{}'::jsonb,
    sources JSONB DEFAULT '[]'::jsonb,
    pricing JSONB DEFAULT '{}'::jsonb,
    parameters TEXT,
    active_parameters TEXT,
    context_window TEXT,
    benchmarks JSONB DEFAULT '[]'::jsonb,
    capabilities JSONB DEFAULT '{}'::jsonb,
    field_confidence JSONB DEFAULT '{}'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    boost INTEGER DEFAULT 1,
    verified BOOLEAN DEFAULT FALSE,
    verification_status TEXT DEFAULT 'LIKELY',
    needs_review BOOLEAN DEFAULT FALSE,
    curator_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    source TEXT,
    modality JSONB DEFAULT '["text"]'::jsonb,
    license TEXT DEFAULT 'proprietary',
    base_model TEXT,
    is_legacy_curated BOOLEAN DEFAULT FALSE,
    cost_tiers JSONB,
    pricing_last_verified TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    quality_status TEXT DEFAULT 'thin',
    quality_score INTEGER DEFAULT 0,
    quality_breakdown JSONB DEFAULT '{}'::jsonb,
    quality_reasons JSONB DEFAULT '[]'::jsonb,
    quality_checked_at TIMESTAMPTZ,
    card_summary TEXT,
    page_overview TEXT,
    editorial_note TEXT,
    description TEXT,
    description_draft TEXT,
    key_features JSONB DEFAULT '[]'::jsonb,
    key_features_draft JSONB DEFAULT '[]'::jsonb,
    chatgpt_availability BOOLEAN DEFAULT FALSE,
    api_availability JSONB DEFAULT '[]'::jsonb,
    aliases JSONB DEFAULT '[]'::jsonb,
    staged_changes JSONB DEFAULT '{}'::jsonb,
    staged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for models
CREATE INDEX IF NOT EXISTS idx_models_slug ON public.models(slug);
CREATE INDEX IF NOT EXISTS idx_models_status ON public.models(status);
CREATE INDEX IF NOT EXISTS idx_models_quality_status ON public.models(quality_status);
CREATE INDEX IF NOT EXISTS idx_models_institution ON public.models(institution);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON public.models(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. News Items Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author TEXT DEFAULT 'Modelverse Editorial',
    category TEXT DEFAULT 'ai-news',
    publish_date DATE DEFAULT CURRENT_DATE,
    read_time TEXT DEFAULT '2 min read',
    status TEXT DEFAULT 'published',
    confidence_level TEXT DEFAULT 'confirmed',
    external_sources JSONB DEFAULT '[]'::jsonb,
    sources JSONB DEFAULT '[]'::jsonb,
    related_models JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    article_type TEXT,
    deep_dive_score NUMERIC,
    read_time_minutes INTEGER,
    has_diagram BOOLEAN DEFAULT FALSE,
    mermaid_diagrams JSONB DEFAULT '[]'::jsonb,
    curator_reviewed BOOLEAN DEFAULT FALSE,
    breakthrough_signals JSONB DEFAULT '[]'::jsonb,
    quality_status TEXT DEFAULT 'indexed',
    quality_score INTEGER DEFAULT 0,
    quality_reasons JSONB DEFAULT '[]'::jsonb,
    quality_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for news_items
CREATE INDEX IF NOT EXISTS idx_news_slug ON public.news_items(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON public.news_items(status);
CREATE INDEX IF NOT EXISTS idx_news_quality_status ON public.news_items(quality_status);
CREATE INDEX IF NOT EXISTS idx_news_publish_date ON public.news_items(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_article_type ON public.news_items(article_type);

-- ----------------------------------------------------------------------------
-- 3. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active models
CREATE POLICY "Allow public read access to models"
    ON public.models
    FOR SELECT
    USING (true);

-- Allow public read access to published news
CREATE POLICY "Allow public read access to news_items"
    ON public.news_items
    FOR SELECT
    USING (status = 'published');

-- Write policies are restricted to authenticated service_role
CREATE POLICY "Allow service role full access to models"
    ON public.models
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role full access to news_items"
    ON public.news_items
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
