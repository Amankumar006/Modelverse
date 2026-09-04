import { unstable_cache } from 'next/cache';
import { createServerClient } from './server';
import { getModels } from './models';
import type { ArticleRow, ArticleInsert, ArticleUpdate, ModelRow } from '@/types/database';

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

async function fetchArticlesFromDb(options: GetArticlesOptions): Promise<GetArticlesResult> {
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

export async function getArticles(options: GetArticlesOptions = {}): Promise<GetArticlesResult> {
  const cacheKey = `articles-${options.category || ''}-${options.search || ''}-${options.limit || 20}-${options.offset || 0}-${options.isPublished ?? true}`;
  return unstable_cache(
    () => fetchArticlesFromDb(options),
    [cacheKey],
    { revalidate: 60, tags: ['articles'] }
  )();
}

export async function getArticleBySlug(slug: string): Promise<ArticleRow | null> {
  return unstable_cache(
    async () => {
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
    },
    [`article-slug-${slug}`],
    { revalidate: 300, tags: ['articles', `article-${slug}`] }
  )();
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

export async function getArticlesForModel(
  modelSlug: string,
  modelName?: string
): Promise<ArticleRow[]> {
  return unstable_cache(
    async () => {
      const { articles } = await getArticles({ limit: 100, isPublished: true });
      const slugLower = modelSlug.toLowerCase();
      const cleanModelName = (modelName || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
      const nameTokens = cleanModelName.split(/\s+/).filter((t) => t.length > 2);

      return articles.filter((a) => {
        if (Array.isArray(a.related_models)) {
          if (
            a.related_models.some(
              (m) =>
                typeof m === "string" &&
                (m.toLowerCase() === slugLower || m.toLowerCase().includes(slugLower))
            )
          ) {
            return true;
          }
        }

        const articleSlugLower = a.slug.toLowerCase();
        const articleTitleLower = a.title.toLowerCase();

        if (articleSlugLower.includes(slugLower) || articleTitleLower.includes(slugLower)) {
          return true;
        }

        if (
          nameTokens.length >= 2 &&
          nameTokens.every(
            (token) => articleSlugLower.includes(token) || articleTitleLower.includes(token)
          )
        ) {
          return true;
        }

        return false;
      });
    },
    [`articles-for-model-${modelSlug}`],
    { revalidate: 60, tags: ["articles", "models", `model-articles-${modelSlug}`] }
  )();
}

export async function getModelsForArticle(article: ArticleRow): Promise<ModelRow[]> {
  return unstable_cache(
    async () => {
      const { models } = await getModels({ limit: 1000, isActive: true });
      const relatedSlugs = new Set<string>();

      if (Array.isArray(article.related_models)) {
        article.related_models.forEach((m) => {
          if (typeof m === "string") relatedSlugs.add(m.toLowerCase());
        });
      }

      const articleTitleLower = article.title.toLowerCase();
      const articleSlugLower = article.slug.toLowerCase();

      const matched = models.filter((m) => {
        const mSlugLower = m.slug.toLowerCase();
        if (relatedSlugs.has(mSlugLower)) return true;
        if (articleSlugLower.includes(mSlugLower)) return true;

        const cleanName = m.name.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
        const words = cleanName.split(/\s+/).filter((w) => w.length > 2);
        if (words.length >= 2) {
          const joinedPattern = words.join(" ");
          if (articleTitleLower.includes(joinedPattern) || articleSlugLower.includes(words.join("-"))) {
            return true;
          }
        }
        return false;
      });

      return matched.slice(0, 3);
    },
    [`models-for-article-${article.slug}`],
    { revalidate: 60, tags: ["articles", "models", `article-models-${article.slug}`] }
  )();
}
