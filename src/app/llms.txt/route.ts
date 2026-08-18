import { NextResponse } from "next/server";
import { getAllModelEntries, SITE_URL } from "@/lib/models";
import { getAllArticles } from "@/lib/news";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const models = await getAllModelEntries();
  const indexedModels = models.filter((m) => m.qualityStatus === "indexed");
  const articles = (await getAllArticles()).slice(0, 10);

  const content = `# Modelverse (themodelverse.in)
> Every AI model, every release. A structured, living technical archive of frontier LLMs, open-weight breakthroughs, verified benchmarks, and pricing.

## Key Sections
- [Model Catalog](${SITE_URL}/models): Browse and filter all verified AI models with parameter counts, context windows, and licensing.
- [LLM Benchmarks & Leaderboard](${SITE_URL}/models/benchmarks): Compare models across MMLU, SWE-bench, HumanEval, GPQA, and other standardized evaluation suites.
- [Side-by-Side Model Comparison](${SITE_URL}/compare): Interactive side-by-side comparison of architectures, pricing, context windows, and benchmarks.
- [AI Research News & Deep-Dives](${SITE_URL}/news): Technical news reviews, release analyses, and weekly recaps.
- [AI Release Timeline](${SITE_URL}/timeline): Chronological history of all AI foundation model shipments.
- [Archive](${SITE_URL}/archive): Historical records of legacy and previous generation architectures.

## Recent Flagship Models
${indexedModels
  .slice(0, 20)
  .map(
    (m) =>
      `- [${m.name}](${SITE_URL}/models/${m.slug}): ${m.parameters ? `${m.parameters} parameters, ` : ""}developed by ${m.developer}. ${m.cardSummary || m.description || ""}`
  )
  .join("\n")}

## Recent News & Analyses
${articles
  .map((a) => `- [${a.title}](${SITE_URL}/news/${a.slug}): ${a.excerpt}`)
  .join("\n")}

## API & Feeds
- RSS Feed (Models): ${SITE_URL}/feed.xml
- RSS Feed (News): ${SITE_URL}/news/feed.xml
- Full LLMs Directory: ${SITE_URL}/llms-full.txt
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
