import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Simple in-memory rate limiting. 
// Note: In a serverless Edge environment, this state is per-isolate. 
// For distributed strict limits, a KV store is required.
const rateLimitMap = new Map<string, { count: number; startTime: number }>();
const RATE_LIMIT = 60; // Max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute

export async function proxy(request: NextRequest) {
  // Only apply rate limiting to /api/models endpoints
  if (request.nextUrl.pathname.startsWith('/api/models')) {
    // Read Vercel's actual forwarded-IP context
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    
    const requestData = rateLimitMap.get(ip) || { count: 0, startTime: now };
    
    if (requestData.startTime < windowStart) {
      requestData.count = 1;
      requestData.startTime = now;
    } else {
      requestData.count++;
    }
    
    rateLimitMap.set(ip, requestData);
    
    if (requestData.count > RATE_LIMIT) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
