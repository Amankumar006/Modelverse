import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (!q) {
      // Return featured / top items if query is empty
      const [modelsRes, articlesRes] = await Promise.all([
        getModels({ limit: 6, isActive: true }),
        getArticles({ limit: 4, isPublished: true }),
      ]);

      return NextResponse.json({
        models: modelsRes.models,
        articles: articlesRes.articles,
      });
    }

    const [modelsRes, articlesRes] = await Promise.all([
      getModels({ search: q, limit: 8, isActive: true }),
      getArticles({ search: q, limit: 5, isPublished: true }),
    ]);

    return NextResponse.json({
      models: modelsRes.models,
      articles: articlesRes.articles,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
