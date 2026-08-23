---
name: open-pull-request
description: Use this skill when the user asks to "open a PR", "create a pull request", "push and open a PR", or when a feature/bugfix/hotfix branch is ready to merge. Uses the gh CLI. Since there's no CI wired to pull_request events yet, this skill's checklist is the actual quality gate.
---

# Open Pull Request — Modelverse

There is no CI check running on pull requests yet (see `.agents/rules/project-context.md`), and no second human reviewer. This skill's checklist is what stands in for both. Don't shortcut it because GitHub won't stop you.

## 1. Determine the base branch

- `feature/*`, `bugfix/*`, `docs/*` → base is `develop`.
- `hotfix/*` → base is `main`, and note in the PR body that this needs a back-merge into `develop` after merging (then follow the back-merge steps in the `release-to-main` skill).
- Never target `main` from a `feature/*` branch.

## 2. Pre-PR checklist (run before opening, not after)

Run through `.agents/rules/testing-and-quality-gate.md` in full:
1. `npm run build` passes.
2. `npm run lint` is clean.
3. Any relevant `tests/*.test.js` script has been run manually and passes.
4. Diff scanned for secrets.
5. Changed UI/flow manually exercised locally if applicable.

If any of these fail, fix them before opening the PR — don't open it as a draft to "deal with later" on a repo with no CI to catch it.

## 3. Push and open the PR

```bash
git push -u origin <branch-name>

gh pr create \
  --base <develop-or-main> \
  --head <branch-name> \
  --title "<type>(<scope>): <summary>" \
  --body "$(cat <<'EOF'
## Summary
<what changed and why, 1-3 sentences>

## Changes
- <bullet list of concrete changes>

## Testing done
- [ ] npm run build
- [ ] npm run lint
- [ ] node tests/<name>.test.js (if applicable) — result: <pass/fail summary>
- [ ] Manually exercised affected flow locally

## Security considerations
<any secrets/RLS/validation implications, or "None">

## Related
<issue/task reference, or "None">
EOF
)"
```

Use the same `type(scope): summary` convention as the `git-commit-formatter` skill for the PR title — invoke that skill if writing commits for the branch too.

## 4. Self-review before merging

1. `gh pr diff <number>` — read the full diff one more time as if reviewing someone else's PR.
2. `gh pr checks <number>` — confirm there's nothing red (if any CI exists).
3. Merge: `gh pr merge <number> --squash` (or `--merge` if preserving individual commits matters for this change) — only after the checklist above is genuinely satisfied, not just pasted into the template.

## For hotfixes specifically

After a `hotfix/*` PR merges into `main`, immediately open a second PR (or fast-forward merge) bringing the same fix into `develop`:

```bash
git checkout develop
git pull origin develop
git merge --no-ff hotfix/<name>
git push origin develop
```

Don't consider a hotfix done until `develop` has it too.
