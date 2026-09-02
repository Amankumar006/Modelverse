/**
 * src/lib/extract-source-poster.ts
 *
 * Extracts the official announcement poster or architecture diagram from technical AI sources.
 * Supports Standard AI Blogs, GitHub Repositories, Hugging Face, and arXiv preprints.
 */

export interface ExtractionOptions {
  url: string;
  html?: string;
}

export async function extractSourcePoster(
  input: string | ExtractionOptions | null | undefined
): Promise<string | null> {
  if (!input) return null;
  const url = typeof input === "string" ? input.trim() : input.url?.trim();
  let html = typeof input === "object" ? input.html : undefined;

  if (!url) return null;

  // Direct image URLs
  if (/\.(?:jpg|jpeg|png|webp|svg)(?:[?#].*)?$/i.test(url)) {
    return url;
  }

  // 1. Fetch HTML if not provided
  if (!html) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) return null;
      html = await response.text();
    } catch {
      return null;
    }
  }

  const resolveUrl = (src: string) => {
    try {
      return new URL(src, url).href;
    } catch {
      return src;
    }
  };

  // 2. Strategy: GitHub Repositories
  if (url.includes("github.com")) {
    const repoMatch = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
    if (repoMatch) {
      const repoPath = repoMatch[1].split("/tree")[0].split("/blob")[0].replace(/\.git$/, "");
      const branches = ["main", "master"];
      for (const branch of branches) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/README.md`;
          const res = await fetch(rawUrl);
          if (res.ok) {
            const markdown = await res.text();
            const mdImageMatch = markdown.match(/!\[.*?\]\((.*?)\)/) || markdown.match(/<img[^>]+src=["'](.*?)["']/i);
            if (mdImageMatch) {
              let imgSrc = mdImageMatch[1].split(" ")[0].split("#")[0];
              if (!imgSrc.startsWith("http")) {
                imgSrc = `https://raw.githubusercontent.com/${repoPath}/${branch}/${imgSrc.replace(/^\.\//, "")}`;
              }
              if (isValidImage(imgSrc)) return resolveUrl(imgSrc);
            }
          }
        } catch {
          // Continue to next branch
        }
      }
    }
  }

  // 3. Strategy: arXiv Preprints (Extract Figure 1)
  if (url.includes("arxiv.org/abs/") || url.includes("arxiv.org/html/")) {
    const arxivId = url.match(/arxiv\.org\/(?:abs|html)\/([^\/?]+)/)?.[1];
    if (arxivId) {
      const htmlUrl = `https://arxiv.org/html/${arxivId}`;
      try {
        const htmlRes = await fetch(htmlUrl);
        if (htmlRes.ok) {
          const arxivHtml = await htmlRes.text();
          const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
          let match;
          while ((match = imgRegex.exec(arxivHtml)) !== null) {
            const imgSrc = match[1];
            if (isValidImage(imgSrc)) {
              return resolveUrl(new URL(imgSrc, htmlUrl).href);
            }
          }
        }
      } catch {
        // Fallback to meta tags
      }
    }
  }

  // 4. Strategy: Standard AI Lab Blogs (OpenAI, Anthropic, DeepSeek, Z.ai)
  const extractors = [
    /<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i,
    /<meta\s+(?:property|name)=["']og:image:secure_url["']\s+content=["']([^"']+)["']/i,
    /<meta\s+(?:name|property)=["']twitter:image(?::src)?["']\s+content=["']([^"']+)["']/i,
    /<link\s+rel=["']image_src["']\s+href=["']([^"']+)["']/i,
  ];

  for (const regex of extractors) {
    const match = html.match(regex);
    if (match && match[1] && isValidImage(match[1])) {
      return resolveUrl(match[1]);
    }

    const reverseRegex = new RegExp(
      regex.source.replace(/property\|name/, "content").replace(/content=/, "(?:property|name)="),
      "i"
    );
    const reverseMatch = html.match(reverseRegex);
    if (reverseMatch && reverseMatch[1] && isValidImage(reverseMatch[1])) {
      return resolveUrl(reverseMatch[1]);
    }
  }

  // JSON-LD Structured Data
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonMatch;
  while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const image = extractImageFromJsonLd(data);
      if (image && isValidImage(image)) {
        return resolveUrl(image);
      }
    } catch {
      // Ignore JSON parse error
    }
  }

  return null;
}

function extractImageFromJsonLd(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;

  if (record.image) {
    if (typeof record.image === "string") return record.image;
    if (Array.isArray(record.image) && typeof record.image[0] === "string") return record.image[0];
    if (typeof record.image === "object" && record.image !== null) {
      const imgObj = record.image as Record<string, unknown>;
      if (typeof imgObj.url === "string") return imgObj.url;
    }
  }
  if (record["@type"] === "ImageObject" && typeof record.url === "string") return record.url;

  if (Array.isArray(data)) {
    for (const item of data) {
      const img = extractImageFromJsonLd(item);
      if (img) return img;
    }
  }
  return null;
}

function isValidImage(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();

  const ignoreKeywords = [
    "favicon",
    "logo",
    "pixel",
    "tracker",
    "badge",
    "button",
    "shield",
    "avatar",
    "profile",
    "1x1",
  ];

  if (ignoreKeywords.some((kw) => lowerUrl.includes(kw))) {
    return false;
  }

  return true;
}
