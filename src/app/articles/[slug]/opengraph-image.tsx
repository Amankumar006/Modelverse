import { ImageResponse } from "next/og";
import { getArticleBySlug } from "@/lib/supabase/articles";

export const alt = "AI Research & Deep Dive — Modelverse";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  const title = article?.title || slug;
  const category = article?.category || "Research";
  const sourceName = article?.source_name || "Modelverse Research";
  const summary = article?.summary || "";

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
            "radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.18), transparent 50%), radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15), transparent 50%)",
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
                backgroundColor: "#7C3AED",
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
                MODELVERSE RESEARCH
              </span>
              <span style={{ fontSize: "10px", color: "#9CA3AF", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                Intelligence Digest &amp; Deep Dives
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "rgba(147, 51, 234, 0.15)",
              border: "1px solid rgba(147, 51, 234, 0.3)",
              color: "#C084FC",
              fontSize: "13px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {category}
          </div>
        </div>

        {/* Center Article Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontSize: title.length > 50 ? "42px" : "50px",
              fontWeight: "900",
              color: "#FFFFFF",
              letterSpacing: "-1px",
              lineHeight: 1.15,
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>

          {summary && (
            <div
              style={{
                fontSize: "18px",
                color: "#9CA3AF",
                lineHeight: 1.4,
                maxWidth: "900px",
                maxHeight: "52px",
                overflow: "hidden",
              }}
            >
              {summary}
            </div>
          )}
        </div>

        {/* Bottom Author / Source & URL Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#F3F4F6" }}>
              Source: {sourceName}
            </span>
          </div>

          <span style={{ fontSize: "13px", color: "#6B7280", fontFamily: "monospace" }}>
            themodelverse.in/articles/{slug}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
