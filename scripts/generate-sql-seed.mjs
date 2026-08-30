import fs from "fs";

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

function escapeSql(str) {
  if (str === null || str === undefined) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJson(obj) {
  if (obj === null || obj === undefined) return "'{}'::jsonb";
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function escapeArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "ARRAY['text']::text[]";
  const escapedItems = arr.map((item) => `'${String(item).replace(/'/g, "''")}'`);
  return `ARRAY[${escapedItems.join(", ")}]::text[]`;
}

async function main() {
  const res = await fetch("https://models.dev/models.json");
  const rawData = await res.json();

  const statements = [];

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

    const row = {
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
    };

    const sql = `INSERT INTO public.models (
      name, slug, provider, category, description, release_date, context_window,
      parameters, active_parameters, source_type, weights_size, announcement_url,
      benchmarks, pricing, modalities, links, is_active
    ) VALUES (
      ${escapeSql(row.name)},
      ${escapeSql(row.slug)},
      ${escapeSql(row.provider)},
      ${escapeSql(row.category)},
      ${escapeSql(row.description)},
      ${escapeSql(row.release_date)}::date,
      ${row.context_window},
      ${escapeSql(row.parameters)},
      ${escapeSql(row.active_parameters)},
      ${escapeSql(row.source_type)},
      ${escapeSql(row.weights_size)},
      ${escapeSql(row.announcement_url)},
      ${escapeJson(row.benchmarks)},
      ${escapeJson(row.pricing)},
      ${escapeArray(row.modalities)},
      ${escapeJson(row.links)},
      true
    ) ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      provider = EXCLUDED.provider,
      category = EXCLUDED.category,
      description = EXCLUDED.description,
      release_date = EXCLUDED.release_date,
      context_window = EXCLUDED.context_window,
      parameters = EXCLUDED.parameters,
      active_parameters = EXCLUDED.active_parameters,
      source_type = EXCLUDED.source_type,
      weights_size = EXCLUDED.weights_size,
      announcement_url = EXCLUDED.announcement_url,
      benchmarks = EXCLUDED.benchmarks,
      pricing = EXCLUDED.pricing,
      modalities = EXCLUDED.modalities,
      links = EXCLUDED.links,
      is_active = true,
      updated_at = now();`;

    statements.push(sql);
  }

  // Split into chunks of 30 statements
  const chunkSize = 30;
  const chunks = [];
  for (let i = 0; i < statements.length; i += chunkSize) {
    chunks.push(statements.slice(i, i + chunkSize).join("\n\n"));
  }

  fs.writeFileSync("scripts/.sql_chunks.json", JSON.stringify(chunks, null, 2));
  console.log(`Generated ${statements.length} SQL statements in ${chunks.length} chunks.`);
}

main().catch(console.error);
