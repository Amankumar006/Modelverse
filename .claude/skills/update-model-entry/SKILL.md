---
name: update-model-entry
description: Enrich an existing model entry with pricing, benchmarks, and additional official sources without altering core identity fields.
---

# Update Model Entry

This skill is for enriching an *already registered* model entry in the Modelverse catalog. It is primarily used to backfill missing `benchmarks[]` and `pricing[]` data, or to add new official sources.

## Core Directives

1. **Do not modify identity fields:** Never change `name`, `developer`, `releaseDate`, or `type` unless explicitly instructed by the user or if you find a glaring factual error (in which case, explain the change).
2. **Strict Sourcing (No Hallucination):** Every new piece of data (pricing, benchmark) MUST be accompanied by a valid, official URL added to the `sources[]` array. Do not estimate, infer, or pull numbers from your pre-training weights.
3. **Additive Updates:** Append new sources to the existing `sources[]` array; do not delete old ones.

## Process

1. **Load Current State:** Read the model's existing JSON file (e.g. `data/models/<developer>-<slug>.json`).
2. **Fetch Existing Sources:** Visit the URLs already in the `sources[]` array to look for pricing and benchmark data that might have been skipped during initial registration.
3. **Search for New Sources:** If data is still missing, actively search the web for the developer's official pricing page or API documentation for this specific model.
4. **Update the JSON:**
   - Add/update `pricing[]` following the schema format.
   - Add/update `benchmarks[]`.
   - Update `pricingLastVerified` to today's date (YYYY-MM-DD) if you actively verified the pricing (even if you confirmed it's "Free").
   - Append any new URLs to `sources[]`.
5. **No Data Found Fallback:** If you perform a thorough search and *no* official pricing or benchmark data is available, do not leave the entry untouched and stay silent. Instead, append a note to `curatorNotes` like: `"Enrichment pass on YYYY-MM-DD: no public pricing or benchmark data found."` This signals that the absence of data is confirmed, not just overlooked.
6. **Validation:** Ensure the resulting JSON is strictly valid according to `data/schema/model.schema.ts`.

## Pricing Schema Reference

```json
"pricing": [
  {
    "tier": "Input", // optional
    "unit": "per 1M tokens",
    "amount": 5.00,
    "currency": "USD", // defaults to USD
    "notes": "Context caching available" // optional
  }
],
"pricingLastVerified": "2026-07-16"
```
