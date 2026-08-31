import { NextResponse } from "next/server";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";

export const revalidate = 3600;

function wrapCdata(content: string): string {
  return `<![CDATA[${content.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
  
  const [modelsRes, articlesRes] = await Promise.all([
    getModels({ limit: 100, isActive: true }),
    getArticles({ limit: 100, isPublished: true }),
  ]);

  const allItems = [
    ...modelsRes.models.map(m => ({
      title: `${m.name} by ${m.provider}`,
      link: `${baseUrl}/models/${encodeURIComponent(m.slug)}`,
      description: m.description || `${m.name} specification and benchmark profile`,
      pubDate: new Date(m.release_date || m.created_at).toUTCString(),
      lastmod: new Date(m.updated_at || m.created_at).getTime(),
    })),
    ...articlesRes.articles.map(a => ({
      title: a.title,
      link: `${baseUrl}/articles/${encodeURIComponent(a.slug)}`,
      description: a.summary || a.title,
      pubDate: new Date(a.published_at || a.created_at).toUTCString(),
      lastmod: new Date(a.updated_at || a.published_at).getTime(),
    }))
  ];

  allItems.sort((a, b) => b.lastmod - a.lastmod);

  const itemsXml = allItems
    .map(
      (item) => `
    <item>
      <title>${wrapCdata(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${wrapCdata(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
    </item>`
    )
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Modelverse — AI Models and Articles</title>
    <link>${baseUrl}</link>
    <description>Living catalogue of artificial intelligence models, parameters, context windows, documentation, and tech articles.</description>
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
