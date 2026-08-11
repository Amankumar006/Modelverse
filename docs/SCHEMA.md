# Modelverse Specification Schema Documentation

Every model in Modelverse is backed by a relational record in the Supabase `models` table.

---

## 📋 Data Fields & Types

### 1. Model Core Identity

| Field | Type | Description |
|:---|:---|:---|
| `id` | `uuid` | Unique database identifier |
| `name` | `string` | Display name (e.g. `Claude Opus 5`) |
| `slug` | `string` | URL slug (e.g. `anthropic-claude-opus-5`) |
| `developer` | `string` | Developer or research lab (e.g. `Anthropic`) |
| `releaseDate` | `string` (`YYYY-MM-DD`) | Initial public release date |
| `updatedAt` | `string` (`YYYY-MM-DD`) | Date of last metadata update |
| `type` | `enum` | `"open-source"` \| `"open-weights"` \| `"closed-source"` \| `"api-only"` \| `"research-preview"` |
| `status` | `enum` | `"active"` \| `"deprecated"` \| `"sunset"` |
| `vendorApiStatus`| `enum` | `"active"` \| `"deprecated"` \| `"sunset"` |

---

### 2. Capabilities & Specifications

| Field | Type | Description |
|:---|:---|:---|
| `primaryTask` | `enum` | `"chat-reasoning"` \| `"code-generation"` \| `"image-generation"` \| `"video-generation"` \| `"audio-speech"` \| `"embedding"` \| `"agentic"` \| `"multimodal-general"` \| `"translation"` \| `"search-retrieval"` \| `"other"` |
| `modality` | `string[]` | Input/output modalities (e.g. `["text", "image", "code"]`) |
| `deployment` | `string[]` | Deployment options (`"api-only"`, `"self-hostable"`, `"on-device"`) |
| `parameters` | `string` / `jsonb` | Parameter size (e.g. `"111.1B"`, `"70B"`, `"undisclosed"`) |
| `activeParameters` | `string` / `jsonb` | Active parameter size for MoE architectures |
| `contextWindow` | `string` / `jsonb` | Context token limit (e.g. `"128K tokens"`, `"1.0M tokens"`) |
| `license` | `string` / `jsonb` | Software/model license (e.g. `"Apache-2.0"`, `"Llama-3.3"`, `"proprietary"`) |

---

### 3. Prose & Draft Isolation Fields

| Field | Type | Description |
|:---|:---|:---|
| `description` | `string` | Live production model overview summary |
| `descriptionDraft` | `string` (optional) | AI-generated candidate description awaiting human review |
| `keyFeatures` | `string[]` | Live production key feature bullet points |
| `keyFeaturesDraft` | `string[]` (optional) | Candidate key features awaiting human review |

---

### 4. Provenance, Human Verification & SEO

| Field | Type | Description |
|:---|:---|:---|
| `verified` | `boolean` | **Human Gate Flag**. Indicates human review. Renders amber dot UI when false. |
| `verificationStatus` | `enum` | Detailed state (`"VERIFIED"`, `"LIKELY"`, `"DRAFT"`, `"DISPUTED"`) |
| `fieldConfidence` | `jsonb` | Field-level confidence scores for pricing, benchmarks, context window |
| `needsReview` | `boolean` (optional) | Flags entries auto-enriched by scripts requiring human review |
| `sources` | `string[]` | Array of source URLs attached for provenance verification |
| `curatorNotes` | `string` | Operational notes regarding verification status or migration history |

**SEO Note:** Models are marked up using `SoftwareApplication` JSON-LD schema for optimal Google Search coverage, avoiding ecommerce product errors.
