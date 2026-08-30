import type { Json } from './models';

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  category: string | null;
  source_name: string | null;
  source_url: string | null;
  cover_image: string | null;
  related_models: Json;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type ArticleInsert = {
  id?: string;
  slug: string;
  title: string;
  content: string;
  summary?: string | null;
  category?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  cover_image?: string | null;
  related_models?: Json;
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type ArticleUpdate = {
  id?: string;
  slug?: string;
  title?: string;
  content?: string;
  summary?: string | null;
  category?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  cover_image?: string | null;
  related_models?: Json;
  is_published?: boolean;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
};
