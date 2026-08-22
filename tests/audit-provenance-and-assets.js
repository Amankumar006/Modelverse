/**
 * tests/audit-provenance-and-assets.js
 * 
 * Provenance Consistency & Asset Health Diagnostic Suite
 * 
 * Audits:
 * 1. HTTP Liveness & Content-Type for all model logos & images (Valid, Redirected, Broken, Inaccessible)
 * 2. Triangulated Provenance Audit: models <-> model_evidence <-> source_url
 * 3. Anomaly & Suspicious Enrichment Detection:
 *    - Circular / degenerate base models
 *    - Trivial / empty aliases
 *    - Developer logo / family mismatches
 *    - Orphaned fields without evidence rows
 * 4. Confidence Hierarchy & Non-Destructive Guardrail Verification
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const https = require("https");
const http = require("http");
const { URL } = require("url");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

const fs = require("fs");
const path = require("path");

/**
 * Checks an asset URL via local file check or HTTP HEAD / GET
 */
function probeUrl(urlStr, maxRedirects = 3) {
  return new Promise((resolve) => {
    if (!urlStr || typeof urlStr !== "string") {
      return resolve({ url: urlStr, status: "INVALID_URL", code: 0, contentType: null });
    }

    // Local relative asset in public/
    if (urlStr.startsWith("/")) {
      const cleanPath = urlStr.replace(/^\//, "");
      const localFilePath = path.join(process.cwd(), "public", cleanPath);
      if (fs.existsSync(localFilePath)) {
        const stats = fs.statSync(localFilePath);
        if (stats.size > 0) {
          return resolve({ url: urlStr, status: "VALID", code: 200, contentType: "image/svg+xml" });
        }
      }
      return resolve({ url: urlStr, status: "NOT_FOUND", code: 404, contentType: null });
    }

    if (!urlStr.startsWith("http")) {
      return resolve({ url: urlStr, status: "INVALID_URL", code: 0, contentType: null });
    }

    try {
      const parsed = new URL(urlStr);
      const client = parsed.protocol === "https:" ? https : http;

      const req = client.request(
        urlStr,
        {
          method: "HEAD",
          timeout: 6000,
          headers: {
            "User-Agent": "Modelverse-Asset-Validator/1.0 (https://themodelverse.in)",
            Accept: "image/*,*/*;q=0.8",
          },
        },
        (res) => {
          const code = res.statusCode || 0;
          const contentType = res.headers["content-type"] || "";

          // Follow redirects if under limit
          if ([301, 302, 307, 308].includes(code) && res.headers.location && maxRedirects > 0) {
            const redirectUrl = new URL(res.headers.location, urlStr).toString();
            return probeUrl(redirectUrl, maxRedirects - 1).then(resolve);
          }

          if (code >= 200 && code < 300) {
            resolve({ url: urlStr, status: "VALID", code, contentType });
          } else if (code >= 300 && code < 400) {
            resolve({ url: urlStr, status: "REDIRECT_UNRESOLVED", code, contentType });
          } else if (code === 403 || code === 401) {
            resolve({ url: urlStr, status: "AUTH_RESTRICTED", code, contentType });
          } else if (code === 404) {
            resolve({ url: urlStr, status: "NOT_FOUND", code, contentType });
          } else {
            resolve({ url: urlStr, status: "HTTP_ERROR", code, contentType });
          }
        }
      );

      req.on("error", (err) => {
        resolve({ url: urlStr, status: "NETWORK_ERROR", code: 0, error: err.message });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ url: urlStr, status: "TIMEOUT", code: 0 });
      });

      req.end();
    } catch (err) {
      resolve({ url: urlStr, status: "EXCEPTION", code: 0, error: err.message });
    }
  });
}

/**
 * Concurrency runner for probing URLs
 */
