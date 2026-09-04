import { NextRequest, NextResponse } from "next/server";
import { getModels, getModelCount } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";
import { z } from 'zod';

const SearchSchema = z.object({
  q: z.string().trim().default(""),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = SearchSchema.safeParse({ q: searchParams.get("q") || "" });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400, headers: corsHeaders }
      );
    }

    const { q } = parsed.data;

    let responseData;

    if (!q) {
      // Return featured / top items if query is empty
      const [modelsRes, articlesRes, totalCount] = await Promise.all([
        getModels({ limit: 6, isActive: true }),
        getArticles({ limit: 4, isPublished: true }),
        getModelCount(),
      ]);

      responseData = {
        models: modelsRes.models,
        articles: articlesRes.articles,
        totalModels: totalCount,
      };
    } else {
      const [modelsRes, articlesRes, totalCount] = await Promise.all([
        getModels({ search: q, limit: 8, isActive: true }),
        getArticles({ search: q, limit: 5, isPublished: true }),
        getModelCount(),
      ]);

      responseData = {
        models: modelsRes.models,
        articles: articlesRes.articles,
        totalModels: totalCount,
      };
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Search error";
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
