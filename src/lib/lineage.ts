import type { ModelRow } from "@/types/database";

export type LineageResult = {
  family: string | null;
  generation: number | null;
  predecessors: ModelRow[];
  successors: ModelRow[];
  siblings: ModelRow[];
  distillations: ModelRow[];
};

// Memoization cache
const cache = new Map<string, LineageResult>();

const FAMILY_PATTERNS = [
  { name: "Llama", regex: /llama[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "DeepSeek V", regex: /deepseek[-\s]?v(\d+(?:\.\d+)?)/i },
  { name: "DeepSeek R", regex: /deepseek[-\s]?r(\d+(?:\.\d+)?)/i },
  { name: "DeepSeek Coder", regex: /deepseek[-\s]?coder[-\s]?v?(\d+(?:\.\d+)?)/i },
  { name: "DeepSeek", regex: /deepseek/i },
  { name: "Claude", regex: /claude[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "GPT", regex: /gpt[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "O-Series", regex: /o(\d+)(?:-mini|-pro|-deep-research)?/i },
  { name: "Qwen", regex: /qwen[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "Mistral", regex: /(?:mistral|mixtral|codestral|pixtral)[-\s]?(?:large|small|medium|nemo|nemotron)?[-\s]?(\d+(?:\.\d+)?)?/i },
  { name: "Gemma", regex: /gemma[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "Gemini", regex: /gemini[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "Phi", regex: /phi[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "Cohere", regex: /command[-\s]?(r\+?)/i },
  { name: "Grok", regex: /grok[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "Nemotron", regex: /nemotron[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "Hunyuan", regex: /(?:hunyuan|hy)[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "GLM", regex: /glm[-\s]?(\d+(?:\.\d+)?)/i },
  { name: "Flux", regex: /flux(?:[-\s.]|v)?(\d+(?:\.\d+)?)/i },
  { name: "ElevenLabs", regex: /elevenlabs.*v(\d+)/i },
  { name: "Moonshine", regex: /moonshine[-\s]?v(\d+)/i },
];

/**
 * Extracts family and generation info from a model name.
 */
export function getModelFamily(name: string): { family: string | null; generation: number | null } {
  for (const pattern of FAMILY_PATTERNS) {
    const match = name.match(pattern.regex);
    if (match) {
      if (pattern.name === "Cohere") {
        return { family: "Cohere", generation: null };
      }
      return { family: pattern.name, generation: match[1] ? parseFloat(match[1]) : null };
    }
  }
  return { family: null, generation: null };
}

/**
 * Determines if a model is a distillation of another based on names.
 */
export function isDistillationOf(distilled: ModelRow, base: ModelRow): boolean {
  const dName = distilled.name.toLowerCase();
  const bName = base.name.toLowerCase();
  
  if (dName.includes("distill")) {
    const dNameClean = dName.replace(/[^a-z0-9]/g, '');
    const bNameClean = bName.replace(/[^a-z0-9]/g, '');
    
    // Base is teacher (e.g. DeepSeek-R1)
    if (dNameClean.includes(bNameClean)) {
      return true;
    }
  }
  return false;
}

/**
 * Resolves the lineage of a model within a given universe of models.
 */
export function resolveModelLineage(currentModel: ModelRow, allModels: ModelRow[], invalidateCache = false): LineageResult {
  if (invalidateCache) {
    cache.clear();
  }

  const cacheKey = currentModel.id;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const { family, generation } = getModelFamily(currentModel.name);
  
  const predecessors: ModelRow[] = [];
  const successors: ModelRow[] = [];
  const siblings: ModelRow[] = [];
  const distillations: ModelRow[] = [];

  const familyMembers = allModels.filter(m => {
    if (m.id === currentModel.id) return false;
    const mFam = getModelFamily(m.name);
    return mFam.family === family;
  });

  if (family) {
    for (const member of familyMembers) {
      const memberFam = getModelFamily(member.name);
      const memberGen = memberFam.generation;

      if (generation !== null && memberGen !== null) {
        if (memberGen === generation) {
          siblings.push(member);
        } else if (memberGen < generation) {
          predecessors.push(member);
        } else if (memberGen > generation) {
          successors.push(member);
        }
      } else {
        // Fallback to release date if generation isn't strictly numeric or is null
        if (currentModel.release_date && member.release_date) {
           const currDate = new Date(currentModel.release_date);
           const memDate = new Date(member.release_date);
           const diffMonths = (currDate.getTime() - memDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
           
           if (Math.abs(diffMonths) <= 2) {
             siblings.push(member);
           } else if (memDate < currDate) {
             predecessors.push(member);
           } else {
             successors.push(member);
           }
        } else {
           siblings.push(member);
        }
      }
    }
  }

  // Find distillations
  for (const model of allModels) {
    if (model.id === currentModel.id) continue;
    if (isDistillationOf(model, currentModel)) {
      distillations.push(model);
    }
  }

  // Refine predecessors to only the closest generation
  if (predecessors.length > 0 && generation !== null) {
    const maxGen = Math.max(...predecessors.map(p => getModelFamily(p.name).generation || -1));
    const immediatePredecessors = predecessors.filter(p => getModelFamily(p.name).generation === maxGen);
    predecessors.splice(0, predecessors.length, ...immediatePredecessors);
  }

  // Refine successors to only the closest generation
  if (successors.length > 0 && generation !== null) {
    const minGen = Math.min(...successors.map(p => getModelFamily(p.name).generation || 999));
    const immediateSuccessors = successors.filter(p => getModelFamily(p.name).generation === minGen);
    successors.splice(0, successors.length, ...immediateSuccessors);
  }
  
  // Sort outputs by release date descending
  const sortByDate = (a: ModelRow, b: ModelRow) => {
    const da = a.release_date ? new Date(a.release_date).getTime() : 0;
    const db = b.release_date ? new Date(b.release_date).getTime() : 0;
    return db - da; // newest first
  };

  predecessors.sort(sortByDate);
  successors.sort(sortByDate);
  siblings.sort(sortByDate);
  distillations.sort(sortByDate);

  const result: LineageResult = {
    family,
    generation,
    predecessors,
    successors,
    siblings,
    distillations,
  };

  cache.set(cacheKey, result);
  return result;
}
