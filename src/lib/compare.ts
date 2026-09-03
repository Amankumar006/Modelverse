import { ModelRow } from "@/types/models";
import { normalizeBenchmarks } from "@/lib/benchmarks";

export type QuantTier = "fp16" | "fp8" | "int4" | "int2";

export interface QuantInfo {
  tier: QuantTier;
  label: string;
  bits: number;
  multiplier: number; // GB per billion parameters
  compressionPercent: number;
  retention: string;
  description: string;
}

export const QUANT_TIERS: Record<QuantTier, QuantInfo> = {
  fp16: {
    tier: "fp16",
    label: "FP16 / BF16",
    bits: 16,
    multiplier: 2.0,
    compressionPercent: 0,
    retention: "100% (Lossless)",
    description: "Full precision reference weights. Highest accuracy, maximum VRAM footprint.",
  },
  fp8: {
    tier: "fp8",
    label: "FP8 (Datacenter)",
    bits: 8,
    multiplier: 1.0,
    compressionPercent: 50,
    retention: ">99.5% (Imperceptible)",
    description: "Modern datacenter standard (Ada/Hopper/Blackwell). Halves VRAM with zero loss.",
  },
  int4: {
    tier: "int4",
    label: "INT4 (GGUF / AWQ)",
    bits: 4,
    multiplier: 0.55,
    compressionPercent: 72.5,
    retention: "96–98% (Sweet Spot)",
    description: "Ideal for local consumer GPUs & Ollama. Drastically cuts memory with minimal loss.",
  },
  int2: {
    tier: "int2",
    label: "INT2 / Ternary",
    bits: 2,
    multiplier: 0.28,
    compressionPercent: 86,
    retention: "85–92% (Specialized)",
    description: "Extreme compression (BitNet / 1.58b style). Enables running large models on edge devices.",
  },
};

export type HardwareTierId = "16gb" | "24gb" | "48gb" | "80gb" | "160gb" | "cluster";

export interface HardwareTier {
  id: HardwareTierId;
  name: string;
  vramGb: number;
  examples: string;
}

export const HARDWARE_TIERS: HardwareTier[] = [
  { id: "16gb", name: "16 GB VRAM", vramGb: 16, examples: "RTX 4070 / 4080 (16GB), Mac M-Series (16GB)" },
  { id: "24gb", name: "24 GB VRAM", vramGb: 24, examples: "1x RTX 3090 / 4090 (24GB), Mac M-Series (32GB)" },
  { id: "48gb", name: "48 GB VRAM", vramGb: 48, examples: "2x RTX 4090 (TP=2), 1x L40S, Mac M-Series (64GB)" },
  { id: "80gb", name: "80 GB VRAM", vramGb: 80, examples: "1x NVIDIA A100 / H100 (80GB), Mac Studio (128GB)" },
  { id: "160gb", name: "160 GB Node", vramGb: 160, examples: "2x H100 (TP=2), 4x L40S, Mac Studio (192GB)" },
  { id: "cluster", name: "Multi-Node Cluster", vramGb: 320, examples: "4x–8x H100 Datacenter Cluster" },
];

export interface ModelMemoryStats {
  isOpenWeights: boolean;
  paramBillions: number;
  activeParamBillions: number;
  isMoE: boolean;
  weightVramGb: number;
  kvCacheVramGb: number;
  totalVramGb: number;
  compressionPercent: number;
  retention: string;
  attentionType: string;
  hardwareFit: Record<HardwareTierId, "optimal" | "tight" | "oom" | "cloud">;
  recommendedHardware: string;
  recommendedTp: number;
}

/**
 * Extracts parameter count in billions from string (e.g. "70B", "671B", "32B", "3.8B", "405B", "1.5T")
 */
