import { NextResponse } from "next/server";
import { getAllModelEntries, SITE_URL } from "@/lib/models";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const models = await getAllModelEntries();
  const indexedModels = models.filter((m) => m.qualityStatus === "indexed");

  let content = `# Modelverse Full Index (llms-full.txt)
> Technical archive of all indexed artificial intelligence models, specifications, and benchmark evaluations.
> Canonical URL: ${SITE_URL}

`;

  for (const m of indexedModels) {
    content += `## ${m.name} (${m.slug})
- **Developer**: ${m.developer}
- **Release Date**: ${m.releaseDate}
- **Parameters**: ${m.parameters || "N/A"}
- **Context Window**: ${m.contextWindow || "N/A"}
- **License**: ${typeof m.license === "object" ? m.license?.name || "Custom" : m.license || "N/A"}
- **Modality**: ${Array.isArray(m.modality) ? m.modality.join(", ") : m.modality || "text"}
- **Deployment**: ${Array.isArray(m.deployment) ? m.deployment.join(", ") : m.deployment || "api"}
- **Primary Task**: ${m.primaryTask || "general"}
- **Description**: ${m.description || m.cardSummary || ""}
- **URL**: ${SITE_URL}/models/${m.slug}
`;

    if (m.benchmarks && m.benchmarks.length > 0) {
      content += `- **Benchmarks**:\n`;
      for (const b of m.benchmarks) {
        content += `  - ${b.name}: ${b.score} (${b.metricType || "performance"})\n`;
      }
    }

    if (m.pricing && m.pricing.length > 0) {
      content += `- **Pricing**:\n`;
      for (const p of m.pricing) {
        content += `  - ${p.tier}: ${p.currency} ${p.amount} / ${p.unit}\n`;
      }
    }

    content += `\n---\n\n`;
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
