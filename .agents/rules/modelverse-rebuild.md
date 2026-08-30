# Modelverse Rebuild — Kickoff & Context

## Context: Why Rebuilding
- The previous codebase ran on GitHub Actions in a **private** repo and hit the 2,000 free minutes/month cap.
- **Decision 1: The new repo will be public.**
  - Unlimited free Actions minutes on standard runners.
  - Free secret scanning and push protection.
  - Code (scoring logic, thresholds, prompts) is public.
  - **Secret hygiene is a strict hard requirement**: zero secrets/credentials in code/repo, `.env*` gitignored, only injected via GitHub Secrets / local `.env.local`.
  - All LLM-generated content is treated as untrusted input.
  - RLS strictly enforced on Supabase tables.
- **Decision 2: Open Pipeline Scope**:
  - Prior short-brief / longform / deep-dive split is prior art to learn from, open for full reconsideration.
  - Supabase database and tables survived and are reused.

## Workflow & Conventions
- Solo-developer workflow: PRs opened via `gh` CLI rather than web UI.
- No heavy test framework: manual verification via lightweight `node tests/<name>.test.js` scripts.
- Self-review checklists in place of multi-reviewer review.
- Always propose and review plans before implementation.
