-- Clean, modern schema for Modelverse
-- Replaces legacy bloated schemas with lean, performant tables

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
    provider TEXT NOT NULL,
    category TEXT DEFAULT 'LLM',
    description TEXT,
    context_window INTEGER,
    parameters TEXT,
    modalities JSONB DEFAULT '["text"]'::jsonb,
    pricing JSONB DEFAULT '{}'::jsonb,
    benchmarks JSONB DEFAULT '{}'::jsonb,
    links JSONB DEFAULT '{}'::jsonb,
    release_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models_slug ON public.models(slug);
CREATE INDEX IF NOT EXISTS idx_models_provider ON public.models(provider);
CREATE INDEX IF NOT EXISTS idx_models_category ON public.models(category);
CREATE INDEX IF NOT EXISTS idx_models_is_active ON public.models(is_active);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON public.models(created_at DESC);

-- ----------------------------------------------------------------------------
-- 2. Articles Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'release',
    source_name TEXT,
    source_url TEXT,
    cover_image TEXT,
    related_models JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_is_published ON public.articles(is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC);

-- ----------------------------------------------------------------------------
-- 3. Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to active models"
    ON public.models
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Allow public read access to published articles"
    ON public.articles
    FOR SELECT
    USING (is_published = true);

-- Allow service role full access
CREATE POLICY "Allow service role full access to models"
    ON public.models
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service role full access to articles"
    ON public.articles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
