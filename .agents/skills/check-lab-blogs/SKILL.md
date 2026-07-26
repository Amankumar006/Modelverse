---
name: check-lab-blogs
description: Surface candidate new-model announcements from primary lab sources (OpenAI, DeepMind, Anthropic, etc.) for curator review before adding to the timeline.
---

# Skill: check-lab-blogs

## Purpose
Surface candidate new-model announcements from primary lab sources, for curator
review — this skill NEVER writes directly to `data/models/*.json`. It only
produces a review list that feeds into the existing `/add-model` workflow.

## Source configuration

### Tier A — has official RSS (poll directly)
| Lab | Feed URL |
|---|---|
| OpenAI | `https://openai.com/news/rss.xml` |
| Google DeepMind | `https://deepmind.google/blog/rss.xml` |

### Tier B — no official RSS (manual-check reminder only)
| Lab | Page to check manually |
|---|---|
| Anthropic | `https://www.anthropic.com/news` |
| Meta AI | `https://ai.https://ai.https://ai.meta.com/blog/introducing-muse-image-muse-video-msl//blog/introducing-muse-image-muse-video-msl//blog/` |
| Mistral | `https://mistral.ai/news/` |

Do not attempt to scrape Tier B pages automatically — their markup isn't
built for this and will silently break. Surface these as a manual checklist
line instead: "No feed for {lab} — check {url} yourself."

## Steps

1. **Fetch** each Tier A feed URL. Parse into a list of
   `{ title, link, pubDate }` items.

2. **Filter for release-shaped titles.** Discard items unless the title
   matches release patterns, e.g.:
   - Starts with "Introducing "
   - Contains a version-like token (`GPT-`, `Gemini `, `Gemma `, `Claude `,
     a number+dot pattern like `3.5`, `5.6`)
   - Contains "System Card" (often co-published alongside a release)

   Reject everything else (case studies, partnership announcements,
   Academy/tutorial content, policy posts) — these make up the majority of
   the raw feed volume and are not model releases.

3. **Diff against `data/ingestion/seen-posts.json`** (git-tracked, one
   array of `{ lab, link, firstSeenAt }` objects). Anything not already in
   this file is a new candidate. Anything that is gets skipped silently.

4. **Output a review list**, one line per candidate:
   ```
   [OpenAI] "Introducing GPT-5.6" — 2026-07-09 — https://openai.com/index/gpt-5-6
   ```
   Followed by the Tier B manual-check reminders.

5. **On curator confirmation** (i.e. "yes, add this one"), do NOT populate
   schema fields from the RSS title/description — hand off to `/add-model`,
   which fetches the actual linked post and treats it as the `sources[]`
   citation, same as any manually-found entry.

6. **Append the candidate to `seen-posts.json`** regardless of whether the
   curator said yes or no, so it's never re-surfaced.

## Explicit non-goals
- Does not run on a schedule by default — triggered manually via
  `/check-lab-blogs` until/unless wired to a cron job later.
- Does not touch the frontend, `/timeline`, `/archive`, or any user-facing
  page.
- Does not attempt Tier B automation — treat as a standing manual TODO.
