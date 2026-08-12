---
name: supabase-migrations
description: Use this skill whenever making any change to the Supabase/Postgres schema for Modelverse — creating tables, altering columns, adding indexes, RLS policies, or functions. Triggers on requests like "add a column", "create a table", "change the schema", "add an RLS policy", or "migration". This project is live in production, so schema changes must be tracked and reversible, never applied ad hoc.
---

# Supabase Migrations — Modelverse

Modelverse's Supabase project is live in production. There's no second reviewer — this skill *is* the review step. Follow it in order.

## Before making any schema change

1. List existing migrations to see current state and naming convention (Supabase MCP `list_migrations`, or `supabase migration list` locally).
2. List tables with `verbose: true` to confirm the *current* schema before touching it — don't rely on memory or docs, which may be stale.
3. Check `docs/` for existing schema documentation and update it as part of this same change, not as a follow-up task.

## Making the change

1. Write the change as a tracked migration — never as a one-off query against prod. Use Supabase MCP `apply_migration` (name + SQL), or `supabase migration new <name>` and edit the generated file.
2. Name migrations descriptively in present tense: `add_model_card_curator_flag`, not `update1` or `fix`.
3. Prefer additive, reversible changes:
   - New columns: nullable, or with a safe default — not `NOT NULL` with no default on a populated table.
   - Dropping a column/table: only after grepping `src/` and `scripts/` to confirm nothing still references it.
4. If the change adds a table or column that's publicly queryable, add or update its Row Level Security policy in the same migration. Don't leave a new table without RLS in a production project.

## After applying

1. Run `get_advisors` for both `security` and `performance` types, and resolve or explicitly note anything new the migration surfaced.
2. Regenerate TypeScript types if the project uses generated Supabase types, and check `src/` still compiles against them.
3. Update any Zod schema in `data/` or `scripts/` that mirrors the changed table shape — these validate the ingestion pipeline's writes and will silently reject or miscast data if they drift from the real schema.
4. Record the change in `docs/` schema documentation.

## Never

- Never edit the schema directly in the Supabase dashboard SQL editor for anything meant to persist — always go through a migration file, or the repo's migration history and the real prod schema silently diverge.
- Never run a destructive migration (dropped column/table, truncating type change) without first confirming a recent backup / point-in-time recovery window exists — this is live production data.
