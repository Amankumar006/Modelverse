const fs = require("fs");
const path = require("path");

const SNAPSHOT_DIR = path.join(__dirname, "..", "..", "data", "cache");

function readSnapshot(filename) {
  const filePath = path.join(SNAPSHOT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`⚠️ Warning: Failed reading snapshot ${filename}:`, e.message);
    return null;
  }
}

module.exports = readSnapshot;
