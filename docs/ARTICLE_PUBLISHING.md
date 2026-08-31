# 📝 Git & Markdown Article Publishing Guide

Modelverse supports an automated, developer-first article publishing pipeline powered by **Git**, **GitHub Actions**, **Supabase PostgreSQL**, and **Real-time Search Engine Indexing**.

---

## 🚀 How to Publish a New Article

### 1. Create a Markdown File
Create a new `.md` file inside `content/articles/<slug>.md`:

```bash
touch content/articles/deepseek-v3-architecture.md
```

### 2. Add Frontmatter & Markdown Content
Fill out the required frontmatter metadata at the top of your markdown document:

```markdown
---
slug: "deepseek-v3-architecture"
title: "DeepSeek V3 Multi-Head Latent Attention & MoE Routing Mechanics"
category: "Architecture"
summary: "A technical deep dive into DeepSeek V3's MLA compression, 256-expert sparse routing, and Multi-Token Prediction training dynamics."
author:
  name: "Modelverse Research"
  role: "AI Systems Engineer"
source_name: "DeepSeek AI"
source_url: "https://github.com/deepseek-ai/DeepSeek-V3"
cover_image: "/images/articles/deepseek-v3.jpg"
tags:
  - "DeepSeek"
  - "MLA"
  - "MoE"
  - "Architecture"
published_at: "2026-09-01T00:00:00Z"
is_published: true
reading_time: 10
---

## Introduction

DeepSeek-V3 represents a massive leap in open-weights mixture-of-experts...
```

### 3. Add Cover Image (Optional)
Place your cover image in `public/images/articles/<image-name>.jpg` or use an external HTTPS URL.

### 4. Validate Locally (Pre-flight check)
Run the validator script to ensure your frontmatter and syntax adhere to the schema:

```bash
npx tsx scripts/validate-articles.ts
```

### 5. Git Commit & Push
```bash
git add content/articles/ public/images/articles/
git commit -m "feat(article): publish deepseek v3 architecture deep dive"
git push origin main
```

---

## ⚡ What Happens Automatically on `git push`

The `.github/workflows/publish-articles.yml` pipeline triggers and performs:
1. **Pre-flight Validation**: Zod schema checks frontmatter, duplicate slugs, and image paths.
2. **Supabase Database Upsert**: Parses the markdown AST and idempotently upserts the article to the `articles` table in Supabase.
3. **On-Demand Edge Cache Invalidation**: Calls `/api/revalidate` with your secret to purge edge caches so the article appears live immediately on [themodelverse.in/articles](https://www.themodelverse.in/articles).
4. **Instant Search Engine Indexing**: Dispatches real-time `URL_UPDATED` pings to Google Indexing API and IndexNow (Bing/Yandex).

---

## 🔑 GitHub Secrets Configuration

To enable automated Supabase synchronization and real-time search indexing in CI, configure these repository secrets under **Settings → Secrets and variables → Actions**:

| Secret Name | Description | Required |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (for secure writes) | Yes |
| `REVALIDATION_SECRET` | Secret token to authenticate on-demand ISR | Yes |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Cloud Service Account JSON Key | Optional (for Google Indexing API) |
| `INDEXNOW_KEY` | Bing / IndexNow API Key | Optional (for IndexNow) |
