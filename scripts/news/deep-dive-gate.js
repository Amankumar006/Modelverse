"use strict";

/**
 * scripts/news/deep-dive-gate.js
 *
 * Secondary breakthrough-novelty gate extending story-worthiness.
 * Gating signals:
 * - Architecture: MLA, Linear Attention, Mamba/SSM, FlashAttention, MoE, Sparse Attention.
 * - Reasoning: Test-time compute, Tree-of-Thought, MCTS, dynamic reasoning budget.
 * - Optimization: RLVR, DPO, GRPO, synthetic distillation.
 * - Systems: 1.58-bit BitNet, FP8/NVFP4, speculative decoding, KV-cache compression.
 *
 * Daily Cap: 2 deep-dives per UTC day (bounds token cost independent of cron frequency).
 */

const BREAKTHROUGH_SIGNALS = {
  architecture: {
    weight: 3,
    patterns: [
      /multi-?head latent attention|\bMLA\b/i,
      /linear attention/i,
      /state-?space model|\bmamba\b/i,
      /flash-?attention-?3?/i,
      /mixture[- ]of[- ]experts|\bMoE\b/i,
      /sparse attention/i,
    ],
  },
  reasoning: {
    weight: 3,
    patterns: [
      /test-?time compute/i,
      /tree-?of-?thought/i,
      /monte carlo tree/i,
      /dynamic reasoning budget/i,
      /chain-?of-?thought (search|verification)/i,
    ],
  },
  optimization: {
    weight: 2,
    patterns: [
      /\bRLVR\b|rule-?based reinforcement learning/i,
      /direct preference optimization|\bDPO\b/i,
      /\bGRPO\b/i,
      /synthetic data distillation/i,
      /group relative policy optimization/i,
    ],
  },
  systems: {
    weight: 2,
    patterns: [
      /1\.58-?bit|\bBitNet\b/i,
      /\bFP8\b|\bNVFP4\b/i,
      /speculative decoding/i,
      /kv-?cache compression/i,
      /quantization-?aware training/i,
    ],
  },
};

const EXCLUSION_PATTERNS = [
  /funding round|series [a-e] raise|valuation of \$/i,
  /price (cut|drop|increase)|pricing update/i,
  /minor (patch|bugfix|version bump)/i,
  /partnership announcement/i,
];

const ELIGIBILITY_THRESHOLD = 9;
const MAX_DEEP_DIVES_PER_DAY = 2;

/**
 * @param {{title: string, summary?: string, description?: string, body?: string, rawBody?: string}} candidate
 * @param {number} baseWorthinessScore
 * @returns {{eligible: boolean, score: number, matchedSignals: string[]}}
 */
function scoreDeepDiveEligibility(candidate, baseWorthinessScore = 0) {
  if (!candidate || typeof candidate !== "object") {
    return { eligible: false, score: 0, matchedSignals: [] };
  }

  const text = `${candidate.title || ""} ${candidate.summary || candidate.description || ""} ${candidate.body || candidate.rawBody || ""}`;

  for (const pattern of EXCLUSION_PATTERNS) {
    if (pattern.test(text)) {
      return { eligible: false, score: 0, matchedSignals: [] };
    }
  }

  let score = Number(baseWorthinessScore) || 0;
  const matchedSignals = [];

  for (const [category, { weight, patterns }] of Object.entries(BREAKTHROUGH_SIGNALS)) {
    const hit = patterns.find((p) => p.test(text));
    if (hit) {
      score += weight;
      matchedSignals.push(category);
    }
  }

  return {
    eligible: score >= ELIGIBILITY_THRESHOLD && matchedSignals.length > 0,
    score,
    matchedSignals,
  };
}

/**
 * Checks if the daily cap of 2 deep-dives per UTC day is respected.
 * @param {import('@supabase/supabase-js').SupabaseClient} supabaseClient
 * @returns {Promise<boolean>}
 */
async function isUnderDailyDeepDiveCap(supabaseClient) {
  if (!supabaseClient) return false;

  const startOfDayUTC = new Date();
  startOfDayUTC.setUTCHours(0, 0, 0, 0);

  try {
    const { count, error } = await supabaseClient
      .from("news_items")
      .select("id", { count: "exact", head: true })
      .eq("article_type", "deep-dive")
      .gte("publish_date", startOfDayUTC.toISOString().split("T")[0]);

    if (error) {
      console.warn("  ⚠️ Daily deep-dive cap check failed:", error.message, "- defaulting to longform");
      return false;
    }

    return (count || 0) < MAX_DEEP_DIVES_PER_DAY;
  } catch (err) {
    console.warn("  ⚠️ Daily deep-dive cap check threw:", err.message);
    return false;
  }
}

module.exports = {
  scoreDeepDiveEligibility,
  isUnderDailyDeepDiveCap,
  BREAKTHROUGH_SIGNALS,
  ELIGIBILITY_THRESHOLD,
  MAX_DEEP_DIVES_PER_DAY,
};
