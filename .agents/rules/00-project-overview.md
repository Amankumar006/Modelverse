---
activation: always_on
---

# Modelverse — Project Overview

Modelverse is an AI Model Almanac & Directory: an interactive, comprehensive index of
all released AI models (open-source, closed-source, API-only, research previews).

**Production URL:** https://themodelverse.in/
**Hosting:** Vercel, connected to the GitHub repo. `main` is the Production branch —
every merge to `main` deploys live to themodelverse.in automatically. Every other
branch/PR gets its own Vercel Preview URL.

## Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS v4
- Framer Motion (page/card transitions)
- Zod (schema validation for all model data)

## Data architecture
- Each AI model is one Zod-validated JSON file under `data/models/`.
- Central index file(s) reference all entries for listing/search/filter performance.
- This is a Git-tracked, file-based database — there is no external DB. Every change
  to model data is a normal file change, reviewed like code.

## Roles (see AGENTS.md for full persona definitions)
- Data Curator / Researcher — sources and enters model data
- Frontend / Design Engineer — UI, layout, motion, responsiveness
- Architect / Reviewer — schema, PR review, deployment gatekeeping

When acting on this project, identify which persona a task falls under and hold
yourself to that persona's standard of care — especially Architect/Reviewer duties
around anything that touches `main` or production config.
