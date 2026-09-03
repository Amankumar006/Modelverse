import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { extractSourcePoster } from "@/lib/extract-source-poster";
import { cacheArticlePosterLocally } from "@/lib/cache-article-poster";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://zmfyclrjbiewmwqiswqk.supabase.co";
const INGEST_SECRET = process.env.INGESTION_SECRET || process.env.REVALIDATION_SECRET || "modelverse-ingest-secret-2026";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-ingest-secret");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    if (token !== INGEST_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid ingestion secret" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.title || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields: title and content are required" },
        { status: 400 }
      );
    }

    const {
      title,
      summary,
      content,
      category = "Architecture",
      source_name = "Modelverse Research",
      source_url,
      tags = ["Architecture", "AI"],
      is_published = true,
      published_at = new Date().toISOString(),
    } = body;

    const slug = body.slug ? generateSlug(body.slug) : generateSlug(title);

    // 1. Fallback Hierarchy: Custom -> Extracted Original -> Universal Poster
    let coverImage = body.cover_image?.trim();
    if (!coverImage || coverImage.toLowerCase().includes("placeholder")) {
      if (source_url) {
        const extractedPoster = await extractSourcePoster(source_url);
        if (extractedPoster) {
          const cachedLocal = await cacheArticlePosterLocally(extractedPoster, slug);
          coverImage = cachedLocal || extractedPoster;
        }
      }
    }
    if (!coverImage || coverImage.toLowerCase().includes("placeholder")) {
      coverImage = "/images/articles/universal-cover.svg";
    }

    const cleanSummary = summary || title;

    // 2. Write Markdown file to content/articles/<slug>.md
    const frontmatterYaml = `---
slug: "${slug}"
title: ${JSON.stringify(title)}
category: "${category}"
summary: ${JSON.stringify(cleanSummary)}
author:
  name: "Modelverse Research"
  role: "AI Systems Engineer"
source_name: ${JSON.stringify(source_name)}
${source_url ? `source_url: "${source_url}"\n` : ""}cover_image: "${coverImage}"
tags:
${tags.map((t: string) => `  - "${t}"`).join("\n")}
published_at: "${published_at}"
is_published: ${is_published}
---

${content.trim()}
`;

    // 2. Safely write Markdown file locally if filesystem is writable (e.g. local / CI)
    try {
      const articlesDir = path.join(process.cwd(), "content/articles");
      await fs.mkdir(articlesDir, { recursive: true });
      await fs.writeFile(path.join(articlesDir, `${slug}.md`), frontmatterYaml, "utf-8");
    } catch {
      // Serverless environments like Vercel Lambda have a read-only filesystem (/var/task)
      // Supabase PostgreSQL serves as the production database and source of truth.
    }

    // Optional: Commit to GitHub repository if GITHUB_TOKEN is configured
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      try {
        const ghUrl = `https://api.github.com/repos/Amankumar006/Modelverse/contents/content/articles/${slug}.md`;
        const contentBase64 = Buffer.from(frontmatterYaml).toString("base64");
        
        let sha: string | undefined;
        const checkRes = await fetch(ghUrl, {
          headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "Modelverse-Ingest" },
        });
        if (checkRes.ok) {
          const fileData = await checkRes.json();
          sha = fileData.sha;
        }

        await fetch(ghUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            "Content-Type": "application/json",
            "User-Agent": "Modelverse-Ingest",
          },
          body: JSON.stringify({
            message: `feat(articles): auto-publish ${title}`,
            content: contentBase64,
            sha,
            branch: "main",
          }),
        });
      } catch {
        // Non-blocking
      }
    }

    // 3. Upsert to Supabase PostgreSQL Database
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseKey) {
      const supabase = createClient(SUPABASE_URL, supabaseKey);
      await supabase.from("articles").upsert(
        {
          slug,
          title,
          summary: cleanSummary,
          content: content.trim(),
          category,
          source_name,
          source_url: source_url || null,
          cover_image: coverImage,
          is_published: is_published !== false,
          published_at: published_at,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      );
    }

    // 4. Purge Next.js Edge Cache
    revalidateTag("articles", "max");
    revalidatePath("/articles");
    revalidatePath(`/articles/${slug}`);
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      slug,
      title,
      cover_image: coverImage,
      live_url: `https://www.themodelverse.in/articles/${slug}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
