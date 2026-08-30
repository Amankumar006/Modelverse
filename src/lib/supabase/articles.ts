import { createServerClient } from './server';
import type { ArticleRow, ArticleInsert, ArticleUpdate } from '@/types/database';

export interface GetArticlesOptions {
  category?: string;
  isPublished?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetArticlesResult {
  articles: ArticleRow[];
  total: number;
  limit: number;
  offset: number;
  warning?: string;
}

export async function getArticles(options: GetArticlesOptions = {}): Promise<GetArticlesResult> {
  const {
    category,
    isPublished = true,
    search,
    limit = 20,
    offset = 0,
  } = options;

  const supabase = createServerClient();

  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('published_at', { ascending: false });

  if (isPublished !== undefined) {
    query = query.eq('is_published', isPublished);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      articles: [],
      total: 0,
      limit,
      offset,
      warning: error.message,
    };
  }

  return {
    articles: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  };
}

export async function getArticleBySlug(slug: string): Promise<ArticleRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function upsertArticle(article: ArticleInsert): Promise<ArticleRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('articles')
    .upsert(article, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert article: ${error.message}`);
  }

  return data;
}

export async function updateArticle(slug: string, updates: ArticleUpdate): Promise<ArticleRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update article: ${error.message}`);
  }

  return data;
}
