"use strict";

/**
 * Deterministic Markdown Table Benchmark Extractor
 * Extracts benchmark scores directly from markdown tables without requiring external LLM APIs.
 */

const KNOWN_BENCHMARKS = [
  { key: "mmlu", name: "MMLU", pattern: /\b(?:mmlu|mmlu-pro|mmlu-5shot)\b/i },
  { key: "gsm8k", name: "GSM8K", pattern: /\b(?:gsm8k|gsm-8k|gsm_8k)\b/i },
  { key: "math", name: "MATH", pattern: /\b(?:math|math-500|competition math)\b/i },
  { key: "humanEval", name: "HumanEval", pattern: /\b(?:humaneval|human-eval|human_eval|evalplus)\b/i },
  { key: "gpqa", name: "GPQA", pattern: /\b(?:gpqa|gpqa-diamond|gpqa_diamond)\b/i },
  { key: "sweBench", name: "SWE-bench", pattern: /\b(?:swe-bench|swe_bench|swebench)\b/i },
  { key: "liveCodeBench", name: "LiveCodeBench", pattern: /\b(?:livecodebench|live-code-bench|lcb)\b/i },
  { key: "arenaElo", name: "LMSYS Arena Elo", pattern: /\b(?:arena elo|chatbot arena|arena-elo)\b/i }
];

function extractBenchmarksFromMarkdownTable(markdown, targetModelName = "") {
  if (!markdown || typeof markdown !== "string") return [];

  const lines = markdown.split(/\r?\n/);
  const tables = [];
  let currentTable = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      currentTable.push(trimmed);
    } else {
      if (currentTable.length >= 3) {
        tables.push(currentTable);
      }
      currentTable = [];
    }
  }
  if (currentTable.length >= 3) {
    tables.push(currentTable);
  }

  const results = [];
  const foundBenchmarks = new Set();

  for (const table of tables) {
    const headerRow = table[0].split("|").map(c => c.trim().toLowerCase()).filter(Boolean);
    const dataRows = table.slice(2); // skip header and separator row

    // Case 1: Columns are benchmarks (e.g. | Model | MMLU | GSM8K | MATH |)
    const colBenchmarkMap = new Map();
    headerRow.forEach((col, idx) => {
      for (const b of KNOWN_BENCHMARKS) {
        if (b.pattern.test(col)) {
          colBenchmarkMap.set(idx, b);
        }
      }
    });

    if (colBenchmarkMap.size > 0) {
      // Find the row matching targetModelName, or best matching row
      for (const rowStr of dataRows) {
        const cells = rowStr.split("|").map(c => c.trim()).filter(Boolean);
        if (cells.length === 0) continue;

        const rowLabel = cells[0].toLowerCase();
        const matchesTarget = !targetModelName || rowLabel.includes(targetModelName.toLowerCase()) || targetModelName.toLowerCase().includes(rowLabel);

        if (matchesTarget || dataRows.length === 1) {
          colBenchmarkMap.forEach((benchmark, colIdx) => {
            if (colIdx < cells.length && !foundBenchmarks.has(benchmark.name)) {
              const rawVal = cells[colIdx].replace(/[%,*]/g, "").trim();
              const score = parseFloat(rawVal);
              if (Number.isFinite(score) && score > 0 && score <= 2000) {
                results.push({ name: benchmark.name, score, verified: true });
                foundBenchmarks.add(benchmark.name);
              }
            }
          });
        }
      }
    }

    // Case 2: Rows are benchmarks (e.g. | MMLU | 88.6 |)
    for (const rowStr of dataRows) {
      const cells = rowStr.split("|").map(c => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        const firstCell = cells[0];
        for (const b of KNOWN_BENCHMARKS) {
          if (b.pattern.test(firstCell) && !foundBenchmarks.has(b.name)) {
            // Find first numeric cell in row
            for (let i = 1; i < cells.length; i++) {
              const rawVal = cells[i].replace(/[%,*]/g, "").trim();
              const score = parseFloat(rawVal);
              if (Number.isFinite(score) && score > 0 && score <= 2000) {
                results.push({ name: b.name, score, verified: true });
                foundBenchmarks.add(b.name);
                break;
              }
            }
          }
        }
      }
    }
  }

  return results;
}

module.exports = {
  extractBenchmarksFromMarkdownTable,
  KNOWN_BENCHMARKS
};
