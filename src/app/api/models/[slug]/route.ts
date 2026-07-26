import { NextRequest, NextResponse } from "next/server";
import { getAllModelEntries } from "@/lib/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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
}
