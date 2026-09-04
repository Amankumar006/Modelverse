export interface BenchmarkItem {
  name: string;
  score: string | number;
  metric?: string;
  source?: string;
  category?: BenchmarkCategory;
  lower_is_better?: boolean;
  conditions?: string;
  note?: string;
  is_headline?: boolean;
}

export type BenchmarkCategory =
  | "Reasoning & Science"
  | "Coding & Software"
  | "Agentic & Computer Use"
  | "Cybersecurity & Safety"
  | "Domain & Multimodal"
  | "General / Other";

export function inferBenchmarkCategory(name: string): BenchmarkCategory {
  const n = name.toLowerCase();
  if (
    n.includes("arc-agi") ||
    n.includes("gpqa") ||
    n.includes("mmlu") ||
    n.includes("frontiermath") ||
    n.includes("humanity") ||
    (n.includes("agent") && n.includes("exam")) ||
    n.includes("aime") ||
    n.includes("mgsm") ||
    n.includes("mmmu") ||
    n.includes("simpleqa") ||
    n.includes("intelligence index") ||
    n.includes("reasoning") ||
    n.startsWith("math")
  ) {
    return "Reasoning & Science";
  }
  if (
    n.includes("osworld") ||
    n.includes("screenspot") ||
    n.includes("browsecomp") ||
    n.includes("automation") ||
    n.includes("computer use") ||
    n.includes("webdev") ||
    n.includes("sre-bench")
  ) {
    return "Agentic & Computer Use";
  }
  if (
    n.includes("terminal") ||
    n.includes("swe") ||
    n.includes("deepswe") ||
    n.includes("frontiercode") ||
    n.includes("code") ||
    n.includes("humaneval") ||
    n.includes("livebench") ||
    n.includes("database migration")
  ) {
    return "Coding & Software";
  }
  if (
    n.includes("exploit") ||
    n.includes("cybergym") ||
    n.includes("cwe") ||
    n.includes("sec-bench") ||
    n.includes("circumvention") ||
    n.includes("hallucination") ||
    n.includes("safety")
  ) {
    return "Cybersecurity & Safety";
  }
  if (
    n.includes("cad") ||
    n.includes("medchem") ||
    n.includes("gene") ||
    n.includes("lifesci") ||
    n.includes("health") ||
    n.includes("charxiv") ||
    n.includes("tau-bench") ||
    n.includes("openscore") ||
    n.includes("mrcr") ||
    n.includes("omr")
  ) {
    return "Domain & Multimodal";
  }
  return "General / Other";
}

export function isHeadlineBenchmark(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes("arc-agi-3") ||
    n.includes("osworld 2.0") ||
    n.includes("gpqa diamond") ||
    n.includes("terminal-bench 4.0") ||
    n.includes("terminal-bench 2.1") ||
    n.includes("deepswe") ||
    n.includes("swe-bench") ||
    n.includes("codearena") ||
    n.includes("frontiermath") ||
    n.includes("screenspot")
  );
}

const METADATA_KEYS = new Set([
  "source",
  "source_type",
  "sources",
  "url",
  "urls",
  "notes",
  "note",
  "eval_date",
  "date",
  "created_at",
  "updated_at",
  "type",
  "description",
  "provider",
  "status",
]);

export function normalizeBenchmarks(raw: unknown): BenchmarkItem[] {
  if (!raw) return [];

  // 1. If wrapped in an object like { results: [ ... ] } or { benchmarks: [ ... ] } or { data: [ ... ] }
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record = raw as Record<string, any>;
    const parentSource = typeof record.source === "string" ? record.source : (typeof record.url === "string" ? record.url : undefined);

    const nestedArray = Array.isArray(record.results)
      ? record.results
      : Array.isArray(record.benchmarks)
      ? record.benchmarks
      : Array.isArray(record.data)
      ? record.data
      : null;

    if (nestedArray) {
      return normalizeBenchmarks(
        nestedArray.map((item) => {
          if (typeof item === "object" && item !== null && parentSource && !item.source && !item.url) {
            return { ...item, source: parentSource };
          }
          return item;
        })
      );
    }
  }

  // 2. Array of benchmark objects: [ { name: "...", score: 74.4, metric: "..." } ]
  if (Array.isArray(raw)) {
    return raw
      .map((item, idx) => {
        if (typeof item === "object" && item !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const obj = item as Record<string, any>;
          const scoreVal = obj.score !== undefined ? obj.score : (obj.value !== undefined ? obj.value : "");
          const name = String(obj.name || obj.benchmark || obj.metric || `Benchmark ${idx + 1}`);
          return {
            name,
            score: typeof scoreVal === "object" ? JSON.stringify(scoreVal) : scoreVal,
            metric: obj.metric ? String(obj.metric) : undefined,
            source: obj.source || obj.url ? String(obj.source || obj.url) : undefined,
            category: inferBenchmarkCategory(name),
            lower_is_better: Boolean(obj.lower_is_better),
            conditions: obj.conditions ? String(obj.conditions) : undefined,
            note: obj.note ? String(obj.note) : undefined,
            is_headline: isHeadlineBenchmark(name),
          };
        }
        const name = `Benchmark ${idx + 1}`;
        return {
          name,
          score: String(item),
          category: inferBenchmarkCategory(name),
          is_headline: isHeadlineBenchmark(name),
        };
      })
      .filter((b) => b.score !== "" && b.score !== undefined && b.score !== null);
  }

  // 3. Dictionary object: { "MMLU": 88.7, "GPQA": { score: 65 } }
  if (typeof raw === "object" && raw !== null) {
    return Object.entries(raw)
      .filter(([key]) => !METADATA_KEYS.has(key.toLowerCase()))
      .map(([key, val]) => {
        if (typeof val === "object" && val !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const nested = val as Record<string, any>;
          const scoreVal = nested.score !== undefined ? nested.score : (nested.value !== undefined ? nested.value : "");
          const name = String(nested.name || key);
          return {
            name,
            score: typeof scoreVal === "object" ? JSON.stringify(scoreVal) : scoreVal,
            metric: nested.metric ? String(nested.metric) : undefined,
            source: nested.source || nested.url ? String(nested.source || nested.url) : undefined,
            category: inferBenchmarkCategory(name),
            lower_is_better: Boolean(nested.lower_is_better),
            conditions: nested.conditions ? String(nested.conditions) : undefined,
            note: nested.note ? String(nested.note) : undefined,
            is_headline: isHeadlineBenchmark(name),
          };
        }
        const name = key;
        return {
          name,
          score: val as string | number,
          category: inferBenchmarkCategory(name),
          is_headline: isHeadlineBenchmark(name),
        };
      })
      .filter((b) => b.score !== "" && b.score !== undefined && b.score !== null);
  }

  return [];
}
