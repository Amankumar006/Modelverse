import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getArticles } from '@/lib/supabase/articles';

const QuerySchema = z.object({
  category: z.string().optional(),
  is_published: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? true : val === 'true')),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
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
    const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400, headers: corsHeaders }
      );
    }

    const { category, is_published, limit, offset, search } = parsed.data;
    const result = await getArticles({
      category,
      isPublished: is_published,
      limit,
      offset,
      search,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
