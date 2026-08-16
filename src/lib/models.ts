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
  verified?: boolean;
  verificationStatus?: string;
  qualityStatus?: "indexed" | "thin";
}

export interface Benchmark {
  name: string;
  score: string | number;
  verified: boolean;
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
  cardSummary?: string;
  pageOverview?: string;
  editorialNote?: string;
  customSections?: { id: string; title: string; content: string }[];
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
            revalidate: 0,
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
    qualityStatus: row.quality_status,
    qualityScore: row.quality_score,
    qualityReasons: row.quality_reasons || [],
    qualityCheckedAt: row.quality_checked_at,
    cardSummary: row.card_summary,
    pageOverview: row.page_overview,
    editorialNote: row.editorial_note,
    customSections: row.metadata?.custom_sections || row.metadata?.customSections || row.custom_sections || [],
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
    verified: row.verified,
    verificationStatus: row.verification_status,
    qualityStatus: row.quality_status,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API (Supabase Backend)                                     */
/* ------------------------------------------------------------------ */

/** Return lightweight index summaries, sorted newest-first. */
export async function getAllModels(): Promise<ModelIndex[]> {
  const { data } = await supabase
    .from('models')
    .select('id, name, slug, developer, release_date, type, status, vendor_api_status, featured, boost, family, tier, institution, verified, verification_status, quality_status')
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
