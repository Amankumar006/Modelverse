import { getAllModelEntries, ModelEntry } from "./models";

/**
 * ── Stage 1 Trending — Decay Curve Sanity Check ──
 *
 * Score = boost / (ageHours + 2) ^ 1.7
 *
 * This is a Hacker-News-style decay (HN itself uses exponent 1.8 on ageHours + 2).
 * The exponent and the "+2" offset are tunable knobs, not fixed constants —
 * increasing the exponent makes the ranking decay faster (favors very fresh
 * content more aggressively); decreasing it flattens the curve and lets
 * boosted/older items linger near the top longer.
 *
 * Reference scores at boost = 1 (a typical, non-boosted release):
 *   age =  0h   → 0.308
 *   age =  1h   → 0.154
 *   age =  6h   → 0.029
 *   age = 12h   → 0.011
 *   age = 24h   → 0.0039
 *   age = 48h   → 0.0013
 *   age = 72h   → 0.0007
 *
 * Reference scores at boost = 5 (max editorial boost):
 *   age =  0h   → 1.539
 *   age = 12h   → 0.056
 *   age = 24h   → 0.0196
 *   age = 48h   → 0.0065
 *   age = 72h   → 0.0033
 *
 * Worked comparison (what "editorial boost buys you"):
 *   A boost=5 release at 24h old (0.0196) still outranks a boost=1 release
 *   at 12h old (0.0113) — the editorial bump keeps a highlighted model near
 *   the top for roughly a day.
 *
 *   But a brand-new boost=1 release overtakes that same boost=5/24h model
 *   after only ~8 hours of its own age. In other words: max boost buys a
 *   model about a day of prominence, not a free pass — genuinely fresh,
 *   unboosted news still wins fairly quickly. If that 8-hour crossover feels
 *   too short (or too long) once real data is flowing, that's the number to
 *   revisit by adjusting the exponent above, not the boost range.
 *
 * If you change the exponent or offset, recompute this table so future edits
 * to the curve stay eyeball-able without re-deriving the math from scratch.
 */

export function getTrendingScore(releaseDate: string, boost: number): number {
  const releaseTime = new Date(releaseDate).getTime();
  const now = Date.now();
  
  // Calculate age in hours, ensuring it's at least 0
  const ageHours = Math.max(0, (now - releaseTime) / (1000 * 60 * 60));
  
  return boost / Math.pow(ageHours + 2, 1.7);
}

export interface TrendingModelEntry extends ModelEntry {
  trendingScore: number;
}

export function getTrendingModels(limit: number): TrendingModelEntry[] {
  const entries = getAllModelEntries();
  
  const scoredEntries: TrendingModelEntry[] = entries.map(entry => {
    return {
      ...entry,
      trendingScore: getTrendingScore(entry.releaseDate, entry.boost),
    };
  });
  
  // Sort descending by trending score
  scoredEntries.sort((a, b) => b.trendingScore - a.trendingScore);
  
  return scoredEntries.slice(0, limit);
}
