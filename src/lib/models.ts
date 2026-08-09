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
  status: "active" | "deprecated" | "sunset";
  vendorApiStatus?: "active" | "deprecated" | "sunset";
  featured: boolean;
  boost: number;
  family: string | null;
  tier?: string | null;
  institution?: string;
}

export interface Benchmark {
  name: string;
  score: string;
  verified: boolean;
  sourceType?: "vendor-reported" | "independent-eval";
  category?: string;
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
  };
  vendorApiStatus?: "active" | "deprecated" | "sunset";
  costTiers?: { id: string; label: string; description?: string }[];
  pricing?: { tier?: string; unit: string; amount: number; currency: string; notes?: string }[];
  pricingLastVerified?: string;
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.warn("⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL is missing during build.");
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
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
    verified: row.verified,
    needsReview: row.needs_review,
    curatorNotes: row.curator_notes,
    isLegacyCurated: row.is_legacy_curated,
    verificationStatus: row.verification_status,
    verifiedAt: row.reviewed_at,
    fieldConfidence: row.field_confidence,
    costTiers: row.cost_tiers,
    pricing: row.pricing,
    pricingLastVerified: row.pricing_last_verified,
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
  };
}

/* ------------------------------------------------------------------ */
/*  Public API (Supabase Backend)                                     */
/* ------------------------------------------------------------------ */

/** Return lightweight index summaries, sorted newest-first. */
export async function getAllModels(): Promise<ModelIndex[]> {
  const { data } = await supabase
    .from('models')
    .select('id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution')
    .order('release_date', { ascending: false });
  return (data || []).map(mapRowToModelIndex);
}

/** Return all full model entries, sorted newest-first. */
export async function getAllModelEntries(): Promise<ModelEntry[]> {
  const { data } = await supabase
    .from('models')
    .select('*')
    .order('release_date', { ascending: false });
  return (data || []).map(mapRowToModelEntry);
}

/** Return the N most recently released models. */
export async function getRecentModels(n: number): Promise<ModelIndex[]> {
  const { data } = await supabase
    .from('models')
    .select('id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution')
    .order('release_date', { ascending: false })
    .limit(n);
  return (data || []).map(mapRowToModelIndex);
}

/** Return all slugs — for generateStaticParams. */
export async function getAllSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from('models')
    .select('slug');
  return (data || []).map(row => row.slug);
}

/** Read a single model's full data by slug. */
export async function getModelBySlug(slug: string): Promise<ModelEntry | null> {
  const { data } = await supabase
    .from('models')
    .select('*')
    .eq('slug', slug)
    .single();
  if (!data) return null;
  return mapRowToModelEntry(data);
}

/** Get all unique developers from the models. */
export async function getAllDevelopers(): Promise<string[]> {
  const { data } = await supabase
    .from('models')
    .select('developer');
  const devs = new Set((data || []).map(row => row.developer));
  return Array.from(devs).sort();
}

/** Get total count of models tracked. */
export async function getModelCount(): Promise<number> {
  const { count } = await supabase
    .from('models')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

/** Get developers and their counts of tracked models. */
export async function getDeveloperCounts(): Promise<{ developer: string; count: number }[]> {
  const { data } = await supabase
    .from('models')
    .select('developer');
  const counts: Record<string, number> = {};
  (data || []).forEach(row => {
    counts[row.developer] = (counts[row.developer] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([developer, count]) => ({ developer, count }))
    .sort((a, b) => b.count - a.count || a.developer.localeCompare(b.developer));
}

/** Format parameters display string including active parameters if present */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatParameters(model: { parameters?: string | any; activeParameters?: string | any }): string {
  if (!model.parameters) return "Undisclosed";
  const p = typeof model.parameters === "object" && model.parameters !== null ? Object.values(model.parameters).join(" / ") : model.parameters;
  if (model.activeParameters) {
    const active = model.activeParameters.toLowerCase().includes("active")
      ? model.activeParameters
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

