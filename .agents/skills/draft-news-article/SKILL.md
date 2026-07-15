---
name: draft-news-article
description: Drafts news articles (Short News and Weekly News issues) from verified catalog data (Lane 1) or credible external sources (Lane 2). This skill only writes files with status "draft" and never publishes directly.
---

# Draft News Article

Use this skill to draft News section content (Short News and Weekly News roundup issues) following our two-lane news sourcing model.

## Sourcing Lanes

### Lane 1: Catalog-Backed News (Strictly Factual)
- **Scope**: Direct recaps, feature breakdowns, and models already in the Modelverse catalog.
- **Fact-Checking**: Every factual claim must trace directly to a verified schema field or `sources[]` list in `data/models/`. No other claims or benchmarks are allowed.
- **Fields**:
  - `confidenceLevel`: `"confirmed"`
  - `externalSources`: Omit or empty array.

### Lane 2: Industry News (Leaks, Rumors, & Sentiment)
- **Scope**: Leaks, rumors, delays, benchmark gossip, or community reactions about models/updates not in the model catalog.
- **Trigger**: The curator supplies one or more `externalSources` URLs and a topic.
- **URL Verification**: Verify that each URL in `externalSources` is real and fully formed before drafting.
- **Confidence Level Assignment**:
  - `"confirmed"`: Official company statement, blog post, or legal filing.
  - `"reported"`: Credible tech journalism report (named outlet, clear byline, professional sourcing).
  - `"rumor"`: Unverified leak, anonymous post, or screenshot.
  - `"community-discussion"`: Public community sentiment, discussion aggregation.
  - *If genuinely unclear, default to the more conservative/lower-confidence level.*
- **Mandatory Hedged Language**: For any article where `confidenceLevel` is NOT `"confirmed"`, you must use hedged language.
  - Do NOT write flat, declarative fact claims.
  - Use phrases like "according to [outlet]," "has not been officially confirmed by [company]," "reportedly," or "alleged leaks suggest."
- **Fields**:
  - `confidenceLevel`: `"reported"`, `"rumor"`, or `"community-discussion"`
  - `externalSources`: Array of the verified URLs cited.

---

## Hard Constraints (Non-Negotiable)
1. **House Byline**: The `author` field must always be `"Modelverse Editorial"`. Never fabricate a person's name.
2. **Draft Status**: Every drafted article MUST be written to disk with `"status": "draft"`. Never auto-set `"status": "published"`.
3. **Appropriate Categories**: This skill only drafts `"short-news"` and `"weekly-news"` category entries. It does NOT draft `"model-review"` or `"other"` categories.
4. **No Cover Art Generation**: Do NOT generate cover art. Leave the `coverImage` field as an empty string `""` and flag it to the curator.

---

## Workflow Steps

1. **Sourcing Lane Identification**:
   - If drafting Lane 1: Read the target model JSON file(s) from `data/models/`.
   - If drafting Lane 2: Read the curator-provided topic and verify `externalSources` URLs.
2. **Determine Confidence & Language**:
   - Set `confidenceLevel` appropriately.
   - For Lane 2, write the body text using strict hedged language.
3. **Calculate Issue Number (Weekly news only)**:
   - Read `data/news/_index.json` or `src/lib/news-index.json`.
   - Find the maximum existing `issueNumber` among `weekly-news` posts.
   - Set the draft's `issueNumber` to `highest + 1`.
4. **Write to Disk**: Save the file in `data/news/<slug>.json` with `"status": "draft"`.
5. **Report to Curator**: Report back with a summary:
   ```
   Draft ready for review: {title} — {category} ({confidenceLevel}) — cites {N} sources.
   ```
   Point out that cover art and flipping `status` to `"published"` must be done manually.
