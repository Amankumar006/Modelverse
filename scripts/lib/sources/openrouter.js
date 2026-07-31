const https = require("https");
const readSnapshot = require("../read-snapshot");

function getHttpsJson(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Truthfulness-Bot/1.0" } }, (res) => {
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

function findModelInPayload(json, modelName) {
  if (!json || !Array.isArray(json.data)) return null;

  const targetName = normalizeName(modelName);
  const match = json.data.find((m) => {
    const mId = normalizeName(m.id || "");
    const mName = normalizeName(m.name || "");
    return mId.includes(targetName) || mName.includes(targetName);
  });

  if (!match) return null;

  const promptPrice = match.pricing?.prompt ? parseFloat(match.pricing.prompt) * 1000000 : null;
  const completionPrice = match.pricing?.completion ? parseFloat(match.pricing.completion) * 1000000 : null;

  return {
    sourceName: "openrouter",
    pricing: {
      inputPricePerM: promptPrice,
      outputPricePerM: completionPrice,
    },
    contextWindow: match.context_length ? String(match.context_length) : null,
  };
}

module.exports = {
  name: "openrouter",
  independentFor: ["pricing", "contextWindow"],
  async fetchModel(modelName, developer) {
    try {
      // 1. Check local snapshot first
      const snapshot = readSnapshot("openrouter.json");
      if (snapshot && snapshot.data) {
        const localMatch = findModelInPayload(snapshot.data, modelName);
        if (localMatch) {
          return localMatch;
        }
      }

      // 2. Live fallback if missing from local snapshot
      const liveJson = await getHttpsJson("https://openrouter.ai/api/v1/models");
      return findModelInPayload(liveJson, modelName);
    } catch (e) {
      return null;
    }
  },
};
