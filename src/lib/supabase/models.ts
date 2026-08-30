import { createServerClient } from './server';
import type { ModelRow, ModelInsert, ModelUpdate } from '@/types/database';

export interface GetModelsOptions {
  provider?: string;
  category?: string;
  isActive?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface GetModelsResult {
  models: ModelRow[];
  total: number;
  limit: number;
  offset: number;
  warning?: string;
}

export async function getModels(options: GetModelsOptions = {}): Promise<GetModelsResult> {
  const {
    provider,
    category,
    isActive = true,
    search,
    limit = 20,
    offset = 0,
  } = options;

  const supabase = createServerClient();

  let query = supabase
    .from('models')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (isActive !== undefined) {
    query = query.eq('is_active', isActive);
  }

  if (provider) {
    query = query.eq('provider', provider);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return {
      models: [],
      total: 0,
      limit,
      offset,
      warning: error.message,
    };
  }

  return {
    models: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  };
}

export async function getModelBySlug(slug: string): Promise<ModelRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('models')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function upsertModel(model: ModelInsert): Promise<ModelRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('models')
    .upsert(model, { onConflict: 'slug' })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upsert model: ${error.message}`);
  }

  return data;
}

export async function updateModel(slug: string, updates: ModelUpdate): Promise<ModelRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('models')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update model: ${error.message}`);
  }

  return data;
}
