const fs = require("fs");
const path = require("path");

const dir = path.join(process.cwd(), "data", "news");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));

function clean(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8230;/g, "…")
    .replace(/&#160;/g, " ")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function cleanObj(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanObj);
  } else if (obj && typeof obj === "object") {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = cleanObj(v);
    }
    return res;
  } else if (typeof obj === "string") {
    return clean(obj);
  }
  return obj;
}

let cleanedCount = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const cleaned = cleanObj(data);
  const newRaw = JSON.stringify(cleaned, null, 2) + "\n";
  if (raw !== newRaw) {
    fs.writeFileSync(filePath, newRaw);
    cleanedCount++;
    console.log(`Cleaned entities in ${file}`);
  }
}

console.log(`Successfully cleaned ${cleanedCount} news JSON files.`);
