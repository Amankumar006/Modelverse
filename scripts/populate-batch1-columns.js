"use strict";

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const { createClient } = require("@supabase/supabase-js");
const { scoreModelPage } = require("./quality/score-content");

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key);
}

const BATCH1_CONFIG = {
  "openai-gpt-5.6-sol": {
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Plus", "Pro", "Team", "Enterprise"],
      since: "2026-07-09",
      notes: "Frontier flagship tier with ultra multi-agent mode in ChatGPT and Codex.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.6-sol",
      endpoints: ["v1/responses", "v1/chat/completions", "v1/batch"],
      since: "2026-07-09",
    },
    aliases: ["gpt-5.6", "gpt-5.6-sol", "openai-gpt-5-6-sol"],
  },
  "openai-gpt-5.6-terra": {
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Plus", "Pro", "Team", "Enterprise"],
      since: "2026-07-09",
      notes: "Balanced daily driver tier in ChatGPT for Plus and Enterprise subscribers.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.6-terra",
      endpoints: ["v1/responses", "v1/chat/completions", "v1/batch"],
      since: "2026-07-09",
    },
    aliases: ["gpt-5.6-terra", "openai-gpt-5-6-terra", "gpt-5.6t"],
  },
  "openai-gpt-5.6-luna": {
    chatgptAvailability: {
      status: "active",
      access: "free-tier",
      plans: ["Free", "Plus", "Pro", "Team", "Enterprise"],
      since: "2026-07-09",
      notes: "Default low-latency model for standard ChatGPT free and paid web queries.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.6-luna",
      endpoints: ["v1/responses", "v1/chat/completions", "v1/batch"],
      since: "2026-07-09",
    },
    aliases: ["gpt-5.6-luna", "openai-gpt-5-6-luna", "gpt-5.6l"],
  },
  "openai-gpt-5.5-pro": {
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Pro", "Enterprise"],
      since: "2026-03-15",
      notes: "Flagship deep-thinking tier for GPT-5.5 generation.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.5-pro",
      endpoints: ["v1/responses", "v1/chat/completions"],
      since: "2026-03-15",
    },
    aliases: ["gpt-5.5-pro", "openai-gpt-5-5-pro", "gpt-5.5"],
  },
  "openai-gpt-5.5-instant": {
    chatgptAvailability: {
      status: "active",
      access: "free-tier",
      plans: ["Free", "Plus", "Pro"],
      since: "2026-03-15",
      notes: "Fast interactive conversational tier in ChatGPT.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.5-instant",
      endpoints: ["v1/responses", "v1/chat/completions"],
      since: "2026-03-15",
    },
    aliases: ["gpt-5.5-instant", "openai-gpt-5-5-instant"],
  },
  "openai-gpt-5.4-pro": {
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Pro", "Enterprise"],
      since: "2025-11-20",
      notes: "Professional reasoning tier for GPT-5.4 generation.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.4-pro",
      endpoints: ["v1/chat/completions", "v1/responses"],
      since: "2025-11-20",
    },
    aliases: ["gpt-5.4-pro", "openai-gpt-5-4-pro", "gpt-5.4"],
  },
  "openai-gpt-5.4-mini": {
    chatgptAvailability: {
      status: "active",
      access: "free-tier",
      plans: ["Free", "Plus", "Pro"],
      since: "2025-11-20",
      notes: "Lightweight chat and assistance tier.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.4-mini",
      endpoints: ["v1/chat/completions", "v1/responses"],
      since: "2025-11-20",
    },
    aliases: ["gpt-5.4-mini", "openai-gpt-5-4-mini"],
  },
  "openai-gpt-5.4-nano": {
    chatgptAvailability: {
      status: "retired",
      access: "api-only",
      since: "2025-11-20",
      notes: "Exclusively deployed via API for high-frequency routing and classification.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.4-nano",
      endpoints: ["v1/chat/completions"],
      since: "2025-11-20",
    },
    aliases: ["gpt-5.4-nano", "openai-gpt-5-4-nano"],
  },
  "openai-gpt-5.2-pro": {
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Plus", "Pro"],
      since: "2025-08-10",
      notes: "Frontier reasoning model for the GPT-5.2 generation.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.2-pro",
      endpoints: ["v1/chat/completions"],
      since: "2025-08-10",
    },
    aliases: ["gpt-5.2-pro", "openai-gpt-5-2-pro", "gpt-5.2"],
  },
  "openai-gpt-5.1-codex-max": {
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Plus", "Pro", "Team", "Enterprise"],
      since: "2025-05-18",
      notes: "Integrated directly into Codex and advanced software development modes in ChatGPT.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.1-codex-max",
      endpoints: ["v1/chat/completions", "v1/responses"],
      since: "2025-05-18",
    },
    aliases: ["gpt-5.1-codex-max", "openai-gpt-5-1-codex-max", "gpt-5.1-codex"],
  },
  "openai-gpt-5.1-codex-mini": {
    chatgptAvailability: {
      status: "active",
      access: "free-tier",
      plans: ["Free", "Plus", "Pro"],
      since: "2025-05-18",
      notes: "Fast inline code completion and review assistant.",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.1-codex-mini",
      endpoints: ["v1/chat/completions", "v1/responses"],
      since: "2025-05-18",
    },
    aliases: ["gpt-5.1-codex-mini", "openai-gpt-5-1-codex-mini", "codex-mini"],
  },
};

