export const LICENSES = [
  "Apache 2.0",
  "MIT",
  "Proprietary",
  "Llama Community License",
  "Gemma Terms of Use",
  "Stability AI Community License",
  "Other/Custom",
] as const;

export type LicenseType = typeof LICENSES[number];
