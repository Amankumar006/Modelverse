/**
 * src/lib/benchmarkParser.ts
 *
 * Smart parser for AI benchmark strings, extracting Name, Score, Metric, and Category automatically.
 * Handles messy pasted inputs like "MMLU-Pro86.3%", "SWE-bench Verified: 77.9%", and multi-line pastes.
 */

export interface ParsedBenchmark {
  name: string;
  score: string;
  subCategory?: string; // metric / unit
  category?: string;
  sourceType?: string;
}

export const KNOWN_BENCHMARK_CATEGORIES: Record<string, { category: string; metric: string }> = {
  "mmlu-pro": { category: "Reasoning", metric: "% Accuracy" },
  "mmlu": { category: "Reasoning", metric: "% Accuracy" },
  "gpqa diamond": { category: "Reasoning", metric: "% Accuracy" },
  "gpqa": { category: "Reasoning", metric: "% Accuracy" },
  "hle": { category: "Academic Reasoning", metric: "% Accuracy" },
  "humanity's last exam": { category: "Academic Reasoning", metric: "% Accuracy" },
  "arc-agi-2": { category: "Abstract Reasoning", metric: "% Accuracy" },
  "arc-agi": { category: "Abstract Reasoning", metric: "% Accuracy" },
  "agieval": { category: "Reasoning", metric: "% Accuracy" },
  "hellaswag": { category: "Reasoning", metric: "% Accuracy" },
  "swe-bench verified": { category: "Code", metric: "% Solved" },
  "swe-bench pro": { category: "Agentic Coding", metric: "% Solved" },
  "swe-bench": { category: "Code", metric: "% Solved" },
  "swe-lancer": { category: "Agentic Coding", metric: "% Solved" },
  "terminal-bench 2.1": { category: "Agentic Coding", metric: "% Accuracy" },
  "terminal-bench 2.0": { category: "Agentic Coding", metric: "% Accuracy" },
  "terminal-bench": { category: "Agentic Coding", metric: "% Accuracy" },
  "livecodebench": { category: "Code", metric: "Pass@1" },
  "humaneval": { category: "Code", metric: "Pass@1" },
  "aider polyglot": { category: "Code", metric: "% Benchmark" },
  "aider": { category: "Code", metric: "% Benchmark" },
  "mbpp": { category: "Code", metric: "Pass@1" },
  "math-500": { category: "Math", metric: "% Accuracy" },
  "math": { category: "Math", metric: "% Accuracy" },
  "gsm8k": { category: "Math", metric: "% Accuracy" },
  "minerva": { category: "Math", metric: "% Accuracy" },
  "aime": { category: "Math", metric: "% Solved" },
  "olympiadbench": { category: "Math", metric: "% Accuracy" },
  "bfcl v2": { category: "Agentic", metric: "% Accuracy" },
  "bfcl": { category: "Agentic", metric: "% Accuracy" },
  "tau-bench": { category: "Agentic", metric: "% Accuracy" },
  "osworld-verifie": { category: "UI Control", metric: "% Accuracy" },
  "osworld": { category: "UI Control", metric: "% Accuracy" },
  "mcp atlas": { category: "Multi-step Workflows", metric: "% Accuracy" },
  "finance agent": { category: "Expert Tasks", metric: "% Accuracy" },
  "mmmu-pro": { category: "Multimodal", metric: "% Accuracy" },
  "mmmu": { category: "Multimodal", metric: "% Accuracy" },
  "mathvista": { category: "Multimodal", metric: "% Accuracy" },
  "charxiv": { category: "Multimodal", metric: "% Accuracy" },
  "video-mme": { category: "Multimodal", metric: "% Accuracy" },
  "docvqa": { category: "Multimodal", metric: "% Accuracy" },
  "arena hard auto": { category: "General", metric: "Elo / Score" },
  "arena hard": { category: "General", metric: "Elo / Score" },
  "chatbot arena": { category: "General", metric: "Elo / Score" },
  "lmsys": { category: "General", metric: "Elo / Score" },
};

