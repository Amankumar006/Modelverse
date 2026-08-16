/**
 * deep-dive-quality-checks.js
 * ---------------------------------------------------------------
 * INTEGRATION: Import into scripts/quality/score-content.js. Call
 * `scoreDeepDiveArticle()` INSTEAD of your normal scoring path only
 * when `article.type === 'deep-dive'` — everything else (Jaccard
 * originality check, near-duplicate fingerprinting, source-domain
 * count) should still run exactly as it does today. This module only
 * adds the pedagogical-structure checks and swaps the word-count floor.
 *
 * Suggested splice point in score-content.js:
 *
 *   const { scoreDeepDiveExtras, DEEP_DIVE_WORD_FLOOR } = require('./deep-dive-quality-checks');
 *
 *   const wordFloor = article.type === 'deep-dive' ? DEEP_DIVE_WORD_FLOOR : existingFloor;
 *   // ...existing Jaccard / source-count / near-dup logic unchanged...
 *
 *   let score = existingBaseScore; // from your current per-source originality + source-quality-bonus logic
 *   if (article.type === 'deep-dive') {
 *     score += scoreDeepDiveExtras(article);
 *   }
 * ---------------------------------------------------------------
 */

const DEEP_DIVE_WORD_FLOOR = 1200;
const REQUIRED_HEADERS = [
  '## The Intuitive Mental Model',
  '## The Traditional Bottleneck',
  '## Under the Hood',
  '## Empirical Evidence',
  '## Engineering Trade-Offs',
  '## Key Takeaways',
];

/**
 * Checks the article follows the mandated 6-part pedagogical structure.
 * @param {string} markdown
 * @returns {{ complete: boolean, missing: string[] }}
 */
function checkPedagogicalStructure(markdown) {
  const missing = REQUIRED_HEADERS.filter((h) => !markdown.includes(h));
  return { complete: missing.length === 0, missing };
}

/**
 * Heuristic check that "Key Takeaways" has exactly 3 bullets, not 1 or 7.
 * @param {string} markdown
 * @returns {boolean}
 */
function checkTakeawaysBulletCount(markdown) {
  const section = markdown.split('## Key Takeaways')[1];
  if (!section) return false;
  const nextHeaderIdx = section.search(/\n## /);
  const scoped = nextHeaderIdx === -1 ? section : section.slice(0, nextHeaderIdx);
  const bulletCount = (scoped.match(/^\s*[-*]\s+/gm) || []).length;
  return bulletCount === 3;
}

/**
 * Rejects generic filler openers that indicate the model ignored the
 * "start with a real analogy" instruction. Same spirit as your existing
 * isStructuralBoilerplate() check for the longform path — extend that
 * function's banned-phrase list with these if you'd rather keep one
 * boilerplate detector instead of two.
 * @param {string} markdown
 * @returns {boolean} true if an analogy-shaped opener is present
 */
function checkAnalogyPresence(markdown) {
  const mentalModelSection = markdown.split('## The Intuitive Mental Model')[1] || '';
  const firstParagraph = mentalModelSection.trim().split('\n\n')[0] || '';

  const genericOpeners = [
    /^in the (rapidly evolving|fast-paced|ever-changing) (world|landscape) of/i,
    /^as artificial intelligence continues to/i,
    /^in recent years,/i,
  ];
  if (genericOpeners.some((p) => p.test(firstParagraph.trim()))) return false;

  // A real analogy paragraph is typically comparative ("like", "think of",
  // "imagine", "similar to") — weak signal, but catches the worst cases.
  const analogyMarkers = /\b(like a|think of it as|imagine|similar to|works like|akin to)\b/i;
  return analogyMarkers.test(firstParagraph);
}

/**
 * Combined extra scoring for deep-dive articles, meant to be ADDED to
 * whatever score-content.js already computes from originality + source
 * quality. Keep the 0-100 scale consistent with your existing gate
 * (<25 quarantine, 25-54 unlisted, >=55 indexed) — these bonuses/penalties
 * are calibrated to matter but not to dominate the originality check.
 *
 * @param {{ content: string, hasDiagram: boolean }} article
 * @returns {number} point delta to add to the base score
 */
function scoreDeepDiveExtras(article) {
  let delta = 0;

  const structure = checkPedagogicalStructure(article.content);
  if (structure.complete) {
    delta += 15;
  } else {
    // Missing structure is a harder signal than most originality issues —
    // this article doesn't do the one job it exists to do.
    delta -= 10 * structure.missing.length;
  }

  if (checkTakeawaysBulletCount(article.content)) delta += 5;
  if (checkAnalogyPresence(article.content)) delta += 10;
  if (article.hasDiagram) delta += 10; // set from validateMermaidBlocks() upstream

  const wordCount = article.content.trim().split(/\s+/).length;
  if (wordCount < DEEP_DIVE_WORD_FLOOR) {
    delta -= 25; // strong penalty — this is a hard requirement, not a nice-to-have
  }

  return delta;
}

module.exports = {
  DEEP_DIVE_WORD_FLOOR,
  checkPedagogicalStructure,
  checkTakeawaysBulletCount,
  checkAnalogyPresence,
  scoreDeepDiveExtras,
};
