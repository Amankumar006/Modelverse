import fs from "fs/promises";
import path from "path";

/**
 * Downloads a remote image and caches it locally into public/images/articles/<slug>.<ext>
 * Returns the local web path (e.g. "/images/articles/my-slug.jpg") or null on failure.
 */
export async function cacheArticlePosterLocally(
  imageUrl: string | null | undefined,
  slug: string
): Promise<string | null> {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  // If already a local path, verify and return
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Modelverse-Asset-Cacher/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    let ext = ".jpg";
    if (contentType.includes("png") || imageUrl.includes(".png")) ext = ".png";
    else if (contentType.includes("webp") || imageUrl.includes(".webp")) ext = ".webp";
    else if (contentType.includes("svg") || imageUrl.includes(".svg")) ext = ".svg";

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 500) return null; // Ignore empty / corrupt responses

    const targetDir = path.join(process.cwd(), "public/images/articles");
    await fs.mkdir(targetDir, { recursive: true });

    const fileName = `${slug}${ext}`;
    const filePath = path.join(targetDir, fileName);
    await fs.writeFile(filePath, buffer);

    return `/images/articles/${fileName}`;
  } catch {
    return null;
  }
}
