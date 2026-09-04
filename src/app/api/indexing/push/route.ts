import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";
import { CURATED_POPULAR_PAIRS, getCanonicalCompareSlug } from "@/lib/compare";
import { submitToIndexNow, getIndexNowKey } from "@/lib/indexnow";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
const INDEXING_API_SECRET = process.env.INDEXING_API_SECRET || process.env.CRON_SECRET;

const PushSchema = z.object({
  url: z.string().url().optional(),
  urls: z.array(z.string().url()).optional(),
  slug: z.string().optional(),
  type: z.enum(["models", "articles", "compare"]).default("models"),
  target: z.enum(["all", "models", "articles", "compare", "recent"]).optional(),
  action: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
  engines: z.array(z.enum(["google", "indexnow"])).default(["google", "indexnow"]),
});

function generateGoogleJwtToken(email: string, privateKey: string): string {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: email,
    scope: "https://www.googleapis.com/auth/indexing",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedClaim = Buffer.from(JSON.stringify(claimSet)).toString("base64url");
  const signInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signInput);
  const signature = signer.sign(privateKey, "base64url");

  return `${signInput}.${signature}`;
}

async function getGoogleAccessToken(jwtToken: string): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
  params.append("assertion", jwtToken);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Google token exchange failed");
  }
  return data.access_token;
}

async function collectTargetUrls(
  target: "all" | "models" | "articles" | "compare" | "recent"
): Promise<string[]> {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const urls: string[] = [];

  if (target === "all" || target === "recent") {
    urls.push(
      `${baseUrl}`,
      `${baseUrl}/models`,
      `${baseUrl}/articles`,
      `${baseUrl}/compare`,
      `${baseUrl}/trending`,
      `${baseUrl}/timeline`
    );
  }

  if (target === "all" || target === "models" || target === "recent") {
    const limit = target === "recent" ? 25 : 500;
    const { models } = await getModels({ limit, isActive: true });
    models.forEach((m) => urls.push(`${baseUrl}/models/${m.slug}`));
  }

  if (target === "all" || target === "articles" || target === "recent") {
    const limit = target === "recent" ? 15 : 500;
    const { articles } = await getArticles({ limit, isPublished: true });
    articles.forEach((a) => urls.push(`${baseUrl}/articles/${a.slug}`));
  }

  if (target === "all" || target === "compare" || target === "recent") {
    for (const [s1, s2] of CURATED_POPULAR_PAIRS) {
      urls.push(`${baseUrl}/compare/${getCanonicalCompareSlug(s1, s2)}`);
    }
  }

  return Array.from(new Set(urls));
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (INDEXING_API_SECRET && authHeader !== `Bearer ${INDEXING_API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = PushSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { url, urls, slug, type, target, action, engines } = parsed.data;

    let targetUrls: string[] = [];

    if (urls && urls.length > 0) {
      targetUrls = urls;
    } else if (url) {
      targetUrls = [url];
    } else if (slug) {
      targetUrls = [`${SITE_URL.replace(/\/$/, "")}/${type}/${slug}`];
    } else if (target) {
      targetUrls = await collectTargetUrls(target);
    } else {
      // Default: collect recent high-intent URLs (flagships, recent articles, comparisons, core pages)
      targetUrls = await collectTargetUrls("recent");
    }

    const results: Record<string, unknown> = {
      totalUrls: targetUrls.length,
      sampleUrls: targetUrls.slice(0, 5),
    };

    // 1. IndexNow Push (Bing, Yandex, Seznam, Naver)
    if (engines.includes("indexnow")) {
      const indexNowRes = await submitToIndexNow(targetUrls);
      results.indexNow = {
        key: getIndexNowKey(),
        ...indexNowRes,
      };
    }

    // 2. Google Indexing API Push
    if (engines.includes("google")) {
      if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
        results.google = {
          status: "dry_run",
          message:
            "GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured in environment. Dry-run completed.",
          urlCount: targetUrls.length,
        };
      } else {
        try {
          const jwtToken = generateGoogleJwtToken(SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY);
          const accessToken = await getGoogleAccessToken(jwtToken);

          // Push up to 50 URLs to respect rate limits
          const googleBatch = targetUrls.slice(0, 50);
          let successCount = 0;
          let failCount = 0;

          for (const targetUrl of googleBatch) {
            try {
              const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  url: targetUrl,
                  type: action,
                }),
              });
              if (res.ok) {
                successCount++;
              } else {
                failCount++;
              }
            } catch {
              failCount++;
            }
          }

          results.google = {
            status: "success",
            pushed: successCount,
            failed: failCount,
            totalQueued: googleBatch.length,
          };
        } catch (err) {
          results.google = {
            status: "error",
            message: err instanceof Error ? err.message : "Google authentication failed",
          };
        }
      }
    }

    return NextResponse.json({
      status: "completed",
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const target = (request.nextUrl.searchParams.get("target") || "recent") as
    | "all"
    | "models"
    | "articles"
    | "compare"
    | "recent";

  if (INDEXING_API_SECRET && secret !== INDEXING_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = await collectTargetUrls(target);
  const indexNowRes = await submitToIndexNow(urls);

  return NextResponse.json({
    status: "success",
    target,
    totalUrls: urls.length,
    indexNow: {
      key: getIndexNowKey(),
      ...indexNowRes,
    },
    google: {
      status: SERVICE_ACCOUNT_EMAIL && SERVICE_ACCOUNT_PRIVATE_KEY ? "ready" : "dry_run",
      message:
        SERVICE_ACCOUNT_EMAIL && SERVICE_ACCOUNT_PRIVATE_KEY
          ? "Google credentials configured."
          : "Google credentials not set. Pushed to IndexNow.",
    },
  });
}
