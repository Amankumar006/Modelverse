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
  license: string;
  parameters: string;
  contextWindow: string;
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
  vendorApiStatus?: "active" | "deprecated" | "sunset";
  costTiers?: { id: string; label: string; description?: string }[];
  pricing?: { tier?: string; unit: string; amount: number; currency: string; notes?: string }[];
  pricingLastVerified?: string;
}

/* ------------------------------------------------------------------ */
/*  Development Hot-Reload Helper                                      */
/* ------------------------------------------------------------------ */

let _devCachedEntries: ModelEntry[] | null = null;

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
    type: z.string(),
    status: z.enum(["active", "deprecated", "sunset"]).default("active"),
    modality: z.array(z.string()),
    primaryTask: z.string(),
    deployment: z.array(z.string()),
    license: z.string(),
    parameters: z.string(),
    contextWindow: z.string(),
    description: z.string(),
    templatedDescription: z.boolean().optional(),
    keyFeatures: z.array(z.string()),
    benchmarks: z.array(z.object({ name: z.string(), score: z.string(), verified: z.boolean() })),
    family: z.string().nullable(),
    tier: z.string().optional(),
    institution: z.string().optional(),
    previousVersion: z.string().nullable(),
    costTiers: z.array(z.object({ id: z.string(), label: z.string(), description: z.string().optional() })).optional(),
    pricing: z.array(z.object({ tier: z.string().optional(), unit: z.string(), amount: z.number(), currency: z.string().default("USD"), notes: z.string().optional() })).optional(),
    pricingLastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    links: z.record(z.string(), z.string()),
    logo: z.string().nullable(),
    tags: z.array(z.string()),
    sources: z.array(z.string()),
    verified: z.boolean(),
    featured: z.boolean().default(false),
    boost: z.number().default(1),
    curatorNotes: z.string().default(""),
    vendorApiStatus: z.enum(["active", "deprecated", "sunset"]).optional()
  });

  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
      const result = ModelSchema.safeParse(raw);
      if (!result.success) {
        console.warn(`[DEV] Validation failed for ${file}, skipping.`);
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
  return [...new Set(models.map((m) => m.developer))].sort();
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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Base URL for canonical links and OG images. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
