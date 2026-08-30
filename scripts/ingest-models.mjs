import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Read .env.local
let envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...vals] = trimmed.split("=");
    const val = vals.join("=").trim().replace(/^["']|["']$/g, "");
    if (key === "NEXT_PUBLIC_SUPABASE_URL" && !envUrl) envUrl = val;
    if ((key === "SUPABASE_SERVICE_ROLE_KEY" || key === "NEXT_PUBLIC_SUPABASE_ANON_KEY") && !envKey) envKey = val;
  }
}

const SUPABASE_URL = envUrl || "https://zmfyclrjbiewmwqiswqk.supabase.co";
const SUPABASE_KEY = envKey;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PROVIDER_NAMES = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google DeepMind",
  meta: "Meta",
  mistral: "Mistral AI",
  alibaba: "Alibaba Cloud",
  deepseek: "DeepSeek",
  cohere: "Cohere",
  xai: "xAI",
  nvidia: "NVIDIA",
  zhipuai: "Zhipu AI",
  "bytedance-seed": "ByteDance",
  bytedance: "ByteDance",
  minimax: "MiniMax",
  moonshotai: "Moonshot AI",
  tencent: "Tencent",
  elevenlabs: "ElevenLabs",
  stability: "Stability AI",
  perplexity: "Perplexity",
  xiaomi: "Xiaomi",
  "arcee-ai": "Arcee AI",
  poolside: "Poolside",
  deepreinforce: "DeepReinforce",
};

function inferCategory(m) {
  const name = (m.name || "").toLowerCase();
  const desc = (m.description || "").toLowerCase();
  const inputMods = m.modalities?.input || [];
  const outputMods = m.modalities?.output || [];
  const allMods = [...inputMods, ...outputMods];

  if (name.includes("video") || desc.includes("video") || allMods.includes("video")) return "Video";
  if (name.includes("audio") || name.includes("speech") || name.includes("tts") || name.includes("whisper") || name.includes("voice") || allMods.includes("audio")) return "Audio";
  if (name.includes("embed") || name.includes("embedding")) return "Embedding";
  if (name.includes("coder") || name.includes("code") || desc.includes("coding")) return "Code";
  if (m.reasoning || name.includes("thinking") || name.includes("reasoning") || name.includes("r1")) return "Reasoning";
  if (allMods.includes("image") || allMods.includes("vision") || m.attachment) return "Multimodal";
  return "LLM";
}

function formatParameters(m) {
  if (m.parameters) return String(m.parameters);
  const name = m.name || "";
  const match = name.match(/(\d+(?:\.\d+)?b)/i);
  if (match) return match[1].toUpperCase();
  return m.open_weights ? "Open Weights" : "Proprietary";
}

function normalizeDate(d) {
  if (!d || typeof d !== "string") return "2026-01-01";
  const trimmed = d.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) return `${trimmed}-01`;
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`;
  return "2026-01-01";
}

async function ingestModels() {
  console.log("📥 Fetching models snapshot from models.dev...");
  const res = await fetch("https://models.dev/models.json");
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch models.json`);

  const rawData = await res.json();
  const keys = Object.keys(rawData);
  console.log(`🔍 Found ${keys.length} models in remote catalog.`);

  const records = [];

  for (const [key, m] of Object.entries(rawData)) {
    const rawProvider = key.split("/")[0];
    const provider = PROVIDER_NAMES[rawProvider] || rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1);
    const slug = key.replace(/[/_]/g, "-").toLowerCase();

    const inputMods = m.modalities?.input || [];
    const outputMods = m.modalities?.output || [];
    const modalities = Array.from(new Set([...inputMods, ...outputMods, "text"])).filter(Boolean);

    const category = inferCategory(m);
    const parameters = formatParameters(m);

    const pricing = {};
    if (m.cost?.input !== undefined) pricing.input_per_1m = Number((m.cost.input * 1_000_000).toFixed(4));
    if (m.cost?.output !== undefined) pricing.output_per_1m = Number((m.cost.output * 1_000_000).toFixed(4));

    const sourceType = m.open_weights
      ? `Open Weights (${m.license || "Open"})`
      : "Proprietary Commercial API";

    const links = { api_id: m.id || key };
    if (m.knowledge) links.knowledge_cutoff = m.knowledge;

    records.push({
      name: m.name || key,
      slug,
      provider,
      category,
      description: m.description || `${provider} foundation model supporting high-throughput intelligence and tool calling.`,
      release_date: normalizeDate(m.release_date),
      context_window: m.limit?.context || 128000,
      parameters,
      active_parameters: m.architecture?.active_parameters || null,
      source_type: sourceType,
      weights_size: m.architecture?.weights_size || null,
      announcement_url: m.announcement_url || null,
      benchmarks: m.benchmarks || {},
      pricing,
      modalities,
      links,
      is_active: true,
    });
  }

  console.log(`🚀 Upserting ${records.length} models in batches of 50 into Supabase...`);

  let insertedCount = 0;
  for (let i = 0; i < records.length; i += 50) {
    const chunk = records.slice(i, i + 50);
    const { error } = await supabase
      .from("models")
      .upsert(chunk, { onConflict: "slug" });

    if (error) {
      console.error(`❌ Batch error at index ${i}:`, error.message);
    } else {
      insertedCount += chunk.length;
      console.log(`✅ Progress: ${insertedCount}/${records.length} models synced.`);
    }
  }

  console.log(`🎉 Ingestion complete! Total ${insertedCount} models synced to Supabase.`);
}

ingestModels().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
