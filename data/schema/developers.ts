export const DEVELOPERS = [
  "OpenAI",
  "Anthropic",
  "Google DeepMind",
  "Meta",
  "Mistral AI",
  "Cohere",
  "DeepSeek",
  "xAI",
  "Stability AI",
  "Other",
] as const;

export type DeveloperType = typeof DEVELOPERS[number];
