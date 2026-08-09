const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const INGESTION_DIR = path.join(process.cwd(), "data", "ingestion");
const DIGEST_PATH = path.join(INGESTION_DIR, "latest-digest.html");

if (!fs.existsSync(INGESTION_DIR)) {
  fs.mkdirSync(INGESTION_DIR, { recursive: true });
}

const supabase = require("../src/lib/supabase");

async function generateEmailDigest() {
  console.log("📧 Generating Email Digest...");

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  let newModels = [];
  try {
    const { data, error } = await supabase
      .from("models")
      .select("*")
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false });
      
    if (error) throw error;
    newModels = data || [];
  } catch (err) {
    console.error("Supabase fetch error:", err.message);
  }

  // Fallback for manual test runs (workflow_dispatch)
  if (newModels.length === 0) {
    console.log("No recent models found in last 24h. Gathering top 5 newest models for digest...");
    try {
      const { data, error } = await supabase
        .from("models")
        .select("*")
        .order("release_date", { ascending: false })
        .limit(5);
        
      if (error) throw error;
      newModels = data || [];
    } catch (e) {
      console.error("Fallback error:", e.message);
    }
  }

  if (newModels.length === 0) {
    console.log("No models detected for email digest.");
    if (process.env.GITHUB_ENV) {
      fs.appendFileSync(process.env.GITHUB_ENV, "NEW_MODELS_PUSHED=false\n");
    }
    return;
  }

  console.log(`Found ${newModels.length} new models for email digest.`);

  // Build HTML email body
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const modelRowsHtml = newModels
    .map(
      (m) => `
      <tr style="border-bottom: 1px solid #243629;">
        <td style="padding: 12px; font-weight: bold; color: #ffffff;">${m.name}</td>
        <td style="padding: 12px; color: #4ADE80;">${m.developer}</td>
        <td style="padding: 12px; color: #A3B8AA;">${m.verification_status || 'DRAFT'}</td>
        <td style="padding: 12px; text-align: right;">
          <a href="https://www.themodelverse.in/admin/review/${m.slug}" style="display: inline-block; padding: 6px 12px; background-color: #4ADE80; color: #0C120F; font-weight: bold; text-decoration: none; border-radius: 6px; font-size: 12px;">Review →</a>
        </td>
      </tr>
    `
    )
    .join("");

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Modelverse Daily Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0C120F; color: #E2E8E4; margin: 0; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #121A15; border: 1px solid #243629; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
    
    <!-- Header -->
    <div style="border-bottom: 1px solid #243629; padding-bottom: 16px; margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 20px; color: #ffffff; display: flex; align-items: center; gap: 8px;">
        🤖 Modelverse Ingestion Digest
      </h1>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #8C9E91;">Published on ${dateStr}</p>
    </div>

    <!-- Intro -->
    <p style="font-size: 14px; line-height: 1.5; color: #A3B8AA;">
      The automated daily ingestion pipeline discovered <strong>${newModels.length} new AI model(s)</strong>. They have been added to your <a href="https://www.themodelverse.in/admin" style="color: #4ADE80; text-decoration: underline;">Admin Review Queue</a> for verification:
    </p>

    <!-- Table -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; text-align: left;">
      <thead>
        <tr style="background-color: #1A261D; color: #8C9E91;">
          <th style="padding: 10px;">Model Name</th>
          <th style="padding: 10px;">Developer</th>
          <th style="padding: 10px;">Status</th>
          <th style="padding: 10px; text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${modelRowsHtml}
      </tbody>
    </table>

    <!-- Footer -->
    <div style="margin-top: 24px; padding-top: 16px; border-t: 1px solid #243629; font-size: 11px; color: #5A6E60; text-align: center;">
      <p style="margin: 0;">Sent by Modelverse Automated Pipeline • <a href="https://www.themodelverse.in" style="color: #4ADE80;">themodelverse.in</a></p>
    </div>

  </div>
</body>
</html>
`;

  fs.writeFileSync(DIGEST_PATH, htmlBody, "utf-8");
  console.log(`Saved email digest HTML to ${DIGEST_PATH}`);

  if (process.env.GITHUB_ENV) {
    fs.appendFileSync(process.env.GITHUB_ENV, "NEW_MODELS_PUSHED=true\n");
    fs.appendFileSync(process.env.GITHUB_ENV, `NEW_MODELS_COUNT=${newModels.length}\n`);
  }
}

generateEmailDigest();
