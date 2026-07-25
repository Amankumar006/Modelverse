---
name: verify-source
description: Use when asked to verify, audit, or double-check the accuracy of existing model entries, sources, licenses, or benchmark claims already in data/models/.
---

# Verify Model Data / Source Audit

## When to use this
"Audit the sources on X," "double check the license for Y," "batch-verify recent
entries," "check for GitHub affiliation / academic metadata accuracy."

## Steps

1. **Do not treat this as read-only.** The output is either a confirmation, a
   correction, or a `verified: false` flag — not silence.
2. For each entry under audit:
   - Re-fetch each URL in `sources[]` and confirm it still supports the claimed
     field (sources go stale — pages get edited, models get relicensed).
   - For any field currently marked `verified: false`, actively try to find a
     primary source that resolves it. If found, add the source and flip to `true`.
     If not, leave it flagged — don't silently drop the flag.
   - Cross-check provider/GitHub affiliation claims against the actual org account,
     not just a README mention.
3. **Never silently correct a value without logging what changed and why** — treat
   this like the data-integrity "flag conflicts, don't resolve unilaterally" rule.
   Summarize corrections in the PR description as a clear before/after list.
4. **Batch audits still follow one-PR-per-logical-unit** where practical — a
   "verify all July research model entries" batch can be one PR, but keep it
   scoped to that batch, not mixed with new entries.
5. Commit style: `fix(models): correct license verification for <Model Name>` or
   `chore(models): batch source audit for research models`.