async function main() {
  const db = getClient();
  console.log("🚀 Populating and verifying new columns for all 11 Batch 1 models...\n");

  const slugs = Object.keys(BATCH1_CONFIG);
  let updatedCount = 0;

  for (const slug of slugs) {
    const cfg = BATCH1_CONFIG[slug];
    console.log(`📌 Processing ${slug}...`);

    // 1. Fetch current row
    const { data: row, error: fetchErr } = await db.from("models").select("*").eq("slug", slug).single();
    if (fetchErr) {
      console.error(`   ❌ Failed to fetch ${slug}:`, fetchErr.message);
      continue;
    }

    // 2. Build model representation for scoring
    const modelToScore = {
      ...(row.metadata || {}),
      id: row.id,
      name: row.name,
      slug: row.slug,
      developer: row.developer,
      releaseDate: row.release_date,
      type: row.type,
      status: row.status,
      parameters: row.parameters,
      activeParameters: row.active_parameters,
      contextWindow: row.context_window,
      modality: row.modality || [],
      deployment: row.deployment || [],
      primaryTask: row.primary_task,
      license: row.license,
      family: row.family,
      tier: row.tier,
      previousVersion: row.previous_version,
      baseModel: row.base_model,
      description: row.description,
      descriptionDraft: row.description_draft,
      cardSummary: row.card_summary,
      pageOverview: row.page_overview,
      editorialNote: row.editorial_note,
      keyFeatures: row.key_features || [],
      benchmarks: row.benchmarks || [],
      pricing: row.pricing,
      pricingLastVerified: row.pricing_last_verified,
      links: row.links || {},
      sources: row.sources || [],
      tags: row.tags || [],
      quickstart: row.metadata?.quickstart,
      customSections: row.metadata?.custom_sections,
    };

    const gate = scoreModelPage(modelToScore);

    // 3. Deduplicate aliases
    const uniqueAliases = Array.from(new Set((cfg.aliases || []).map((a) => a.trim()).filter(Boolean)));

    // 4. Update the 4 new columns and quality score fields
    const updatePayload = {
      chatgpt_availability: cfg.chatgptAvailability,
      api_availability: cfg.apiAvailability,
      aliases: uniqueAliases,
      quality_breakdown: gate.breakdown,
      quality_score: gate.score,
      quality_status: gate.status,
      quality_reasons: gate.reasons,
      quality_checked_at: new Date().toISOString(),
    };

    const { error: updateErr } = await db
      .from("models")
      .update(updatePayload)
      .eq("id", row.id);

    if (updateErr) {
      console.error(`   ❌ Failed to update ${slug}:`, updateErr.message);
    } else {
      console.log(`   ✅ Columns populated successfully.`);
      console.log(`      Quality Score : ${gate.score} (Status: ${gate.status})`);
      console.log(`      Breakdown     : ${JSON.stringify(gate.breakdown)}`);
      console.log(`      Aliases       : [${uniqueAliases.join(", ")}]`);
      console.log(`      ChatGPT Access: ${cfg.chatgptAvailability.access} (${cfg.chatgptAvailability.status})`);
      console.log(`      API Model ID  : ${cfg.apiAvailability.apiModelId}`);
      updatedCount++;
    }
    console.log("");
  }

  console.log(`✨ Population complete: ${updatedCount}/${slugs.length} records updated in database.\n`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
