const aaSource = require("./lib/sources/artificial-analysis");
const orSource = require("./lib/sources/openrouter");
const hfSource = require("./lib/sources/huggingface");

async function testLiveAdapters() {
  console.log("🌐 Testing Live Source Adapters against real endpoints...\n");

  console.log("📡 1. Testing OpenRouter Live API (querying 'llama')...");
  const orResult = await orSource.fetchModel("llama", "meta");
  console.log("   OpenRouter Result:", JSON.stringify(orResult, null, 2));

  console.log("\n📡 2. Testing HuggingFace Hub & Leaderboard API (querying 'BAAI/Infinity-Instruct-3M-0613-Llama3-70B')...");
  const hfResult = await hfSource.fetchModel("Infinity-Instruct-3M-0613-Llama3-70B", "BAAI", "BAAI/Infinity-Instruct-3M-0613-Llama3-70B");
  console.log("   HuggingFace Result:", JSON.stringify(hfResult, null, 2));

  console.log("\n📡 3. Testing Artificial Analysis API...");
  const aaResult = await aaSource.fetchModel("llama", "meta");
  console.log("   Artificial Analysis Result:", JSON.stringify(aaResult, null, 2));

  console.log("\n✅ Live Source Adapters Execution Completed!");
}

testLiveAdapters();
