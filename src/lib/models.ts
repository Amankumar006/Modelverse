import fs from "fs";
import path from "path";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ModelIndex {
  id: string;
  name: string;
  slug: string;
  developer: string;
  releaseDate: string;
  type: "open-weights" | "closed-source" | "api-only" | "research-preview";
}

export interface Benchmark {
  name: string;
  score: string;
  verified: boolean;
}

export interface ModelEntry extends ModelIndex {
  updatedAt: string;
  modality: string[];
  primaryTask: string;
  deployment: string[];
  license: string;
  parameters: string;
  contextWindow: string;
  description: string;
  keyFeatures: string[];
  benchmarks: Benchmark[];
  family: string | null;
  previousVersion: string | null;
  links: Record<string, string>;
  logo: string;
  tags: string[];
  sources: string[];
  verified: boolean;
  curatorNotes: string;
}

/* ------------------------------------------------------------------ */
/*  Paths                                                              */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), "data", "models");
const INDEX_PATH = path.join(DATA_DIR, "_index.json");

/* ------------------------------------------------------------------ */
/*  Data access functions (server-side only)                           */
/* ------------------------------------------------------------------ */

/** Read the index and return all model summaries, sorted newest-first. */
export function getAllModels(): ModelIndex[] {
  const raw = fs.readFileSync(INDEX_PATH, "utf-8");
  const models: ModelIndex[] = JSON.parse(raw);
  return models.sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
}

/** Read all model files and return full entries, sorted newest-first. */
export function getAllModelEntries(): ModelEntry[] {
  const index = getAllModels();
  const entries: ModelEntry[] = [];
  for (const item of index) {
    const entry = getModelBySlug(item.slug);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}

/** Return the N most recently released models. */
export function getRecentModels(n: number): ModelIndex[] {
  return getAllModels().slice(0, n);
}

/** Return all slugs — for generateStaticParams. */
export function getAllSlugs(): string[] {
  return getAllModels().map((m) => m.slug);
}

/** Read a single model's full JSON by slug. */
export function getModelBySlug(slug: string): ModelEntry | null {
  const index = getAllModels();
  const entry = index.find((m) => m.slug === slug);
  if (!entry) return null;

  const filePath = path.join(DATA_DIR, `${entry.id}.json`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as ModelEntry;
}

/** Get all unique developers from the index. */
export function getAllDevelopers(): string[] {
  const models = getAllModels();
  return [...new Set(models.map((m) => m.developer))].sort();
}

/** Get total count of models tracked. */
export function getModelCount(): number {
  return getAllModels().length;
}

/** Get developers and their counts of tracked models. */
export function getDeveloperCounts(): { developer: string; count: number }[] {
  const models = getAllModels();
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

/** Placeholder base URL — update when real domain is assigned. */
export const SITE_URL = "https://modelverse.dev";
