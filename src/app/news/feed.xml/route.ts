import { NextResponse } from "next/server";
import { getArticles } from "@/lib/supabase/articles";

export const revalidate = 3600;

function wrapCdata(content: string): string {
  return `<![CDATA[${content.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
  const { articles } = await getArticles({ limit: 100, isPublished: true });

  const itemsXml = articles
    .map(
      (a) => `
    <item>
      <title>${wrapCdata(a.title)}</title>
      <link>${baseUrl}/articles/${encodeURIComponent(a.slug)}</link>
      <guid isPermaLink="true">${baseUrl}/articles/${encodeURIComponent(a.slug)}</guid>
      <description>${wrapCdata(a.summary || a.title)}</description>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Modelverse — AI News &amp; Intelligence Digest</title>
    <link>${baseUrl}/articles</link>
    <description>Daily breaking artificial intelligence research, papers, and lab releases.</description>
    <language>en-us</language>
    <atom:link href="${baseUrl}/news/feed.xml" rel="self" type="application/rss+xml"/>
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
