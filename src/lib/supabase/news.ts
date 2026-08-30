import { createServerClient } from './server';
import type { NewsItemRow, NewsItemInsert } from '@/types/database';

export interface GetNewsOptions {
  category?: string;
  articleType?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetNewsResult {
  news: NewsItemRow[];
  total: number;
  limit: number;
  offset: number;
  warning?: string;
}

export async function getNewsItems(options: GetNewsOptions = {}): Promise<GetNewsResult> {
  const {
    category,
    articleType,
    status = 'published',
    search,
    limit = 20,
    offset = 0,
  } = options;

  const supabase = createServerClient();

  let query = supabase
    .from('news_items')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('publish_date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (articleType) {
    query = query.eq('article_type', articleType);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      news: [],
      total: 0,
      limit,
      offset,
      warning: error.message,
    };
  }

  return {
    news: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  };
}

export async function getNewsItemBySlug(slug: string): Promise<NewsItemRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('news_items')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function upsertNewsItem(item: NewsItemInsert): Promise<NewsItemRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('news_items')
    .upsert(item, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert news item: ${error.message}`);
  }

  return data;
}
