import { NextRequest, NextResponse } from "next/server";
import { getAllModelEntries } from "@/lib/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }
    const normalizedSlug = slug.toLowerCase();

    const models = getAllModelEntries();
    const model = models.find(
      (m) => m.slug.toLowerCase() === normalizedSlug || m.id.toLowerCase() === normalizedSlug
    );

    if (!model) {
      return NextResponse.json(
        { error: "Model not found", slug },
        { status: 404 }
      );
    }

    return NextResponse.json(model);
  } catch (err: any) {
    console.error("API Error in /api/models/[slug]:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
