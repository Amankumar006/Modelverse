export const PROVIDER_LOGOS: Record<string, string> = {
  openai: "/logos/openai.svg",
  anthropic: "/logos/anthropic.svg",
  google: "/logos/google.svg",
  "google deepmind": "/logos/google-deepmind.svg",
  meta: "/logos/meta.svg",
  mistral: "/logos/mistral.svg",
  "mistral ai": "/logos/mistral.svg",
  alibaba: "/logos/alibaba.svg",
  "alibaba cloud": "/logos/alibaba.svg",
  qwen: "/logos/alibaba.svg",
  deepseek: "/logos/deepseek.svg",
  cohere: "/logos/cohere.svg",
  microsoft: "/logos/microsoft.svg",
  xai: "/logos/xai.svg",
  nvidia: "/logos/nvidia.svg",
  stability: "/logos/stability.svg",
  "stability ai": "/logos/stability.svg",
  moonshot: "/logos/moonshot.svg",
  "moonshot ai": "/logos/moonshot.svg",
  bytedance: "/logos/bytedance.svg",
  minimax: "/logos/minimax.svg",
  tencent: "/logos/tencent.svg",
  midjourney: "/logos/midjourney.svg",
  runway: "/logos/runway.svg",
  suno: "/logos/suno.svg",
  apple: "/logos/apple.svg",
  bfl: "/logos/bfl.svg",
  "black forest labs": "/logos/bfl.svg",
  kuaishou: "/logos/kuaishou.svg",
  sakana: "/logos/sakana.svg",
  "sakana ai": "/logos/sakana.svg",
  academic: "/logos/academic.svg",
  "academic research": "/logos/academic.svg",
  huggingface: "/logos/huggingface.svg",
};

export function getProviderLogo(providerName?: string | null): string {
  if (!providerName) return "/logos/default.svg";
  const normalized = providerName.toLowerCase().trim();

  for (const [key, path] of Object.entries(PROVIDER_LOGOS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return path;
    }
  }

  return "/logos/default.svg";
}
