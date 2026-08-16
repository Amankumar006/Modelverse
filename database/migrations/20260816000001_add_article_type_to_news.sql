-- Add article_type column to news_items
ALTER TABLE news_items
  ADD COLUMN IF NOT EXISTS article_type TEXT;
