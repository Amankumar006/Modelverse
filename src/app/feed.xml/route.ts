import { NextResponse } from "next/server";
import { getModels } from "@/lib/supabase/models";

export const revalidate = 3600;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://modelverse.ai";
  const { models } = await getModels({ limit: 50, isActive: true });

  const itemsXml = models
    .map(
      (m) => `
    <item>
      <title><![CDATA[${m.name} by ${m.provider}]]></title>
      <link>${baseUrl}/models/${m.slug}</link>
      <guid isPermaLink="true">${baseUrl}/models/${m.slug}</guid>
      <description><![CDATA[${m.description || `${m.name} specification and benchmark profile`}]]></description>
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

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
