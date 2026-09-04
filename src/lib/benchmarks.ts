export interface BenchmarkItem {
  name: string;
  score: string | number;
  metric?: string;
  source?: string;
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
          return {
            name: String(obj.name || obj.benchmark || obj.metric || `Benchmark ${idx + 1}`),
            score: typeof scoreVal === "object" ? JSON.stringify(scoreVal) : scoreVal,
            metric: obj.metric ? String(obj.metric) : undefined,
            source: obj.source || obj.url ? String(obj.source || obj.url) : undefined,
          };
        }
        return {
          name: `Benchmark ${idx + 1}`,
          score: String(item),
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
          return {
            name: String(nested.name || key),
            score: typeof scoreVal === "object" ? JSON.stringify(scoreVal) : scoreVal,
            metric: nested.metric ? String(nested.metric) : undefined,
            source: nested.source || nested.url ? String(nested.source || nested.url) : undefined,
          };
        }
        return {
          name: key,
          score: val as string | number,
        };
      })
      .filter((b) => b.score !== "" && b.score !== undefined && b.score !== null);
  }

  return [];
}
