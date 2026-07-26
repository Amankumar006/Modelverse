"use client";

import { useState } from "react";
import { Zap, DollarSign, Award, SlidersHorizontal, ArrowUpRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface VisionModelBenchmark {
  id: string;
  name: string;
  developer: string;
  slug: string;
  imgGenElo: number;
  imgEditElo: number;
  latencySeconds: number; // Latency per 1K resolution image
  priceUsd: number; // Price per 1K resolution image
  highlight?: string;
  isPopular?: boolean;
}

const VISION_MODELS_DATA: VisionModelBenchmark[] = [
  {
    id: "google-gemini-3.1-flash-lite-image",
    name: "Nano Banana 2 Lite",
    developer: "Google DeepMind",
    slug: "google-gemini-3.1-flash-lite-image",
    imgGenElo: 1251,
    imgEditElo: 1308,
    latencySeconds: 4.0,
    priceUsd: 0.034,
    highlight: "Fastest 4.0s Latency",
    isPopular: true,
  },
  {
    id: "google-gemini-3.1-flash-image",
    name: "Nano Banana 2",
    developer: "Google DeepMind",
    slug: "google-gemini-3.1-flash-image",
    imgGenElo: 1270,
    imgEditElo: 1387,
    latencySeconds: 20.0,
    priceUsd: 0.067,
    highlight: "Top Edit Elo (1387)",
    isPopular: true,
  },
  {
    id: "google-gemini-2.5-flash-image",
    name: "Nano Banana (Gemini 2.5)",
    developer: "Google DeepMind",
    slug: "google-gemini-2.5-flash-image",
    imgGenElo: 1151,
    imgEditElo: 1295,
    latencySeconds: 7.0,
    priceUsd: 0.039,
  },
  {
    id: "black-forest-labs-flux.1-schnell",
    name: "Flux 2 Klein 9B",
    developer: "Black Forest Labs",
    slug: "black-forest-labs-flux.1-schnell",
    imgGenElo: 1069,
    imgEditElo: 1224,
    latencySeconds: 4.4,
    priceUsd: 0.015,
    highlight: "Lowest Price ($0.015)",
  },
  {
    id: "xai-grok-imagine",
    name: "Grok Imagine Image",
    developer: "xAI",
    slug: "xai-grok-imagine",
    imgGenElo: 1174,
    imgEditElo: 1329,
    latencySeconds: 6.4,
    priceUsd: 0.020,
    highlight: "Fast 6.4s + $0.020 Rate",
    isPopular: true,
  },
  {
    id: "bytedance-seedream-5-pro",
    name: "Seedream v5 Lite / Pro",
    developer: "ByteDance",
    slug: "seedream-5-pro",
    imgGenElo: 1132,
    imgEditElo: 1294,
    latencySeconds: 45.1,
    priceUsd: 0.035,
  },
];

type MetricKey = "imgGenElo" | "imgEditElo" | "latencySeconds" | "priceUsd";

export default function VisionBenchmarkChart() {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("imgGenElo");

  const metricConfigs: Record<
    MetricKey,
    {
      label: string;
      unit: string;
      higherIsBetter: boolean;
      description: string;
      source: string;
      format: (val: number) => string;
    }
  > = {
    imgGenElo: {
      label: "Image Generation Elo",
      unit: "Elo Score",
      higherIsBetter: true,
      description: "Human preference arena Elo score for prompt adherence and visual fidelity.",
      source: "LMArena.ai Vision Leaderboard",
      format: (val) => `${val} Elo`,
    },
    imgEditElo: {
      label: "Image Editing Elo",
      unit: "Elo Score",
      higherIsBetter: true,
      description: "Multi-turn editing Elo score for localized modifications and subject preservation.",
      source: "LMArena.ai Vision Leaderboard",
      format: (val) => `${val} Elo`,
    },
    latencySeconds: {
      label: "1K Generation Latency",
      unit: "Seconds",
      higherIsBetter: false,
      description: "End-to-end rendering time to produce a 1K resolution output image.",
      source: "ArtificialAnalysis.ai Benchmark",
      format: (val) => `${val.toFixed(1)}s`,
    },
    priceUsd: {
      label: "Price per 1K Resolution Image",
      unit: "USD",
      higherIsBetter: false,
      description: "API inference cost per 1K resolution rendered image.",
      source: "Vendor Official Pricing",
      format: (val) => `$${val.toFixed(3)}`,
    },
  };

  const currentConfig = metricConfigs[selectedMetric];

  // Calculate max value for percentage bar width
  const values = VISION_MODELS_DATA.map((m) => m[selectedMetric]);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  // Best performer per metric
  const bestPerformer = VISION_MODELS_DATA.reduce((best, m) => {
    if (currentConfig.higherIsBetter) {
      return m[selectedMetric] > best[selectedMetric] ? m : best;
    } else {
      return m[selectedMetric] < best[selectedMetric] ? m : best;
    }
  }, VISION_MODELS_DATA[0]);

  return (
    <div className="rounded-2xl bg-[#1C1C1E] border border-[#282828] p-6 shadow-2xl space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#282828]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-[#242426] text-emerald-400 border border-emerald-500/20">
              <SlidersHorizontal size={18} />
            </span>
            <h2
              className="text-2xl font-normal text-white"
              style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
            >
              Vision Model Benchmark & Latency Leaderboard
            </h2>
          </div>
          <p className="text-xs text-[#90908F] mt-1 leading-relaxed">
            {currentConfig.description} Data sourced from{" "}
            <span className="text-emerald-400 font-mono">{currentConfig.source}</span>.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center bg-[#141414] p-1 rounded-xl border border-[#282828]">
          <button
            onClick={() => setSelectedMetric("imgGenElo")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === "imgGenElo"
                ? "bg-[#242426] text-emerald-400 border border-emerald-500/30 font-semibold"
                : "text-[#90908F] hover:text-white"
            }`}
          >
            <Award size={13} />
            <span>ImgGen Elo</span>
          </button>
          <button
            onClick={() => setSelectedMetric("imgEditElo")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === "imgEditElo"
                ? "bg-[#242426] text-emerald-400 border border-emerald-500/30 font-semibold"
                : "text-[#90908F] hover:text-white"
            }`}
          >
            <Award size={13} />
            <span>ImgEdit Elo</span>
          </button>
          <button
            onClick={() => setSelectedMetric("latencySeconds")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === "latencySeconds"
                ? "bg-[#242426] text-emerald-400 border border-emerald-500/30 font-semibold"
                : "text-[#90908F] hover:text-white"
            }`}
          >
            <Zap size={13} />
            <span>1K Latency</span>
          </button>
          <button
            onClick={() => setSelectedMetric("priceUsd")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              selectedMetric === "priceUsd"
                ? "bg-[#242426] text-emerald-400 border border-emerald-500/30 font-semibold"
                : "text-[#90908F] hover:text-white"
            }`}
          >
            <DollarSign size={13} />
            <span>Price / 1K Img</span>
          </button>
        </div>
      </div>

      {/* Visual Bar Chart List */}
      <div className="space-y-4">
        {VISION_MODELS_DATA.map((model) => {
          const rawValue = model[selectedMetric];
          const isBest = model.id === bestPerformer.id;

          // Calculate bar width percentage relative to max value
          let barPercentage = 0;
          if (currentConfig.higherIsBetter) {
            barPercentage = Math.max(12, (rawValue / maxValue) * 100);
          } else {
            // For latency & price where lower is better, invert scale relative to max
            barPercentage = Math.max(12, ((maxValue - rawValue + minValue) / maxValue) * 100);
          }

          return (
            <div
              key={model.id}
              className={`p-4 rounded-xl transition-all border ${
                isBest
                  ? "bg-[#242426] border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                  : "bg-[#141414] border-[#282828] hover:border-[#333333]"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Link
                    href={`/models/${model.slug}`}
                    className="text-sm font-semibold text-white hover:text-emerald-400 transition-colors flex items-center gap-1 truncate"
                  >
                    <span className="truncate">{model.name}</span>
                    <ArrowUpRight size={13} className="text-[#90908F] shrink-0" />
                  </Link>
                  <span className="text-xs text-[#90908F] font-mono shrink-0">({model.developer})</span>
                  {isBest && (
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={10} /> Best Perform
                    </span>
                  )}
                  {model.highlight && !isBest && (
                    <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-[#242426] text-[#E1E1E0] border border-[#333333] shrink-0">
                      {model.highlight}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`font-mono text-sm font-bold ${
                      isBest ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {currentConfig.format(rawValue)}
                  </span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-[#242426] h-2.5 rounded-full overflow-hidden relative border border-[#333333]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBest
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-300"
                      : "bg-[#90908F]/60"
                  }`}
                  style={{ width: `${barPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Legend */}
      <div className="pt-3 border-t border-[#282828] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#90908F] gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Top Performer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#90908F]/60 inline-block" /> Evaluated Vision Models
          </span>
        </div>
        <span className="font-mono text-[11px]">Last verified: July 2026</span>
      </div>
    </div>
  );
}
