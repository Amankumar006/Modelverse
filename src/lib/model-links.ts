import type { ModelRow } from "@/types/database";

export interface ResolvedModelLink {
  key: string;
  label: string;
  url: string;
  type: "github" | "huggingface" | "docs" | "paper" | "ollama" | "openrouter" | "website" | "announcement" | "other";
}

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveModelLinks(model: ModelRow): ResolvedModelLink[] {
  const result: ResolvedModelLink[] = [];
  const seenUrls = new Set<string>();

  const addLink = (
    key: string,
    url: string | null | undefined,
    fallbackLabel: string,
    type: ResolvedModelLink["type"]
  ) => {
    if (!url || typeof url !== "string" || !isValidHttpUrl(url)) return;
    const cleanUrl = url.trim();
    if (seenUrls.has(cleanUrl)) return;
    seenUrls.add(cleanUrl);

    result.push({
      key,
      label: fallbackLabel,
      url: cleanUrl,
      type,
    });
  };

  // 1. Announcement URL
  if (model.announcement_url) {
    addLink("announcement", model.announcement_url, "Announcement Blog", "announcement");
  }

  // 2. Custom links object
  const rawLinks = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, string>;

  for (const [key, value] of Object.entries(rawLinks)) {
    if (typeof value !== "string" || !isValidHttpUrl(value)) continue;

    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("github") || lowerKey.includes("repo") || lowerKey.includes("code")) {
      addLink(key, value, "GitHub Repository", "github");
    } else if (lowerKey.includes("huggingface") || lowerKey === "hf") {
      addLink(key, value, "Hugging Face Model", "huggingface");
    } else if (lowerKey.includes("doc") || lowerKey.includes("api")) {
      addLink(key, value, "Developer Docs", "docs");
    } else if (lowerKey.includes("paper") || lowerKey.includes("arxiv") || lowerKey.includes("pdf")) {
      addLink(key, value, "Research Paper", "paper");
    } else if (lowerKey.includes("ollama")) {
      addLink(key, value, "Ollama Library", "ollama");
    } else if (lowerKey.includes("openrouter")) {
      addLink(key, value, "OpenRouter API", "openrouter");
    } else if (lowerKey.includes("website") || lowerKey.includes("portal") || lowerKey.includes("home")) {
      addLink(key, value, "Official Website", "website");
    } else {
      const formatted = key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      addLink(key, value, formatted, "other");
    }
  }

  return result;
}
