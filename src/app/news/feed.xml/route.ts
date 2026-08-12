import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/news";
import { SITE_URL } from "@/lib/models";

export const dynamic = "force-static";

export async function GET() {
  const articles = await getAllArticles();

  const xmlItems = articles
    .map((article) => {
      const pubDate = new Date(article.publishDate).toUTCString();
      const articleUrl = `${SITE_URL}/news/${article.slug}`;
      
      let titlePrefix = "";
      if (article.confidenceLevel === "reported") {
        titlePrefix = "[Reported] ";
      } else if (article.confidenceLevel === "rumor") {
        titlePrefix = "[Rumor] ";
      } else if (article.confidenceLevel === "community-discussion") {
        titlePrefix = "[Community] ";
      }
      
      const displayTitle = `${titlePrefix}${article.title}`;

      return `
    <item>
      <title><![CDATA[${displayTitle}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${article.excerpt}]]></description>
    </item>`;
    })
    .join("");

  const mostRecentDate = articles.length > 0
    ? new Date(articles[0].publishDate).toUTCString()
    : new Date().toUTCString();

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Modelverse — AI Intelligence News</title>
  <link>${SITE_URL}/news</link>
  <description>Practical reads, weekly recaps, and deep-dive model reviews from the Modelverse editorial team.</description>
  <language>en-us</language>
  <lastBuildDate>${mostRecentDate}</lastBuildDate>
  <atom:link href="${SITE_URL}/news/feed.xml" rel="self" type="application/rss+xml" />
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
