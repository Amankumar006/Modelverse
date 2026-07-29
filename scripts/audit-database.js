const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "models");

function runAudit() {
  console.log("🔍 Starting Modelverse database audit...");
  
  if (!fs.existsSync(DATA_DIR)) {
    console.error("❌ Model directory not found at:", DATA_DIR);
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json") && f !== "_index.json");
  console.log(`Found ${files.length} model entries to audit.\n`);

  const report = {
    totalFiles: files.length,
    missingMMLU: [],
    missingHumanEval: [],
    missingGSM8K: [],
    invalidBenchmarkFormats: [],
    apiModelsMissingPricing: [],
    inconsistentPricingUnits: []
  };

  const benchmarkCounts = {};

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    let model;
    try {
      model = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch (err) {
      console.error(`❌ Failed to parse ${file}:`, err.message);
      continue;
    }

    const benchmarks = model.benchmarks || [];
    const pricing = model.pricing || [];
    const isApiOnly = model.type === "api-only";

    // Track unique benchmarks
    benchmarks.forEach(b => {
      benchmarkCounts[b.name] = (benchmarkCounts[b.name] || 0) + 1;
    });

    // 1. Check Benchmarks Coverage
    const hasMmlu = benchmarks.some(b => b.name.toLowerCase() === "mmlu");
    const hasHumanEval = benchmarks.some(b => b.name.toLowerCase() === "humaneval");
    const hasGsm8k = benchmarks.some(b => b.name.toLowerCase() === "gsm8k");

    if (!hasMmlu) report.missingMMLU.push({ file, name: model.name });
    if (!hasHumanEval) report.missingHumanEval.push({ file, name: model.name });
    if (!hasGsm8k) report.missingGSM8K.push({ file, name: model.name });

    // 2. Check Score Formats (should be percentages like "84.2%")
    benchmarks.forEach(b => {
      const isStandard = ["mmlu", "humaneval", "gsm8k"].includes(b.name.toLowerCase());
      if (isStandard) {
        const score = b.score || "";
        const isValid = /^\d+(\.\d+)?%?$/.test(score.trim());
        if (!isValid) {
          report.invalidBenchmarkFormats.push({ file, name: model.name, benchmark: b.name, score });
        }
      }
    });

    // 3. Check Pricing for API models
    if (isApiOnly) {
      if (pricing.length === 0) {
        report.apiModelsMissingPricing.push({ file, name: model.name });
      } else {
        pricing.forEach(p => {
          const unit = p.unit || "";
          const isValidUnit = unit.toLowerCase().includes("input tokens") || unit.toLowerCase().includes("output tokens") || unit.toLowerCase().includes("cache");
          if (!isValidUnit) {
            report.inconsistentPricingUnits.push({ file, name: model.name, unit, amount: p.amount });
          }
        });
      }
    }
  }

  // Display Audit Summary
  console.log("=========================================");
  console.log("          DATABASE AUDIT SUMMARY         ");
  console.log("=========================================");
  console.log(`Total Models Audited: ${report.totalFiles}`);
  console.log(`Missing MMLU Score: ${report.missingMMLU.length}`);
  console.log(`Missing HumanEval Score: ${report.missingHumanEval.length}`);
  console.log(`Missing GSM8K Score: ${report.missingGSM8K.length}`);
  console.log(`Invalid Score Formats: ${report.invalidBenchmarkFormats.length}`);
  console.log(`API Models with Missing Pricing: ${report.apiModelsMissingPricing.length}`);
  console.log(`Inconsistent Pricing Units: ${report.inconsistentPricingUnits.length}`);
  console.log("=========================================\n");

  console.log("📊 Top 20 Benchmarks in the Database:");
  Object.entries(benchmarkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([name, count]) => {
      console.log(`  - ${name}: ${count} models`);
    });
  console.log("\n");

  if (report.invalidBenchmarkFormats.length > 0) {
    console.log("⚠️ Sample Mismatched Benchmark Formats (Target: e.g. '85.4%'):");
    report.invalidBenchmarkFormats.slice(0, 10).forEach(x => {
      console.log(`  - [${x.file}] ${x.name}: ${x.benchmark} score is "${x.score}"`);
    });
    console.log("");
  }

  if (report.inconsistentPricingUnits.length > 0) {
    console.log("⚠️ Sample Inconsistent Pricing Units:");
    report.inconsistentPricingUnits.slice(0, 10).forEach(x => {
      console.log(`  - [${x.file}] ${x.name}: "${x.unit}" at $${x.amount}`);
    });
    console.log("");
  }
}

runAudit();
