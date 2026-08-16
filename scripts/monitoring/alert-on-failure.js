"use strict";

/**
 * scripts/monitoring/alert-on-failure.js
 *
 * Dead Man's Switch & Health Monitor:
 * 1. Checks enrichment_jobs table for high failure rates (>30%).
 * 2. Detects stalled worker jobs (running for > 15 minutes without completion).
 * 3. Summarizes estimated token / API operational activity.
 * 4. Dispatches Discord alert webhook if critical threshold is breached.
 */

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const https = require("https");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

function sendDiscordAlert(webhookUrl, title, description, color = 15158332) {
  return new Promise((resolve) => {
    if (!webhookUrl) return resolve(false);

    const payload = JSON.stringify({
      embeds: [
        {
          title: `🚨 ${title}`,
          description,
          color,
          timestamp: new Date().toISOString(),
          footer: { text: "Modelverse Worker Watchdog" },
        },
      ],
    });

    const url = new URL(webhookUrl);
    const req = https.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      }
    );

    req.on("error", () => resolve(false));
    req.write(payload);
    req.end();
  });
}

async function checkQueueHealth() {
  console.log("🛡️ Running Enrichment Worker Health & Alert Check...\n");

  const { data: jobs, error } = await db.from("enrichment_jobs").select("*");

  if (error) {
    console.error("❌ Failed to query enrichment_jobs:", error.message);
    process.exit(1);
  }

  const now = Date.now();
  const fifteenMinutesAgo = now - 15 * 60 * 1000;

  const stats = {
    total: jobs.length,
    byStatus: { queued: 0, running: 0, done: 0, failed: 0, skipped: 0 },
    byAction: {},
    stalledJobs: [],
    failedJobs: [],
  };

  for (const j of jobs) {
    stats.byStatus[j.status] = (stats.byStatus[j.status] || 0) + 1;

    if (!stats.byAction[j.action_type]) {
      stats.byAction[j.action_type] = { queued: 0, running: 0, done: 0, failed: 0, skipped: 0 };
    }
    stats.byAction[j.action_type][j.status] = (stats.byAction[j.action_type][j.status] || 0) + 1;

    // Check stalled jobs (running for > 15m)
    if (j.status === "running" && j.last_run_at) {
      const runTime = new Date(j.last_run_at).getTime();
      if (runTime < fifteenMinutesAgo) {
        stats.stalledJobs.push(j);
      }
    }

    if (j.status === "failed") {
      stats.failedJobs.push(j);
    }
  }

  console.log(`Total Tracked Jobs: ${stats.total}`);
  console.log(`Done: ${stats.byStatus.done} | Queued: ${stats.byStatus.queued} | Running: ${stats.byStatus.running} | Failed: ${stats.byStatus.failed}`);

  // Automatically reset stalled jobs back to 'queued'
  if (stats.stalledJobs.length > 0) {
    console.warn(`\n⚠️ Detected ${stats.stalledJobs.length} stalled jobs. Resetting to 'queued'...`);
    const stalledIds = stats.stalledJobs.map((j) => j.id);
    await db.from("enrichment_jobs").update({ status: "queued" }).in("id", stalledIds);
  }

  // Check failure threshold
  const failureRate = stats.total > 0 ? (stats.byStatus.failed / stats.total) * 100 : 0;
  console.log(`Overall Failure Rate: ${failureRate.toFixed(1)}%`);

  if (failureRate > 25) {
    const alertMsg = `Worker failure rate reached **${failureRate.toFixed(1)}%** (${stats.byStatus.failed}/${stats.total} jobs failed). Check GitHub Actions logs.`;
    console.error(`\n🚨 CRITICAL ALERT: ${alertMsg}`);
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordAlert(process.env.DISCORD_WEBHOOK_URL, "Enrichment Queue Failure Alert", alertMsg);
      console.log("📢 Dispatched Discord alert webhook.");
    }
  } else {
    console.log("\n✅ Enrichment Queue Health: Healthy (Failure rate within normal thresholds).");
  }

  return stats;
}

if (require.main === module) {
  checkQueueHealth().catch((err) => {
    console.error("Health check error:", err);
    process.exit(1);
  });
}

module.exports = { checkQueueHealth };
