import { NextRequest, NextResponse } from "next/server";
import { getModelBySlug } from "@/lib/models";

export async function GET(
  request: NextRequest,
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

    const model = await getModelBySlug(normalizedSlug);

    const redirectTo = model?.metadata?.redirect_to || model?.metadata?.redirectTo;
    if (redirectTo && typeof redirectTo === "string") {
      return NextResponse.redirect(new URL(`/api/models/${redirectTo}`, request.url), 308);
    }

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("API Error in /api/models/[slug]:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
