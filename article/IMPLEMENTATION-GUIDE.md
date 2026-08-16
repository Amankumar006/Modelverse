# Deep-Dive Explainers — Implementation Guide

Four files, each designed to extend an existing pipeline stage rather than fork it:

| New file | Extends | Does NOT touch |
|---|---|---|
| `001_deep_dive_articles.sql` | `news_items` table | existing columns, RLS policies |
| `deep-dive-gate.js` | `story-worthiness.js` | `research-story.js`, caching, domain-count fallback |
| `generate-explainer-prompt.js` | `generate-longform-article.js`'s provider-fallback call | the fallback/retry logic itself |
| `deep-dive-quality-checks.js` | `score-content.js` | Jaccard originality, near-dup fingerprinting |

No new GitHub Actions workflow, no new cron. This rides the existing hourly `daily-news.yml` run.

## Wiring order

1. **Apply the migration.** Review `001_deep_dive_articles.sql` against your real schema first (run `Supabase:list_tables` once MCP is authorized, or check manually) — it's written defensively but the `article_type` enum-vs-CHECK branch needs to match what you actually have.

2. **In `story-worthiness.js`:** after your existing `evaluateStoryWorthiness()` returns a score `>= 6` (i.e. the story is already headed for the research + longform branch), call `scoreDeepDiveEligibility(candidate, baseScore)`. Attach the result to the candidate object. This does not change routing for anything scoring below 6 — those stories are untouched.

3. **In `ingest-daily-news.js`:** right before the existing longform/brief branch, insert one more check:
   ```js
   if (candidate.deepDiveEligible && await isUnderDailyDeepDiveCap(supabase)) {
     // -> generate-explainer-prompt.js path
   } else {
     // -> existing generate-longform-article.js path, unchanged
   }
   ```
   A story that's deep-dive-eligible but hits the daily cap (default: 2/day) falls back to the normal longform treatment rather than being dropped — it's still a good story, it just doesn't get the explainer format that day.

4. **Generation:** `buildExplainerPrompt(dossier)` returns `{system, user}` — pass these into whatever function in `generate-longform-article.js` already does the Gemini → Groq → OpenRouter fallback call. I didn't rename or duplicate that logic since I can't see its current signature; wire the two together and it should be a small diff.

5. **After generation:** run `validateMermaidBlocks(rawOutput)`. If no valid diagram, publish anyway with `has_diagram: false` — don't block the whole article over a diagram the model botched. Feed `article.hasDiagram` into `scoreDeepDiveExtras()`.

6. **In `score-content.js`:** branch on `article.type === 'deep-dive'` to use `DEEP_DIVE_WORD_FLOOR` (1200) instead of the existing 800-word longform floor, and add `scoreDeepDiveExtras()`'s return value to your existing base score before applying the same 25/55 thresholds you already use.

## Decisions I made that you should sanity-check

- **Curator review default: ON.** New `curator_reviewed` column defaults `false`. I left the DB-level constraint commented out (application-level enforcement only) so you can flip it on once you trust the output — per the phasing from the last message, I'd manually review the first 10-15 before automating.
- **Daily cap: 2/day**, checked at generation time regardless of how many stories score high in a given hour. This bounds LLM cost independent of cron frequency — change `MAX_DEEP_DIVES_PER_DAY` in `deep-dive-gate.js` once you've seen real token costs.
- **Distribution: not addressed yet.** Your existing Phase 6 (Gmail digest, Reddit post, git push) will fire for `article_type: 'deep-dive'` exactly as it does for longform, since I didn't touch that stage. Worth deciding deliberately — a 1,500-word explainer probably shouldn't hit Reddit the same way a breaking-news brief does. Flag this before your first real deep-dive goes out.
- **Mermaid validation is structural, not a real parse.** Full validation needs `mermaid` + a headless browser, heavy for an hourly worker. The regex check catches the obvious LLM failure modes; a genuinely malformed-but-structurally-valid diagram could still slip through and fail client-side. Consider client-side try/catch around the Mermaid render (hide the diagram, don't break the page) as a second safety net in `src/app/news/[slug]/page.tsx`.

## Not built yet (later phases)

- ArXiv/lab-research discovery worker — per the earlier discussion, starting without this and letting deep-dives trigger off your existing 9 RSS feeds (which already surface MLA/DeepSeek-GRPO/BitNet-style announcements) is the smaller, faster v1. Revisit if you find the 9 feeds aren't catching enough real breakthroughs.
- Frontend callout components (💡 Core Intuition, ⚙️ Under the Hood, ⚖️ Trade-Offs boxes) and the reading-progress bar — build these once you have 2-3 real generated articles to design against, not before.
- Semantic Scholar citation lookups for impact-scoring standalone papers — only relevant once/if you add the ArXiv discovery worker.

## Before you hand this to Antigravity CLI

The three `.js` files reference function names I inferred from your architecture description (`evaluateStoryWorthiness`, `callLLMWithFallback`, `isStructuralBoilerplate`) but haven't seen the actual signatures for. Antigravity CLI has the real files open — have it confirm the exact names/signatures during integration rather than assuming mine are exact matches.
