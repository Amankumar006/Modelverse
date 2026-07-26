---
name: import-from-model-docs
description: Enumerate every currently-listed model ID from each lab's public "all models" documentation page to catch API-only tiers, cost variants, and task-specific sub-models for curator review.
---

# Skill: import-from-model-docs

## Purpose
Enumerate every currently-listed model ID from each lab's public "all
models" documentation page — distinct from `check-lab-blogs`, which only
catches flagship announcements. This skill catches the API-only tiers,
cost variants, and task-specific sub-models that never get their own blog
post.

Like `check-lab-blogs`, this produces a REVIEW LIST for curator
confirmation — it does not write directly to `data/models/*.json`.

## Source configuration

### Confirmed public docs pages (no auth required to view)
| Lab | URL | Notes |
|---|---|---|
| OpenAI | `https://developers.openai.com/api/docs/models/all` | Lists all current tiers incl. Sol/Terra/Luna naming |
| Anthropic | `https://platform.claude.com/docs/en/about-claude/models/overview` | Lists all current Claude model IDs with specs |
| Google | `https://ai.google.dev/gemini-api/docs/models` | Lists all current Gemini/Gemma/Veo/Imagen variants |

### Needs verification before use
| Lab | Likely location |
|---|---|
| Meta AI | Check `ai.https://ai.https://ai.meta.com/blog/introducing-muse-image-muse-video-msl//blog/introducing-muse-image-muse-video-msl/` or `llama.com` for an equivalent "models" docs page — not yet confirmed to exist in this format. |
| Mistral | Check `docs.mistral.ai` for an equivalent models-list page — not yet confirmed. |

Do not assume these two mirror the OpenAI/Anthropic/Google pattern without
checking first — verify the page exists and is structured similarly
before wiring it in.

## Steps

1. **Fetch each confirmed docs page** (not the blog, not the API endpoint
   — the public HTML docs page listing all models).

2. **Extract every model ID/name mentioned**, along with whatever
   inline description/spec text is present (context window, pricing,
   capabilities) — these pages are text-dense so treat this as parsing a
   structured listing, not a narrative article.

3. **Apply the scope-policy variant rule** (see `scope-policy.md` addition
   — "Model Variants vs. Cost Tiers"):
   - Determine `primaryTask` and `modality` for each ID by reading its
     description on the page.
   - Group IDs that share both with an existing/candidate parent entry as
     `costTiers` on that parent.
   - IDs that differ on either dimension become independent candidate
     entries.

4. **Diff against existing `data/models/*.json` and `data/ingestion/seen-model-ids.json`** 
   so re-running doesn't re-surface IDs already processed or already cataloged.

5. **Output a review list**, grouped by lab and by parent generation:
   ```
   [OpenAI] gpt-5.6 (existing entry) — new cost tiers found: sol, terra, luna
   [OpenAI] gpt-5.3-codex — NOT in catalog — different primaryTask (code-generation) — candidate for its own entry
   [Anthropic] claude-haiku-4-5 — already cataloged, no action
   ```

6. **On curator confirmation**, hand off to `/add-model` for genuinely new
   entries (citing the docs page itself as one of the `sources[]`, since
   it's a primary, official source — no secondary verification needed for
   facts the docs page states structurally, like context window or
   pricing). For cost-tier additions to an existing entry, this is a
   smaller `[MODIFY]` to that entry's `costTiers` array rather than a new
   file.

7. **Append processed IDs to `seen-model-ids.json`** regardless of
   curator decision, so they're never re-surfaced.

## Explicit non-goals
- Does not replace `check-lab-blogs` — the two are complementary. This
  skill catches variants the blog never announced; the blog catches the
  narrative/context the docs page doesn't provide.
- Does not auto-apply the variant-vs-entry rule blindly — the rule is a
  strong default, but curator confirmation is still required, especially
  for the "marketed as standalone" judgment call carved out in
  `scope-policy.md`.
- Does not attempt Meta/Mistral until their equivalent docs page is
  confirmed to exist and its structure is understood.
