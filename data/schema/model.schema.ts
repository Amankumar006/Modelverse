import { z } from "zod";
import { DEVELOPERS } from "./developers";
import { LICENSES } from "./licenses";

export const PrimaryTaskEnum = z.enum([
  "chat-reasoning",
  "code-generation",
  "image-generation",
  "video-generation",
  "audio-speech",
  "speech-to-text",
  "image-to-editable-design",
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
  "self-hosted",
  "on-device",
  "on-premise",
  "cloud",
  "edge (CPU/GPU)",
  "research"
]);

export const MetricTypeEnum = z.enum(["performance", "technical", "economic", "ranking", "availability"]);

export const BenchmarkSchema = z.object({
  name: z.string(),
  score: z.union([z.string(), z.number()]),
  verified: z.boolean(),
  metricType: MetricTypeEnum.optional(),
  sourceType: z.enum(["vendor-reported", "independent-eval"]).optional(),
}).passthrough();

export const ModelStatusEnum = z.enum(["active", "deprecated", "sunset"]);

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  developer: z.enum(DEVELOPERS),
  institution: z.string().optional(),
  releaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  type: z.enum(["open-source", "open-weights", "closed-source", "api-only", "research-preview", "research"]),
  status: ModelStatusEnum.default("active"),
  // vendorApiStatus: tracks the vendor's API lifecycle independently of weight/model availability.
  // Only set when a model's open-weights remain active but the vendor's API endpoint has been deprecated/sunset.
  vendorApiStatus: ModelStatusEnum.optional(),
  modality: z.union([z.array(z.string()).min(1), z.any()]),
  primaryTask: PrimaryTaskEnum,
  deployment: z.array(DeploymentEnum).min(1),
  license: z.union([z.enum(LICENSES), z.any()]),
  parameters: z.union([z.string(), z.any()]).optional(),
  contextWindow: z.union([z.string(), z.any()]).optional(),
  description: z.string(),
  descriptionDraft: z.string().optional(),
  templatedDescription: z.boolean().optional(),
  keyFeatures: z.array(z.string()).optional(),
  keyFeaturesDraft: z.array(z.string()).optional(),
  benchmarks: z.array(BenchmarkSchema).optional(),
  // family: the generation-level identifier shared by every variant of one release
  // (e.g. "gpt-5.6" shared by chat, codex, realtime). Convention: lowercase, hyphenated, matches the primary base entry's slug.
  family: z.string().nullable().optional(),
  // tier: the persistent product-tier identity across generations (e.g., Opus, Sonnet, Flash, Pro)
  tier: z.string().optional(),
  // previousVersion: lineage pointing to the specific prior-generation entry (e.g. gpt-5.6 chat points to gpt-5.5 chat).
  previousVersion: z.string().nullable().optional(),
  costTiers: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
  })).optional(),
  pricing: z.array(z.object({
    tier: z.string().optional(),
    unit: z.string(),
    amount: z.number(),
    currency: z.string().default("USD"),
    notes: z.string().optional(),
  })).optional(),
  pricingLastVerified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  links: z.union([z.record(z.string(), z.string()), z.any()]),
  logo: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  // Namespaced tags: "arxiv:2401.xxxxx" (paper), "base:<model-id>" (lineage,
  // in addition to the structured `previousVersion`/`family` fields).
  // Unnamespaced tags are free descriptive terms (e.g. "long-context",
  // "on-device", "agentic-tooling") — keep these to genuinely useful,
  // non-redundant terms; don't duplicate what a facet already covers
  // (e.g. don't add a "vision" tag when `modality` already includes "image").
  tags: z.array(z.string()),
  sources: z.array(z.string()).min(1),
  verified: z.boolean().optional(),
  needsReview: z.boolean().optional(),
  featured: z.boolean().default(false),
  boost: z.number().min(1).max(5).default(1),
  // curatorNotes: internal-only notes for curation triage, deliberately omitted from any client-facing rendering
  curatorNotes: z.string().default(""),
  // Public quality-gate state. curatorNotes remains internal; these fields are
  // safe to expose to discovery/rendering logic.
  qualityStatus: z.enum(["indexed", "thin"]).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  qualityReasons: z.array(z.string()).optional(),
  qualityCheckedAt: z.string().datetime().optional(),
  qualityBreakdown: z.record(z.string(), z.any()).optional(),
  cardSummary: z.string().optional(),
  pageOverview: z.string().optional(),
  editorialNote: z.string().optional(),
  chatgptAvailability: z.record(z.string(), z.any()).optional(),
  apiAvailability: z.record(z.string(), z.any()).optional(),
  aliases: z.array(z.string()).optional(),
}).passthrough();

export type Model = z.infer<typeof ModelSchema>;
