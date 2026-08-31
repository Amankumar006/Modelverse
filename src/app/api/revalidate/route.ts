import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || req.headers.get("x-revalidate-secret");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    const expectedSecret = process.env.REVALIDATION_SECRET || "modelverse-revalidate-secret-2026";
    if (token !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid revalidation token" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { slug, tag = "articles", path } = body;

    // Purge cached data tags
    if (tag) {
      revalidateTag(tag, "max");
    }

    // Revalidate paths
    revalidatePath("/articles");
    revalidatePath("/");
    if (slug) {
      revalidatePath(`/articles/${slug}`);
    }
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      tag,
      slug: slug || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
