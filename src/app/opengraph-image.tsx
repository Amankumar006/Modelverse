import { ImageResponse } from "next/og";

export const alt = "Modelverse — The Open Foundation Model Catalog";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
            "radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.22), transparent 50%), radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15), transparent 50%)",
          padding: "56px 64px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                backgroundColor: "#2563EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "900",
                color: "#FFFFFF",
              }}
            >
              M
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "18px", fontWeight: "900", letterSpacing: "1px", color: "#FFFFFF" }}>
                MODELVERSE
              </span>
              <span style={{ fontSize: "11px", color: "#9CA3AF", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Open Intelligence Architecture
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              color: "#60A5FA",
              fontSize: "14px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Real-Time AI Catalog
          </div>
        </div>

        {/* Center Title & Tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "58px",
              fontWeight: "900",
              color: "#FFFFFF",
              letterSpacing: "-1.5px",
              lineHeight: 1.05,
              maxWidth: "1000px",
            }}
          >
            The Open Foundation Model Catalog
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#9CA3AF",
              lineHeight: 1.4,
              maxWidth: "850px",
            }}
          >
            Explore 376+ frontier AI models, verified benchmark scores, parameter counts, context architectures, and live API pricing rates.
          </div>
        </div>

        {/* Bottom Highlights & Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>Foundation Models</span>
              <span style={{ fontSize: "22px", fontWeight: "900", color: "#60A5FA", marginTop: "2px" }}>376+ Models</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>AI Research Labs</span>
              <span style={{ fontSize: "22px", fontWeight: "900", color: "#34D399", marginTop: "2px" }}>23 Providers</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "12px 20px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
              }}
            >
              <span style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>Domain Modalities</span>
              <span style={{ fontSize: "22px", fontWeight: "900", color: "#F472B6", marginTop: "2px" }}>7 Categories</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              paddingTop: "12px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6B7280", fontFamily: "monospace" }}>
              themodelverse.in
            </span>
            <span style={{ fontSize: "14px", color: "#6B7280" }}>
              Open Intelligence Catalog
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
