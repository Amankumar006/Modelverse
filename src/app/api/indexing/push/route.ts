import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
const INDEXING_API_SECRET = process.env.INDEXING_API_SECRET || process.env.CRON_SECRET;

const PushSchema = z.object({
  url: z.string().url().optional(),
  slug: z.string().optional(),
  type: z.enum(["models", "articles"]).default("models"),
  action: z.enum(["URL_UPDATED", "URL_DELETED"]).default("URL_UPDATED"),
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
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (INDEXING_API_SECRET && authHeader !== `Bearer ${INDEXING_API_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = PushSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload", details: parsed.error.format() }, { status: 400 });
    }

    const { url, slug, type, action } = parsed.data;
    const targetUrl = url || `${SITE_URL}/${type}/${slug}`;

    if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
      return NextResponse.json({
        status: "dry_run",
        message: "Google service account keys not configured. Dry-run accepted.",
        url: targetUrl,
      });
    }

    const jwtToken = generateGoogleJwtToken(SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY);
    const accessToken = await getGoogleAccessToken(jwtToken);

    const googleRes = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
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

    const googleData = await googleRes.json();

    return NextResponse.json({
      status: googleRes.ok ? "success" : "error",
      url: targetUrl,
      googleResponse: googleData,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
