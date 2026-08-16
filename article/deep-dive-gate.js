/**
 * deep-dive-gate.js
 * ---------------------------------------------------------------
 * INTEGRATION: This is NOT a new pipeline stage. Import this into your
 * existing scripts/news/story-worthiness.js and call
 * `scoreDeepDiveEligibility()` on any candidate that already scored >=6
 * on your existing heuristic (i.e. one that's already headed for the
 * multi-source research + longform branch). It adds a second, narrower
 * score on top — it does not replace anything.
 *
 * Suggested splice point in story-worthiness.js:
 *
 *   const baseScore = evaluateStoryWorthiness(candidate); // existing fn
 *   if (baseScore >= 6) {
 *     const deepDive = scoreDeepDiveEligibility(candidate, baseScore);
 *     candidate.deepDiveScore = deepDive.score;
 *     candidate.deepDiveEligible = deepDive.eligible;
 *     candidate.breakthroughSignals = deepDive.matchedSignals;
 *   }
 *
 * Then in ingest-daily-news.js, branch on `candidate.deepDiveEligible`
 * BEFORE the existing longform/brief branch — a deep-dive-eligible story
 * skips generate-longform-article.js and goes to generate-explainer-prompt.js
 * instead. Everything else (research-story.js, caching, domain-count
 * fallback) stays exactly as-is.
 * ---------------------------------------------------------------
 */

// Category-weighted novelty signals. Tune these lists as you see real
// stories come through — this is the part most worth iterating on.
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

// Hard exclusions — even if a keyword above matches, these disqualify.
// (e.g. "we fine-tuned Llama with DPO on our support tickets" should NOT
// become a deep-dive just because "DPO" appears.)
const EXCLUSION_PATTERNS = [
  /funding round|series [a-e] raise|valuation of \$/i,
  /price (cut|drop|increase)|pricing update/i,
  /minor (patch|bugfix|version bump)/i,
  /partnership announcement/i,
];

const ELIGIBILITY_THRESHOLD = 9; // out of a possible ~10-13 depending on stacking
const MAX_DEEP_DIVES_PER_DAY = 2; // cost control, independent of trigger frequency

/**
 * @param {{title: string, summary: string, body?: string}} candidate
 * @param {number} baseWorthinessScore - output of your existing evaluateStoryWorthiness()
 * @returns {{eligible: boolean, score: number, matchedSignals: string[]}}
 */
function scoreDeepDiveEligibility(candidate, baseWorthinessScore) {
  const text = `${candidate.title || ''} ${candidate.summary || ''} ${candidate.body || ''}`;

  for (const pattern of EXCLUSION_PATTERNS) {
    if (pattern.test(text)) {
      return { eligible: false, score: 0, matchedSignals: [] };
    }
  }

  let score = 0;
  const matchedSignals = [];

  for (const [category, { weight, patterns }] of Object.entries(BREAKTHROUGH_SIGNALS)) {
    const hit = patterns.find((p) => p.test(text));
    if (hit) {
      score += weight;
      matchedSignals.push(category);
    }
  }

  // Reuse the existing source-authority signal as a floor, not a bonus —
  // a breakthrough claim from an unknown blog needs corroboration more
  // than one from Anthropic/DeepMind/HF does. Deep-dives still route
  // through research-story.js afterward regardless, so this just gates entry.
  if (baseWorthinessScore >= 8) score += 1;

  return {
    eligible: score >= ELIGIBILITY_THRESHOLD,
    score,
    matchedSignals,
  };
}

/**
 * Cost control independent of cron frequency. Call this right before
 * committing to the deep-dive generation branch — if the cap is hit,
 * fall back to the normal longform path instead of skipping the story
 * entirely (it's still a >=6 story, it just doesn't get the explainer treatment today).
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<boolean>} true if under the daily cap
 */
async function isUnderDailyDeepDiveCap(supabase) {
  const startOfDayUTC = new Date();
  startOfDayUTC.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from('news_items')
    .select('id', { count: 'exact', head: true })
    .eq('article_type', 'deep-dive')
    .gte('published_at', startOfDayUTC.toISOString());

  if (error) {
    // Fail closed: if we can't verify the count, don't risk a cost spike.
    console.error('[deep-dive-gate] cap check failed, defaulting to longform:', error.message);
    return false;
  }

  return (count || 0) < MAX_DEEP_DIVES_PER_DAY;
}

module.exports = {
  scoreDeepDiveEligibility,
  isUnderDailyDeepDiveCap,
  ELIGIBILITY_THRESHOLD,
  MAX_DEEP_DIVES_PER_DAY,
};
