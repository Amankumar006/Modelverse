---
activation: always_on
---

# Data Truthfulness & Verification Pipeline Rules

1. **Verification Status Tiers**:
   - `VERIFIED`: 2+ independent sources agree within tolerance, OR 1 source + `humanApproved: true`.
   - `LIKELY`: 1 independent source confirmed, or inherited from a verified base model derivative.
   - `DRAFT`: 0 corroborating sources found / missing data.
   - `DISPUTED`: 2+ independent sources disagree outside tolerance limits (strictly blocks publish).

2. **Tolerance Limits**:
   - **Pricing**: ±10% variation allowance between sources.
   - **Benchmarks**: ±2.0 points variation allowance between sources.
   - **Parameters**: Float normalization matching (e.g. 70B vs 70.6B).

3. **Derivative Base Model Benchmark Inheritance**:
   - Derivative fine-tunes, quantizations (GGUF, EXL2), or LoRA adapters specifying a `baseModel` or `family` matching a verified model in `data/models/` inherit the base model's benchmark tier as `LIKELY`.

4. **News Verification & Workflow Gating**:
   - Every `relatedModels` slug in news posts must exist in production `data/models/`.
   - Numeric claims in rewritten body text must trace back to `rawSourceText`.
   - Workflow scripts (`verify-news.js`, `verify-model-facts.js`) must return exit code `1` on verification failure to prevent auto-posting.

5. **Deduplication Invariant**:
   - Ingestion pipelines must deduplicate candidate models against **both** `data/models/` and `data/models-pending/` before staging.
