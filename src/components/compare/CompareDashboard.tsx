"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModelRow } from "@/types/models";
import { ModelSelector } from "./ModelSelector";
import { CompareVerdict } from "./CompareVerdict";
import { ModelCompressionMeter } from "./ModelCompressionMeter";
import { BenchmarkDiff } from "./BenchmarkDiff";
import { InferenceEconomics } from "./InferenceEconomics";
import { ArchitectureMatrix } from "./ArchitectureMatrix";
import { CatalogTableFallback } from "./CatalogTableFallback";

interface CompareDashboardProps {
  models: ModelRow[];
  initialM1?: string | null;
  initialM2?: string | null;
  initialM3?: string | null;
}

export function CompareDashboard({
  models,
  initialM1 = null,
  initialM2 = null,
  initialM3 = null,
}: CompareDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [m1, setM1] = useState<string | null>(initialM1 || searchParams.get("m1"));
  const [m2, setM2] = useState<string | null>(initialM2 || searchParams.get("m2"));
  const [m3, setM3] = useState<string | null>(initialM3 || searchParams.get("m3"));

  // Sync state to URL without reloading
  useEffect(() => {
    // Only update search query if on base /compare page
    if (window.location.pathname === "/compare") {
      const params = new URLSearchParams();
      if (m1) params.set("m1", m1);
      if (m2) params.set("m2", m2);
      if (m3) params.set("m3", m3);

      const query = params.toString();
      const newUrl = query ? `/compare?${query}` : "/compare";

      router.replace(newUrl, { scroll: false });
    }
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
        <div className="flex flex-col gap-10">
          {/* Executive Verdict if at least 2 models selected */}
          {model1 && model2 && (
            <CompareVerdict model1={model1} model2={model2} />
          )}

          {/* Model Compression & Hardware Fit */}
          <ModelCompressionMeter models={[model1, model2, model3]} />

          {/* Benchmark Showdown */}
          <BenchmarkDiff models={[model1, model2, model3]} />

          {/* Inference Economics Simulator */}
          <InferenceEconomics models={[model1, model2, model3]} />

          {/* Architecture Feature Matrix */}
          <ArchitectureMatrix models={[model1, model2, model3]} />
        </div>
      )}
    </div>
  );
}
