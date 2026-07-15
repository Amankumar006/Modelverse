import { z } from "zod";
import { DEVELOPERS } from "./developers";
import { LICENSES } from "./licenses";

export const PrimaryTaskEnum = z.enum([
  "chat-reasoning",
  "code-generation",
  "image-generation",
  "video-generation",
  "audio-speech",
  "embedding",
  "agentic",
  "multimodal-general",
  "translation",
  "search-retrieval",
  "other",
]);

export const DeploymentEnum = z.enum([
  "api-only",
  "self-hostable",
  "on-device",
]);

export const BenchmarkSchema = z.object({
  name: z.string(),
  score: z.string(),
  verified: z.boolean(),
});

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  developer: z.enum(DEVELOPERS),
  institution: z.string().optional(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  type: z.enum(["open-source", "open-weights", "closed-source", "api-only", "research-preview"]),
  modality: z.array(z.string()).min(1),
  primaryTask: PrimaryTaskEnum,
  deployment: z.array(DeploymentEnum).min(1),
  license: z.enum(LICENSES),
  parameters: z.string(),
  contextWindow: z.string(),
  description: z.string(),
  keyFeatures: z.array(z.string()),
  benchmarks: z.array(BenchmarkSchema),
  // family: the generation-level identifier shared by every variant of one release
  // (e.g. "gpt-5.6" shared by chat, codex, realtime). Convention: lowercase, hyphenated, matches the primary base entry's slug.
  family: z.string().nullable(),
  // tier: the persistent product-tier identity across generations (e.g., Opus, Sonnet, Flash, Pro)
  tier: z.string().optional(),
  // previousVersion: lineage pointing to the specific prior-generation entry (e.g. gpt-5.6 chat points to gpt-5.5 chat).
  previousVersion: z.string().nullable(),
  costTiers: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
  })).optional(),
  links: z.record(z.string(), z.string()),
  logo: z.string().nullable(),
  // Namespaced tags: "arxiv:2401.xxxxx" (paper), "base:<model-id>" (lineage,
  // in addition to the structured `previousVersion`/`family` fields).
  // Unnamespaced tags are free descriptive terms (e.g. "long-context",
  // "on-device", "agentic-tooling") — keep these to genuinely useful,
  // non-redundant terms; don't duplicate what a facet already covers
  // (e.g. don't add a "vision" tag when `modality` already includes "image").
  tags: z.array(z.string()),
  sources: z.array(z.string()).min(1),
  verified: z.boolean(),
  featured: z.boolean().default(false),
  boost: z.number().min(1).max(5).default(1),
  // curatorNotes: internal-only notes for curation triage, deliberately omitted from any client-facing rendering
  curatorNotes: z.string().default(""),
});

export type Model = z.infer<typeof ModelSchema>;
