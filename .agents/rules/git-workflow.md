# Git Workflow

## Branches

- `main` — production. Auto-deploys to Vercel on every merge. No direct pushes, ever.
- `develop` — integration branch. All feature work merges here first. No direct pushes.
- `feature/*`, `bugfix/*`, `docs/*` — branch off `develop`, PR back into `develop`.
- `hotfix/*` — branch off `main` for urgent prod fixes. PR into `main`, then **immediately** back-merge the same fix into `develop` so it isn't lost or reintroduced.

Never open a feature branch/PR directly against `main`.

## Commits

Use Conventional Commits: `type(scope): imperative summary`. See the `git-commit-formatter` skill for the full workflow — always write commit messages from an actual `git diff`, never from a description of intent.

## Pull Requests

Every change to `develop` or `main` goes through a PR opened via `gh` (see the `open-pull-request` skill), even solo. This isn't bureaucracy — it's the one forced pause before code reaches an integration or production branch, and it leaves a reviewable diff and a paper trail for a production app with no second reviewer.

Since there is currently no CI wired to `pull_request` events (see `project-context.md`), the PR checklist itself — not GitHub — is the enforcement mechanism. Don't skip it because "GitHub didn't block it."

## Merging

- `feature/* → develop`: squash or merge, whichever keeps history readable; self-review the diff via `gh pr diff` before merging.
- `develop → main`: see the `release-to-main` skill — this is the production release gate and has its own checklist.

## Do Not

- ❌ Push directly to `main` or `develop`
- ❌ Open a feature PR targeting `main`
- ❌ Merge a PR without having run build + lint locally
- ❌ Merge with unresolved TODOs that matter for correctness or security
