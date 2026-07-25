"use client";

import { useState } from "react";
import Image from "next/image";

const tabs = [
  { id: "arc", label: "ARC-AGI 3", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/a8fb4f77a9fe240e6f27f3bdc47a137f3c74a29d-2600x2578.png" },
  { id: "gdpval", label: "GDPval-AA v2", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/7530b1086992936d7e9d5796a892d1e8fa063253-3840x2160.png" },
  { id: "osworld", label: "OSWorld 2.0", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/1af9dbd742e3812be4bf66903740188fb8fd2e33-3840x2160.png" },
  { id: "hle", label: "HLE", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/08499ed7c3c2b6416700fa47c70d36dff5eb8461-3840x2160.png" },
  { id: "automation", label: "AutomationBench", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/b5e071ba6a9ce5628b4662f05484d1806a9fdc94-3840x2160.png" },
  { id: "deepsearch", label: "DeepSearchQA", url: "https://www-cdn.anthropic.com/images/4zrzovbb/website/8c0870bfca0dfac1d81a20e0ebac7eb3eff6d554-3840x2160.png" }
];

export default function BenchmarkTabs() {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div className="my-10 w-full bg-[#FAFAFA] rounded-3xl p-6 sm:p-10 border border-[#E5E5E5]">
      {/* Tabs Header */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${
              activeTab === tab.id
                ? "bg-[#111] text-white border-[#111] shadow-sm"
                : "bg-transparent text-[#444] border-[#CCC] hover:border-[#999] hover:text-[#111]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Image Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-transparent">
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
    </div>
  );
}
