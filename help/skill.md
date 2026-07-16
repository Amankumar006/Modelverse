# Project Custom Skills

These are the custom skills available in this workspace (located in `.agents/skills`). You can invoke them to automate specific workflows for the Modelverse project:

### 1. add-model-entry
Adds a single new AI model (open-source, closed-source, API-only, or research-preview) to the site's dataset as a validated JSON entry. 
*Use this whenever you want to add, register, or document a specific released AI model, or hand over structured details about one model to be entered into the catalog.*

### 2. check-lab-blogs
Surfaces candidate new-model announcements from primary lab sources (OpenAI, DeepMind, Anthropic, etc.) for curator review before adding to the timeline.
*Use this to poll official RSS feeds and flag potential new model releases that haven't been ingested yet.*

### 3. design-polish-audit
Audits a page or component against Awwwards-caliber visual and motion design heuristics and flags anything that looks like a generic template default. 
*Use before considering any UI work finished, or when you want to "make this look better/more premium/more awwwards".*

### 4. extract-from-youtube
Extracts AI model release information from a YouTube video (given a URL or a pasted transcript) and turns each model mentioned into a draft entry ready for the `add-model-entry` skill. 
*Use when sharing a YouTube link or transcript to pull model info from it, or to "import" or "catch up" on recent releases from a video.*

### 5. import-from-model-docs
Enumerates currently-listed model IDs from public "all models" documentation pages (OpenAI, Anthropic, Google) to surface API-only tiers, cost variants, and task-specific sub-models for curator review.
*Use this to sweep up minor variants, tiers, and sub-models that never get their own flagship blog post announcements.*
