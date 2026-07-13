# Modelverse Model Entry Template

Use this to gather everything needed before adding a model (manually, or handing to the `add-model-entry` skill). Fields marked **Required** must be filled before an entry can be published; **Optional** fields improve the page but won't block it. This mirrors `data/schema/model.schema.ts` exactly — nothing here should drift from that file.

---

## 1. Identity

- **Name** (Required) — the model's official name as released.
  _e.g. "Claude 3.5 Sonnet"_
- **Developer** (Required) — must match an entry in the controlled
  `developers.ts` list; if the org isn't listed yet, flag it to add rather
  than free-typing a variant spelling.
  _e.g. "Anthropic"_
- **Slug / ID** — usually auto-derived from developer + name
  (kebab-case), no need to fill manually unless something looks off.
  _e.g. "anthropic-claude-3-5-sonnet"_

## 2. Classification (drives search/filter — get these right)

- **Type** (Required) — one of: `open-source`, `open-weights`,
  `closed-source`, `api-only`, `research-preview`.
- **Modality** (Required, pick 1+) — one or more of: `text`, `image`,
  `video`, `audio`, `multimodal`, `code`, `embedding`.
- **Primary Task** (Required) — the single main thing this model is for.
  One of: `chat-reasoning`, `code-generation`, `image-generation`,
  `video-generation`, `audio-speech`, `embedding`, `agentic`,
  `multimodal-general`, `translation`, `search-retrieval`, `other`.
- **Deployment** (Required, pick 1+) — one or more of: `api-only`,
  `self-hostable`, `on-device`.
- **License** (Required) — must match the controlled `licenses.ts` list
  (e.g. "Apache 2.0", "MIT", "Proprietary", "Llama Community License").
  If genuinely novel/custom, use `"Other/Custom"` and explain in curator
  notes.

## 3. Technical specs

- **Parameters** (Optional but encouraged) — free text; use
  `"undisclosed"` rather than leaving blank for closed-source models —
  that's informative in itself.
  _e.g. "70B", "8x22B MoE", "undisclosed"_
- **Context window** (Optional) — e.g. `"128K tokens"`.
- **Release date** (Required) — ISO format `YYYY-MM-DD`. If only the
  month is known publicly, use the 1st and note the imprecision.

## 4. Content

- **Description** (Required, 20-600 characters) — one paragraph, plain
  language, what it is and why it's notable. Not marketing copy — a
  factual summary someone unfamiliar with the model could understand.
- **Key features** (Optional, list) — 3-5 short bullet points. Concrete
  capabilities, not vague adjectives.
  _e.g. "Native function calling", "128K context window", not "powerful and fast"_
- **Benchmarks** (Optional, list of name + score) — only include ones you
  can source. Mark any you can't independently verify.
  _e.g. MMLU: 88.7%, SWE-bench Verified: 49%_

## 5. Lineage (if applicable)

- **Family** (Optional) — the model family/series this belongs to.
  _e.g. "Claude", "Llama", "Gemini"_
- **Previous version** (Optional) — the `id` of the prior version in the
  same family, if this is a successor release.

## 6. Links & sources

- **Website** (Optional but usually available) — official announcement or
  product page.
- **Paper** (Optional) — arXiv or official technical report, if one exists.
- **HuggingFace** (Optional) — model card URL, if open/available there.
- **GitHub** (Optional) — repo URL, if applicable.
- **Blog post** (Optional) — official blog announcement, if distinct from
  the website link.
- **Sources** (Required, at least 1 URL) — this is what everything above
  should be checkable against. A YouTube video alone is not sufficient —
  pair it with at least one primary source (official page, paper, or
  model card) before marking the entry complete.

## 7. Media

- **Logo** (Optional) — path under `/public/logos/` for the developer's
  logo (shared across all their models, not per-model).

## 8. Tags (optional, namespaced)

- Namespaced tags for structured lineage/references:
  `arxiv:2401.xxxxx` (paper), `base:<model-id>` (fine-tune lineage).
- Free descriptive tags for anything not already covered by a facet
  above: `long-context`, `on-device`, `agentic-tooling`, etc. Don't
  duplicate what a facet field already says (e.g. no `"vision"` tag if
  `modality` already includes `"image"`).

## 9. Internal / curator fields

- **Verified** (defaults `true`) — set to `false` if any field above is
  unconfirmed/best-guess rather than sourced.
- **Curator notes** (Optional) — explain any imprecision: an estimated
  release date, an unconfirmed benchmark, a discrepancy between a video
  source and what you could verify officially.

---

### Quick copy-paste blank version

```
Name:
Developer:
Type:
Modality:
Primary Task:
Deployment:
License:
Parameters:
Context window:
Release date:
Description:
Key features:
Benchmarks:
Family:
Previous version:
Website:
Paper:
HuggingFace:
GitHub:
Blog post:
Sources (required, 1+):
Logo:
Tags:
Verified:
Curator notes:
```
