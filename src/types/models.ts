export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ModelPricing = {
  input_per_1m?: number;
  output_per_1m?: number;
  input_cached_per_1m?: number;
  training_per_1m?: number;
  [key: string]: Json | undefined;
};

export type ModelLinks = {
  website?: string;
  docs?: string;
  paper?: string;
  github?: string;
  huggingface?: string;
  [key: string]: Json | undefined;
};

export type ModelRow = {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: string | null;
  description: string | null;
  context_window: number | null;
  parameters: string | null;
  modalities: Json;
  pricing: Json;
  benchmarks: Json;
  links: Json;
  release_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ModelInsert = {
  id?: string;
  slug: string;
  name: string;
  provider: string;
  category?: string | null;
  description?: string | null;
  context_window?: number | null;
  parameters?: string | null;
  modalities?: Json;
  pricing?: Json;
  benchmarks?: Json;
  links?: Json;
  release_date?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ModelUpdate = {
  id?: string;
  slug?: string;
  name?: string;
  provider?: string;
  category?: string | null;
  description?: string | null;
  context_window?: number | null;
  parameters?: string | null;
  modalities?: Json;
  pricing?: Json;
  benchmarks?: Json;
  links?: Json;
  release_date?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
};
