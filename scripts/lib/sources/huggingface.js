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

function extractLeaderboardScores(lbRows, target, searchTarget) {
  if (!lbRows || !Array.isArray(lbRows.rows)) return null;

  const matchRow = lbRows.rows.find((r) => {
    const fullname = normalizeName(r.row?.fullname || r.row?.Model || "");
    const evalName = normalizeName(r.row?.eval_name || "");
    return (
      (target.length > 3 && (fullname.includes(target) || evalName.includes(target))) ||
      (searchTarget.length > 3 && (fullname.includes(searchTarget) || evalName.includes(searchTarget)))
    );
  });

  if (matchRow && matchRow.row) {
    return {
      gpqa: matchRow.row.GPQA != null ? String(matchRow.row.GPQA.toFixed(1)) : null,
      mmluPro: matchRow.row["MMLU-PRO"] != null ? String(matchRow.row["MMLU-PRO"].toFixed(1)) : null,
      ifeval: matchRow.row.IFEval != null ? String(matchRow.row.IFEval.toFixed(1)) : null,
      bbh: matchRow.row.BBH != null ? String(matchRow.row.BBH.toFixed(1)) : null,
    };
  }

  return null;
}

module.exports = {
  name: "huggingface",
  independentFor: ["benchmarks", "parameters", "license"],
  async fetchModel(modelName, developer, hfId) {
    try {
      const searchId = hfId || `${developer}/${modelName}`;
      const target = normalizeName(modelName);
      const searchTarget = normalizeName(searchId);

      // Fetch hub detail (license, params)
      const detail = await getHttpsJson(`https://huggingface.co/api/models/${searchId}`);

      let leaderboardScores = null;

      // 1. Check local snapshot first
      const snapshot = readSnapshot("hf-leaderboard.json");
      if (snapshot && snapshot.data) {
        leaderboardScores = extractLeaderboardScores(snapshot.data, target, searchTarget);
      }

      // 2. Live fallback if not found in local snapshot
      if (!leaderboardScores) {
        try {
          const lbRows = await getHttpsJson("https://datasets-server.huggingface.co/rows?dataset=open-llm-leaderboard%2Fcontents&config=default&split=train&limit=100");
          leaderboardScores = extractLeaderboardScores(lbRows, target, searchTarget);
        } catch (e) {}
      }

      if (!detail && !leaderboardScores) return null;

      const tags = detail?.tags || [];
      const cardData = detail?.cardData || {};
      let license = cardData.license ? cardData.license.toUpperCase() : null;
      if (!license) {
        for (const t of tags) {
          if (t.startsWith("license:")) license = t.replace("license:", "").toUpperCase();
        }
      }

      const totalParams = detail?.safetensors?.total || null;

      return {
        sourceName: "huggingface",
        parameters: totalParams ? String(totalParams) : null,
        license: license || null,
        benchmarks: leaderboardScores || {
          mmlu: detail?.evals?.mmlu || null,
          gpqa: detail?.evals?.gpqa || null,
        },
      };
    } catch (e) {
      return null;
    }
  },
};