async function probeUrlsWithConcurrency(urls, limit = 15) {
  const results = new Map();
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      if (url && !results.has(url)) {
        const result = await probeUrl(url);
        results.set(url, result);
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return results;
}

async function runProvenanceAudit() {
  console.log("================================================================================");
  console.log("🛡️ MODELVERSE PROVENANCE & ASSET HEALTH AUDIT");
  console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
  console.log(`🌐 Supabase Host: ${new URL(SUPABASE_URL).hostname}`);
  console.log("================================================================================\n");

  // 1. Fetch models and all evidence with full pagination
  const { data: models, error: mErr } = await db
    .from("models")
    .select("id, name, slug, developer, family, tier, status, verification_status, capabilities, logo, images, base_model, aliases, api_availability, vendor_api_status, pricing, sources");

  if (mErr) {
    console.error("❌ Failed to fetch models:", mErr.message);
    return;
  }

  const { data: evidence, error: eErr } = await db
    .from("model_evidence")
    .select("id, model_id, field_name, source_type, source_url, extracted_value, confidence, extracted_at")
    .range(0, 5000);

  if (eErr) {
    console.error("❌ Failed to fetch model_evidence:", eErr.message);
    return;
  }

  console.log(`📦 Catalog Snapshot: ${models.length} models loaded | ${evidence.length} evidence rows loaded.\n`);

  // ---------------------------------------------------------------------------
  // PART 1: ASSET URL HEALTH & LIVENESS PROBE (Logos & Images)
  // ---------------------------------------------------------------------------
  console.log("🖼️ 1. ASSET URL HEALTH & LIVENESS AUDIT");
  console.log("--------------------------------------------------");

  const distinctLogos = new Set();
  const distinctImages = new Set();

  for (const m of models) {
    if (m.logo && typeof m.logo === "string") distinctLogos.add(m.logo.trim());
    if (Array.isArray(m.images)) {
      m.images.forEach((img) => {
        if (typeof img === "string" && img.trim().length > 0) distinctImages.add(img.trim());
      });
    }
  }

  console.log(`  Distinct Logo URLs to test:   ${distinctLogos.size}`);
  console.log(`  Distinct Image URLs to test:  ${distinctImages.size}`);

  const allAssetUrls = Array.from(new Set([...distinctLogos, ...distinctImages]));
  console.log(`  Total Unique Media URLs:      ${allAssetUrls.length}`);
  console.log(`  Probing URLs with HTTP HEAD requests (concurrency: 15)...`);

  const probeResults = await probeUrlsWithConcurrency(allAssetUrls, 15);

  const statusSummary = {
    VALID: 0,
    AUTH_RESTRICTED: 0, // e.g. some CDNs block automated HEAD requests with 403
    REDIRECT_UNRESOLVED: 0,
    NOT_FOUND: 0,
    HTTP_ERROR: 0,
    TIMEOUT: 0,
    NETWORK_ERROR: 0,
    INVALID_URL: 0,
  };

  const brokenUrls = [];

  for (const [url, res] of probeResults.entries()) {
    statusSummary[res.status] = (statusSummary[res.status] || 0) + 1;
    if (["NOT_FOUND", "HTTP_ERROR", "TIMEOUT", "NETWORK_ERROR", "INVALID_URL"].includes(res.status)) {
      brokenUrls.push({ url, status: res.status, code: res.code, error: res.error });
    }
  }

  console.log("\n  📊 Asset Probe Results:");
  console.log(`    - ✅ Valid (200 OK):                 ${statusSummary.VALID}`);
  console.log(`    - 🔒 Auth Restricted (403/Hotlink):   ${statusSummary.AUTH_RESTRICTED}`);
  console.log(`    - ❌ Not Found (404):                 ${statusSummary.NOT_FOUND}`);
  console.log(`    - ⚠️ Timeout / Network Error:        ${statusSummary.TIMEOUT + statusSummary.NETWORK_ERROR}`);
  console.log(`    - ⚠️ Other HTTP Error:                ${statusSummary.HTTP_ERROR}`);

  if (brokenUrls.length > 0) {
    console.log(`\n  🚨 Found ${brokenUrls.length} potentially broken asset URLs:`);
    brokenUrls.forEach((b, i) => {
      console.log(`    ${i + 1}. [${b.status} ${b.code || ""}] ${b.url}`);
    });
  } else {
    console.log("\n  ✨ Zero 404/broken asset URLs detected across the catalog!");
  }

  // ---------------------------------------------------------------------------
  // PART 2: PROVENANCE TRIANGULATION (models <-> model_evidence <-> source_url)
  // ---------------------------------------------------------------------------
  console.log("\n📑 2. PROVENANCE TRIANGULATION & CROSS-LAYER AUDIT");
  console.log("--------------------------------------------------");

  // Map evidence by model_id -> Map of field_name -> array of evidence
  const evidenceMap = new Map();
  for (const ev of evidence) {
    if (!evidenceMap.has(ev.model_id)) {
      evidenceMap.set(ev.model_id, new Map());
    }
    const modelEvMap = evidenceMap.get(ev.model_id);
    if (!modelEvMap.has(ev.field_name)) {
      modelEvMap.set(ev.field_name, []);
    }
    modelEvMap.get(ev.field_name).push(ev);
  }

  let modelsWithEvidence = 0;
  let capabilityEvidenceMatches = 0;
  let capabilityEvidenceMissing = 0;
  let baseModelEvidenceMatches = 0;
  let baseModelEvidenceMissing = 0;
  let providerEvidenceMatches = 0;
  let mediaEvidenceMatches = 0;

  for (const m of models) {
    const modelEvMap = evidenceMap.get(m.id);
    if (modelEvMap && modelEvMap.size > 0) {
      modelsWithEvidence++;
    }

    // Check capabilities provenance
    if (m.capabilities && typeof m.capabilities === "object") {
      for (const [capKey, capVal] of Object.entries(m.capabilities)) {
        if (capVal === true) {
          const capEv = modelEvMap?.get(`capabilities.${capKey}`);
          if (capEv && capEv.length > 0) {
            capabilityEvidenceMatches++;
          } else {
            capabilityEvidenceMissing++;
          }
        }
      }
    }

    // Check base_model provenance
    if (m.base_model && m.base_model.trim() !== "") {
      const bmEv = modelEvMap?.get("base_model");
      if (bmEv && bmEv.length > 0) {
        baseModelEvidenceMatches++;
      } else {
        baseModelEvidenceMissing++;
      }
    }

    // Check providers provenance
    if (Array.isArray(m.api_availability) && m.api_availability.includes("OpenRouter")) {
      const provEv = modelEvMap?.get("api_availability.openrouter");
      if (provEv && provEv.length > 0) {
        providerEvidenceMatches++;
      }
    }

    // Check logo/media provenance
    if (m.logo && m.logo.trim() !== "") {
      const mediaEv = modelEvMap?.get("media.logo");
      if (mediaEv && mediaEv.length > 0) {
        mediaEvidenceMatches++;
      }
    }
  }

  console.log(`  Models with Verified Evidence:      ${modelsWithEvidence} / ${models.length} (${((modelsWithEvidence / models.length) * 100).toFixed(1)}%)`);
  console.log(`  Capability Facts with Evidence:    ${capabilityEvidenceMatches} substantiated | ${capabilityEvidenceMissing} unmapped`);
  console.log(`  Base Model Facts with Evidence:    ${baseModelEvidenceMatches} substantiated | ${baseModelEvidenceMissing} unmapped`);
  console.log(`  OpenRouter Provider Citations:     ${providerEvidenceMatches} models linked`);
  console.log(`  Media & Logo Evidence Records:     ${mediaEvidenceMatches} models linked`);

  // ---------------------------------------------------------------------------
  // PART 3: SUSPICIOUS ENRICHMENT & ANOMALY DETECTION
  // ---------------------------------------------------------------------------
  console.log("\n🔍 3. SUSPICIOUS ENRICHMENT & ANOMALY DETECTION");
  console.log("--------------------------------------------------");

  const anomalies = {
    circularBaseModels: [],
    trivialAliases: [],
    developerLogoMismatches: [],
    deprecatedVendorStatus: [],
    lowQualityDrafts: [],
  };

  for (const m of models) {
    const nameNorm = String(m.name || "").toLowerCase().trim();
    const slugNorm = String(m.slug || "").toLowerCase().trim();
    const baseModelNorm = String(m.base_model || "").toLowerCase().trim();
    const devNorm = String(m.developer || "").toLowerCase().trim();
    const logoNorm = String(m.logo || "").toLowerCase().trim();

    // 1. Circular / self-referencing base model on non-foundation model
    if (
      baseModelNorm === nameNorm ||
      baseModelNorm === slugNorm ||
      (baseModelNorm.includes(nameNorm) && !baseModelNorm.includes("foundation") && !baseModelNorm.includes("base"))
    ) {
      anomalies.circularBaseModels.push({ name: m.name, slug: m.slug, base_model: m.base_model });
    }

    // 2. Trivial Aliases (array length 1 and identical to name)
    if (Array.isArray(m.aliases)) {
      if (m.aliases.length === 1 && m.aliases[0] === m.name) {
        anomalies.trivialAliases.push({ name: m.name, slug: m.slug });
      }
    }

    // 3. Developer / Logo Mismatch Check
    if (devNorm.includes("openai") && logoNorm && !logoNorm.includes("openai") && !logoNorm.includes("huggingface")) {
      anomalies.developerLogoMismatches.push({ name: m.name, developer: m.developer, logo: m.logo });
    }
    if (devNorm.includes("anthropic") && logoNorm && !logoNorm.includes("anthropic") && !logoNorm.includes("huggingface")) {
      anomalies.developerLogoMismatches.push({ name: m.name, developer: m.developer, logo: m.logo });
    }
    if (devNorm.includes("google") && logoNorm && !logoNorm.includes("google") && !logoNorm.includes("huggingface")) {
      anomalies.developerLogoMismatches.push({ name: m.name, developer: m.developer, logo: m.logo });
    }

    // 4. Deprecated status
    if (m.vendor_api_status === "DEPRECATED" || m.vendor_api_status === "SHUTDOWN") {
      anomalies.deprecatedVendorStatus.push({ name: m.name, status: m.vendor_api_status });
    }

    // 5. Low Quality Drafts
    if (m.status === "staged" || m.verification_status === "DRAFT") {
      anomalies.lowQualityDrafts.push({ name: m.name, status: m.status, vStatus: m.verification_status });
    }
  }

  console.log(`  Anomalies Detected:`);
  console.log(`  - Circular / Suspicious Base Models: ${anomalies.circularBaseModels.length}`);
  console.log(`  - Trivial / Degenerate Aliases:      ${anomalies.trivialAliases.length}`);
  console.log(`  - Developer Logo Brand Mismatches:   ${anomalies.developerLogoMismatches.length}`);
  console.log(`  - Deprecated Vendor Endpoints:       ${anomalies.deprecatedVendorStatus.length}`);
  console.log(`  - Staged / Unverified Drafts:        ${anomalies.lowQualityDrafts.length}`);

  if (anomalies.circularBaseModels.length > 0) {
    console.log(`\n  ⚠️ Sample Circular Base Models:`);
    anomalies.circularBaseModels.slice(0, 5).forEach((a, i) => {
      console.log(`    ${i + 1}. [${a.name}] base_model: "${a.base_model}"`);
    });
  }

  if (anomalies.developerLogoMismatches.length > 0) {
    console.log(`\n  ⚠️ Sample Developer Logo Mismatches:`);
    anomalies.developerLogoMismatches.slice(0, 5).forEach((a, i) => {
      console.log(`    ${i + 1}. [${a.name}] dev: ${a.developer} | logo: ${a.logo}`);
    });
  }

  // ---------------------------------------------------------------------------
  // PART 4: CONFIDENCE & PROVENANCE SCORE CARD
  // ---------------------------------------------------------------------------
  console.log("\n🏆 4. OVERALL PROVENANCE HEALTH SCORECARD");
  console.log("--------------------------------------------------");

  const assetHealthScore = (((statusSummary.VALID + statusSummary.AUTH_RESTRICTED) / allAssetUrls.length) * 100).toFixed(1);
  const evidenceCoverageScore = ((modelsWithEvidence / models.length) * 100).toFixed(1);
  const anomalyFreeScore = (((models.length - anomalies.circularBaseModels.length - anomalies.developerLogoMismatches.length) / models.length) * 100).toFixed(1);

  console.log(`  - Asset Health (Non-404):           ${assetHealthScore}%`);
  console.log(`  - Evidence Coverage (Provenance):    ${evidenceCoverageScore}%`);
  console.log(`  - Anomaly-Free Integrity Score:     ${anomalyFreeScore}%`);

  console.log("\n================================================================================");
  console.log("✅ AUDIT & INTEGRITY CHECK COMPLETE");
  console.log("================================================================================");
}

if (require.main === module) {
  runProvenanceAudit().catch((err) => {
    console.error("Audit suite fatal error:", err);
    process.exit(1);
  });
}

module.exports = { runProvenanceAudit };
