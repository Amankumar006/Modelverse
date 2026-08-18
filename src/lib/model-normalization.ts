/**
 * Data normalization utilities for Modelverse model records.
 * Ensures backward compatibility across diverse data shapes, handles stringified newlines,
 * and formats metadata cleanly for developer documentation rendering.
 */

export function unescapeNewlines(val: unknown): string {
  if (typeof val !== "string") return "";
  // Unescape double-escaped or literal "\\n" and "\\r\\n" into real newlines
  return val
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t");
}

export function safeString(val: unknown, fallback: string = ""): string {
  if (typeof val === "string") return val.trim();
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return fallback;
}

export function safeArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) {
    return [val.trim()];
  }
  return [];
}

export interface NormalizedQuickstart {
  hasContent: boolean;
  overview?: string;
  codeExamples: {
    language: string;
    label: string;
    code: string;
  }[];
  prerequisites?: string[];
  installation?: Record<string, string> | string;
  environment?: Record<string, string> | string[] | string;
  firstRequest?: string;
  responseHandling?: string | Record<string, string>;
  productionNotes?: string[];
}

export function normalizeQuickstart(rawQuickstart: unknown): NormalizedQuickstart {
  if (!rawQuickstart || typeof rawQuickstart !== "object") {
    return { hasContent: false, codeExamples: [] };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qs = rawQuickstart as Record<string, any>;

  const languagePriority = ["curl", "python", "javascript", "typescript", "bash", "go", "rust"];
  const languageLabels: Record<string, string> = {
    curl: "cURL",
    python: "Python",
    javascript: "JavaScript",
    typescript: "TypeScript",
    bash: "Bash",
    go: "Go",
    rust: "Rust",
  };

  const codeExamples: { language: string; label: string; code: string }[] = [];

  // Add priority languages first if present
  for (const lang of languagePriority) {
    if (typeof qs[lang] === "string" && qs[lang].trim()) {
      codeExamples.push({
        language: lang,
        label: languageLabels[lang] || lang,
        code: unescapeNewlines(qs[lang]),
      });
    }
  }

  // Add any other languages present in quickstart
  for (const [key, value] of Object.entries(qs)) {
    const lowerKey = key.toLowerCase();
    if (
      !languagePriority.includes(lowerKey) &&
      !["overview", "prerequisites", "installation", "environment", "env", "firstrequest", "responsehandling", "productionnotes"].includes(lowerKey) &&
      typeof value === "string" &&
      value.trim()
    ) {
      codeExamples.push({
        language: lowerKey,
        label: languageLabels[lowerKey] || key.charAt(0).toUpperCase() + key.slice(1),
        code: unescapeNewlines(value),
      });
    }
  }

  // Extract overview
  const overview = typeof qs.overview === "string" && qs.overview.trim() ? unescapeNewlines(qs.overview) : undefined;

  // Extract prerequisites
  let prerequisites: string[] | undefined;
  if (Array.isArray(qs.prerequisites)) {
    prerequisites = qs.prerequisites.map((item: unknown) => safeString(item)).filter(Boolean);
  } else if (typeof qs.prerequisites === "string" && qs.prerequisites.trim()) {
    prerequisites = [unescapeNewlines(qs.prerequisites)];
  }

  // Extract installation
  let installation: Record<string, string> | string | undefined;
  if (typeof qs.installation === "string" && qs.installation.trim()) {
    installation = unescapeNewlines(qs.installation);
  } else if (qs.installation && typeof qs.installation === "object") {
    installation = {};
    for (const [k, v] of Object.entries(qs.installation)) {
      if (typeof v === "string" && v.trim()) {
        installation[k] = unescapeNewlines(v);
      }
    }
    if (Object.keys(installation).length === 0) installation = undefined;
  }

  // Extract environment variables
  let environment: Record<string, string> | string[] | string | undefined;
  const envSource = qs.environment || qs.env;
  if (typeof envSource === "string" && envSource.trim()) {
    environment = unescapeNewlines(envSource);
  } else if (Array.isArray(envSource)) {
    environment = envSource.map((item: unknown) => safeString(item)).filter(Boolean);
  } else if (envSource && typeof envSource === "object") {
    environment = {};
    for (const [k, v] of Object.entries(envSource)) {
      if (typeof v === "string" && v.trim()) {
        (environment as Record<string, string>)[k] = unescapeNewlines(v);
      }
    }
    if (Object.keys(environment).length === 0) environment = undefined;
  }

  // Extract first request
  const firstRequest = typeof qs.firstRequest === "string" && qs.firstRequest.trim() ? unescapeNewlines(qs.firstRequest) : undefined;

  // Extract response handling
  let responseHandling: string | Record<string, string> | undefined;
  if (typeof qs.responseHandling === "string" && qs.responseHandling.trim()) {
    responseHandling = unescapeNewlines(qs.responseHandling);
  } else if (qs.responseHandling && typeof qs.responseHandling === "object") {
    responseHandling = {};
    for (const [k, v] of Object.entries(qs.responseHandling)) {
      if (typeof v === "string" && v.trim()) {
        responseHandling[k] = unescapeNewlines(v);
      }
    }
  }

  // Extract production notes
  let productionNotes: string[] | undefined;
  if (Array.isArray(qs.productionNotes)) {
    productionNotes = qs.productionNotes.map((item: unknown) => safeString(item)).filter(Boolean);
  } else if (typeof qs.productionNotes === "string" && qs.productionNotes.trim()) {
    productionNotes = [unescapeNewlines(qs.productionNotes)];
  }

  const hasContent =
    codeExamples.length > 0 ||
    Boolean(overview) ||
    Boolean(prerequisites?.length) ||
    Boolean(installation) ||
    Boolean(environment) ||
    Boolean(firstRequest) ||
    Boolean(productionNotes?.length);

  return {
    hasContent,
    overview,
    codeExamples,
    prerequisites,
    installation,
    environment,
    firstRequest,
    responseHandling,
    productionNotes,
  };
}

export interface NormalizedCustomSection {
  id: string;
  title: string;
  content: string;
  code?: string;
  language?: string;
}

export function normalizeCustomSections(rawSections: unknown): NormalizedCustomSection[] {
  if (!Array.isArray(rawSections)) return [];
  const results: NormalizedCustomSection[] = [];

  for (let i = 0; i < rawSections.length; i++) {
    const sec = rawSections[i];
    if (!sec || typeof sec !== "object") continue;

    const title = safeString(sec.title || sec.name, `Section ${i + 1}`);
    const content = unescapeNewlines(sec.content || sec.description || sec.text || "");
    const id = safeString(sec.id, `custom-sec-${i + 1}`);
    const code = sec.code ? unescapeNewlines(sec.code) : undefined;
    const language = sec.language ? safeString(sec.language) : undefined;

    if (title || content || code) {
      results.push({ id, title, content, code, language });
    }
  }

  return results;
}

export interface NormalizedPricingItem {
  tier?: string;
  unit: string;
  amount: number;
  currency: string;
  notes?: string;
}

export function normalizePricing(rawPricing: unknown): NormalizedPricingItem[] {
  if (!rawPricing) return [];

  // Array format: [{ tier, unit, amount, currency, notes }]
  if (Array.isArray(rawPricing)) {
    const results: NormalizedPricingItem[] = [];
    for (const item of rawPricing) {
      if (!item || typeof item !== "object") continue;
      const amount = typeof item.amount === "number" ? item.amount : parseFloat(item.amount);
      if (isNaN(amount)) continue;
      results.push({
        tier: item.tier ? safeString(item.tier) : undefined,
        unit: safeString(item.unit, "1M tokens"),
        amount,
        currency: safeString(item.currency, "USD"),
        notes: item.notes ? safeString(item.notes) : undefined,
      });
    }
    return results;
  }

  // Object format: { inputPricePerM: 3, outputPricePerM: 15 }
  if (typeof rawPricing === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = rawPricing as Record<string, any>;
    const items: NormalizedPricingItem[] = [];

    if (obj.inputPricePerM !== undefined && !isNaN(parseFloat(obj.inputPricePerM))) {
      items.push({
        tier: "Standard",
        unit: "1M input tokens",
        amount: parseFloat(obj.inputPricePerM),
        currency: "USD",
      });
    }
    if (obj.cachedInputPricePerM !== undefined && !isNaN(parseFloat(obj.cachedInputPricePerM))) {
      items.push({
        tier: "Prompt Caching",
        unit: "1M cached input tokens",
        amount: parseFloat(obj.cachedInputPricePerM),
        currency: "USD",
        notes: "Cache hit pricing",
      });
    }
    if (obj.outputPricePerM !== undefined && !isNaN(parseFloat(obj.outputPricePerM))) {
      items.push({
        tier: "Standard",
        unit: "1M output tokens",
        amount: parseFloat(obj.outputPricePerM),
        currency: "USD",
      });
    }

    return items;
  }

  return [];
}

export interface DomainSource {
  url: string;
  domain: string;
  label: string;
  type?: "docs" | "announcement" | "paper" | "github" | "huggingface" | "benchmark" | "system-card" | "general";
}

export function extractDomainSources(sources: unknown, links: unknown): DomainSource[] {
  const allUrls = new Set<string>();
  const results: DomainSource[] = [];

  // Add links with known keys first
  if (links && typeof links === "object") {
    for (const [key, value] of Object.entries(links)) {
      if (typeof value === "string" && value.startsWith("http")) {
        const url = value.trim();
        allUrls.add(url);
        try {
          const parsed = new URL(url);
          const domain = parsed.hostname.replace(/^www\./, "");
          let type: DomainSource["type"] = "general";
          let label = key;

          if (key === "announcement" || key === "blogPost") {
            type = "announcement";
            label = "Launch Announcement";
          } else if (key === "docs" || key === "modelPage" || key === "official") {
            type = "docs";
            label = "Official Documentation";
          } else if (key === "api") {
            type = "docs";
            label = "API Platform & Reference";
          } else if (key === "paper" || key === "arxiv") {
            type = "paper";
            label = "Research Paper";
          } else if (key === "github") {
            type = "github";
            label = "GitHub Repository";
          } else if (key === "huggingface" || key === "huggingFace") {
            type = "huggingface";
            label = "Hugging Face Model Card";
          } else if (key === "systemCard") {
            type = "system-card";
            label = "System Card & Evaluation";
          }

          results.push({ url, domain, label, type });
        } catch {
          // ignore invalid urls
        }
      }
    }
  }

  // Add sources
  const rawSources = Array.isArray(sources) ? sources : typeof sources === "string" ? [sources] : [];
  for (const item of rawSources) {
    if (typeof item === "string" && item.startsWith("http")) {
      const url = item.trim();
      if (!allUrls.has(url)) {
        allUrls.add(url);
        try {
          const parsed = new URL(url);
          const domain = parsed.hostname.replace(/^www\./, "");
          let label = "Reference Source";
          let type: DomainSource["type"] = "general";

          if (url.includes("arxiv.org")) {
            type = "paper";
            label = "arXiv Research Preprint";
          } else if (url.includes("github.com")) {
            type = "github";
            label = "GitHub Repository";
          } else if (url.includes("huggingface.co")) {
            type = "huggingface";
            label = "Hugging Face Hub";
          } else if (url.includes("system-card") || url.includes("system_card")) {
            type = "system-card";
            label = "Safety & System Card";
          }

          results.push({ url, domain, label, type });
        } catch {
          // ignore
        }
      }
    }
  }

  return results;
}
