# Contributing to Modelverse

Thank you for contributing to Modelverse!

This document defines our repository structure, branching strategy, pull request workflow, and development guidelines.

---

# Repository Structure

```text
Modelverse/
│
├── src/               # Next.js Application (App Router, Components, Lib)
├── scripts/           # Node.js Ingestion & Enrichment Scripts
├── docs/              # Project Documentation (Architecture, Schema, etc.)
├── data/              # Validation Schemas, API Caches, & CI Artifacts
└── .github/
    └── workflows/     # CI/CD & Automated Data Ingestion Pipelines
```

---

# Technology Stack

## Frontend & Fullstack
* Next.js 15 (App Router)
* TypeScript
* Tailwind CSS (v4)
* Framer Motion

## Backend & Database
* Supabase (PostgreSQL)
* Node.js (for ingestion scripts)
* Zod (for data validation)

---

# Branching Strategy

The repository follows a Git Flow inspired workflow.

## Protected Branches

### main
Production-ready code and live data source.
Rules:
* No direct pushes from developers (Note: GitHub Actions bots may push automated data ingestion commits here)
* Pull Request required for feature merges
* At least 1 approval required
* CI checks must pass
* Conversations must be resolved before merge

### develop
Integration branch for all ongoing development.
Rules:
* No direct pushes
* Pull Request required
* At least 1 approval required

---

# Branch Naming Convention

## Feature Branches
```text
feature/admin-dashboard
feature/ingestion-pipeline
feature/ui-refresh
```

## Bug Fixes
```text
bugfix/schema-validation
bugfix/news-rendering
```

## Hotfixes
```text
hotfix/production-build-crash
hotfix/api-rate-limits
```

## Documentation
```text
docs/schema-update
docs/architecture-revision
```

---

# Development Workflow

## 1. Sync develop
```bash
git checkout develop
git pull origin develop
```

## 2. Create Feature Branch
Example:
```bash
git checkout -b feature/admin-dashboard
```

---

## 3. Commit Changes
Use Conventional Commits.
Examples:
```text
feat(ui): add curator review dashboard
feat(ingestion): implement openrouter api fallback
fix(schema): resolve type mismatch in model schema
fix(news): correct template string escaping
docs: update ingestion pipeline documentation
chore: update dependencies
```

---

## 4. Push Branch
```bash
git push origin feature/admin-dashboard
```

---

## 5. Open Pull Request
Target Branch:
```text
develop
```
All feature branches must be merged into `develop`.
Do NOT create feature PRs directly into `main`.

---

## 6. Code Review
Requirements:
* At least 1 approval
* CI checks passing
* No unresolved conversations

---

## 7. Merge
After approval:
```text
feature/* → develop
```
Release Flow:
```text
develop → main
```

---

# CI/CD

GitHub Actions automatically manage data ingestion and validation:

## Data Ingestion & Enrichment
* Fetch RSS feeds and 3rd party APIs
* Validate new model payloads with Zod
* Commit cached datasets to the repository
Workflows:
```text
.github/workflows/daily-news.yml
.github/workflows/daily-ingestion.yml
```

---

# Pull Request Checklist

Before creating a PR:
* Code compiles successfully (`npm run build`)
* No lint errors (`npm run lint`)
* Documentation updated if required
* Branch is up-to-date with `develop`
* Self-review completed

---

# Do Not
❌ Push directly to `main` (unless you are a CI/CD bot)
❌ Push directly to `develop`
❌ Merge without review
❌ Commit secrets, API keys, or credentials
❌ Bypass CI checks
