/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Lightweight index entry for listing pages. */
export interface ModelIndex {
  id: string;
  name: string;
  slug: string;
  developer: string;
  releaseDate: string;
  type: "open-source" | "open-weights" | "closed-source" | "api-only" | "research-preview";
  status: "active" | "deprecated" | "sunset" | "staged" | string;
  vendorApiStatus?: "active" | "deprecated" | "sunset";
  featured: boolean;
  boost: number;
  family: string | null;
  tier?: string | null;
  institution?: string;
  verified?: boolean;
  verificationStatus?: string;
  qualityStatus?: "indexed" | "thin";
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters?: string | Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextWindow?: string | Record<string, any>;
  primaryTask?: string;
  previousVersion?: string | null;
  modality?: string[];
  deployment?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  license?: string | Record<string, any>;
  chatgptAvailability?: Record<string, unknown>;
  apiAvailability?: Record<string, unknown>;
  aliases?: string[];
  qualityBreakdown?: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

export interface Benchmark {
  name: string;
  score: string | number;
  verified: boolean;
  metricType?: "performance" | "technical" | "economic" | "ranking" | "availability" | string;
  sourceType?: "vendor-reported" | "independent-eval" | string;
  category?: string;
  subCategory?: string;
  citation?: string;
  source?: string;
  baseline?: string;
  hardware?: string;
  notes?: string;
  customColumns?: Record<string, string>;
  [key: string]: unknown;
}

/** Full model entry. */
export interface ModelEntry extends ModelIndex {
  updatedAt: string;
  modality: string[];
  primaryTask: string;
  deployment: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  license: string | Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: string | Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeParameters?: string | Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextWindow: string | Record<string, any>;
  description: string;
  descriptionDraft?: string;
  keyFeatures: string[];
  keyFeaturesDraft?: string[];
  benchmarks: Benchmark[];
  family: string | null;
  previousVersion: string | null;
  baseModel?: string | null;
  links: Record<string, string>;
  logo: string | null;
  images?: string[];
  tags: string[];
  sources: string[];
  verified: boolean;
  needsReview?: boolean;
  featured: boolean;
  boost: number;
  curatorNotes: string;
  isLegacyCurated?: boolean;
  verificationStatus?: "VERIFIED" | "LIKELY" | "DRAFT" | "DISPUTED";
  verifiedAt?: string;
  fieldConfidence?: {
    pricing?: "VERIFIED" | "LIKELY" | "DRAFT" | "DISPUTED";
    contextWindow?: "VERIFIED" | "LIKELY" | "DRAFT" | "DISPUTED";
    benchmarks?: "VERIFIED" | "LIKELY" | "DRAFT" | "DISPUTED";
    parameters?: "VERIFIED" | "LIKELY" | "DRAFT" | "DISPUTED";
  };
  vendorApiStatus?: "active" | "deprecated" | "sunset";
  costTiers?: { id: string; label: string; description?: string }[];
  pricing?: { tier?: string; unit: string; amount: number; currency: string; notes?: string }[];
  pricingLastVerified?: string;
  qualityStatus?: "indexed" | "thin";
  qualityScore?: number;
  qualityReasons?: string[];
  qualityCheckedAt?: string;
  qualityBreakdown?: Record<string, unknown>;
  cardSummary?: string;
  pageOverview?: string;
  editorialNote?: string;
  customSections?: { id: string; title: string; content: string }[];
  quickstart?: Record<string, string>;
  chatgptAvailability?: Record<string, unknown>;
  apiAvailability?: Record<string, unknown>;
  aliases?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.warn("⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL is missing during build.");
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          next: {
            revalidate: 60,
            tags: ['models']
          }
        });
      }
    }
  }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToModelEntry(row: any): ModelEntry {
  // Map snake_case to camelCase and merge metadata
  const base = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    releaseDate: row.release_date,
    type: row.type,
    status: row.status,
    vendorApiStatus: row.vendor_api_status,
    featured: row.featured,
    boost: row.boost,
    family: row.family,
    tier: row.tier,
    institution: row.institution,
    
    updatedAt: row.updated_at,
    modality: row.modality || [],
    primaryTask: row.primary_task,
    deployment: row.deployment || [],
    license: row.license,
    parameters: row.parameters,
    activeParameters: row.active_parameters,
    contextWindow: row.context_window,
    description: row.description,
    descriptionDraft: row.description_draft,
    keyFeatures: row.key_features || [],
    keyFeaturesDraft: row.key_features_draft,
    benchmarks: row.benchmarks || [],
    previousVersion: row.previous_version,
    baseModel: row.base_model,
    links: row.links || {},
    logo: row.logo,
    images: row.images || [],
    tags: row.tags || [],
    sources: row.sources || [],
    verified: Boolean(row.verified),
    needsReview: row.needs_review,
    curatorNotes: row.curator_notes,
    isLegacyCurated: row.is_legacy_curated,
    verificationStatus: row.verification_status,
    verifiedAt: row.reviewed_at,
    fieldConfidence: row.field_confidence,
    costTiers: row.cost_tiers,
    pricing: row.pricing,
    pricingLastVerified: row.pricing_last_verified,
    qualityStatus: row.quality_status,
    qualityScore: row.quality_score,
    qualityReasons: row.quality_reasons || [],
    qualityCheckedAt: row.quality_checked_at,
    qualityBreakdown: row.quality_breakdown,
    cardSummary: row.card_summary,
    pageOverview: row.page_overview,
    editorialNote: row.editorial_note,
    chatgptAvailability: row.chatgpt_availability || row.metadata?.chatgptAvailability || row.metadata?.chatgpt_availability,
    apiAvailability: row.api_availability || row.metadata?.apiAvailability || row.metadata?.api_availability,
    aliases: row.aliases || row.metadata?.aliases || [],
    customSections: row.metadata?.custom_sections || row.metadata?.customSections || row.custom_sections || [],
    quickstart: row.metadata?.quickstart || row.quickstart || undefined,
    metadata: row.metadata || {},
  };

  if (row.metadata) {
    return { ...row.metadata, ...base };
  }
  return base as ModelEntry;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToModelIndex(row: any): ModelIndex {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    releaseDate: row.release_date,
    type: row.type,
    status: row.status,
    vendorApiStatus: row.vendor_api_status,
    featured: row.featured,
    boost: row.boost,
    family: row.family,
    tier: row.tier,
    institution: row.institution,
    verified: Boolean(row.verified),
    verificationStatus: row.verification_status,
    qualityStatus: row.quality_status,
    modality: row.modality || [],
    deployment: row.deployment || [],
    license: row.license,
    chatgptAvailability: row.chatgpt_availability || row.metadata?.chatgptAvailability || row.metadata?.chatgpt_availability,
    apiAvailability: row.api_availability || row.metadata?.apiAvailability || row.metadata?.api_availability,
    aliases: row.aliases || row.metadata?.aliases || [],
    qualityBreakdown: row.quality_breakdown,
    description: row.description || row.metadata?.description || "",
    parameters: row.parameters || row.metadata?.parameters || "",
    contextWindow: row.context_window || row.metadata?.context_window || "",
    primaryTask: row.primary_task || row.metadata?.primary_task || "",
    previousVersion: row.previous_version || row.metadata?.previous_version || undefined,
    metadata: row.metadata || {},
  };
}

