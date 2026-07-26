import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, promoteDraft } = body;

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'slug' parameter." },
        { status: 400 }
      );
    }

    const modelPath = path.join(process.cwd(), "data", "models", `${slug}.json`);
    if (!fs.existsSync(modelPath)) {
      return NextResponse.json(
        { error: `Model file for slug '${slug}' not found.` },
        { status: 404 }
      );
    }

    const rawData = fs.readFileSync(modelPath, "utf-8");
    const model = JSON.parse(rawData);

    // Update verification & review status
    model.verified = true;
    model.needsReview = false;
    model.updatedAt = new Date().toISOString().slice(0, 10);

    // Promote draft content if requested
    if (promoteDraft) {
      if (model.descriptionDraft) {
        model.description = model.descriptionDraft;
        model.templatedDescription = false;
      }
      if (Array.isArray(model.keyFeaturesDraft) && model.keyFeaturesDraft.length > 0) {
        model.keyFeatures = model.keyFeaturesDraft;
      }
    }

    // Write back updated model file
    fs.writeFileSync(modelPath, JSON.stringify(model, null, 2) + "\n", "utf-8");

    // Re-compile model catalog archives
    try {
      execSync("node scripts/compile-models.js", {
        cwd: process.cwd(),
        encoding: "utf-8",
      });
      revalidatePath(`/models/${slug}`);
      revalidatePath("/models");
      revalidatePath("/");
    } catch (compileErr) {
      console.error("Failed to recompile models archive:", compileErr);
    }

    return NextResponse.json({
      success: true,
      message: `Model '${model.name}' (${slug}) marked as verified.`,
      model,
    });
  } catch (err: any) {
    console.error("Error verifying model:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
