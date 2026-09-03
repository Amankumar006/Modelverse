import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const content = "google.com, pub-5666739187500051, DIRECT, f08c47fec0942fa0\n";

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
