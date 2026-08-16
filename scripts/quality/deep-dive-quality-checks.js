"use strict";

/**
 * scripts/quality/deep-dive-quality-checks.js
 *
 * Pedagogical quality checks specifically for 'deep-dive' explainer articles.
 * Enforces:
 * 1. 1,200 - 1,800 word floor.
 * 2. 6 mandatory pedagogical H2 headers.
 * 3. Analogy presence in mental model section (penalizes generic corporate openers).
 * 4. Exactly 3 takeaway bullets in "Key Takeaways".
 * 5. Structural Mermaid diagram presence bonus.
 */

const DEEP_DIVE_WORD_FLOOR = 1200;
const REQUIRED_HEADERS = [
  "## The Intuitive Mental Model",
  "## The Traditional Bottleneck",
  "## Under the Hood",
  "## Empirical Evidence",
  "## Engineering Trade-Offs",
  "## Key Takeaways",
];

/**
 * Checks that the article follows the mandated 6-part pedagogical structure.
 * @param {string} markdown
 * @returns {{ complete: boolean, missing: string[] }}
 */
function checkPedagogicalStructure(markdown) {
  if (typeof markdown !== "string") return { complete: false, missing: REQUIRED_HEADERS };
  const missing = REQUIRED_HEADERS.filter((h) => !markdown.includes(h));
  return { complete: missing.length === 0, missing };
}

/**
 * Heuristic check that "Key Takeaways" has exactly 3 bullets.
 * @param {string} markdown
 * @returns {boolean}
 */
function checkTakeawaysBulletCount(markdown) {
  if (typeof markdown !== "string") return false;
  const section = markdown.split(/##\s*Key Takeaways/i)[1];
  if (!section) return false;
  const nextHeaderIdx = section.search(/\n## /);
  const scoped = nextHeaderIdx === -1 ? section : section.slice(0, nextHeaderIdx);
  const bulletCount = (scoped.match(/^\s*[-*]\s+/gm) || []).length;
  return bulletCount === 3;
}

/**
 * Validates that an analogy-shaped opener is present and flags generic AI landscape fluff.
 * @param {string} markdown
 * @returns {boolean}
 */
function checkAnalogyPresence(markdown) {
  if (typeof markdown !== "string") return false;
  const mentalModelSection = markdown.split(/##\s*The Intuitive Mental Model/i)[1] || "";
  const firstParagraph = mentalModelSection.trim().split("\n\n")[0] || "";

  const genericOpeners = [
    /^in the (rapidly evolving|fast-paced|ever-changing) (world|landscape) of/i,
    /^as artificial intelligence continues to/i,
    /^in recent years,/i,
  ];
  if (genericOpeners.some((p) => p.test(firstParagraph.trim()))) return false;

  const analogyMarkers = /\b(like a|think of it as|imagine|similar to|works like|akin to|metaphor|analogy|resembles)\b/i;
  return analogyMarkers.test(firstParagraph);
}

/**
 * Combined delta calculation for deep-dive articles.
 * @param {{ body?: string, content?: string, has_diagram?: boolean, hasDiagram?: boolean }} article
 * @returns {number}
 */
function scoreDeepDiveExtras(article) {
  const content = String(article?.body || article?.content || "");
  const hasDiagram = Boolean(article?.has_diagram || article?.hasDiagram);

  let delta = 0;

  const structure = checkPedagogicalStructure(content);
  if (structure.complete) {
    delta += 15;
  } else {
    delta -= 10 * structure.missing.length;
  }

  if (checkTakeawaysBulletCount(content)) delta += 5;
  if (checkAnalogyPresence(content)) delta += 10;
  if (hasDiagram) delta += 10;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < DEEP_DIVE_WORD_FLOOR) {
    delta -= 25;
  }

  return delta;
}

module.exports = {
  DEEP_DIVE_WORD_FLOOR,
  REQUIRED_HEADERS,
  checkPedagogicalStructure,
  checkTakeawaysBulletCount,
  checkAnalogyPresence,
  scoreDeepDiveExtras,
};
