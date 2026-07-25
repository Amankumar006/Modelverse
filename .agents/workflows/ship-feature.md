# /ship

Standard end-to-end cycle for shipping a non-urgent change (model entry, feature,
fix) from a clean working tree to a ready-for-review PR.

## Steps

1. Confirm the current git status is clean. If there are uncommitted changes ask
   the user whether to include them or stash them.
2. Create an appropriately named branch per the git-branching rule
   (`feature/...`, `fix/...`, or `chore/...`).
3. Make the requested change, applying the relevant skill if one matches
   (`add-model-entry` for model data, otherwise proceed directly).
4. Run `next build` locally. If it fails, fix before proceeding — do not open a
   PR on a broken build.
5. Run the deploy-readiness checklist from the `vercel-deploy-check` skill.
6. Commit using Conventional Commits style.
7. Push the branch and open a PR against `main` with a description covering:
   what changed, why, and whether it affects live data/layout/infra.
8. Once Vercel generates the Preview URL, paste it into the PR description and
   report it back to the user for visual review.
9. Stop. Do not merge. Wait for explicit user go-ahead per the git-branching rule.
