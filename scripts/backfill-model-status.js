const fs = require("fs");
const path = require("path");

const MODELS_DIR = path.join(process.cwd(), "data", "models");

function backfillStatus() {
  const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json") && !f.startsWith("_"));
  console.log(`🚀 Found ${files.length} model JSON files to process...`);

  let updatedCount = 0;
  let alreadyHasCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const filePath = path.join(MODELS_DIR, file);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(raw);

      if (!data.status) {
        // Insert 'status': 'active' right after 'type' if possible
        const newObj = {};
        for (const [key, val] of Object.entries(data)) {
          newObj[key] = val;
          if (key === "type" && !("status" in data)) {
            newObj["status"] = "active";
          }
        }
        if (!("status" in newObj)) {
          newObj["status"] = "active";
        }

        fs.writeFileSync(filePath, JSON.stringify(newObj, null, 2) + "\n", "utf-8");
        updatedCount++;
      } else {
        alreadyHasCount++;
      }
    } catch (err) {
      console.error(`❌ Error processing ${file}: ${err.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Backfill Complete:`);
  console.log(` - Explicitly updated with 'status: active': ${updatedCount}`);
  console.log(` - Already had explicit 'status': ${alreadyHasCount}`);
  console.log(` - Errors: ${errorCount}`);
}

backfillStatus();