export function parseParamBillions(paramStr: string | null | undefined): number {
  if (!paramStr) return 0;
  const cleaned = paramStr.toLowerCase().trim();
  if (cleaned.includes("t")) {
    const num = parseFloat(cleaned.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num * 1000;
  }
  if (cleaned.includes("m")) {
    const num = parseFloat(cleaned.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num / 1000;
  }
  const num = parseFloat(cleaned.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

/**
 * Calculates compression stats, KV-cache scaling, and hardware suitability
 */
export function calculateModelMemoryAndCompression(
  model: ModelRow,
  quant: QuantTier = "int4",
  contextLength: number = 8192
): ModelMemoryStats {
  const isOpenWeights = Boolean(
    model.source_type &&
      (model.source_type.toLowerCase().includes("open") ||
        model.source_type.toLowerCase().includes("weight") ||
        model.source_type.toLowerCase().includes("apache") ||
        model.source_type.toLowerCase().includes("mit"))
  );

  const totalParams = parseParamBillions(model.parameters);
  const activeParams = parseParamBillions(model.active_parameters) || totalParams;
  const isMoE = Boolean(model.active_parameters && model.active_parameters !== model.parameters);

  const nameDesc = ((model.description || "") + (model.name || "")).toLowerCase();
  const isMLA = nameDesc.includes("mla") || nameDesc.includes("multi-head latent") || nameDesc.includes("deepseek");

  // Weights Memory
  const quantInfo = QUANT_TIERS[quant];
  const weightVramGb = totalParams * quantInfo.multiplier;

  // KV Cache calculation:
  // Standard GQA: ~0.00075 GB per billion active params per 1k context
  // MLA (DeepSeek): ~80% compressed KV cache
  const ctxInThousands = Math.max(1, contextLength / 1024);
  let kvCachePerK = activeParams * 0.00075;
  if (isMLA) {
    kvCachePerK *= 0.2; // 80% reduction
  }
  const kvCacheVramGb = kvCachePerK * ctxInThousands;

  // Activation & CUDA context overhead: ~15%
  const totalVramGb = (weightVramGb + kvCacheVramGb) * 1.15;

  // Compute fit for each hardware tier
  const hardwareFit: Record<HardwareTierId, "optimal" | "tight" | "oom" | "cloud"> = {
    "16gb": "cloud",
    "24gb": "cloud",
    "48gb": "cloud",
    "80gb": "cloud",
    "160gb": "cloud",
    cluster: "cloud",
  };

  if (!isOpenWeights || totalParams === 0) {
    // Closed-source cloud API
    return {
      isOpenWeights: false,
      paramBillions: totalParams,
      activeParamBillions: activeParams,
      isMoE,
      weightVramGb: 0,
      kvCacheVramGb: 0,
      totalVramGb: 0,
      compressionPercent: quantInfo.compressionPercent,
      retention: quantInfo.retention,
      attentionType: isMLA ? "MLA (Multi-Head Latent)" : "GQA / Multi-Head",
      hardwareFit,
      recommendedHardware: "Zero Local VRAM (Managed Cloud API)",
      recommendedTp: 1,
    };
  }

  for (const tier of HARDWARE_TIERS) {
    if (totalVramGb <= tier.vramGb * 0.85) {
      hardwareFit[tier.id] = "optimal";
    } else if (totalVramGb <= tier.vramGb) {
      hardwareFit[tier.id] = "tight";
    } else {
      hardwareFit[tier.id] = "oom";
    }
  }

  // Determine recommendation
  let recommendedHardware = "Multi-Node Datacenter Cluster";
  let recommendedTp = 1;

  if (totalVramGb <= 16 * 0.9) {
    recommendedHardware = "1x RTX 4070 / 4080 (16GB) or Mac (16GB Unified)";
    recommendedTp = 1;
  } else if (totalVramGb <= 24 * 0.9) {
    recommendedHardware = "1x RTX 3090 / 4090 (24GB) or Mac (32GB Unified)";
    recommendedTp = 1;
  } else if (totalVramGb <= 48 * 0.9) {
    recommendedHardware = "2x RTX 4090 (TP=2) or 1x L40S (48GB)";
    recommendedTp = 2;
  } else if (totalVramGb <= 80 * 0.9) {
    recommendedHardware = "1x NVIDIA A100 / H100 (80GB)";
    recommendedTp = 1;
  } else if (totalVramGb <= 160 * 0.9) {
    recommendedHardware = "2x H100 (80GB, TP=2) or 4x L40S";
    recommendedTp = 2;
  } else {
    recommendedHardware = "4x–8x H100 Cluster with Tensor Parallelism";
    recommendedTp = Math.max(4, Math.pow(2, Math.ceil(Math.log2(totalVramGb / 80))));
  }

  return {
    isOpenWeights: true,
    paramBillions: totalParams,
    activeParamBillions: activeParams,
    isMoE,
    weightVramGb: Math.round(weightVramGb * 10) / 10,
    kvCacheVramGb: Math.round(kvCacheVramGb * 10) / 10,
    totalVramGb: Math.round(totalVramGb * 10) / 10,
    compressionPercent: quantInfo.compressionPercent,
    retention: quantInfo.retention,
    attentionType: isMLA ? "MLA (Compressed KV Latent)" : "GQA (Grouped-Query)",
    hardwareFit,
    recommendedHardware,
    recommendedTp,
  };
}

/**
 * Splits and parses a comparison slug formatted as `[slug1]-vs-[slug2]`
 */
export function parseCompareSlug(rawSlug: string): { slug1: string; slug2: string } | null {
  if (!rawSlug || typeof rawSlug !== "string") return null;
  const decoded = decodeURIComponent(rawSlug).trim().toLowerCase();
  const vsIndex = decoded.indexOf("-vs-");
  if (vsIndex === -1) return null;

  const slug1 = decoded.slice(0, vsIndex).trim();
  const slug2 = decoded.slice(vsIndex + 4).trim();

  if (!slug1 || !slug2) return null;
  return { slug1, slug2 };
}

/**
 * Returns canonical sorted slug to eliminate duplicate URLs in search index
 */
export function getCanonicalCompareSlug(slug1: string, slug2: string): string {
  const [first, second] = [slug1.trim().toLowerCase(), slug2.trim().toLowerCase()].sort();
  return `${first}-vs-${second}`;
}

export interface VerdictItem {
  category: "reasoning" | "coding" | "economics" | "hardware";
  title: string;
  winner: "model1" | "model2" | "tie";
  winnerName: string;
  metric: string;
  deltaText: string;
  rationale: string;
}

/**
 * Computes executive showdown verdict between two models
 */
export function computeExecutiveVerdict(m1: ModelRow, m2: ModelRow): VerdictItem[] {
  const verdicts: VerdictItem[] = [];

  const b1 = normalizeBenchmarks(m1.benchmarks);
  const b2 = normalizeBenchmarks(m2.benchmarks);

  const findBench = (benchmarks: ReturnType<typeof normalizeBenchmarks>, keys: string[]) => {
    for (const key of keys) {
      const match = benchmarks.find((b) => b.name.toLowerCase().includes(key));
      if (match) {
        const val = typeof match.score === "number" ? match.score : parseFloat(String(match.score));
        if (!isNaN(val)) return { name: match.name, score: val };
      }
    }
    return null;
  };

  // 1. Hard Reasoning (GPQA Diamond, MATH-500, AIME, MMLU-Pro)
  const r1 = findBench(b1, ["gpqa", "math", "aime", "mmlu"]);
  const r2 = findBench(b2, ["gpqa", "math", "aime", "mmlu"]);
  if (r1 && r2 && r1.score > 0 && r2.score > 0) {
    const diff = r1.score - r2.score;
    const absDiff = Math.abs(diff);
    const pct = ((absDiff / Math.min(r1.score, r2.score)) * 100).toFixed(1);
    if (absDiff >= 1.0) {
      const winner = diff > 0 ? "model1" : "model2";
      const winnerModel = diff > 0 ? m1 : m2;
      verdicts.push({
        category: "reasoning",
        title: "Reasoning & STEM Intelligence",
        winner,
        winnerName: winnerModel.name,
        metric: `${r1.score.toFixed(1)} vs ${r2.score.toFixed(1)}`,
        deltaText: `+${pct}% lead`,
        rationale: `${winnerModel.name} outperforms in advanced scientific and math problem-solving benchmarks.`,
      });
    }
  }

  // 2. Code Synthesis (SWE-bench, HumanEval, LiveCodeBench)
  const c1 = findBench(b1, ["swe", "human", "code"]);
  const c2 = findBench(b2, ["swe", "human", "code"]);
  if (c1 && c2 && c1.score > 0 && c2.score > 0) {
    const diff = c1.score - c2.score;
    const absDiff = Math.abs(diff);
    const pct = ((absDiff / Math.min(c1.score, c2.score)) * 100).toFixed(1);
    if (absDiff >= 1.0) {
      const winner = diff > 0 ? "model1" : "model2";
      const winnerModel = diff > 0 ? m1 : m2;
      verdicts.push({
        category: "coding",
        title: "Software Engineering & Code",
        winner,
        winnerName: winnerModel.name,
        metric: `${c1.score.toFixed(1)} vs ${c2.score.toFixed(1)}`,
        deltaText: `+${pct}% lead`,
        rationale: `${winnerModel.name} demonstrates higher code generation accuracy and agentic bug resolution.`,
      });
    }
  }

  // 3. Inference Economics ($/1M input & output tokens)
  const p1 = (m1.pricing || {}) as Record<string, unknown>;
  const p2 = (m2.pricing || {}) as Record<string, unknown>;
  const in1 = typeof p1.input_per_1m === "number" ? p1.input_per_1m : null;
  const in2 = typeof p2.input_per_1m === "number" ? p2.input_per_1m : null;
  const out1 = typeof p1.output_per_1m === "number" ? p1.output_per_1m : null;
  const out2 = typeof p2.output_per_1m === "number" ? p2.output_per_1m : null;

  if (in1 !== null && in2 !== null) {
    const blended1 = in1 * 3 + (out1 || in1) * 1;
    const blended2 = in2 * 3 + (out2 || in2) * 1;
    if (blended1 !== blended2) {
      const winner = blended1 < blended2 ? "model1" : "model2";
      const winnerModel = blended1 < blended2 ? m1 : m2;
      const loserCost = Math.max(blended1, blended2);
      const winnerCost = Math.min(blended1, blended2);
      const savingsPct = Math.round(((loserCost - winnerCost) / loserCost) * 100);
      verdicts.push({
        category: "economics",
        title: "API Cost & Token Economics",
        winner,
        winnerName: winnerModel.name,
        metric: `$${in1.toFixed(2)} vs $${in2.toFixed(2)} / 1M in`,
        deltaText: `${savingsPct}% cheaper`,
        rationale: `${winnerModel.name} delivers significantly lower input/output token pricing for high-throughput production.`,
      });
    }
  }

  // 4. Hardware Portability & Local Inference
  const open1 = Boolean(m1.source_type?.toLowerCase().includes("open"));
  const open2 = Boolean(m2.source_type?.toLowerCase().includes("open"));

  if (open1 !== open2) {
    const winner = open1 ? "model1" : "model2";
    const winnerModel = open1 ? m1 : m2;
    verdicts.push({
      category: "hardware",
      title: "Local Portability & Sovereignty",
      winner,
      winnerName: winnerModel.name,
      metric: "Open Weights vs Closed API",
      deltaText: "Self-Hostable",
      rationale: `${winnerModel.name} can be deployed on private GPUs, Ollama, and on-prem clusters without third-party vendor lock-in.`,
    });
  } else if (open1 && open2) {
    const mem1 = calculateModelMemoryAndCompression(m1, "int4");
    const mem2 = calculateModelMemoryAndCompression(m2, "int4");
    if (mem1.totalVramGb > 0 && mem2.totalVramGb > 0 && mem1.totalVramGb !== mem2.totalVramGb) {
      const winner = mem1.totalVramGb < mem2.totalVramGb ? "model1" : "model2";
      const winnerModel = mem1.totalVramGb < mem2.totalVramGb ? m1 : m2;
      const lowerMem = Math.min(mem1.totalVramGb, mem2.totalVramGb);
      const higherMem = Math.max(mem1.totalVramGb, mem2.totalVramGb);
      verdicts.push({
        category: "hardware",
        title: "VRAM Efficiency (INT4)",
        winner,
        winnerName: winnerModel.name,
        metric: `${mem1.totalVramGb} GB vs ${mem2.totalVramGb} GB`,
        deltaText: `${Math.round(higherMem - lowerMem)} GB lighter`,
        rationale: `${winnerModel.name} requires substantially less memory to run at scale, fitting on more accessible GPU tiers.`,
      });
    }
  }

  // Fallback if no specific verdict
  if (verdicts.length === 0) {
    verdicts.push({
      category: "reasoning",
      title: "Context Window Capacity",
      winner: (m1.context_window || 0) >= (m2.context_window || 0) ? "model1" : "model2",
      winnerName: (m1.context_window || 0) >= (m2.context_window || 0) ? m1.name : m2.name,
      metric: `${((m1.context_window || 0) / 1000).toFixed(0)}k vs ${((m2.context_window || 0) / 1000).toFixed(0)}k`,
      deltaText: "Context Depth",
      rationale: "Accommodates larger single-turn document ingestions and extensive conversation histories.",
    });
  }

  return verdicts;
}

/**
 * Curated list of high-intent head-to-head comparison pairs for programmatic SEO indexing
 */
export const CURATED_POPULAR_PAIRS: [string, string][] = [
  ["anthropic-claude-3-5-sonnet", "gpt-4o"],
  ["anthropic-claude-3-7-sonnet", "gpt-4o"],
  ["anthropic-claude-3-5-sonnet", "deepseek-v3"],
  ["deepseek-v3", "meta-llama-3.3-70b-instruct"],
  ["meta-llama-3.3-70b-instruct", "alibaba-qwen3-32b"],
  ["google-gemini-2.0-flash", "gpt-4o"],
  ["google-gemini-2.0-flash", "anthropic-claude-3-5-haiku"],
  ["deepseek-v3", "deepseek-r1"],
  ["o1", "anthropic-claude-3-7-sonnet"],
  ["o3-mini", "deepseek-r1"],
  ["alibaba-qwen3-coder-30b-a3b-instruct", "anthropic-claude-3-5-sonnet"],
  ["mistral-mistral-large-latest", "meta-llama-3.3-70b-instruct"],
  ["phi-4", "meta-llama-3.3-70b-instruct"],
  ["gpt-4o", "gpt-4o-mini"],
  ["anthropic-claude-3-5-sonnet", "anthropic-claude-3-5-haiku"],
];
