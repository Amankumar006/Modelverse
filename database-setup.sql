-- 1. Add yourself as an Admin Curator
INSERT INTO curator_profiles (id, role, display_name) 
VALUES ('c69639f8-1047-4701-b992-0a1cfbc96bb8', 'admin', 'Admin')
ON CONFLICT (id) DO NOTHING;

-- 2. Drop the old/incorrect news_items table (if it exists)
DROP TABLE IF EXISTS news_items;

-- 3. Create the correct news_items table for the migration
CREATE TABLE news_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    excerpt TEXT,
    cover_image TEXT,
    author TEXT DEFAULT 'Modelverse Editorial',
    category TEXT DEFAULT 'short-news',
    publish_date DATE DEFAULT CURRENT_DATE,
    read_time TEXT,
    status TEXT DEFAULT 'published',
    confidence_level TEXT DEFAULT 'confirmed',
    external_sources JSONB DEFAULT '[]'::jsonb,
    sources JSONB DEFAULT '[]'::jsonb,
    related_models JSONB DEFAULT '[]'::jsonb,
    tags JSONB DEFAULT '[]'::jsonb,
    quality_status TEXT CHECK (quality_status IS NULL OR quality_status IN ('indexed', 'unlisted')),
    quality_score INTEGER,
    quality_reasons JSONB DEFAULT '[]'::jsonb,
    quality_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for news_items
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to news_items
CREATE POLICY "Public can view published news"
ON news_items
FOR SELECT
TO public
USING (status = 'published');

-- Allow curators full access to news_items
CREATE POLICY "Curators can manage news"
ON news_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM curator_profiles WHERE curator_profiles.id = auth.uid()
  )
);

-- 4. Create community_submissions table
CREATE TABLE IF NOT EXISTS community_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name TEXT NOT NULL,
    developer TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT,
    submitted_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for community_submissions
ALTER TABLE community_submissions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to submit models
CREATE POLICY "Authenticated users can submit models"
ON community_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Allow users to view their own submissions
CREATE POLICY "Users can view own submissions"
ON community_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = submitted_by);

-- Allow curators full access to submissions
CREATE POLICY "Curators can manage submissions"
ON community_submissions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM curator_profiles WHERE curator_profiles.id = auth.uid()
  )
);
