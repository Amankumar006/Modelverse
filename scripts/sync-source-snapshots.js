/**
 * Sync Source Snapshots Script
 * 
 * Periodically fetches full-catalog snapshots from external sources:
 * - Artificial Analysis (v2 language models)
 * - OpenRouter (v1 models list)
 * - HuggingFace Open LLM Leaderboard (contents rows)
 * 
 * Stores versioned payloads under data/cache/ for offline-safe,
 * instant verification lookups during model ingestion runs.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const SNAPSHOT_DIR = path.join(process.cwd(), "data", "cache");

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

function getHttpsJson(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = { "User-Agent": "Modelverse-Snapshot-Sync/1.0", ...extraHeaders };
    const req = https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          if (res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 100)}`));
          }
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", reject);
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

function writeSnapshot(filename, data) {
  const payload = {
    fetchedAt: new Date().toISOString(),
    data,
  };
  const targetPath = path.join(SNAPSHOT_DIR, filename);
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), "utf-8");
  const count = Array.isArray(data?.data ?? data) ? (data.data ?? data).length : "1";
  console.log(`✅ Synced ${filename}: ${count} entries saved.`);
}

async function syncArtificialAnalysis() {
  const headers = {};
  if (process.env.ARTIFICIAL_ANALYSIS_API_KEY) {
    headers["x-api-key"] = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
  }
  const data = await getHttpsJson("https://artificialanalysis.ai/api/v2/language/models", headers);
  if (data) {
    writeSnapshot("artificial-analysis.json", data);
  }
}

async function syncOpenRouter() {
  const data = await getHttpsJson("https://openrouter.ai/api/v1/models");
  if (data) {
    writeSnapshot("openrouter.json", data);
  }
}

async function syncHfLeaderboard() {
  const data = await getHttpsJson("https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard%2Fcontents&config=default&split=train&limit=100");
  if (data) {
    writeSnapshot("hf-leaderboard.json", data);
  }
}

async function main() {
  console.log("🚀 Starting Source Snapshot Synchronization...");

  const results = await Promise.allSettled([
    syncArtificialAnalysis(),
    syncOpenRouter(),
    syncHfLeaderboard(),
  ]);

  const sourceNames = ["Artificial Analysis", "OpenRouter", "HF Leaderboard"];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.warn(`⚠️ Source sync for ${sourceNames[i]} failed (non-fatal, retaining previous snapshot):`, r.reason?.message || r.reason);
    }
  });

  console.log("✨ Source Snapshot Sync Completed!");
}

if (require.main === module) {
  main();
}

module.exports = { main, writeSnapshot };
