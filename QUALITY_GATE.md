# Quality gate

The ingestion workflows still commit and push directly to `main`. The quality
gate controls public indexability, not the Git flow: indexed records are sent
to sitemaps and IndexNow; `thin` model pages and `unlisted` news pages remain
available to human visitors with `noindex, follow` metadata.

## Scores

- Models need **65/100** to be `indexed`: populated core fields (30), at least
  two genuinely distinct rendered text fields (25), two numeric benchmarks
  (20), no placeholders in an available self-comparison row (15), and a
  reviewed editorial note longer than 150 characters (10).
- News needs **55/100** to be `indexed`: low 5-word-shingle similarity to its
  source text (35), an original analysis section (25), valid source attribution
  (15), more than one source domain (15), and a 120-word floor (10). Length is
  deliberately only a small tiebreaker.
- Models below **40** and news below **25** are copied to the matching
  `data/quarantine/` directory rather than inserted into public Supabase tables.

Review `data/quality-report.json` after several runs, then tune the two
quarantine thresholds first. The scoring functions are pure and make no LLM
calls.

## Data fields and migration

Run `database/migrations/20260814000000_add_quality_gate.sql` before deploying
the scripts. It adds the `quality_*` columns and canonical news `sources`
array. Existing legacy rows have no quality status and remain indexable; the
gate applies to new records going forward.

After applying the migration, run `node scripts/backfill-quality.js` once to
score existing Supabase records. Use `--dry-run` only for an inspection run;
the real invocation writes the status/score fields and emits the detailed
model/news distribution in `data/quality-report.json`.

Models previously used only `description` for card/meta and overview content.
Optional `cardSummary`, `pageOverview`, and `editorialNote` fields now allow a
curator to supply distinct public text. `curatorNotes` remains internal and is
not used as editorial copy. News previously had only `externalSources`; new
ingestion writes both it and `sources` for compatibility.

## Duplicate and story controls

`data/cache/content-fingerprints.json` stores a 30-day window of hashes and
5-word shingles. Every checked item is appended, even if unlisted or
quarantined. A match at 0.75 forces news to `unlisted`.

News candidates get a free 0–10 story-worthiness pre-score before any full LLM
draft. Scores under 6 become explicitly unlisted briefs, reducing hourly
single-source rewrites without changing the workflow schedule.
