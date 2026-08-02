const fs = require("fs");
const path = require("path");
const { z } = require("zod");

const DATA_DIR = path.join(process.cwd(), "data", "models");
const file = "academic-research-redesign.json";

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
  benchmarks: z.array(z.object({ name: z.string(), score: z.string(), verified: z.boolean().optional() }).passthrough()),
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
}).passthrough();

const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf-8"));
const result = ModelSchema.safeParse(raw);

if (!result.success) {
  console.log("Failed validation:", result.error.format());
  if (raw.id && raw.slug && raw.name) {
    console.log("Fallback accepted");
  } else {
    console.log("Fallback rejected");
  }
} else {
  console.log("Passed validation");
}
