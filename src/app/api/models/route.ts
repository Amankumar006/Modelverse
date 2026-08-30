import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';

const QuerySchema = z.object({
  provider: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { provider, limit, offset, search } = parsed.data;
    const supabase = createServerClient();

    let query = supabase
      .from('models')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (provider) {
      query = query.eq('provider', provider);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      // If table doesn't exist yet or connection isn't configured, return a clean payload
      return NextResponse.json(
        {
          models: [],
          total: 0,
          limit,
          offset,
          warning: error.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      models: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
