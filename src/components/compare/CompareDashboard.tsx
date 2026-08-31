"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModelRow } from "@/types/models";
import { ModelSelector } from "./ModelSelector";
import { BenchmarkDiff } from "./BenchmarkDiff";
import { HardwareMath } from "./HardwareMath";
import { InferenceEconomics } from "./InferenceEconomics";
import { ArchitectureMatrix } from "./ArchitectureMatrix";
import { CatalogTableFallback } from "./CatalogTableFallback";

export function CompareDashboard({ models }: { models: ModelRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [m1, setM1] = useState<string | null>(searchParams.get("m1"));
  const [m2, setM2] = useState<string | null>(searchParams.get("m2"));
  const [m3, setM3] = useState<string | null>(searchParams.get("m3"));

  // Sync state to URL without reloading
  useEffect(() => {
    const params = new URLSearchParams();
    if (m1) params.set("m1", m1);
    if (m2) params.set("m2", m2);
    if (m3) params.set("m3", m3);
    
    const query = params.toString();
    const newUrl = query ? `/compare?${query}` : "/compare";
    
    // update url
    router.replace(newUrl, { scroll: false });
  }, [m1, m2, m3, router]);

  const model1 = models.find((m) => m.slug === m1) || null;
  const model2 = models.find((m) => m.slug === m2) || null;
  const model3 = models.find((m) => m.slug === m3) || null;

  const hasSelection = m1 || m2 || m3;

  return (
    <div className="flex flex-col gap-10">
      {/* Selection Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModelSelector
          label="Model 1"
          models={models}
          selectedSlug={m1}
          onSelect={setM1}
        />
        <ModelSelector
          label="Model 2"
          models={models}
          selectedSlug={m2}
          onSelect={setM2}
        />
        <ModelSelector
          label="Model 3 (Optional)"
          models={models}
          selectedSlug={m3}
          onSelect={setM3}
        />
      </div>

      {!hasSelection ? (
        <CatalogTableFallback models={models} />
      ) : (
        <div className="flex flex-col gap-8">
          <BenchmarkDiff models={[model1, model2, model3]} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <InferenceEconomics models={[model1, model2, model3]} />
            <HardwareMath models={[model1, model2, model3]} />
          </div>

          <ArchitectureMatrix models={[model1, model2, model3]} />
        </div>
      )}
    </div>
  );
}
