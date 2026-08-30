import { ImageResponse } from "next/og";
import { getModelBySlug } from "@/lib/supabase/models";
import { normalizeBenchmarks } from "@/lib/benchmarks";

export const alt = "Foundation Model Specifications & Benchmarks — Modelverse";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function formatContext(tokens: number | null): string {
  if (!tokens) return "Standard Ctx";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M Tokens`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}k Tokens`;
  return `${tokens} Tokens`;
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  const modelName = model?.name || slug;
  const provider = model?.provider || "AI Laboratory";
  const category = model?.category || "LLM";
  const contextStr = formatContext(model?.context_window || null);
  const parametersStr = model?.active_parameters
    ? `${model.active_parameters} act / ${model.parameters || "MoE"}`
    : model?.parameters || "Proprietary";

  const benchmarks = normalizeBenchmarks(model?.benchmarks).slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#070A10",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(59, 130, 246, 0.18), transparent 45%), radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.12), transparent 45%)",
          padding: "52px 64px",
          fontFamily: "sans-serif",
          color: "#FFFFFF",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: "900",
                color: "#FFFFFF",
              }}
            >
              M
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "16px", fontWeight: "800", letterSpacing: "1px", color: "#F3F4F6" }}>
                MODELVERSE
              </span>
              <span style={{ fontSize: "10px", color: "#9CA3AF", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Open Foundation Model Catalog
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                color: "#60A5FA",
                fontSize: "13px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {category}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#34D399",
                fontSize: "13px",
                fontWeight: "700",
                letterSpacing: "0.5px",
              }}
            >
              Verified Specs
            </div>
          </div>
        </div>

        {/* Main Center Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#3B82F6",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {provider}
            </span>
          </div>

          <div
            style={{
              fontSize: modelName.length > 24 ? "48px" : "56px",
              fontWeight: "900",
              color: "#FFFFFF",
              letterSpacing: "-1px",
              lineHeight: 1.1,
              maxWidth: "1000px",
            }}
          >
            {modelName}
          </div>

          {model?.description && (
            <div
              style={{
                fontSize: "18px",
                color: "#9CA3AF",
                lineHeight: 1.4,
                maxWidth: "920px",
                maxHeight: "52px",
                overflow: "hidden",
              }}
            >
              {model.description.slice(0, 140)}...
            </div>
          )}
        </div>

        {/* Bottom Specs & Benchmarks Pill Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", gap: "14px", flexWrap: "nowrap" }}>
            {/* Context Window */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 18px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                minWidth: "180px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1px" }}>
                Context Window
              </span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#F3F4F6", marginTop: "2px" }}>
                {contextStr}
              </span>
            </div>

            {/* Parameter Count */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 18px",
                backgroundColor: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                minWidth: "180px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "1px" }}>
                Parameters
              </span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#F3F4F6", marginTop: "2px" }}>
                {parametersStr}
              </span>
            </div>

            {/* Benchmark Highlights */}
            {benchmarks.map((bench) => (
              <div
                key={bench.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 18px",
                  backgroundColor: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: "14px",
                  minWidth: "150px",
                }}
              >
                <span style={{ fontSize: "11px", color: "#60A5FA", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {bench.name}
                </span>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "#FFFFFF", marginTop: "2px" }}>
                  {typeof bench.score === "number" || !String(bench.score).includes("%")
                    ? `${bench.score}%`
                    : bench.score}
                </span>
              </div>
            ))}
          </div>

          {/* Footer URL watermark */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "12px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#6B7280", fontFamily: "monospace" }}>
              themodelverse.in/models/{slug}
            </span>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>
              Live Architecture &amp; Benchmark Ledger
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
