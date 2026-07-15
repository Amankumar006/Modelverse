# Scope Policy

## Model Variants vs. Cost Tiers

### The rule
A model variant gets its own catalog entry in `data/models/` only if it differs from its sibling(s) on `primaryTask` OR `modality`. If it differs only on cost/speed/latency within the same task and modality, it is NOT a separate entry — it's a cost tier on the parent entry.

### Why
Frontier labs increasingly ship a single "generation" as multiple named SKUs (e.g. Sol / Terra / Luna, or Pro / Flash / Flash-Lite) that are really price/latency points on the same underlying capability, not distinct products. Cataloging every SKU as its own entry inflates the catalog with near-duplicates and fragments benchmark/lineage data across near-identical entries. But some "variant-looking" names ARE genuinely distinct products (a code-specific model, a realtime/audio model) and deserve full entries.

### Decision test (apply in this order)
1. Does the variant have a different `primaryTask` than its sibling(s)?
   → YES: separate entry.
2. Does the variant have a different `modality` than its sibling(s)?
   → YES: separate entry.
3. Otherwise → NOT a separate entry. Add it to the parent's `costTiers` field instead.

### When curator judgment is still needed
Rule step 3's parenthetical (marketed/benchmarked as standalone) is the one subjective call left. When it comes up, the curator should log the reasoning in that entry's `curatorNotes` field. This keeps the judgment call auditable instead of silent.
