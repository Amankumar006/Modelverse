---
name: extract-from-youtube
description: Extracts AI model release information from a YouTube video (given a URL or a pasted transcript) and turns each model mentioned into a draft entry ready for the add-model-entry skill. Use when the user shares a YouTube link or transcript from channels like The AI Search and asks to pull model info from it, or asks to "import" or "catch up" on recent releases from a video.
---

# Extract Model Info From YouTube

## When to use this skill
- The user pastes a YouTube URL or transcript (e.g. from The AI Search or a
  similar AI-news channel) and wants model releases pulled out of it.
- The user asks to "process this video" / "add whatever models are in this
  video" / "catch up the site from this episode."

## How to use it

1. **Get the transcript.** If given only a URL, fetch the transcript (via
   an available tool/MCP, or ask the user to paste it if none is
   available — do not fabricate video content from the title alone).

2. **Identify every distinct model mentioned**, not just the headline one —
   these roundup videos often cover 3-10 releases per episode.

3. **For each model, extract candidate values** for the fields in
   `data/schema/model.schema.ts`: name, developer, approximate release
   timing, type (open/closed/API), modality, primaryTask, deployment,
   and any specific claims (benchmark numbers, parameter counts, license).
   Infer `primaryTask` and `deployment` from context (e.g. "run locally"
   implies self-hostable/on-device; "API only" implies api-only). Mark these
   as needing confirmation in the draft list. Keep the video URL as a source,
   with a timestamp if you can identify one.
   Apply scope-policy.md when filtering which mentioned models are even
   worth drafting — a roundup video often mentions fine-tunes or minor
   updates in passing that shouldn't become full entries.

4. **Cross-check before trusting a number.** Video creators paraphrase and
   sometimes get benchmark numbers, license names, or param counts wrong.
   Before finalizing, do a quick search for each model's official
   announcement/blog/HuggingFace/GitHub page. If you find one, add it to
   `sources` and prefer its numbers over the video's; if you can't, keep
   the video's claim but mark `verified: false`.

5. **Present a draft list** to the user before writing any files: one short
   line per model (name, developer, type, one-line description) so they can
   confirm scope before you create N files at once. Do not silently write
   multiple new entries without this checkpoint — a single video can yield
   many entries and mistakes compound.

6. **Hand off** confirmed entries to the `add-model-entry` skill, one at a
   time, including the duplicate-check step (roundup videos often mention
   models the site already has).

## Notes
- Never invent a release date, benchmark score, or license the video didn't
  actually state and that you couldn't corroborate elsewhere.
- If the video is wrong about something you can verify (e.g. calls a model
  "open source" when it's actually only open-weights), use the correct
  classification and note the discrepancy in `curatorNotes`.
