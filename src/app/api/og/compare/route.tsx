import { ImageResponse } from "next/og";
import { getModelBySlug } from "@/lib/models";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const modelsQuery = searchParams.get("models") || "";

    const slugs = modelsQuery
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);

    const models = (
      await Promise.all(slugs.map((slug) => getModelBySlug(slug)))
    ).filter((m): m is NonNullable<typeof m> => m !== null);

    // Fallback if no valid models
    if (models.length === 0) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
              color: "#e0e0e0",
              fontFamily: "sans-serif",
            }}
          >
            <div style={{ fontSize: 48, fontWeight: 800, color: "#ffffff" }}>
              Compare AI Models
            </div>
            <div style={{ fontSize: 24, marginTop: 16, color: "#a0a0b0" }}>
              Modelverse
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const names = models.map((m) => m.name);
    const title = names.join(" vs ");

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "#e0e0e0",
            fontFamily: "sans-serif",
            padding: "48px 60px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 40,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700, color: "#a0a0b0", letterSpacing: 2, textTransform: "uppercase" }}>
              Modelverse Compare
            </div>
            <div style={{ fontSize: 16, color: "#666680" }}>
              themodelverse.in
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 40 ? 36 : 48,
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: 40,
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          {/* Model Cards */}
          <div
            style={{
              display: "flex",
              gap: 24,
              flex: 1,
            }}
          >
            {models.map((model, i) => {
              const params =
                typeof model.parameters === "string"
                  ? model.parameters
                  : "Unknown";
              const ctx =
                typeof model.contextWindow === "string"
                  ? model.contextWindow
                  : "Unknown";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    padding: "28px 24px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#ffffff",
                      marginBottom: 8,
                    }}
                  >
                    {model.name}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "#888899",
                      marginBottom: 20,
                    }}
                  >
                    {model.developer}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      fontSize: 15,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888899" }}>Parameters</span>
                      <span style={{ color: "#e0e0e0", fontWeight: 600 }}>
                        {params}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888899" }}>Context</span>
                      <span style={{ color: "#e0e0e0", fontWeight: 600 }}>
                        {ctx}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#888899" }}>Type</span>
                      <span style={{ color: "#e0e0e0", fontWeight: 600 }}>
                        {model.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (err) {
    console.error("Error generating OG compare image:", err);
    return new Response("Failed to generate image", { status: 500 });
  }
}
