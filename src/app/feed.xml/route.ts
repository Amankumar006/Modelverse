import { NextResponse } from "next/server";
import { getAllModels, SITE_URL } from "@/lib/models";

export const dynamic = "force-static";

export async function GET() {
  const models = await getAllModels();

  const xmlItems = models
    .map((model) => {
      const pubDate = new Date(model.releaseDate).toUTCString();
      const modelUrl = `${SITE_URL}/models/${model.slug}`;

      return `
    <item>
      <title><![CDATA[${model.name} by ${model.developer}]]></title>
      <link>${modelUrl}</link>
      <guid isPermaLink="true">${modelUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[Type: ${model.type} | Released: ${model.releaseDate}]]></description>
    </item>`;
    })
    .join("");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Modelverse — Recently Tracked AI Models</title>
  <link>${SITE_URL}</link>
  <description>The latest open-weights breakthroughs and closed-source frontier releases tracked as they ship.</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  ${xmlItems}
</channel>
</rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
