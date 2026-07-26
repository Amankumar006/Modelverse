"use client";

import { useState } from "react";
import Image from "next/image";

const tabs = [
  { id: "arc", label: "Frontier-Bench v0.1", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/a8fb4f77a9fe240e6f27f3bdc47a137f3c74a29d-2600x2578.png" },
  { id: "gdpval", label: "CursorBench 3.2", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/7530b1086992936d7e9d5796a892d1e8fa063253-3840x2160.png" },
  { id: "osworld", label: "AA Coding Agent Index", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/1af9dbd742e3812be4bf66903740188fb8fd2e33-3840x2160.png" },
  { id: "hle", label: "HLE Benchmark", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/08499ed7c3c2b6416700fa47c70d36dff5eb8461-3840x2160.png" },
  { id: "automation", label: "AutomationBench", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/b5e071ba6a9ce5628b4662f05484d1806a9fdc94-3840x2160.png" }
];

export default function BenchmarkTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="my-10 w-full bg-[#F7F5F0] rounded-2xl p-6 sm:p-8 border border-[#E5E2DB] shadow-sm">
      {/* Anthropic Style Benchmark Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all border ${
              activeTab === tab.id
                ? "bg-[#191919] text-white border-[#191919] font-medium shadow-sm"
                : "bg-white text-[#555555] border-[#E0DCD5] hover:border-[#191919] hover:text-[#191919]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Visual Chart Card */}
      <div className="relative w-full rounded-xl overflow-hidden bg-white p-4 border border-[#E0DCD5] shadow-xs">
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9]">
          <Image
            src={currentTab?.url || ""}
            alt={currentTab?.label || ""}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            priority
          />
        </div>
      </div>
      <p className="text-[11px] text-[#777777] italic text-center mt-3 font-serif">
        {currentTab?.label}: Performance vs. cost-effectiveness by effort level setting.
      </p>
    </div>
  );
}
