import modelsArchive from "./models-archive.json";

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
}

/** Full model entry. */
export interface ModelEntry extends ModelIndex {
  updatedAt: string;
  modality: string[];
  primaryTask: string;
  deployment: string[];
  license: string | Record<string, any>;
  parameters: string | Record<string, any>;
  activeParameters?: string | Record<string, any>;
  contextWindow: string | Record<string, any>;
  description: string;
  descriptionDraft?: string;
  keyFeatures: string[];
  keyFeaturesDraft?: string[];
  benchmarks: Benchmark[];
  family: string | null;
  previousVersion: string | null;
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
  verificationStatus?: "VERIFIED" | "DRAFT" | "DISPUTED";
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

/* ------------------------------------------------------------------ */
/*  Development Hot-Reload Helper                                      */
/* ------------------------------------------------------------------ */

let _devCachedEntries: ModelEntry[] | null = null;

export function clearModelCache() {
  _devCachedEntries = null;
}

function loadDevEntries(): ModelEntry[] {
  if (typeof window !== "undefined") return modelsArchive as unknown as ModelEntry[];
  
  if (_devCachedEntries) return _devCachedEntries;

  const fs = require("fs");
  const path = require("path");
  const { z } = require("zod");

  const DATA_DIR = path.join(process.cwd(), "data", "models");
  const files = fs.readdirSync(DATA_DIR).filter((f: string) => f.endsWith(".json") && f !== "_index.json");

  const entries: any[] = [];

  // Re-declare mini schema here for validation check in dev
  const ModelSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    developer: z.string(),
    releaseDate: z.string(),
    updatedAt: z.string(),
    type: z.enum(["open-source", "open-weights", "closed-source", "api-only", "research-preview", "research"]),
    status: z.enum(["active", "deprecated", "sunset"]).default("active"),
    modality: z.any(),
    primaryTask: z.string(),
    deployment: z.array(z.any()),
    license: z.any(),
    parameters: z.any().optional(),
    contextWindow: z.any().optional(),
    description: z.string(),
    templatedDescription: z.boolean().optional(),
    keyFeatures: z.any().optional(),
    benchmarks: z.any().optional(),
    family: z.string().nullable().optional(),
    tier: z.string().optional(),
    institution: z.string().optional(),
    previousVersion: z.string().nullable().optional(),
    costTiers: z.any().optional(),
    pricing: z.any().optional(),
    pricingLastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    links: z.any().optional(),
    logo: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    sources: z.any().optional(),
    verified: z.boolean().optional(),
    featured: z.boolean().default(false),
    boost: z.number().default(1),
    curatorNotes: z.string().default(""),
    vendorApiStatus: z.enum(["active", "deprecated", "sunset"]).optional()
  }).passthrough();

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
      const result = ModelSchema.safeParse(raw);
      if (!result.success) {
        console.warn(`[DEV] Validation failed for ${file}:`, result.error.format());
        // Fallback: push raw object if essential fields exist
        if (raw.id && raw.slug && raw.name) {
          entries.push(raw);
        }
        continue;
      }
      entries.push(result.data);
    } catch (err: any) {
      console.error(`[DEV] Failed to parse model file ${file}:`, err.message);
    }
  }

  entries.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  // Auto-regenerate files in background so client bundles are hot-reloaded
  try {
    const searchIndex = entries.map((e) => ({
      id: e.id,
      name: e.name,
      slug: e.slug,
      developer: e.developer,
      type: e.type,
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    fs.writeFileSync(path.join(process.cwd(), "src", "lib", "search-index.json"), JSON.stringify(searchIndex, null, 2));
    fs.writeFileSync(path.join(process.cwd(), "src", "lib", "models-archive.json"), JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error("[DEV] Failed to regenerate compile artifacts:", err);
  }

  _devCachedEntries = entries as ModelEntry[];
  return _devCachedEntries;
}

function loadAllEntries(): ModelEntry[] {
  if (process.env.NODE_ENV !== "production") {
    return loadDevEntries();
  }
  return modelsArchive as unknown as ModelEntry[];
}

/* ------------------------------------------------------------------ */
/*  Public API (Precompiled in production, Dynamic in development)      */
/* ------------------------------------------------------------------ */

/** Return lightweight index summaries, sorted newest-first. */
export function getAllModels(): ModelIndex[] {
  return loadAllEntries().map((e) => ({
    id: e.id,
    name: e.name,
    slug: e.slug,
    developer: e.developer,
    releaseDate: e.releaseDate,
    type: e.type,
    status: e.status,
    vendorApiStatus: e.vendorApiStatus,
    featured: e.featured,
    boost: e.boost,
    family: e.family,
    tier: e.tier,
    institution: e.institution,
  }));
}

/** Return all full model entries, sorted newest-first. */
export function getAllModelEntries(): ModelEntry[] {
  return loadAllEntries();
}

/** Return the N most recently released models. */
export function getRecentModels(n: number): ModelIndex[] {
  return getAllModels().slice(0, n);
}

/** Return all slugs — for generateStaticParams. */
export function getAllSlugs(): string[] {
  return loadAllEntries().map((m) => m.slug);
}

/** Read a single model's full data by slug. */
export function getModelBySlug(slug: string): ModelEntry | null {
  return loadAllEntries().find((m) => m.slug === slug) ?? null;
}

/** Get all unique developers from the models. */
export function getAllDevelopers(): string[] {
  const models = loadAllEntries();
  const seen = new Set<string>();
  const result: string[] = [];
  for (const m of models) {
    if (!m.developer) continue;
    const key = m.developer.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(key)) {
      seen.add(key);
      result.push(m.developer);
    }
  }
  return result.sort();
}

/** Get total count of models tracked. */
export function getModelCount(): number {
  return loadAllEntries().length;
}

/** Get developers and their counts of tracked models. */
export function getDeveloperCounts(): { developer: string; count: number }[] {
  const models = loadAllEntries();
  const counts: Record<string, number> = {};
  for (const m of models) {
    counts[m.developer] = (counts[m.developer] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([developer, count]) => ({ developer, count }))
    .sort((a, b) => b.count - a.count || a.developer.localeCompare(b.developer));
}

/** Format parameters display string including active parameters if present */
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
