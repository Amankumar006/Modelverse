import crypto from "crypto";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

if (fs.existsSync(".env.local")) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    const envContent = fs.readFileSync(".env.local", "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || "").trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[match[1]] = val;
      }
    }
  }
}

const SITE_URL =
  process.env.INDEXING_SITE_URL ||
  (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.themodelverse.in");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
const DEFAULT_INDEXNOW_KEY = "e4c1b98f2a7d45609381e029471bfa3c";
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || DEFAULT_INDEXNOW_KEY;

const CURATED_POPULAR_PAIRS = [
  ["google-gemini-3-8-flash-20260902", "openai-gpt-6-astra-20260903"],
  ["alibaba-qwen-3-8-max-0902-20260902", "openai-gpt-6-astra-20260903"],
  ["alibaba-qwen-3-8-max-0902-20260902", "google-gemini-3-8-flash-20260902"],
  ["openai-gpt-6-astra-20260903", "gpt-4o"],
  ["claude-3-5-sonnet-20241022", "openai-gpt-6-astra-20260903"],
  ["anthropic-claude-3-7-sonnet-20250219", "openai-gpt-6-astra-20260903"],
  ["deepseek-r1", "openai-gpt-6-astra-20260903"],
  ["gemini-1-5-flash", "google-gemini-3-8-flash-20260902"],
  ["deepseek-v3", "google-gemini-3-8-flash-20260902"],
  ["alibaba-qwen-3-8-max-0902-20260902", "deepseek-r1"],
  ["claude-3-5-sonnet-20241022", "gpt-4o"],
  ["claude-3-5-sonnet-20241022", "deepseek-v3"],
  ["deepseek-v3", "gpt-4o"],
  ["deepseek-r1", "gpt-4o"],
  ["deepseek-v3", "llama-3-3-70b"],
  ["llama-3-3-70b", "gpt-4o"],
  ["gemini-1-5-pro", "gpt-4o"],
  ["gemini-1-5-flash", "gpt-4o"],
  ["gemini-1-5-pro", "claude-3-5-sonnet-20241022"],
  ["deepseek-v3", "deepseek-r1"],
  ["mistral-large-2", "gpt-4o"],
  ["mistral-large-2", "llama-3-3-70b"],
  ["openai-gpt-4o-mini", "gemini-1-5-flash"],
  ["deepseek-deepseek-r1-distill-qwen-32b", "llama-3-3-70b"],
  ["alibaba-qwen3.7-max", "deepseek-v3"],
];

function getCanonicalCompareSlug(s1, s2) {
  const sorted = [s1.toLowerCase().trim(), s2.toLowerCase().trim()].sort();
  return `${sorted[0]}-vs-${sorted[1]}`;
}

/**
 * Generate Google OAuth2 JWT Bearer Token without external packages
 */
function generateGoogleJwtToken(email, privateKey) {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

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

/**
 * Exchange JWT for Google API access token
 */
async function getGoogleAccessToken(jwtToken) {
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
    throw new Error(`Failed to fetch Google OAuth access token: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * Publish a URL to Google Indexing API
 */
async function pushUrlToGoogle(url, accessToken, type = "URL_UPDATED") {
  const res = await fetch("https://indexing.googleapis.com/v3/urlNotifications:publish", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      type,
    }),
  });

  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

/**
 * Publish batch of URLs to IndexNow (Bing, Yandex, Seznam, Naver)
 */
async function pushToIndexNow(host, key, urlList) {
  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  };

  try {
    const bingRes = await fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    if (bingRes.ok || bingRes.status === 200 || bingRes.status === 202) {
      return { ok: true, status: bingRes.status, provider: "Microsoft Bing" };
    }

    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const isSuccess = res.ok || res.status === 200 || res.status === 202;
    const body = await res.text().catch(() => "");
    return { ok: isSuccess, status: res.status, provider: "IndexNow Hub", body };
  } catch (err) {
    return { ok: false, status: 500, error: err.message };
  }
}

async function main() {
  console.log("==================================================");
  console.log("   🚀 THEMODELVERSE SEARCH INDEXING AUTO-PUSH    ");
  console.log("==================================================");

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Error: Missing Supabase connection keys in environment.");
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch all active models
  const { data: models, error: modelsErr } = await supabase
    .from("models")
    .select("slug, name, provider")
    .eq("is_active", true);

  if (modelsErr) {
    console.error("❌ Error querying models:", modelsErr.message);
    process.exit(1);
  }

  // Fetch all published articles
  const { data: articles, error: articlesErr } = await supabase
    .from("articles")
    .select("slug, title")
    .eq("is_published", true);

  if (articlesErr) {
    console.error("❌ Error querying articles:", articlesErr.message);
    process.exit(1);
  }

  const baseUrl = SITE_URL.replace(/\/$/, "");

  // Assemble all comparison URLs from curated pairs
  const seenCompareSlugs = new Set();
  const comparisonUrls = [];
  for (const [s1, s2] of CURATED_POPULAR_PAIRS) {
    const canonical = getCanonicalCompareSlug(s1, s2);
    if (!seenCompareSlugs.has(canonical)) {
      seenCompareSlugs.add(canonical);
      comparisonUrls.push(`${baseUrl}/compare/${canonical}`);
    }
  }

  const coreUrls = [
    `${baseUrl}`,
    `${baseUrl}/models`,
    `${baseUrl}/articles`,
    `${baseUrl}/trending`,
    `${baseUrl}/timeline`,
    `${baseUrl}/compare`,
    `${baseUrl}/methodology`,
    `${baseUrl}/about`,
    `${baseUrl}/submit`,
    `${baseUrl}/privacy`,
    `${baseUrl}/terms`,
    `${baseUrl}/security`,
  ];

  const modelUrls = models.map((m) => `${baseUrl}/models/${m.slug}`);
  const articleUrls = articles.map((a) => `${baseUrl}/articles/${a.slug}`);

  const allUrls = Array.from(new Set([
    ...coreUrls,
    ...modelUrls,
    ...articleUrls,
    ...comparisonUrls,
  ]));

  console.log(`📦 Discovered ${allUrls.length} total URLs:`);
  console.log(`   - Core Pages: ${coreUrls.length}`);
  console.log(`   - Models: ${modelUrls.length}`);
  console.log(`   - Articles: ${articleUrls.length}`);
  console.log(`   - Comparisons: ${comparisonUrls.length}`);

  // 1. IndexNow Push (Instant discovery for Microsoft Bing, Yandex, Seznam, Naver)
  const urlHost = new URL(baseUrl).hostname;
  console.log(`\n⚡ Submitting ${allUrls.length} URLs to IndexNow (Bing / Yandex)...`);
  console.log(`   Host: ${urlHost}`);
  console.log(`   Key: ${INDEXNOW_KEY}`);
  console.log(`   Key Location: https://${urlHost}/${INDEXNOW_KEY}.txt`);

  try {
    const indexNowRes = await pushToIndexNow(urlHost, INDEXNOW_KEY, allUrls);
    if (indexNowRes.ok) {
      console.log(`✅ IndexNow push successful! (HTTP ${indexNowRes.status} Accepted)`);
    } else {
      console.log(`⚠️ IndexNow response: HTTP ${indexNowRes.status}`, indexNowRes.body || indexNowRes.error);
    }
  } catch (inErr) {
    console.warn(`⚠️ IndexNow error: ${inErr.message}`);
  }

  // 2. Google Indexing API Push
  if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
    console.log("\n⚠️ Note: GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured in .env.local.");
    console.log("👉 Dry-run mode for Google Indexing completed successfully.");
    console.log("   To enable direct Google Indexing API pushes:");
    console.log("   1. Enable 'Web Search Indexing API' in Google Cloud Console.");
    console.log("   2. Create a Service Account, generate a JSON key, and add the email as Owner in Google Search Console.");
    console.log("   3. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in .env.local\n");
    console.log("Sample URLs queued:");
    allUrls.slice(0, 10).forEach((u) => console.log(`   - ${u}`));
    console.log(`   ... and ${allUrls.length - 10} more URLs.\n`);
    return;
  }

  console.log("\n🔐 Authenticating with Google Search Indexing OAuth2 API...");
  try {
    const jwtToken = generateGoogleJwtToken(SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY);
    const accessToken = await getGoogleAccessToken(jwtToken);
    console.log("✅ Authenticated successfully! Pushing priority URLs to Google Indexing API...");

    // Push high-priority URLs first (core pages, new models, new comparisons)
    const priorityUrls = [
      ...coreUrls,
      `${baseUrl}/models/openai-gpt-6-astra-20260903`,
      `${baseUrl}/models/google-gemini-3-8-flash-20260902`,
      `${baseUrl}/models/alibaba-qwen-3-8-max-0902-20260902`,
      ...comparisonUrls.slice(0, 10),
      ...articleUrls.slice(0, 5),
    ];

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < priorityUrls.length; i++) {
      const url = priorityUrls[i];
      process.stdout.write(`[${i + 1}/${priorityUrls.length}] Pushing ${url}... `);
      const res = await pushUrlToGoogle(url, accessToken);

      if (res.ok) {
        console.log("✅ Indexed (200)");
        successCount++;
      } else {
        console.log(`⚠️ Failed (${res.status}):`, res.data?.error?.message || "Unknown error");
        failCount++;
      }

      // Respect Google Indexing API rate limits (avoid burst throttle)
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`\n🎉 Google Indexing batch finished: ${successCount} pushed successfully, ${failCount} errors.`);
  } catch (err) {
    console.error("❌ Google Indexing Error:", err.message);
  }
}

main();
