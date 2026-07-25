---
activation: model_decision
description: Apply when the task touches deployment, Vercel config, environment variables, domain/DNS, redirects, build settings, or anything under vercel.json / next.config.*
---

# Vercel / Production Deployment Rules

Modelverse is live at **https://themodelverse.in/** on Vercel, connected to `main`.

1. **Every push to `main` ships to production immediately.** There is no manual
   "deploy" step to approve on Vercel's side once merged — the merge *is* the
   deploy trigger. Treat merging to `main` with that weight.
2. **Preview deployments are your safety net.** Every branch/PR gets an automatic
   Vercel Preview URL. Always point the user to the preview URL for visual/behavioral
   review before a merge, especially for UI or data changes that affect rendering.
3. **Environment variables live in Vercel's dashboard, not in the repo.** Never
   commit `.env`, API keys, or secrets. If a task needs a new env var, tell the user
   explicitly what to add in Vercel (Project Settings → Environment Variables) and
   for which environments (Production / Preview / Development) — don't assume it's
   already there.
4. **Domain/DNS changes are out of scope for autonomous action.** If a task would
   touch `vercel.json` redirects/rewrites, custom domain config, or anything that
   could affect `themodelverse.in` resolving correctly, stop and confirm with the
   user before making the change — a mistake here takes the whole site down, not
   just a feature.
5. **Build must pass locally before you claim a change is deploy-ready.** Run
   `next build` (not just `next dev`) — dev mode hides type errors and some
   server/client boundary issues that break production builds.
6. **If a deploy fails on Vercel,** pull the build log via the Vercel CLI/dashboard
   rather than guessing at the cause from the diff alone.
