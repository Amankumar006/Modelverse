const https = require("https");
const readSnapshot = require("../read-snapshot");

function getHttpsJson(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { "User-Agent": "Modelverse-Curator-Hint/1.0" } }, (res) => {
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

function findArenaHint(payload, modelName) {
  if (!payload || !Array.isArray(payload.data || payload.leaderboard || payload)) return null;

  const list = payload.data || payload.leaderboard || payload;
  const target = normalizeName(modelName);

  const matchIdx = list.findIndex((m) => {
    const mName = normalizeName(m.name || m.model || m.key || "");
    return mName.includes(target) || target.includes(mName);
  });

  if (matchIdx === -1) return null;

  const match = list[matchIdx];
  return {
    sourceName: "lmarena-mirror",
    arenaRank: matchIdx + 1,
    arenaElo: match.elo || match.arena_elo || match.score || null,
  };
}

module.exports = {
  name: "lmarena-mirror",
  async fetchArenaHint(modelName) {
    try {
      // Check snapshot cache or live endpoint
      const snapshot = readSnapshot("lmarena.json");
      if (snapshot && snapshot.data) {
        const hint = findArenaHint(snapshot.data, modelName);
        if (hint) return hint;
      }

      const liveData = await getHttpsJson("https://api.wulong.dev/arena-ai-leaderboards/v1/leaderboard?name=text");
      return findArenaHint(liveData, modelName);
    } catch (e) {
      return null;
    }
  },
};
