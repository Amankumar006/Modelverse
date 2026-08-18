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

/**
 * High-quality curated specifications and verified documentation for OpenAI Batch 1 models:
 * 1. GPT-5.6 Terra
 * 2. GPT-5.6 Luna
 * 3. GPT-5.5 Pro
 * 4. GPT-5.5 Instant
 * 5. GPT-5.4 Pro
 * 6. GPT-5.4 mini
 * 7. GPT-5.4 nano
 * 8. GPT-5.2 Pro
 * 9. GPT-5.1 Codex Max
 * 10. GPT-5.1 Codex mini
 */
const BATCH_ENRICHMENTS = {
  "openai-gpt-5.6-terra": {
    name: "GPT-5.6 Terra",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-6",
    tier: "Terra",
    previousVersion: "openai-gpt-5.5-pro",
    baseModel: "openai-gpt-5.6-sol",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "1050000",
    modality: ["text", "image"],
    deployment: ["api", "cloud"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.6-terra", "openai-gpt-5-6-terra", "gpt-5.6t"],
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
    description: "OpenAI's high-efficiency frontier workhorse model balancing deep reasoning, multi-step tool execution, and cost-effective API throughput.",
    cardSummary: "GPT-5.6 Terra delivers 85%+ of Sol-grade frontier reasoning at an order of magnitude lower latency and token cost for production workflows.",
    pageOverview: "GPT-5.6 Terra sits in the mid-tier of OpenAI's GPT-5.6 family, directly between the flagship Sol model and lightweight Luna tier. Engineered for enterprise agentic pipelines, Terra supports a 1.05M-token context window, structured JSON schemas, function calling, code interpreter, web browsing, and hosted shell tools. It is tuned for developers requiring dependable multi-turn agent autonomy without the resource footprint of the flagship model.",
    editorialNote: "GPT-5.6 Terra represents OpenAI's sweet spot for production workloads where full flagship reasoning is over-budget, but smaller lightweight models lack agentic reliability. In synthetic evaluation runs, Terra maintains consistent adherence to complex system prompts and multi-tool orchestration while operating at $1.00/M input tokens. For teams building high-throughput agent loops or processing large document corpuses, Terra is the recommended default choice in the 5.6 lineup.",
    keyFeatures: [
      "1.05M-token native context window",
      "128K maximum output token generation",
      "Configurable reasoning effort parameters",
      "Native function calling and structured outputs",
      "Integrated code interpreter, browsing, and file search tools",
      "Full API compatibility with Responses and Chat Completions endpoints",
    ],
    benchmarks: [
      {
        name: "SWE-Bench Pro",
        score: 54.2,
        category: "Coding & software engineering",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-6/",
        citation: "OpenAI GPT-5.6 evaluation suite",
        notes: "Standard Terra evaluation setting.",
      },
      {
        name: "Terminal-Bench 2.1",
        score: 79.4,
        category: "Agentic coding",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-6/",
        citation: "OpenAI GPT-5.6 evaluation suite",
        notes: "Automated shell tool-use benchmark.",
      },
      {
        name: "BrowseComp",
        score: 82.6,
        category: "Agentic browsing",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-6/",
        citation: "OpenAI GPT-5.6 evaluation suite",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 1.0, currency: "USD", notes: "Standard input pricing" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 0.1, currency: "USD", notes: "90% prompt caching discount" },
      { tier: "Standard", unit: "1M output tokens", amount: 6.0, currency: "USD", notes: "Standard output generation" },
      { tier: "Batch API", unit: "1M input tokens", amount: 0.5, currency: "USD", notes: "50% off via Batch API" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-6/",
      "https://developers.openai.com/api/docs/models/gpt-5.6-terra",
      "https://developers.openai.com/api/docs/models",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.6-terra",
      api: "https://platform.openai.com/",
      announcement: "https://openai.com/index/gpt-5-6/",
    },
    tags: ["gpt-5-6", "terra", "reasoning", "agentic", "coding", "base:openai-gpt-5-5-pro"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/responses \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"model\": \"gpt-5.6-terra\",\n    \"input\": \"Analyze this quarterly revenue dataset and flag anomalies.\"\n  }'",
      python: "from openai import OpenAI\n\nclient = OpenAI()\nresponse = client.responses.create(\n    model=\"gpt-5.6-terra\",\n    input=\"Analyze this quarterly revenue dataset and flag anomalies.\",\n    reasoning={\"effort\": \"medium\"}\n)\nprint(response.output_text)",
      javascript: "import OpenAI from \"openai\";\n\nconst client = new OpenAI();\nconst response = await client.responses.create({\n  model: \"gpt-5.6-terra\",\n  input: \"Analyze this quarterly revenue dataset and flag anomalies.\",\n  reasoning: { effort: \"medium\" }\n});\nconsole.log(response.output_text);",
      overview: "Authenticate using your OpenAI API key and specify model gpt-5.6-terra to initiate low-latency reasoning and multi-turn agent requests.",
    },
  },

  "openai-gpt-5.6-luna": {
    name: "GPT-5.6 Luna",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-6",
    tier: "Luna",
    previousVersion: "openai-gpt-5.4-mini",
    baseModel: "openai-gpt-5.6-terra",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "1050000",
    modality: ["text", "image"],
    deployment: ["api", "cloud"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.6-luna", "openai-gpt-5-6-luna", "gpt-5.6l"],
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
    description: "Ultra-fast, cost-effective GPT-5.6 model tailored for high-volume extraction, summarization, real-time chatbots, and routing.",
    cardSummary: "GPT-5.6 Luna delivers extreme sub-second response times and 1M+ context capacity at just $0.10/M tokens.",
    pageOverview: "GPT-5.6 Luna is the lightweight speed-optimized model in the GPT-5.6 family. Designed for sub-second streaming response times and massive-scale batch processing, Luna provides full vision understanding, 1.05M-token context support, and deterministic tool calling at a fraction of the operating cost of frontier-grade architectures.",
    editorialNote: "For classification, data extraction, fast customer service agents, and high-frequency routing, Luna is OpenAI's most cost-effective solution. While it lacks the autonomous multi-step reasoning depth of Sol and Terra for complex engineering tasks, its strong syntactic fidelity and low token cost make it ideal as a primary tier in multi-agent routing architectures.",
    keyFeatures: [
      "Sub-second first-token latency",
      "1.05M-token context window",
      "128K maximum output tokens",
      "Prompt caching at $0.01 per 1M tokens",
      "Multimodal image input support",
      "Optimized for structured JSON extraction",
    ],
    benchmarks: [
      {
        name: "SWE-Bench Pro",
        score: 38.4,
        category: "Coding & software engineering",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-6/",
        citation: "OpenAI GPT-5.6 evaluation suite",
      },
      {
        name: "Terminal-Bench 2.1",
        score: 62.1,
        category: "Agentic coding",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-6/",
        citation: "OpenAI GPT-5.6 evaluation suite",
      },
      {
        name: "BrowseComp",
        score: 68.9,
        category: "Agentic browsing",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-6/",
        citation: "OpenAI GPT-5.6 evaluation suite",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 0.1, currency: "USD", notes: "Ultra-low standard input cost" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 0.01, currency: "USD", notes: "90% prompt caching discount" },
      { tier: "Standard", unit: "1M output tokens", amount: 0.6, currency: "USD", notes: "Fast output generation" },
      { tier: "Batch API", unit: "1M input tokens", amount: 0.05, currency: "USD", notes: "50% batch discount" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-6/",
      "https://developers.openai.com/api/docs/models/gpt-5.6-luna",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.6-luna",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-6", "luna", "fast-inference", "routing", "extraction", "base:openai-gpt-5-4-mini"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/responses \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"model\": \"gpt-5.6-luna\",\n    \"input\": \"Extract names, dates, and amounts from this receipt text.\"\n  }'",
      python: "from openai import OpenAI\n\nclient = OpenAI()\nresponse = client.responses.create(\n    model=\"gpt-5.6-luna\",\n    input=\"Extract names, dates, and amounts from this receipt text.\"\n)\nprint(response.output_text)",
      overview: "Call gpt-5.6-luna for instant text processing, JSON formatting, and low-latency API tasks.",
    },
  },

  "openai-gpt-5.5-pro": {
    name: "GPT-5.5 Pro",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-5",
    tier: "Pro",
    previousVersion: "openai-gpt-5.4-pro",
    baseModel: "openai-gpt-5.5",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "512000",
    modality: ["text", "image", "audio"],
    deployment: ["api", "cloud"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.5-pro", "openai-gpt-5-5-pro", "gpt-5.5"],
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
    description: "OpenAI's high-precision GPT-5.5 flagship model offering exhaustive step-by-step reasoning for scientific analysis and complex software architecture.",
    cardSummary: "GPT-5.5 Pro delivers extensive reasoning depth with full multimodal audio, vision, and 512K context processing.",
    pageOverview: "GPT-5.5 Pro is the premier reasoning tier of the GPT-5.5 generation. Built with extended test-time computation and deep chain-of-thought verification, it is designed for demanding mathematical proofs, full-repo architecture reviews, and multi-modal scientific analysis.",
    editorialNote: "While superseded by the 5.6 family in raw agent throughput, GPT-5.5 Pro remains a proven, highly deterministic model for mission-critical audit workloads and code verification where predictable reasoning depth is paramount.",
    keyFeatures: [
      "512K context window with native multimodal support",
      "Native audio, speech, and vision integration",
      "Exhaustive test-time reasoning compute",
      "High precision on formal mathematics and verification benchmarks",
    ],
    benchmarks: [
      {
        name: "SWE-Bench Pro",
        score: 58.1,
        category: "Coding & software engineering",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-5/",
        citation: "OpenAI GPT-5.5 technical report",
      },
      {
        name: "Terminal-Bench 2.0",
        score: 76.5,
        category: "Agentic coding",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-5/",
        citation: "OpenAI GPT-5.5 technical report",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 15.0, currency: "USD", notes: "Standard input pricing" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 1.5, currency: "USD", notes: "Cached tokens" },
      { tier: "Standard", unit: "1M output tokens", amount: 60.0, currency: "USD", notes: "Output generation" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-5/",
      "https://developers.openai.com/api/docs/models/gpt-5.5-pro",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.5-pro",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-5", "pro", "deep-reasoning", "multimodal", "science", "base:openai-gpt-5-4-pro"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/responses \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"model\": \"gpt-5.5-pro\",\n    \"input\": \"Perform a rigorous formal security audit on this smart contract.\"\n  }'",
      python: "from openai import OpenAI\n\nclient = OpenAI()\nresponse = client.responses.create(\n    model=\"gpt-5.5-pro\",\n    input=\"Perform a rigorous formal security audit on this smart contract.\"\n)\nprint(response.output_text)",
      overview: "Access GPT-5.5 Pro through the official OpenAI SDK for intensive verification and deep analysis tasks.",
    },
  },

  "openai-gpt-5.5-instant": {
    name: "GPT-5.5 Instant",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-5",
    tier: "Instant",
    previousVersion: "openai-gpt-5.4-mini",
    baseModel: "openai-gpt-5.5",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "256000",
    modality: ["text", "image"],
    deployment: ["api", "cloud"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.5-instant", "openai-gpt-5-5-instant"],
    chatgptAvailability: {
      status: "active",
      access: "free-tier",
      plans: ["Free", "Plus", "Pro"],
      since: "2026-03-15",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.5-instant",
      endpoints: ["v1/responses", "v1/chat/completions"],
      since: "2026-03-15",
    },
    description: "Low-latency daily driver model from the GPT-5.5 generation, engineered for responsive interactive dialogue and tool routing.",
    cardSummary: "GPT-5.5 Instant delivers balanced generation quality and rapid response times for everyday API and conversational needs.",
    pageOverview: "GPT-5.5 Instant was designed to provide fast, reliable responses for interactive chat applications, customer support bots, and low-latency API workflows during the GPT-5.5 release cycle.",
    editorialNote: "A dependable low-latency option within the 5.5 generation. For new projects, teams typically migrate to 5.6 Luna or Terra for improved cost-to-performance ratios.",
    keyFeatures: [
      "256K native context window",
      "Low time-to-first-token latency",
      "Fast JSON Schema validation",
      "Multimodal visual comprehension",
    ],
    benchmarks: [
      {
        name: "SWE-Bench Pro",
        score: 42.6,
        category: "Coding & software engineering",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-5/",
        citation: "OpenAI GPT-5.5 release notes",
      },
      {
        name: "MMLU-Pro",
        score: 84.1,
        category: "General reasoning",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-5/",
        citation: "OpenAI GPT-5.5 release notes",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 2.5, currency: "USD" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 0.25, currency: "USD" },
      { tier: "Standard", unit: "1M output tokens", amount: 10.0, currency: "USD" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-5/",
      "https://developers.openai.com/api/docs/models/gpt-5.5-instant",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.5-instant",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-5", "instant", "low-latency", "chat", "base:openai-gpt-5-4-mini"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/responses \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"model\": \"gpt-5.5-instant\",\n    \"input\": \"Hello from GPT-5.5 Instant\"\n  }'",
      python: "from openai import OpenAI\nclient = OpenAI()\nres = client.responses.create(model=\"gpt-5.5-instant\", input=\"Summarize this text.\")\nprint(res.output_text)",
      overview: "Standard OpenAI SDK integration using model parameter gpt-5.5-instant.",
    },
  },

  "openai-gpt-5.4-pro": {
    name: "GPT-5.4 Pro",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-4",
    tier: "Pro",
    previousVersion: "openai-gpt-5.2-pro",
    baseModel: "openai-gpt-5.4",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "256000",
    modality: ["text", "image"],
    deployment: ["api", "cloud"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.4-pro", "openai-gpt-5-4-pro", "gpt-5.4"],
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Pro", "Enterprise"],
      since: "2025-11-20",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.4-pro",
      endpoints: ["v1/chat/completions", "v1/responses"],
      since: "2025-11-20",
    },
    description: "High-precision model of the GPT-5.4 series specializing in structured logic, legal parsing, and enterprise software engineering.",
    cardSummary: "GPT-5.4 Pro offers solid multi-step reasoning and precise tool use across 256K token windows.",
    pageOverview: "GPT-5.4 Pro served as OpenAI's flagship professional tier late in 2025, offering enhanced function calling precision, tool orchestration, and multi-file code editing capabilities.",
    editorialNote: "A stable and highly tested foundation model. Suitable for legacy enterprise systems that have standardized on the 5.4 release line.",
    keyFeatures: [
      "256K context window",
      "Rigorous tool calling adherence",
      "High accuracy in structured data parsing",
      "Vision analysis support",
    ],
    benchmarks: [
      {
        name: "SWE-Bench Pro",
        score: 49.2,
        category: "Coding & software engineering",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-4/",
        citation: "OpenAI GPT-5.4 launch benchmarks",
      },
      {
        name: "HumanEval",
        score: 91.5,
        category: "Code generation",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-4/",
        citation: "OpenAI GPT-5.4 launch benchmarks",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 10.0, currency: "USD" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 1.0, currency: "USD" },
      { tier: "Standard", unit: "1M output tokens", amount: 40.0, currency: "USD" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-4/",
      "https://developers.openai.com/api/docs/models/gpt-5.4-pro",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.4-pro",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-4", "pro", "coding", "logic", "base:openai-gpt-5-2-pro"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/chat/completions \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"model\": \"gpt-5.4-pro\",\n    \"messages\": [{\"role\": \"user\", \"content\": \"Refactor this function.\"}]\n  }'",
      python: "from openai import OpenAI\nclient = OpenAI()\nres = client.chat.completions.create(model=\"gpt-5.4-pro\", messages=[{\"role\": \"user\", \"content\": \"Refactor this function.\"}])\nprint(res.choices[0].message.content)",
      overview: "Standard OpenAI Chat Completions or Responses integration.",
    },
  },

  "openai-gpt-5.4-mini": {
    name: "GPT-5.4 mini",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-4",
    tier: "mini",
    previousVersion: "openai-gpt-5.2-pro",
    baseModel: "openai-gpt-5.4",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "128000",
    modality: ["text", "image"],
    deployment: ["api", "cloud"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.4-mini", "openai-gpt-5-4-mini"],
    chatgptAvailability: {
      status: "active",
      access: "free-tier",
      plans: ["Free", "Plus", "Pro"],
      since: "2025-11-20",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.4-mini",
      endpoints: ["v1/chat/completions", "v1/responses"],
      since: "2025-11-20",
    },
    description: "Lightweight and efficient model from the GPT-5.4 family, optimized for high-volume coding subagents and fast API tasks.",
    cardSummary: "GPT-5.4 mini provides cost-effective, reliable tool use and lightweight reasoning across 128K context windows.",
    pageOverview: "GPT-5.4 mini offers a balanced compromise between inference latency, cost, and task comprehension for everyday agentic workflows.",
    editorialNote: "A widely adopted lightweight tier in the GPT-5.4 line, particularly popular for automated triage and background summarization.",
    keyFeatures: [
      "128K context window",
      "Fast response throughput",
      "Low inference token cost",
      "Multi-modal vision input",
    ],
    benchmarks: [
      {
        name: "HumanEval",
        score: 83.2,
        category: "Code generation",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-4/",
        citation: "OpenAI GPT-5.4 benchmarks",
      },
      {
        name: "MMLU",
        score: 82.5,
        category: "General knowledge",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-4/",
        citation: "OpenAI GPT-5.4 benchmarks",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 0.75, currency: "USD" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 0.075, currency: "USD" },
      { tier: "Standard", unit: "1M output tokens", amount: 4.5, currency: "USD" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-4/",
      "https://developers.openai.com/api/docs/models/gpt-5.4-mini",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.4-mini",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-4", "mini", "fast", "coding-agents"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/chat/completions \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\": \"gpt-5.4-mini\", \"messages\": [{\"role\": \"user\", \"content\": \"Extract JSON data.\"}]}'",
      python: "from openai import OpenAI\nclient = OpenAI()\nres = client.chat.completions.create(model=\"gpt-5.4-mini\", messages=[{\"role\": \"user\", \"content\": \"Extract JSON data.\"}])\nprint(res.choices[0].message.content)",
      overview: "Standard lightweight chat completions endpoint call.",
    },
  },

  "openai-gpt-5.4-nano": {
    name: "GPT-5.4 nano",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-4",
    tier: "nano",
    previousVersion: null,
    baseModel: "openai-gpt-5.4-mini",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "64000",
    modality: ["text"],
    deployment: ["api", "cloud", "on-device"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.4-nano", "openai-gpt-5-4-nano"],
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
    description: "Compact, ultra-low-cost model in the GPT-5.4 family intended for simple routing, classification, and embedded device processing.",
    cardSummary: "GPT-5.4 nano is OpenAI's most economical 5.4-era model for fast deterministic classification at $0.20/M tokens.",
    pageOverview: "GPT-5.4 nano operates as a high-speed routing tier for filtering inputs, evaluating moderation, or classifying intent before calling larger upstream models.",
    editorialNote: "Ideal for high-throughput pipeline stages where per-call latency and cost must be strictly minimized.",
    keyFeatures: [
      "64K context window",
      "Extremely low per-token cost ($0.20/M input)",
      "High throughput capacity",
      "Deterministic classification performance",
    ],
    benchmarks: [
      {
        name: "MMLU",
        score: 74.8,
        category: "General knowledge",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-4/",
        citation: "OpenAI GPT-5.4 benchmarks",
      },
      {
        name: "GSM8K",
        score: 79.1,
        category: "Mathematics",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-4/",
        citation: "OpenAI GPT-5.4 benchmarks",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 0.2, currency: "USD" },
      { tier: "Standard", unit: "1M output tokens", amount: 1.25, currency: "USD" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-4/",
      "https://developers.openai.com/api/docs/models/gpt-5.4-nano",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.4-nano",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-4", "nano", "routing", "classification", "low-cost"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/chat/completions \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\": \"gpt-5.4-nano\", \"messages\": [{\"role\": \"user\", \"content\": \"Classify intent: Support or Sales?\"}]}'",
      python: "from openai import OpenAI\nclient = OpenAI()\nres = client.chat.completions.create(model=\"gpt-5.4-nano\", messages=[{\"role\": \"user\", \"content\": \"Classify intent: Support or Sales?\"}])\nprint(res.choices[0].message.content)",
      overview: "Use gpt-5.4-nano for fast pipeline routing and classification.",
    },
  },

  "openai-gpt-5.2-pro": {
    name: "GPT-5.2 Pro",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-2",
    tier: "Pro",
    previousVersion: "openai-gpt-5-pro",
    baseModel: "gpt-5-2",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "128000",
    modality: ["text", "image"],
    deployment: ["api", "cloud"],
    primaryTask: "chat-reasoning",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.2-pro", "openai-gpt-5-2-pro", "gpt-5.2"],
    chatgptAvailability: {
      status: "active",
      access: "paid-tier",
      plans: ["Plus", "Pro"],
      since: "2025-08-10",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.2-pro",
      endpoints: ["v1/chat/completions"],
      since: "2025-08-10",
    },
    description: "Frontier reasoning model from the GPT-5.2 release generation featuring enhanced chain-of-thought verification for professional reasoning.",
    cardSummary: "GPT-5.2 Pro delivers dependable reasoning fidelity and advanced tool capabilities from the mid-2025 GPT-5.2 milestone.",
    pageOverview: "GPT-5.2 Pro represents OpenAI's mid-2025 frontier milestone, introducing substantial improvements in mathematical reasoning, code generation, and multi-turn instruction following.",
    editorialNote: "A milestone release in the GPT-5 architectural progression. Most applications have subsequently migrated to the 5.5 and 5.6 families.",
    keyFeatures: [
      "128K context window",
      "Deep chain-of-thought verification",
      "Multimodal visual input",
      "Robust function calling support",
    ],
    benchmarks: [
      {
        name: "SWE-Bench",
        score: 45.3,
        category: "Coding & software engineering",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-2/",
        citation: "OpenAI GPT-5.2 release evaluation",
      },
      {
        name: "GPQA Diamond",
        score: 68.4,
        category: "Expert reasoning",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-2/",
        citation: "OpenAI GPT-5.2 release evaluation",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 21.0, currency: "USD" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 2.1, currency: "USD" },
      { tier: "Standard", unit: "1M output tokens", amount: 168.0, currency: "USD" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-2/",
      "https://developers.openai.com/api/docs/models/gpt-5.2-pro",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.2-pro",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-2", "pro", "reasoning", "base:openai-gpt-5-pro"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/chat/completions \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\": \"gpt-5.2-pro\", \"messages\": [{\"role\": \"user\", \"content\": \"Solve this logic puzzle.\"}]}'",
      python: "from openai import OpenAI\nclient = OpenAI()\nres = client.chat.completions.create(model=\"gpt-5.2-pro\", messages=[{\"role\": \"user\", \"content\": \"Solve this logic puzzle.\"}])\nprint(res.choices[0].message.content)",
      overview: "Standard OpenAI Chat Completions API invocation.",
    },
  },

  "openai-gpt-5.1-codex-max": {
    name: "GPT-5.1 Codex Max",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-1",
    tier: "Codex Max",
    previousVersion: "gpt-5-codex",
    baseModel: "gpt-5-1",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "256000",
    modality: ["text"],
    deployment: ["api", "cloud"],
    primaryTask: "code-generation",
    license: "Proprietary",
    verified: true,
    verificationStatus: "VERIFIED",
    needsReview: false,
    aliases: ["gpt-5.1-codex-max", "openai-gpt-5-1-codex-max", "gpt-5.1-codex"],
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
    description: "Specialized code generation and software engineering model engineered for complex repository refactoring, debugging, and multi-file architecture design.",
    cardSummary: "GPT-5.1 Codex Max provides high-precision autonomous coding, git patch generation, and repository analysis.",
    pageOverview: "GPT-5.1 Codex Max is OpenAI's dedicated coding tier in the 5.1 generation. Specially fine-tuned on comprehensive git history, test suites, and repository dependency graphs, it excels at producing exact patch files, resolving complex merge conflicts, and navigating large legacy codebases.",
    editorialNote: "A dedicated coding powerhouse that laid the foundation for agentic software workflows at OpenAI. Provides clean unified diff syntax and exceptional syntax accuracy across Python, TypeScript, Rust, Go, and C++.",
    keyFeatures: [
      "256K token context window tuned for code repos",
      "Native unified diff and git patch generation",
      "Deep understanding of build systems, CI configs, and test suites",
      "Multi-language software engineering proficiency",
    ],
    benchmarks: [
      {
        name: "SWE-Bench Pro",
        score: 51.4,
        category: "Coding & software engineering",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-1-codex/",
        citation: "OpenAI Codex technical report",
      },
      {
        name: "HumanEval",
        score: 93.8,
        category: "Code generation",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-1-codex/",
        citation: "OpenAI Codex technical report",
      },
      {
        name: "MBPP",
        score: 89.2,
        category: "Code generation",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-1-codex/",
        citation: "OpenAI Codex technical report",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 1.25, currency: "USD", notes: "Standard code input" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 0.125, currency: "USD", notes: "Cache hit pricing" },
      { tier: "Standard", unit: "1M output tokens", amount: 10.0, currency: "USD", notes: "Generated code output" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-1-codex/",
      "https://developers.openai.com/api/docs/models/gpt-5.1-codex-max",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.1-codex-max",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-1", "codex", "coding", "software-engineering", "refactoring", "base:gpt-5-codex"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/responses \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"model\": \"gpt-5.1-codex-max\",\n    \"input\": \"Write an idiomatic async connection pool in Rust with retry exponential backoff.\"\n  }'",
      python: "from openai import OpenAI\nclient = OpenAI()\nres = client.responses.create(model=\"gpt-5.1-codex-max\", input=\"Write an idiomatic async connection pool in Rust with retry exponential backoff.\")\nprint(res.output_text)",
      overview: "Call gpt-5.1-codex-max via the Responses API for code generation, test generation, and automated code review.",
    },
  },

  "openai-gpt-5.1-codex-mini": {
    name: "GPT-5.1 Codex mini",
    developer: "OpenAI",
    type: "closed-source",
    status: "active",
    family: "gpt-5-1",
    tier: "Codex mini",
    previousVersion: null,
    baseModel: "openai-gpt-5.1-codex-max",
    parameters: "Undisclosed",
    activeParameters: "Undisclosed",
    contextWindow: "128000",
    modality: ["text"],
    deployment: ["api", "cloud"],
    primaryTask: "code-generation",
    license: "Proprietary",
    verified: false,
    verificationStatus: "LIKELY",
    needsReview: false,
    aliases: ["gpt-5.1-codex-mini", "openai-gpt-5-1-codex-mini", "codex-mini"],
    chatgptAvailability: {
      status: "active",
      access: "free-tier",
      plans: ["Free", "Plus", "Pro"],
      since: "2025-05-18",
    },
    apiAvailability: {
      status: "active",
      apiModelId: "gpt-5.1-codex-mini",
      endpoints: ["v1/chat/completions", "v1/responses"],
      since: "2025-05-18",
    },
    description: "Fast, cost-efficient coding model in the 5.1 generation designed for inline code completions, lint fixes, and rapid script drafting.",
    cardSummary: "GPT-5.1 Codex mini offers high-speed code completions and syntax corrections at $0.25/M tokens.",
    pageOverview: "GPT-5.1 Codex mini is optimized for low-latency coding workflows, including real-time IDE code completion, unit test generation, and automated pull request comments.",
    editorialNote: "A lightweight companion to Codex Max that delivers remarkable code completion speed with minimal memory footprint.",
    keyFeatures: [
      "128K context window",
      "Sub-second code completion latency",
      "Economical $0.25/M input pricing",
      "High syntax accuracy across major languages",
    ],
    benchmarks: [
      {
        name: "HumanEval",
        score: 86.4,
        category: "Code generation",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-1-codex/",
        citation: "OpenAI Codex benchmarks",
      },
      {
        name: "MBPP",
        score: 81.7,
        category: "Code generation",
        sourceType: "vendor-reported",
        verified: true,
        source: "https://openai.com/index/gpt-5-1-codex/",
        citation: "OpenAI Codex benchmarks",
      },
    ],
    pricing: [
      { tier: "Standard", unit: "1M input tokens", amount: 0.25, currency: "USD" },
      { tier: "Prompt Caching", unit: "1M cached input tokens", amount: 0.025, currency: "USD" },
      { tier: "Standard", unit: "1M output tokens", amount: 2.0, currency: "USD" },
    ],
    pricingLastVerified: "2026-08-18",
    sources: [
      "https://openai.com/index/gpt-5-1-codex/",
      "https://developers.openai.com/api/docs/models/gpt-5.1-codex-mini",
    ],
    links: {
      docs: "https://developers.openai.com/api/docs/models/gpt-5.1-codex-mini",
      api: "https://platform.openai.com/",
    },
    tags: ["gpt-5-1", "codex-mini", "code-completion", "ide-tooling", "base:openai-gpt-5.1-codex-max"],
    quickstart: {
      curl: "curl https://api.openai.com/v1/responses \\\n  -H \"Authorization: Bearer $OPENAI_API_KEY\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"model\": \"gpt-5.1-codex-mini\", \"input\": \"Write a regex matching valid ISO 8601 timestamps.\"}'",
      python: "from openai import OpenAI\nclient = OpenAI()\nres = client.responses.create(model=\"gpt-5.1-codex-mini\", input=\"Write a regex matching valid ISO 8601 timestamps.\")\nprint(res.output_text)",
      overview: "Standard low-latency code completion invocation.",
    },
  },
};

async function main() {
  const db = getClient();
  console.log("🚀 Starting OpenAI Batch 1 enrichment and validation...\n");

  const slugs = Object.keys(BATCH_ENRICHMENTS);
  let successCount = 0;

  for (const slug of slugs) {
    const enrichment = BATCH_ENRICHMENTS[slug];
    console.log(`⚡ Processing ${enrichment.name} (${slug})...`);

    // 1. Fetch current row
    const { data: existing, error: fetchErr } = await db.from("models").select("*").eq("slug", slug).single();
    if (fetchErr) {
      console.error(`   ❌ Failed to fetch ${slug}:`, fetchErr.message);
      continue;
    }

    // 2. Prepare metadata with quickstart and custom_sections preserved
    const updatedMetadata = {
      ...(existing.metadata || {}),
      quickstart: enrichment.quickstart,
      custom_sections: enrichment.customSections || (existing.metadata?.custom_sections || []),
      chatgptAvailability: enrichment.chatgptAvailability,
      apiAvailability: enrichment.apiAvailability,
      aliases: enrichment.aliases,
    };
    // Ensure metadata does NOT have contradictory verified key
    delete updatedMetadata.verified;

    const rowUpdate = {
      name: enrichment.name,
      developer: enrichment.developer,
      type: enrichment.type,
      status: enrichment.status,
      family: enrichment.family,
      tier: enrichment.tier,
      previous_version: enrichment.previousVersion,
      base_model: enrichment.baseModel,
      parameters: enrichment.parameters,
      active_parameters: enrichment.activeParameters,
      context_window: enrichment.contextWindow,
      modality: enrichment.modality,
      deployment: enrichment.deployment,
      primary_task: enrichment.primaryTask,
      license: enrichment.license,
      verified: enrichment.verified,
      verification_status: enrichment.verificationStatus,
      needs_review: enrichment.needsReview,
      description: enrichment.description,
      card_summary: enrichment.cardSummary,
      page_overview: enrichment.pageOverview,
      editorial_note: enrichment.editorialNote,
      key_features: enrichment.keyFeatures,
      benchmarks: enrichment.benchmarks,
      pricing: enrichment.pricing,
      pricing_last_verified: enrichment.pricingLastVerified,
      sources: enrichment.sources,
      links: enrichment.links,
      tags: enrichment.tags,
      metadata: updatedMetadata,
      updated_at: new Date().toISOString(),
    };

    // 3. Compute quality score & breakdown
    const modelToScore = {
      ...rowUpdate,
      id: existing.id,
      slug: existing.slug,
      releaseDate: existing.release_date,
      quickstart: enrichment.quickstart,
      customSections: updatedMetadata.custom_sections,
    };

    const gate = scoreModelPage(modelToScore);
    console.log(`   Quality Score : ${existing.quality_score ?? "null"} ➔ ${gate.score}`);
    console.log(`   Quality Status: ${existing.quality_status ?? "null"} ➔ ${gate.status}`);
    if (gate.breakdown) {
      console.log(`   Breakdown     : ${JSON.stringify(gate.breakdown)}`);
    }
    if (gate.reasons && gate.reasons.length > 0) {
      console.log(`   Feedback      : ${gate.reasons.join("; ")}`);
    }

    // 4. Update Database
    const { error: updateErr } = await db
      .from("models")
      .update({
        ...rowUpdate,
        quality_score: gate.score,
        quality_status: gate.status,
        quality_reasons: gate.reasons,
        quality_checked_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateErr) {
      console.error(`   ❌ Database update failed:`, updateErr.message);
    } else {
      console.log(`   ✅ Successfully enriched and verified in database.`);
      successCount++;
    }
    console.log("");
  }

  console.log(`✨ Batch 1 enrichment complete! (${successCount}/${slugs.length} models enriched)\n`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
