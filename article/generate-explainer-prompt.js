/**
 * generate-explainer-prompt.js
 * ---------------------------------------------------------------
 * INTEGRATION: This module only builds the prompt — it does NOT
 * duplicate your provider-fallback logic (Gemini 2.5 Flash -> Groq
 * Llama 3.3 70B -> OpenRouter Llama 3.3 70B). In generate-longform-article.js
 * you already have some function that does that call-with-fallback
 * (name it here once you confirm — likely something like
 * `callLLMWithFallback(systemPrompt, userPrompt, opts)`).
 *
 * Usage from ingest-daily-news.js, once a candidate passes
 * scoreDeepDiveEligibility() AND isUnderDailyDeepDiveCap():
 *
 *   const { buildExplainerPrompt } = require('./generate-explainer-prompt');
 *   const { system, user } = buildExplainerPrompt(dossier);
 *   const raw = await callLLMWithFallback(system, user, { maxTokens: 4000 });
 *   const { valid, diagrams } = validateMermaidBlocks(raw);
 *   // -> pass to deep-dive-quality-checks.js scoreDeepDiveArticle()
 *
 * `dossier` is whatever research-story.js already produces for the
 * multi-source research branch (sources array with url/domain/text,
 * classification of official_primary vs independent_coverage). This
 * reuses that shape rather than inventing a new one.
 * ---------------------------------------------------------------
 */

const SYSTEM_PROMPT = `You are a technical explainer writer for Modelverse, an AI model directory and news site. Your job is to make a genuine AI/ML breakthrough understandable to a technically curious reader who is NOT a machine learning researcher — think a software engineer who reads Hacker News, not a PhD student.

Hard rules:
- Zero verbatim sentence copying from any source. Every sentence must be written in your own words.
- Direct quotes, if used at all, must be under 15 words and explicitly attributed (e.g. "as the paper's authors put it, '...'").
- Do not invent benchmark numbers, author names, or claims not present in the provided dossier. If a number isn't in the dossier, don't state it.
- Do not pad with generic AI-industry boilerplate ("As AI continues to evolve..."). Every sentence should carry real information.
- Target length: 1,200-1,800 words total.

You must follow this exact 6-part structure, using these exact H2 headers:

## The Intuitive Mental Model
Open with a real-world analogy that captures the core intuition (e.g. Mixture-of-Experts as a hospital triage desk routing patients to specialist doctors, not consulting every doctor for every case). Then explain in plain English why previous approaches struggled with this problem.

## The Traditional Bottleneck
Name the specific limitation this breakthrough addresses (e.g. quadratic memory scaling in standard self-attention, KV-cache explosion at long context lengths). Be concrete about WHY it was a wall, not just that it existed.

## Under the Hood: How It Actually Works
Step-by-step mechanical breakdown. Include ONE Mermaid diagram (flowchart or sequenceDiagram syntax, inside a \`\`\`mermaid fenced code block) showing token/tensor flow or routing logic. Explain any math conceptually — describe what an equation accomplishes, don't just drop notation. If you include pseudo-code, keep it under 15 lines.

## Empirical Evidence
Report only benchmark numbers, latency/throughput figures, or eval results that are explicitly present in the dossier. State the source for each figure. If the dossier has no hard numbers, say so plainly rather than fabricating them.

## Engineering Trade-Offs
What does this cost? Training stability vs. inference speed, memory bandwidth vs. compute intensity, etc. Explicitly address: can this run on consumer hardware (RTX 4090 / Mac) or does it require enterprise clusters (H100/H200)? Base this only on what the dossier supports — flag as "unclear from available sources" if it doesn't say.

## Key Takeaways
Exactly 3 bullet points, each one sentence, summarizing what this means for developers and future models.

At the end, add a "## Sources & Citations" section listing each source domain and its classification (official primary source vs. independent coverage), matching the format your existing longform pipeline already uses.`;

function buildUserPrompt(dossier) {
  const sourceBlocks = dossier.sources
    .map(
      (s, i) =>
        `[Source ${i + 1} - ${s.classification} - ${s.domain}]\n${s.text}`
    )
    .join('\n\n---\n\n');

  return `Story title: ${dossier.title}

Breakthrough signals detected: ${(dossier.breakthroughSignals || []).join(', ') || 'none listed'}

Write the deep-dive explainer following the required structure exactly. Here is the research dossier:

${sourceBlocks}

Remember: no verbatim copying, no fabricated numbers, exactly one Mermaid diagram, exactly 3 takeaway bullets.`;
}

/**
 * @param {{title: string, breakthroughSignals?: string[], sources: Array<{domain: string, classification: string, text: string}>}} dossier
 * @returns {{system: string, user: string}}
 */
function buildExplainerPrompt(dossier) {
  return {
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(dossier),
  };
}

/**
 * Lightweight structural validation for Mermaid blocks — NOT a full parse.
 * A real parse would need the mermaid package + a headless browser (puppeteer),
 * which is heavy for a hourly cron worker. This catches the common LLM failure
 * modes (unbalanced brackets, missing diagram-type keyword, empty block) and
 * is meant to gate whether `has_diagram` gets set to true. If it fails,
 * publish the article WITHOUT the diagram rather than blocking the whole piece —
 * see deep-dive-quality-checks.js for how this feeds into scoring.
 *
 * @param {string} markdown
 * @returns {{valid: boolean, diagrams: string[]}}
 */
function validateMermaidBlocks(markdown) {
  const blocks = [...markdown.matchAll(/```mermaid\n([\s\S]*?)```/g)].map((m) => m[1].trim());
  const validDiagrams = [];

  for (const block of blocks) {
    const hasDiagramType = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram)/m.test(block);
    const openBrackets = (block.match(/[[({]/g) || []).length;
    const closeBrackets = (block.match(/[\])}]/g) || []).length;
    const balanced = openBrackets === closeBrackets;
    const nonTrivial = block.split('\n').filter((l) => l.trim()).length >= 3;

    if (hasDiagramType && balanced && nonTrivial) {
      validDiagrams.push(block);
    }
  }

  return { valid: validDiagrams.length > 0, diagrams: validDiagrams };
}

module.exports = {
  buildExplainerPrompt,
  validateMermaidBlocks,
};
