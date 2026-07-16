const fs = require('fs');
const path = require('path');

const candidates = require('../help/ai_models_full.json');
const modelsArchive = require('../src/lib/models-archive.json');

const DEVELOPERS_ENUM = [
  "OpenAI",
  "Anthropic",
  "Google DeepMind",
  "Meta",
  "Mistral AI",
  "Cohere",
  "DeepSeek",
  "xAI",
  "Stability AI",
  "Alibaba",
  "Microsoft",
  "Black Forest Labs",
  "Midjourney",
  "Runway",
  "Kuaishou",
  "Suno",
  "ByteDance",
  "Tencent",
  "Other"
];

// Helper to check if model already exists
const existingNames = new Set(modelsArchive.map(m => m.name.toLowerCase()));
const existingSlugs = new Set(modelsArchive.map(m => m.slug.toLowerCase()));

const triage = {
  include: [],
  needsInfo: [],
  exclude: []
};

for (const cand of candidates) {
  const name = cand.name;
  const link = cand.link;
  
  // 1. Link is null or unrecoverable -> Exclude
  if (!link) {
    triage.exclude.push({
      ...cand,
      reason: "Link is null/unrecoverable"
    });
    continue;
  }

  // 2. Hardware / Non-models -> Exclude
  if (name.includes("RTX Spark") || name.includes("Majorana 2")) {
    triage.exclude.push({
      ...cand,
      reason: "Not an AI model (hardware/quantum chip)"
    });
    continue;
  }

  // 3. Deduplicate against existing catalog
  const normalizedName = name.toLowerCase();
  const possibleSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (existingNames.has(normalizedName) || existingSlugs.has(possibleSlug)) {
    triage.exclude.push({
      ...cand,
      reason: "Duplicate: already present in catalog"
    });
    continue;
  }

  // Special checks for specific items:
  // - "Claude Sonnet 5 (Anthropic)" -> our catalog already has "anthropic-claude-sonnet-5.json" or similar
  if (normalizedName.includes("claude sonnet 5") || normalizedName.includes("opus 4.8")) {
    triage.exclude.push({
      ...cand,
      reason: "Duplicate: matches Claude Sonnet 5 / Opus 4.8"
    });
    continue;
  }

  // 4. Scope triage: Check recognized company affiliation or academic
  let isAffiliated = false;
  let devName = "Academic/Research";
  let institution = "";

  if (normalizedName.includes("(nvidia)") || link.includes("nvidia.com") || link.includes("nvidia.github.io") || link.includes("research.nvidia.com")) {
    isAffiliated = true;
    devName = "Other"; // Keep to "Other" or "Academic/Research" until we decide. Let's label them. We'll set developer to "Other" or "Academic/Research" and institution to "NVIDIA" if we want to follow Option A.
    institution = "NVIDIA";
  } else if (normalizedName.includes("(google)") || normalizedName.includes("deepmind") || link.includes("google.com") || link.includes("googleblog") || link.includes("deepmind")) {
    isAffiliated = true;
    devName = "Google DeepMind";
  } else if (normalizedName.includes("(meta)") || link.includes("ai.meta.com") || link.includes("facebookresearch")) {
    isAffiliated = true;
    devName = "Meta";
  } else if (normalizedName.includes("(anthropic)") || link.includes("anthropic.com")) {
    isAffiliated = true;
    devName = "Anthropic";
  } else if (normalizedName.includes("(openai)") || link.includes("openai.com")) {
    isAffiliated = true;
    devName = "OpenAI";
  } else if (normalizedName.includes("(microsoft)") || link.includes("microsoft.com") || link.includes("microsoft.ai")) {
    isAffiliated = true;
    devName = "Microsoft";
  } else if (normalizedName.includes("(tencent)") || link.includes("tencent") || link.includes("huggingface.co/tencent")) {
    isAffiliated = true;
    devName = "Tencent";
  } else if (normalizedName.includes("(alibaba)") || normalizedName.includes("qwen") || link.includes("qwen.ai") || link.includes("alibaba")) {
    isAffiliated = true;
    devName = "Alibaba";
  } else if (normalizedName.includes("(stability ai)") || link.includes("stability.ai")) {
    isAffiliated = true;
    devName = "Stability AI";
  } else if (normalizedName.includes("(stepfun)") || link.includes("stepfun")) {
    isAffiliated = true;
    devName = "Other";
    institution = "StepFun";
  } else if (normalizedName.includes("(openbmb)") || link.includes("openbmb")) {
    isAffiliated = true;
    devName = "Academic/Research";
    institution = "OpenBMB";
  } else if (normalizedName.includes("(zhipu ai)") || link.includes("zhipu")) {
    isAffiliated = true;
    devName = "Other";
    institution = "Zhipu AI";
  }

  // Academic detection: Github pages of university, mpichars, Max Planck, Princeton, RUC, UM-Lab, NJU
  let academicInstitution = "";
  if (link.includes("github.io")) {
    const matches = link.match(/https?:\/\/([a-zA-Z0-9\-]+)\.github\.io/);
    if (matches && matches[1]) {
      academicInstitution = matches[1];
    }
  }

  if (link.includes("princeton.github.io")) {
    academicInstitution = "Princeton University";
  } else if (link.includes("ruc-nlpir.github.io")) {
    academicInstitution = "Renmin University of China";
  } else if (link.includes("um-lab.github.io")) {
    academicInstitution = "University of Macau";
  } else if (link.includes("nju-pcalab.github.io")) {
    academicInstitution = "Nanjing University";
  } else if (link.includes("tue.mpg.de") || link.includes("mpi-inf.mpg.de")) {
    academicInstitution = "Max Planck Institute";
  } else if (link.includes("grfia.dlsi.ua.es")) {
    academicInstitution = "University of Alicante";
  }

  // Check if link is too generic (like open llm leaderboard or main blog page) -> Needs Info
  if (link === "https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard" || 
      link === "https://blog.google/innovation-and-ai/") {
    triage.needsInfo.push({
      ...cand,
      reason: "Link is generic (e.g. main blog page or leaderboard), needs specific model article URL"
    });
    continue;
  }

  if (isAffiliated) {
    triage.include.push({
      ...cand,
      devName,
      institution: institution,
      reason: "Affiliated with recognized lab/company research team"
    });
  } else if (academicInstitution) {
    triage.include.push({
      ...cand,
      devName: "Academic/Research",
      institution: academicInstitution,
      reason: "Academic research with released weights/code/demo site"
    });
  } else {
    triage.needsInfo.push({
      ...cand,
      reason: "Unclear affiliation, unverified traction, or needs custom audit"
    });
  }
}

console.log(JSON.stringify(triage, null, 2));
