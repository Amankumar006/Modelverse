const fs = require("fs");
const path = require("path");

const INDEXNOW_KEY = "45a8b792c3014e5fb963f112e847d9a1";
const HOST = "www.themodelverse.in";
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

async function pingSearchEngines(customUrls = []) {
  console.log("⚡ Starting Search Engine Auto-Indexing Ping...");

  let urlsToPing = new Set(customUrls);

  // Default core pages if custom list not passed
  urlsToPing.add(`${BASE_URL}/`);
  urlsToPing.add(`${BASE_URL}/models`);
  urlsToPing.add(`${BASE_URL}/compare`);
  urlsToPing.add(`${BASE_URL}/trending`);
  urlsToPing.add(`${BASE_URL}/news`);

const supabase = require("../src/lib/supabase");

  // Load recently updated models from production catalog
  try {
    const { data: models, error } = await supabase
      .from("models")
      .select("slug, quality_status")
      .order("release_date", { ascending: false })
      .limit(20);
    if (error) throw error;
    if (models) {
      models.forEach((m) => {
        if (m.slug && m.quality_status === "indexed") urlsToPing.add(`${BASE_URL}/models/${m.slug}`);
      });
    }
  } catch (e) {
    console.warn("⚠️ Could not load models for url extraction:", e.message);
  }

  // Load recent news posts
  try {
    const { data: news, error } = await supabase
      .from("news_items")
      .select("slug, quality_status")
      .eq("status", "published")
      .eq("quality_status", "indexed")
      .order("publish_date", { ascending: false })
      .limit(10);
    if (error) throw error;
    if (news) {
      news.forEach((n) => {
        if (n.slug && n.quality_status === "indexed") urlsToPing.add(`${BASE_URL}/news/${n.slug}`);
      });
    }
  } catch (e) {
    console.warn("⚠️ Could not load news for url extraction:", e.message);
  }

  const urlList = Array.from(urlsToPing);
  console.log(`📋 Total URLs collected for instant indexing: ${urlList.length}`);

  // 1. Submit to IndexNow Protocol (Bing, Yandex, Seznam, Naver)
  try {
    const indexNowPayload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlList,
    };

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(indexNowPayload),
    });

    if (response.ok || response.status === 202) {
      console.log("✅ Successfully submitted URLs to IndexNow protocol (HTTP 200/202)");
    } else {
      const text = await response.text();
      console.warn(`⚠️ IndexNow returned HTTP ${response.status}: ${text}`);
    }
  } catch (err) {
    console.error("❌ IndexNow submit error:", err.message);
  }

  // 2. Ping Google Sitemap Endpoint
  try {
    const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`;
    const googleRes = await fetch(googlePingUrl);
    console.log(`✅ Google Sitemap ping completed (HTTP ${googleRes.status})`);
  } catch (err) {
    console.warn("⚠️ Google Sitemap ping error:", err.message);
  }

  // 3. Ping Bing Sitemap Endpoint
  try {
    const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`;
    const bingRes = await fetch(bingPingUrl);
    console.log(`✅ Bing Sitemap ping completed (HTTP ${bingRes.status})`);
  } catch (err) {
    console.warn("⚠️ Bing Sitemap ping error:", err.message);
  }

  console.log("🎉 Search Engine Auto-Indexing Ping completed cleanly!");
}

// Support CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  pingSearchEngines(args);
}

module.exports = { pingSearchEngines };
