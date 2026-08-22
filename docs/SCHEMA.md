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

---

### 5. Performance Indexes & Server-Side Functions

#### Database Indexes
- `idx_models_active_release_date`: `(release_date DESC) WHERE status != 'staged' AND (verification_status IS NULL OR verification_status != 'DISPUTED')`
- `idx_models_developer_active`: `(developer, release_date DESC) WHERE status != 'staged'`
- `idx_models_family_active`: `(family, release_date DESC) WHERE family IS NOT NULL AND status != 'staged'`
- `idx_models_primary_task_active`: `(primary_task, release_date DESC) WHERE status != 'staged'`
- `idx_news_items_published_date`: `(publish_date DESC) WHERE status = 'published'`
- `idx_news_items_category_published`: `(category, publish_date DESC) WHERE status = 'published'`
- `idx_community_submissions_submitted_by`: `(submitted_by)`
- `idx_audit_log_target_created`: `(target_type, target_id, created_at DESC)`

#### Server-Side RPC Functions
- `get_distinct_developers()`: Returns sorted distinct developers from active models.
- `get_distinct_families()`: Returns sorted distinct model families from active models.

