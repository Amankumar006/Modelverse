import { NextResponse } from "next/server";
import { getModels } from "@/lib/supabase/models";

export const revalidate = 3600;

function wrapCdata(content: string): string {
  return `<![CDATA[${content.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
  const { models } = await getModels({ limit: 100, isActive: true });

  const itemsXml = models
    .map(
      (m) => `
    <item>
      <title>${wrapCdata(`${m.name} by ${m.provider}`)}</title>
      <link>${baseUrl}/models/${encodeURIComponent(m.slug)}</link>
      <guid isPermaLink="true">${baseUrl}/models/${encodeURIComponent(m.slug)}</guid>
      <description>${wrapCdata(m.description || `${m.name} specification and benchmark profile`)}</description>
      <pubDate>${new Date(m.release_date || m.created_at).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Modelverse — AI Model Releases</title>
    <link>${baseUrl}</link>
    <description>Living catalogue of artificial intelligence models, parameters, context windows, and documentation.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
