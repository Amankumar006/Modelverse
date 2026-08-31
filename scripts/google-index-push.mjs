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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
const INDEXNOW_KEY = process.env.INDEXNOW_KEY;

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
 * Publish batch of URLs to IndexNow (Bing, Yandex, Seznam)
 */
async function pushToIndexNow(host, key, urlList) {
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `https://${host}/${key}.txt`,
        urlList,
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 500, error: err.message };
  }
}

async function main() {
  console.log("==================================================");
  console.log("   🚀 MODELVERSE SEARCH INDEXING AUTO-PUSH       ");
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

  const urlsToPush = [
    `${SITE_URL}`,
    `${SITE_URL}/models`,
    `${SITE_URL}/articles`,
    `${SITE_URL}/trending`,
    `${SITE_URL}/timeline`,
    `${SITE_URL}/compare`,
    `${SITE_URL}/methodology`,
    `${SITE_URL}/about`,
    `${SITE_URL}/submit`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
    `${SITE_URL}/security`,
    ...models.map((m) => `${SITE_URL}/models/${m.slug}`),
    ...articles.map((a) => `${SITE_URL}/articles/${a.slug}`),
  ];

  console.log(`📦 Discovered ${urlsToPush.length} total URLs (${models.length} models, ${articles.length} articles, 12 core pages).`);

  // 1. IndexNow Push (if configured)
  if (INDEXNOW_KEY) {
    try {
      const urlHost = new URL(SITE_URL).hostname;
      console.log(`\n⚡ Submitting ${urlsToPush.length} URLs to IndexNow (Bing / Yandex / Seznam)...`);
      const indexNowRes = await pushToIndexNow(urlHost, INDEXNOW_KEY, urlsToPush);
      if (indexNowRes.ok) {
        console.log(`✅ IndexNow push successful! (HTTP ${indexNowRes.status})`);
      } else {
        console.log(`⚠️ IndexNow response: HTTP ${indexNowRes.status}`);
      }
    } catch (inErr) {
      console.warn(`⚠️ IndexNow error: ${inErr.message}`);
    }
  }

  // 2. Google Indexing API Push
  if (!SERVICE_ACCOUNT_EMAIL || !SERVICE_ACCOUNT_PRIVATE_KEY) {
    console.log("\n⚠️ Note: GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not configured yet in .env.local.");
    console.log("👉 Dry-run mode completed successfully. To enable live auto-push to Google Indexing API:");
    console.log("   1. Create a Service Account in Google Cloud Console with Indexing API enabled.");
    console.log("   2. Add the Service Account email as an Owner in Google Search Console.");
    console.log("   3. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY in .env.local\n");
    console.log("Sample URLs ready for indexing:");
    urlsToPush.slice(0, 10).forEach((u) => console.log(`   - ${u}`));
    console.log(`   ... and ${urlsToPush.length - 10} more URLs.\n`);
    return;
  }

  console.log("\n🔐 Authenticating with Google Search Indexing OAuth2 API...");
  try {
    const jwtToken = generateGoogleJwtToken(SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY);
    const accessToken = await getGoogleAccessToken(jwtToken);
    console.log("✅ Authenticated successfully! Pushing URLs to Google Indexing API...");

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < urlsToPush.length; i++) {
      const url = urlsToPush[i];
      process.stdout.write(`[${i + 1}/${urlsToPush.length}] Pushing ${url}... `);
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

    console.log(`\n🎉 Indexing batch finished: ${successCount} pushed successfully, ${failCount} errors.`);
  } catch (err) {
    console.error("❌ Google Indexing Error:", err.message);
  }
}

main();