/**
 * Parses a single raw benchmark string and extracts name, score, metric, and category.
 */
export function parseSmartBenchmarkInput(input: string): ParsedBenchmark {
  let str = input.trim();
  if (!str) return { name: "", score: "" };

  let extractedScore = "";
  let extractedMetric = "";
  let extractedCategory = "";

  // 1. Check if metric or category is enclosed in trailing parentheses, e.g. "SWE-bench Verified 77.9% (% Solved)"
  const parenMatch = str.match(/\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const inside = parenMatch[1].trim();
    if (
      inside.toLowerCase().includes("pass@") ||
      inside.toLowerCase().includes("%") ||
      inside.toLowerCase().includes("elo") ||
      inside.toLowerCase().includes("score") ||
      inside.toLowerCase().includes("accuracy") ||
      inside.toLowerCase().includes("solved")
    ) {
      extractedMetric = inside;
    } else {
      extractedCategory = inside;
    }
    str = str.replace(parenMatch[0], "").trim();
  }

  // 2. Extract score from end of string: separated by space/colon or attached directly to text (e.g. "MMLU-Pro86.3%")
  const separatedMatch = str.match(/(?:[:\s\-=–—|]+)?(\d+(?:\.\d+)?\s*%?)\s*$/);
  if (separatedMatch) {
    extractedScore = separatedMatch[1].trim();
    str = str.slice(0, separatedMatch.index).trim();
  } else {
    // Check attached number like "MMLU-Pro86.3%" or "GSM8K92.5%"
    const attachedMatch = str.match(/^(.+?)([:\s\-=–—|]*)(\d+(?:\.\d+)?\s*%?)$/);
    if (attachedMatch) {
      str = attachedMatch[1].trim();
      extractedScore = attachedMatch[3].trim();
    }
  }

  // Clean trailing punctuation from benchmark name
  const cleanName = str.replace(/[:\-=–—|]+$/, "").trim();

  // If score has % symbol and no metric specified, set metric to % Accuracy or % Solved
  if (extractedScore.includes("%") && !extractedMetric) {
    extractedMetric = "% Accuracy";
  }

  // Lookup inferred category and metric from dictionary
  const lowerName = cleanName.toLowerCase();
  for (const [key, meta] of Object.entries(KNOWN_BENCHMARK_CATEGORIES)) {
    if (lowerName.includes(key) || key.includes(lowerName)) {
      if (!extractedCategory) extractedCategory = meta.category;
      if (!extractedMetric) extractedMetric = meta.metric;
      break;
    }
  }

  return {
    name: cleanName || input.trim(),
    score: extractedScore,
    subCategory: extractedMetric || undefined,
    category: extractedCategory || undefined,
    sourceType: "independent-eval",
  };
}

/**
 * Parses multi-line pasted text into an array of structured benchmarks.
 */
export function parseMultiLineBenchmarks(rawText: string): ParsedBenchmark[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => Boolean(l) && !l.startsWith("#") && !l.startsWith("---"));

  const results: ParsedBenchmark[] = [];

  for (const line of lines) {
    // If tab-separated or pipe-separated (table copy-paste)
    if (line.includes("\t") || line.includes("|")) {
      const parts = line.split(/[\t|]/).map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const nameCandidate = parts[0];
        const scoreCandidate = parts[1];
        const parsed = parseSmartBenchmarkInput(`${nameCandidate} ${scoreCandidate}`);
        if (parts[2] && !parsed.subCategory) parsed.subCategory = parts[2];
        if (parts[3] && !parsed.category) parsed.category = parts[3];
        results.push(parsed);
        continue;
      }
    }

    const parsed = parseSmartBenchmarkInput(line);
    if (parsed.name) {
      results.push(parsed);
    }
  }

  return results;
}