/* ------------------------------------------------------------------ */
/*  Public API (Supabase Backend with Build-Time In-Memory Cache)      */
/* ------------------------------------------------------------------ */

let cachedModelEntries: { data: ModelEntry[]; timestamp: number } | null = null;
let cachedModelIndexes: { data: ModelIndex[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60000; // 60 seconds in-memory cache

export interface GetModelsOptions {
  status?: string | null;
  vendorApiStatus?: string | null;
  developer?: string | null;
  type?: string | null;
  modality?: string | null;
  primaryTask?: string | null;
  q?: string | null;
  limit?: number;
  offset?: number;
}

export interface PaginatedModelsResult {
  models: ModelEntry[];
  total: number;
}

/** Return paginated models with database-level filtering, search, and pagination. */
export async function getPaginatedModels(options: GetModelsOptions): Promise<PaginatedModelsResult> {
  const {
    status,
    vendorApiStatus,
    developer,
    type,
    modality,
    primaryTask,
    q,
    limit = 20,
    offset = 0,
  } = options;

  try {
    let query = supabase
      .from('models')
      .select('*', { count: 'exact' })
      .neq('status', 'staged')
      .neq('verification_status', 'DISPUTED');

    if (status) {
      query = query.eq('status', status);
    }
    if (vendorApiStatus) {
      query = query.eq('vendor_api_status', vendorApiStatus);
    }
    if (developer) {
      query = query.ilike('developer', developer);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (primaryTask) {
      query = query.eq('primary_task', primaryTask);
    }
    if (modality) {
      query = query.contains('modality', [modality]);
    }
    if (q) {
      query = query.or(`name.ilike.%${q}%,developer.ilike.%${q}%,slug.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, count, error } = await query
      .order('release_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error in getPaginatedModels:", error);
      return { models: [], total: 0 };
    }

    const validData = (data || []).filter(
      (m) => !m.metadata?.redirect_to && !m.metadata?.redirectTo
    );

    return {
      models: validData.map(mapRowToModelEntry),
      total: count ?? validData.length,
    };
  } catch (err) {
    console.error("Unexpected error in getPaginatedModels:", err);
    return { models: [], total: 0 };
  }
}

/** Return lightweight index summaries, sorted newest-first. Excludes staged, disputed, and redirected models. */
export async function getAllModels(): Promise<ModelIndex[]> {
  const now = Date.now();
  if (cachedModelIndexes && now - cachedModelIndexes.timestamp < CACHE_TTL_MS) {
    return cachedModelIndexes.data;
  }

  try {
    const { data, error } = await supabase
      .from('models')
      .select('id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution, verified, verification_status, quality_status, modality, deployment, license, description, parameters, context_window, primary_task, previous_version, metadata')
      .neq('status', 'staged')
      .order('release_date', { ascending: false });

    if (error) {
      console.error("Database error in getAllModels:", error);
      return cachedModelIndexes?.data || [];
    }
    
    const result = (data || [])
      .filter((m) => m.verification_status !== 'DISPUTED' && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
      .map(mapRowToModelIndex);

    cachedModelIndexes = { data: result, timestamp: now };
    return result;
  } catch (err) {
    console.error("Unexpected error in getAllModels:", err);
    return cachedModelIndexes?.data || [];
  }
}

/** Return all full model entries, sorted newest-first. Excludes staged, disputed, and redirected models. */
export async function getAllModelEntries(): Promise<ModelEntry[]> {
  const now = Date.now();
  if (cachedModelEntries && now - cachedModelEntries.timestamp < CACHE_TTL_MS) {
    return cachedModelEntries.data;
  }

  try {
    const { data, error } = await supabase
      .from('models')
      .select('id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution, verified, verification_status, quality_status, quality_score, quality_reasons, quality_checked_at, quality_breakdown, modality, primary_task, deployment, license, parameters, active_parameters, context_window, description, key_features, benchmarks, previous_version, base_model, links, logo, images, tags, sources, pricing, cost_tiers, pricing_last_verified, card_summary, page_overview, editorial_note, chatgpt_availability, api_availability, aliases, updated_at, metadata')
      .neq('status', 'staged')
      .order('release_date', { ascending: false });
    
    if (error) {
      console.error("Database error in getAllModelEntries:", error);
      return cachedModelEntries?.data || [];
    }

    const result = (data || [])
      .filter((m) => m.verification_status !== 'DISPUTED' && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
      .map(mapRowToModelEntry);

    cachedModelEntries = { data: result, timestamp: now };
    return result;
  } catch (err) {
    console.error("Unexpected error in getAllModelEntries:", err);
    return cachedModelEntries?.data || [];
  }
}

/** Read a single model's full data by slug. */
export async function getModelBySlug(slug: string): Promise<ModelEntry | null> {
  try {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`Database error fetching model slug "${slug}":`, error);
      return null;
    }
    if (!data) return null;
    return mapRowToModelEntry(data);
  } catch (err) {
    console.error(`Unexpected error fetching model slug "${slug}":`, err);
    return null;
  }
}

/** Read models belonging to the same family (lightweight index projection). */
export async function getFamilyModels(family: string, excludeId?: string): Promise<ModelIndex[]> {
  try {
    let query = supabase
      .from('models')
      .select('id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution, verified, verification_status, quality_status, description, parameters, context_window, primary_task, metadata')
      .eq('family', family)
      .neq('status', 'staged')
      .order('release_date', { ascending: false })
      .limit(8);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Database error in getFamilyModels for family "${family}":`, error);
      return [];
    }
    return (data || [])
      .filter((m) => m.verification_status !== 'DISPUTED' && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
      .map(mapRowToModelIndex);
  } catch (err) {
    console.error(`Unexpected error in getFamilyModels for family "${family}":`, err);
    return [];
  }
}

/** Read related models sharing the same primary task (lightweight index projection). */
export async function getRelatedModels(primaryTask: string, excludeId?: string): Promise<ModelIndex[]> {
  try {
    let query = supabase
      .from('models')
      .select('id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution, verified, verification_status, quality_status, description, parameters, context_window, primary_task, metadata')
      .eq('primary_task', primaryTask)
      .eq('quality_status', 'indexed')
      .neq('status', 'staged')
      .order('release_date', { ascending: false })
      .limit(4);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Database error in getRelatedModels for primaryTask "${primaryTask}":`, error);
      return [];
    }
    return (data || [])
      .filter((m) => m.verification_status !== 'DISPUTED' && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
      .map(mapRowToModelIndex);
  } catch (err) {
    console.error(`Unexpected error in getRelatedModels for primaryTask "${primaryTask}":`, err);
    return [];
  }
}

/** Get all models belonging to a specific family */
export async function getModelsByFamily(family: string): Promise<ModelEntry[]> {
  try {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('family', family)
      .neq('status', 'staged')
      .order('release_date', { ascending: false });

    if (error) {
      console.error(`Database error in getModelsByFamily for "${family}":`, error);
      return [];
    }
    return (data || [])
      .filter((m) => m.verification_status !== 'DISPUTED' && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
      .map(mapRowToModelEntry);
  } catch (err) {
    console.error(`Unexpected error in getModelsByFamily for "${family}":`, err);
    return [];
  }
}

/** Get all models belonging to a specific developer */
export async function getModelsByDeveloper(developer: string): Promise<ModelEntry[]> {
  try {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .eq('developer', developer)
      .neq('status', 'staged')
      .order('release_date', { ascending: false });

    if (error) {
      console.error(`Database error in getModelsByDeveloper for "${developer}":`, error);
      return [];
    }
    return (data || [])
      .filter((m) => m.verification_status !== 'DISPUTED' && !m.metadata?.redirect_to && !m.metadata?.redirectTo)
      .map(mapRowToModelEntry);
  } catch (err) {
    console.error(`Unexpected error in getModelsByDeveloper for "${developer}":`, err);
    return [];
  }
}

/** Get all unique families from the models */
export async function getAllFamilies(): Promise<string[]> {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_distinct_families');
    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      return (rpcData as { family: string }[]).map((r) => r.family).filter(Boolean);
    }

    const { data, error } = await supabase
      .from('models')
      .select('family, status, verification_status, metadata')
      .not('family', 'is', null)
      .neq('status', 'staged');

    if (error) {
      console.error("Database error in getAllFamilies:", error);
      return [];
    }

    const validRows = (data || []).filter(
      (row) => row.verification_status !== 'DISPUTED' && !row.metadata?.redirect_to && !row.metadata?.redirectTo
    );
    const seen = new Set<string>();
    const families: string[] = [];
    for (const row of validRows) {
      if (!row.family) continue;
      const key = row.family.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        families.push(row.family);
      }
    }
    return families.sort();
  } catch (err) {
    console.error("Unexpected error in getAllFamilies:", err);
    return [];
  }
}

/** Get all unique developers from the models. */
export async function getAllDevelopers(): Promise<string[]> {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_distinct_developers');
    if (!rpcError && Array.isArray(rpcData) && rpcData.length > 0) {
      return (rpcData as { developer: string }[]).map((r) => r.developer).filter(Boolean);
    }

    const { data, error } = await supabase
      .from('models')
      .select('developer, status, verification_status, metadata')
      .neq('status', 'staged');

    if (error) {
      console.error("Database error in getAllDevelopers:", error);
      return [];
    }

    const validRows = (data || []).filter(
      (row) => row.verification_status !== 'DISPUTED' && !row.metadata?.redirect_to && !row.metadata?.redirectTo
    );
    const devs = new Set(validRows.map(row => row.developer));
    return Array.from(devs).sort();
  } catch (err) {
    console.error("Unexpected error in getAllDevelopers:", err);
    return [];
  }
}

/** Get total count of models tracked. */
export async function getModelCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('models')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'staged');

    if (error) {
      console.error("Database error in getModelCount:", error);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error("Unexpected error in getModelCount:", err);
    return 0;
  }
}


/** Format parameters display string including active parameters if present */
export function formatParameters(model: { parameters?: string | unknown; activeParameters?: string | unknown }): string {
  if (!model.parameters) return "Undisclosed";
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let p: any = model.parameters;
  if (typeof p === "object" && p !== null) {
    if (Array.isArray(p)) {
      if (p.length > 0 && typeof p[0] === 'object') {
        p = "Undisclosed";
      } else {
        p = p.join(" / ");
      }
    } else {
      p = Object.values(p).join(" / ");
    }
  }
  
  p = String(p);

  if (model.activeParameters) {
    const active = String(model.activeParameters).toLowerCase().includes("active")
      ? String(model.activeParameters)
      : `${model.activeParameters} active`;
    if (p.includes("(") || p.toLowerCase().includes("active")) {
      return p;
    }
    return `${p} (${active})`;
  }
  return p;
}

/** Flatten modality array or object to string array */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getModalities(mod: any): string[] {
  if (Array.isArray(mod)) return mod;
  if (typeof mod === "object" && mod !== null) {
    const allMods = new Set<string>();
    if (mod.input && Array.isArray(mod.input)) {
      mod.input.forEach((m: string) => allMods.add(m));
    }
    if (mod.output && Array.isArray(mod.output)) {
      mod.output.forEach((m: string) => allMods.add(m));
    }
    return Array.from(allMods);
  }
  return [];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Base URL for canonical links and OG images. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
