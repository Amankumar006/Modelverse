import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function POST(req: NextRequest) {
  try {
    // Security requirement: Ensure only authorized admins can verify models.
    // Checks for 'Authorization: Bearer <key>' or 'x-api-key' header.
    const authHeader = req.headers.get("Authorization") || req.headers.get("x-api-key");
    let apiKey = "";

    if (authHeader?.startsWith("Bearer ")) {
      apiKey = authHeader.substring(7);
    } else if (authHeader) {
      apiKey = authHeader;
    }

    if (!process.env.ADMIN_API_KEY) {
      if (process.env.NODE_ENV === "development") {
        console.warn("WARNING: ADMIN_API_KEY is not set. Bypassing authentication for development mode.");
      } else {
        return NextResponse.json(
          { error: "Server is not securely configured. Missing ADMIN_API_KEY." },
          { status: 500 }
        );
      }
    } else if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid or missing API key." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { slug, id, promoteDraft } = body;

    const targetSlug = slug || id;

    if (!targetSlug || typeof targetSlug !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'slug' or 'id' parameter." },
        { status: 400 }
      );
    }

    const modelsDir = path.join(process.cwd(), "data", "models");
    let modelPath = path.join(modelsDir, `${targetSlug}.json`);

    // Flexible fallback search across all json files in data/models
    if (!fs.existsSync(modelPath)) {
      const files = fs.readdirSync(modelsDir).filter(
        (f) => f.endsWith(".json") && f !== "_index.json"
      );

      let foundPath: string | null = null;
      for (const file of files) {
        try {
          const filePath = path.join(modelsDir, file);
          const raw = fs.readFileSync(filePath, "utf-8");
          const parsed = JSON.parse(raw);
          if (
            parsed.slug === slug ||
            parsed.id === id ||
            parsed.slug === targetSlug ||
            parsed.id === targetSlug
          ) {
            foundPath = filePath;
            break;
          }
        } catch {
          // ignore parse errors for bad temp files
        }
      }

      if (foundPath) {
        modelPath = foundPath;
      } else {
        return NextResponse.json(
          { error: `Model file for slug '${targetSlug}' not found.` },
          { status: 404 }
        );
      }
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

    // Try writing back updated model file (handles EROFS in serverless environments)
    try {
      fs.writeFileSync(modelPath, JSON.stringify(model, null, 2) + "\n", "utf-8");

      // Re-compile model catalog archives if filesystem is writeable
      try {
        execSync("node scripts/compile-models.js", {
          cwd: process.cwd(),
          encoding: "utf-8",
        });
        if (model.slug) revalidatePath(`/models/${model.slug}`);
        if (targetSlug) revalidatePath(`/models/${targetSlug}`);
        revalidatePath("/models");
        revalidatePath("/");
      } catch (compileErr) {
        console.error("Failed to recompile models archive:", compileErr);
      }

      return NextResponse.json({
        success: true,
        message: `Model '${model.name}' (${model.slug || targetSlug}) marked as verified.`,
        model,
      });
    } catch (writeErr: any) {
      if (writeErr.code === "EROFS" || writeErr.message?.includes("read-only file system")) {
        return NextResponse.json(
          {
            error: `Production deployment filesystem is read-only (EROFS). Direct disk writes are restricted on serverless environments. Please verify and promote '${model.name}' in your local development environment or via Git PR.`,
            isReadOnly: true,
            model,
          },
          { status: 403 }
        );
      }
      throw writeErr;
    }
  } catch (err: any) {
    console.error("Error verifying model:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
