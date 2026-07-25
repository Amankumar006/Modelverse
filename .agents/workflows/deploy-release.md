# /deploy

Use only after a PR has been reviewed and the user has explicitly approved merging
to `main`. This workflow assumes human go-ahead has already been given — it does
not grant it.

## Steps

1. Confirm explicitly with the user: "Merging PR #<n> to main will deploy to
   themodelverse.in immediately — confirm you want to proceed." Do not proceed
   without an explicit yes in this session.
2. Re-run the `vercel-deploy-check` skill's pre-merge checklist one more time in
   case the branch has moved since the PR was opened.
3. Merge the PR into `main` (prefer a merge that preserves a clear commit history —
   squash merge for single-purpose branches, regular merge if the branch has
   meaningful individual commits worth preserving).
4. Watch for the Vercel Production deployment to start. Report back once it's
   live, or immediately if it fails.
5. If it deploys successfully: spot-check https://themodelverse.in/ for the
   specific change that was shipped — don't just trust a green Vercel check.
6. If it fails: pull the build log immediately (see `vercel-deploy-check` skill's
   failure-investigation steps) and propose either a forward fix or a rollback to
   the last known-good deployment. Present both options; let the user choose.
7. Delete the merged feature/fix branch (local and remote) once confirmed live.
