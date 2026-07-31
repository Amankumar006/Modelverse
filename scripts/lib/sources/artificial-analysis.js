const https = require("https");
const readSnapshot = require("../read-snapshot");

function getHttpsJson(url, extraHeaders = {}) {
  return new Promise((resolve) => {
    const headers = { "User-Agent": "Modelverse-Truthfulness-Bot/1.0", ...extraHeaders };
    if (process.env.ARTIFICIAL_ANALYSIS_API_KEY) {
      headers["x-api-key"] = process.env.ARTIFICIAL_ANALYSIS_API_KEY;
    }
    const req = https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on("error", () => resolve(null));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

function normalizeName(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findModelInPayload(payload, modelName, developer) {
  if (!payload || !Array.isArray(payload.data)) return null;
  const targetName = normalizeName(modelName);
  const targetDev = normalizeName(developer);

  const match = payload.data.find((m) => {
    const mName = normalizeName(m.name || m.model_name);
    const mDev = normalizeName(m.creator || m.developer);
    return mName.includes(targetName) || targetName.includes(mName);
  });

  if (!match) return null;

  return {
    sourceName: "artificial-analysis",
    pricing: {
      inputPricePerM: match.pricing?.input_per_m_tokens ?? match.input_price_per_1m ?? null,
      outputPricePerM: match.pricing?.output_per_m_tokens ?? match.output_price_per_1m ?? null,
    },
    benchmarks: {
      gpqa: match.evals?.gpqa ?? match.gpqa ?? null,
      humanEval: match.evals?.human_eval ?? match.coding_index ?? null,
      mmluPro: match.evals?.mmlu_pro ?? match.mmlu_pro ?? null,
    },
    contextWindow: match.context_window ? String(match.context_window) : null,
  };
}

module.exports = {
  name: "artificial-analysis",
  independentFor: ["pricing", "benchmarks"],
  async fetchModel(modelName, developer) {
    try {
      // 1. Check local snapshot first
      const snapshot = readSnapshot("artificial-analysis.json");
      if (snapshot && snapshot.data) {
        const localMatch = findModelInPayload(snapshot.data, modelName, developer);
        if (localMatch) {
          return localMatch;
        }
      }

      // 2. Live fallback if missing from local snapshot
      const liveData = await getHttpsJson("https://artificialanalysis.ai/api/v2/language/models");
      return findModelInPayload(liveData, modelName, developer);
    } catch (e) {
      return null;
    }
  },
};
