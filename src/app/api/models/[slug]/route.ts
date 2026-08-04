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

    const sanitizedModel = {
      id: model.id,
      name: model.name,
      slug: model.slug,
      developer: model.developer,
      releaseDate: model.releaseDate,
      updatedAt: model.updatedAt,
      type: model.type,
      status: model.status,
      vendorApiStatus: model.vendorApiStatus,
      modality: model.modality,
      primaryTask: model.primaryTask,
      deployment: model.deployment,
      license: model.license,
      parameters: model.parameters,
      contextWindow: model.contextWindow,
      description: model.description,
      keyFeatures: model.keyFeatures,
      benchmarks: model.benchmarks,
      pricing: model.pricing,
      family: model.family,
      previousVersion: model.previousVersion,
      links: model.links,
      logo: model.logo,
      tags: model.tags,
      sources: model.sources,
      verified: model.verified
    };

    return NextResponse.json(sanitizedModel);
  } catch (err: any) {
    console.error("API Error in /api/models/[slug]:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
