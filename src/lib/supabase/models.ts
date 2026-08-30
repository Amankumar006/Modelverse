import { createServerClient } from './server';
import type { ModelRow, ModelInsert } from '@/types/database';

export interface GetModelsOptions {
  developer?: string;
  institution?: string;
  family?: string;
  status?: string;
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
    developer,
    institution,
    family,
    status = 'active',
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

  if (status) {
    query = query.eq('status', status);
  }

  if (developer) {
    query = query.eq('developer', developer);
  }

  if (institution) {
    query = query.eq('institution', institution);
  }

  if (family) {
    query = query.eq('family', family);
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
