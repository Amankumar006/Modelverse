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
    <div className="my-10 w-full bg-[#1C1C1E] rounded-2xl p-6 sm:p-8 border border-[#282828] shadow-2xl">
      {/* Benchmark Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all border ${
              activeTab === tab.id
                ? "bg-[#242426] text-emerald-400 border-emerald-500/40 font-semibold shadow-sm"
                : "bg-[#141414] text-[#90908F] border-[#282828] hover:border-[#333333] hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Visual Chart Container */}
      <div className="relative w-full rounded-xl overflow-hidden bg-[#141414] p-4 border border-[#282828] shadow-inner">
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
      <p className="text-xs text-[#90908F] font-mono italic text-center mt-3">
        {currentTab?.label}: Performance vs. cost-effectiveness by effort level setting.
      </p>
    </div>
  );
}
