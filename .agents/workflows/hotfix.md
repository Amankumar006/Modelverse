# /hotfix

For urgent production issues on themodelverse.in that can't wait for the normal
`/ship` cycle — site down, broken rendering, bad data live, security issue.

## Steps

1. Confirm this is actually urgent enough to bypass the normal review cadence —
   state to the user why (e.g. "site returning 500s in production").
2. Branch directly off `main`: `hotfix/<short-description>`.
3. Make the minimal fix — resist scope creep. A hotfix branch should contain only
   what's needed to stop the bleeding, not unrelated improvements noticed along
   the way.
4. Run `next build` locally. Even under time pressure, do not skip this — a broken
   hotfix build makes things worse, not better.
5. Push and open a PR against `main`, clearly labeled `[HOTFIX]` in the title,
   with the Vercel preview link.
6. Ask the user for expedited approval to merge — do not auto-merge even in an
   urgent scenario; production merges stay a human decision per the git-branching
   rule.
7. On merge, run the same production spot-check as `/deploy` step 5.
8. Once confirmed fixed, write up a short postmortem note (what broke, why, what
   the fix was) and ask the user where it should live — e.g. a `docs/incidents/`
   file — so the project's Knowledge base captures it, not just the git log.
