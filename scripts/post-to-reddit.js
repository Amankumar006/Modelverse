const fs = require("fs");
const path = require("path");

const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");
const NEW_ARTICLES_PATH = path.join(INGESTION_DIR, "new-articles.json");

async function postToReddit() {
  console.log("🤖 Starting Reddit Automated Posting Bot...");

  // 1. Verify credentials exist
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const username = process.env.REDDIT_USERNAME;
  const password = process.env.REDDIT_PASSWORD;
  const subreddit = process.env.REDDIT_SUBREDDIT || "Modelverse";

  if (!clientId || !clientSecret || !username || !password) {
    console.error("❌ Missing Reddit credentials in environment variables (REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD). Skipping Reddit post.");
    return;
  }

  // 2. Read new articles
  if (!fs.existsSync(NEW_ARTICLES_PATH)) {
    console.log("ℹ️ No new articles JSON found. Nothing to post to Reddit.");
    return;
  }

  let articles = [];
  try {
    articles = JSON.parse(fs.readFileSync(NEW_ARTICLES_PATH, "utf-8"));
  } catch (e) {
    console.error("❌ Failed to parse new-articles.json:", e.message);
    return;
  }

  if (articles.length === 0) {
    console.log("ℹ️ Zero new articles in digest. Skipping Reddit post.");
    return;
  }

  console.log(`📋 Found ${articles.length} new articles to post.`);

  // 3. Format Reddit Markdown Body
  const todayStr = new Date().toISOString().split("T")[0];
  const postTitle = `📰 Modelverse AI News Digest — ${todayStr} (${articles.length} updates)`;
  
  let markdownBody = `Here are the latest AI news and model releases tracked today on [Modelverse](https://www.themodelverse.in):\n\n`;

  articles.forEach((art, index) => {
    const cleanExcerpt = art.excerpt || "";
    markdownBody += `### ${index + 1}. [${art.title}](https://www.themodelverse.in/news/${art.slug})\n`;
    markdownBody += `*Source: ${art.author || "Modelverse Editorial"}*\n\n`;
    markdownBody += `> ${cleanExcerpt}\n\n`;
    markdownBody += `[Read the full story on Modelverse →](https://www.themodelverse.in/news/${art.slug})\n\n`;
    markdownBody += `---\n\n`;
  });

  markdownBody += `*Modelverse tracks foundation models, open-weight releases, and daily news updates as they ship. See the live catalog at [themodelverse.in](https://www.themodelverse.in).*`;

  // 4. Authenticate with Reddit (Get Access Token)
  let accessToken = "";
  try {
    const authHeader = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": `Modelverse-Bot/1.0 by ${username}`
      },
      body: new URLSearchParams({
        grant_type: "password",
        username: username,
        password: password
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Auth failed with HTTP status ${tokenResponse.status}: ${errText}`);
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;
    if (!accessToken) {
      throw new Error("Access token missing in Reddit OAuth response.");
    }
    console.log("✅ Authenticated successfully with Reddit OAuth.");
  } catch (err) {
    console.error("❌ Authentication with Reddit failed:", err.message);
    return;
  }

  // 5. Submit Text Post to Subreddit
  try {
    console.log(`📤 Submitting post to r/${subreddit}...`);
    const submitResponse = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": `Modelverse-Bot/1.0 by ${username}`
      },
      body: new URLSearchParams({
        api_type: "json",
        kind: "self",
        sr: subreddit,
        title: postTitle,
        text: markdownBody
      })
    });

    if (!submitResponse.ok) {
      const errText = await submitResponse.text();
      throw new Error(`Reddit API submission error: HTTP ${submitResponse.status} - ${errText}`);
    }

    const submitResult = await submitResponse.json();
    
    if (submitResult.json?.errors && submitResult.json.errors.length > 0) {
      console.error("❌ Reddit API returned validation errors:", JSON.stringify(submitResult.json.errors));
    } else {
      console.log(`🎉 Post successfully submitted to r/${subreddit}!`);
    }
  } catch (err) {
    console.error("❌ Failed to submit post to Reddit:", err.message);
  }
}

postToReddit();
