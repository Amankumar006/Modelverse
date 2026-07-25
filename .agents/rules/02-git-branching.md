---
activation: always_on
---

# Git & Branching Rules

`main` is wired to Vercel Production and deploys to **themodelverse.in** on every
merge. Treat `main` as a live production branch, not a working branch, from now on.

## Branch model
- `main` — production. Protected. No direct commits, no force-push, ever.
- `feature/<short-description>` — new model entries, UI features, non-urgent work.
  e.g. `feature/add-bonsai-27b`, `feature/homepage-card-redesign`.
- `fix/<short-description>` — bug fixes that aren't urgent enough for a hotfix.
- `hotfix/<short-description>` — urgent production fix, branched directly off `main`,
  merged back to `main` as fast as possible, then back-merged into any long-lived
  branches if needed.
- `chore/<short-description>` — tooling, CI, dependency bumps, scripts, docs.

## Rules for the agent specifically
1. **Never commit directly to `main`.** Always create or switch to a branch first.
   If you're asked to "just fix X," still branch — don't rationalize a direct
   commit because the fix is small.
2. **Never force-push `main`**, and don't force-push any shared branch without
   explicitly confirming with the user first.
3. **One logical change per branch/PR.** Matches the data-integrity rule: one model
   entry, one feature, one fix — not a grab-bag.
4. **Commit messages: Conventional Commits style.**
   `feat(models): add Bonsai 27B entry`
   `fix(ui): correct card overflow on mobile filter panel`
   `chore(scripts): update source verification script`
5. **Before opening a PR against `main`, self-check:**
   - Does this pass Zod validation for all touched/added JSON?
   - Does every new/changed model entry have `sources[]` populated?
   - Did you run the local build (`next build`) and confirm no type errors?
   - Is there anything here that changes environment variables, `vercel.json`,
     redirects, or domain config? If yes, flag it explicitly in the PR description
     — these affect production directly on merge.
6. **PR description must state:** what changed, why, and whether it's expected to
   affect the live site's data, layout, or infra. Link the Vercel Preview URL once
   it's generated so the user can review the deployed preview, not just the diff.
7. **Never merge your own PR to `main` automatically.** Prepare it, verify it, then
   hand it back for the user's explicit go-ahead to merge — deployment to production
   is a human decision, not an autonomous one.
