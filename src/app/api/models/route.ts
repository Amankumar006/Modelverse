import { NextRequest, NextResponse } from "next/server";
import { getAllModelEntries, ModelEntry } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const status = searchParams.get("status");
    const vendorApiStatus = searchParams.get("vendorApiStatus");
    const developer = searchParams.get("developer");
    const type = searchParams.get("type");
    const modality = searchParams.get("modality");
    const primaryTask = searchParams.get("primaryTask");
    const qRaw = searchParams.get("q");
    if (qRaw && qRaw.length > 50) {
      return NextResponse.json({ error: "Bad Request", message: "Query too long" }, { status: 400 });
    }
    const q = qRaw?.trim().toLowerCase();
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const offsetParam = parseInt(searchParams.get("offset") || "0", 10);

    const limit = Math.max(1, Math.min(isNaN(limitParam) ? 20 : limitParam, 100));
    const offset = Math.max(0, isNaN(offsetParam) ? 0 : offsetParam);

    let models: ModelEntry[] = await getAllModelEntries();

    if (status) {
      models = models.filter((m) => m.status === status);
    }

    if (vendorApiStatus) {
      models = models.filter((m) => m.vendorApiStatus === vendorApiStatus);
    }

    if (developer) {
      models = models.filter(
        (m) => m.developer.toLowerCase() === developer.toLowerCase()
      );
    }

    if (type) {
      models = models.filter((m) => m.type === type);
    }

    if (modality) {
      models = models.filter((m) =>
        m.modality.some((mod) => mod.toLowerCase() === modality.toLowerCase())
      );
    }

    if (primaryTask) {
      models = models.filter((m) => m.primaryTask === primaryTask);
    }

    if (q) {
      models = models.filter((m) => {
        const nameMatch = m.name.toLowerCase().includes(q);
        const idMatch = m.id.toLowerCase().includes(q);
        const devMatch = m.developer.toLowerCase().includes(q);
        const descMatch = m.description.toLowerCase().includes(q);
        const tagMatch = m.tags.some((tag) => tag.toLowerCase().includes(q));
        return nameMatch || idMatch || devMatch || descMatch || tagMatch;
      });
    }

    const total = models.length;
    const paginated = models.slice(offset, offset + limit);

    // Apply strict allowlist to prevent internal fields (e.g. curatorNotes, needsReview, draft fields) from leaking
    const sanitizedData = paginated.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      developer: m.developer,
      releaseDate: m.releaseDate,
      updatedAt: m.updatedAt,
      type: m.type,
      status: m.status,
      vendorApiStatus: m.vendorApiStatus,
      modality: m.modality,
      primaryTask: m.primaryTask,
      deployment: m.deployment,
      license: m.license,
      parameters: m.parameters,
      contextWindow: m.contextWindow,
      description: m.description,
      keyFeatures: m.keyFeatures,
      benchmarks: m.benchmarks,
      pricing: m.pricing,
      family: m.family,
      previousVersion: m.previousVersion,
      links: m.links,
      logo: m.logo,
      tags: m.tags,
      sources: m.sources,
      verified: m.verified
    }));

    return NextResponse.json({
      total,
      limit,
      offset,
      count: sanitizedData.length,
      data: sanitizedData,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("API Error in /api/models:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
