"use strict";

const assert = require("assert");
const { scoreModelPage } = require("../scripts/quality/score-content");

// Base template for valid models
const baseModel = {
  developer: "Test Labs",
  license: "Apache-2.0",
  releaseDate: "2026-08-18",
  description: "A comprehensive test model designed for verifying metric-type aware benchmark scoring.",
  cardSummary: "Test model for benchmark metric type evaluation and quality gating.",
  pageOverview: "This detailed architectural overview describes the test model configuration, training objective, deployment characteristics, and evaluation methodology across standard benchmark suites.",
  editorialNote: "A verified independent technical analysis discussing practical production deployment, throughput characteristics, hardware requirements, and real-world performance trade-offs.",
  links: { docs: "https://example.com/docs" },
  sources: ["https://example.com/paper", "https://example.com/report"],
  parameters: "7B",
  contextWindow: "128k",
  keyFeatures: ["Native long-context processing", "High throughput streaming"],
  tags: ["testing", "benchmark-eval"],
};

console.log("🧪 Running Benchmark Metric-Type Aware Quality Gate Tests...\n");

// Test 1: A chat model with 2 performance benchmarks → passes
{
  const chatModel = {
    ...baseModel,
    id: "chat-model",
    slug: "chat-model",
    name: "Chat Model 7B",
    primaryTask: "chat-reasoning",
    benchmarks: [
      { name: "MMLU-Pro", score: 84.5, metricType: "performance", verified: true, source: "https://example.com/eval" },
      { name: "SWE-Bench", score: 52.1, metricType: "performance", verified: true, source: "https://example.com/eval" },
    ],
  };

  const result = scoreModelPage(chatModel);
  console.log("Test 1 (Chat Model with 2 performance benchmarks):", {
    score: result.score,
    status: result.status,
    performanceCount: result.breakdown.performanceBenchmarkCount,
    meetsGate: result.breakdown.meetsTwoPerformanceBenchmarkGate,
  });

  assert.equal(result.status, "indexed", "Chat model with 2 performance benchmarks should be indexed");
  assert.equal(result.breakdown.performanceBenchmarkCount, 2);
  assert.equal(result.breakdown.meetsTwoPerformanceBenchmarkGate, true);
  assert.ok(result.score >= 65, "Score should meet index threshold");
}

// Test 2: An embedding model with 1 performance + 1 technical → fails benchmark gate
{
  const embeddingModel = {
    ...baseModel,
    id: "embedding-model",
    slug: "embedding-model",
    name: "Embedding Model v2",
    primaryTask: "embedding",
    benchmarks: [
      { name: "MTEB Retrieval", score: 68.2, metricType: "performance", verified: true, source: "https://example.com/eval" },
      { name: "Embedding Dimensions", score: 1536, metricType: "technical", verified: true, source: "https://example.com/specs" },
    ],
  };

  const result = scoreModelPage(embeddingModel);
  console.log("Test 2 (Embedding Model with 1 performance + 1 technical):", {
    score: result.score,
    status: result.status,
    performanceCount: result.breakdown.performanceBenchmarkCount,
    technicalCount: result.breakdown.technicalMetricCount,
    meetsGate: result.breakdown.meetsTwoPerformanceBenchmarkGate,
  });

  assert.equal(result.status, "thin", "Embedding model with only 1 performance benchmark should fail the index gate");
  assert.equal(result.breakdown.performanceBenchmarkCount, 1);
  assert.equal(result.breakdown.technicalMetricCount, 1);
  assert.equal(result.breakdown.meetsTwoPerformanceBenchmarkGate, false);
  assert.ok(result.reasons.some((r) => r.includes("performance benchmark")), "Should explain insufficient performance benchmarks");
}

// Test 3: An audio model with 2 technical metrics → fails benchmark gate
{
  const audioModel = {
    ...baseModel,
    id: "audio-model",
    slug: "audio-model",
    name: "Audio Processor X",
    primaryTask: "audio-transcription",
    benchmarks: [
      { name: "Sample Rate (kHz)", score: 48, metricType: "technical", verified: true, source: "https://example.com/audio-specs" },
      { name: "Latency RTF", score: 0.15, metricType: "technical", verified: true, source: "https://example.com/audio-specs" },
    ],
  };

  const result = scoreModelPage(audioModel);
  console.log("Test 3 (Audio Model with 2 technical metrics):", {
    score: result.score,
    status: result.status,
    performanceCount: result.breakdown.performanceBenchmarkCount,
    technicalCount: result.breakdown.technicalMetricCount,
    meetsGate: result.breakdown.meetsTwoPerformanceBenchmarkGate,
  });

  assert.equal(result.status, "thin", "Audio model with 2 technical metrics should fail the performance benchmark gate");
  assert.equal(result.breakdown.performanceBenchmarkCount, 0);
  assert.equal(result.breakdown.technicalMetricCount, 2);
  assert.equal(result.breakdown.meetsTwoPerformanceBenchmarkGate, false);
}

