import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = await getAllArticles();
    
    // Sort just in case (newest first) and take the top 10
    const sorted = [...articles].sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
    const sliced = sorted.slice(0, 10);

    return NextResponse.json(sliced, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("API Error in /api/news:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "Failed to retrieve news articles." },
      { status: 500 }
    );
  }
}