// Test 4: A moderation model with technical + economic metrics → fails benchmark gate
{
  const moderationModel = {
    ...baseModel,
    id: "moderation-model",
    slug: "moderation-model",
    name: "Omni Moderation 1",
    primaryTask: "moderation",
    benchmarks: [
      { name: "Inference Latency (ms)", score: 45, metricType: "technical", verified: true, source: "https://example.com/specs" },
      { name: "Cost Per 1K Classifications ($)", score: 0.001, metricType: "economic", verified: true, source: "https://example.com/pricing" },
    ],
  };

  const result = scoreModelPage(moderationModel);
  console.log("Test 4 (Moderation Model with technical + economic metrics):", {
    score: result.score,
    status: result.status,
    performanceCount: result.breakdown.performanceBenchmarkCount,
    technicalCount: result.breakdown.technicalMetricCount,
    economicCount: result.breakdown.economicMetricCount,
    meetsGate: result.breakdown.meetsTwoPerformanceBenchmarkGate,
  });

  assert.equal(result.status, "thin", "Moderation model without performance benchmarks should fail the gate");
  assert.equal(result.breakdown.performanceBenchmarkCount, 0);
  assert.equal(result.breakdown.technicalMetricCount, 1);
  assert.equal(result.breakdown.economicMetricCount, 1);
  assert.equal(result.breakdown.meetsTwoPerformanceBenchmarkGate, false);
}

// Test 5: An image model with 2 performance benchmarks → passes
{
  const imageModel = {
    ...baseModel,
    id: "image-model",
    slug: "image-model",
    name: "Diffusion Vision 3",
    primaryTask: "image-generation",
    benchmarks: [
      { name: "GenEval Overall", score: 0.78, metricType: "performance", verified: true, source: "https://example.com/eval" },
      { name: "DPGBench", score: 86.4, metricType: "performance", verified: true, source: "https://example.com/eval" },
    ],
  };

  const result = scoreModelPage(imageModel);
  console.log("Test 5 (Image Model with 2 performance benchmarks):", {
    score: result.score,
    status: result.status,
    performanceCount: result.breakdown.performanceBenchmarkCount,
    meetsGate: result.breakdown.meetsTwoPerformanceBenchmarkGate,
  });

  assert.equal(result.status, "indexed", "Image model with 2 performance benchmarks should pass");
  assert.equal(result.breakdown.performanceBenchmarkCount, 2);
  assert.equal(result.breakdown.meetsTwoPerformanceBenchmarkGate, true);
  assert.ok(result.score >= 65);
}

// Test 6: A speech model with 2 WER performance benchmarks → passes
{
  const speechModel = {
    ...baseModel,
    id: "speech-model",
    slug: "speech-model",
    name: "Whisper Advanced V3",
    primaryTask: "speech-recognition",
    benchmarks: [
      { name: "Librispeech Clean WER", score: 1.8, metricType: "performance", verified: true, source: "https://example.com/eval" },
      { name: "CommonVoice WER", score: 4.2, metricType: "performance", verified: true, source: "https://example.com/eval" },
    ],
  };

  const result = scoreModelPage(speechModel);
  console.log("Test 6 (Speech Model with 2 WER performance benchmarks):", {
    score: result.score,
    status: result.status,
    performanceCount: result.breakdown.performanceBenchmarkCount,
    meetsGate: result.breakdown.meetsTwoPerformanceBenchmarkGate,
  });

  assert.equal(result.status, "indexed", "Speech model with 2 WER performance benchmarks should pass");
  assert.equal(result.breakdown.performanceBenchmarkCount, 2);
  assert.equal(result.breakdown.meetsTwoPerformanceBenchmarkGate, true);
  assert.ok(result.score >= 65);
}

console.log("\n✅ ALL 6 BENCHMARK METRIC-TYPE AUTOMATED TESTS PASSED SUCCESSFULLY!\n");
