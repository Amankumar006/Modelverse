import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * Out-of-band pipeline watchdog.
 *
 * Every content-pipeline alert used to live INSIDE the GitHub Actions
 * workflows it monitors (`if: failure()` steps). When Actions itself dies —
 * e.g. the August 2026 billing block where every scheduled run was rejected
 * before any step executed — those alerts went silent with it, and the whole
 * catalog froze while nothing made noise.
 *
 * This route runs on Vercel's infrastructure (separate billing plane) and
 * alarms on ground truth instead of workflow outcomes:
 *
 *   1. news staleness      — newest news_items.created_at older than 36h
 *   2. model recheck lapse — newest models.quality_checked_at older than 26h
 *                            (the hourly quality-check worker refreshes it)
 *   3. Actions corroboration — last successful workflow run older than 26h
 *                            via the public GitHub API. API failures count as
 *                            "unknown", never as an alarm by themselves —
 *                            checks 1–2 measure actual pipeline output, this
 *                            one only corroborates.
 *
 * Any `fail` posts to the shared Discord webhook. Always returns 200 after
 * evaluating (a stalled pipeline isn't fixed by Vercel retrying the cron);
 * 401/500 are reserved for auth/config problems.
 */

const GITHUB_REPO = "Amankumar006/Modelverse";
const NEWS_STALE_HOURS = 36;
const WORKER_STALE_HOURS = 26;
const ACTIONS_STALE_HOURS = 26;

type CheckStatus = "ok" | "fail" | "unknown";
interface WatchdogCheck {
  name: string;
  status: CheckStatus;
  detail: string;
}

function hoursSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  return (Date.now() - then) / 3_600_000;
}

// Constructed through a factory so the client type used by the check helpers
// below matches real call-site inference instead of createClient's default
// generics (which collapse untyped schemas to `never`).
function makeDb(url: string, key: string) {
  return createClient(url, key);
}
type Db = ReturnType<typeof makeDb>;

async function checkNewsFreshness(db: Db): Promise<WatchdogCheck> {
  const { data, error } = await db
    .from("news_items")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { name: "news_freshness", status: "fail", detail: `no readable news rows (${error?.message || "empty table"})` };
  }
  const age = hoursSince(data.created_at);
  if (age === null) {
    return { name: "news_freshness", status: "unknown", detail: "unparseable created_at" };
  }
  return age > NEWS_STALE_HOURS
    ? { name: "news_freshness", status: "fail", detail: `newest article is ${age.toFixed(1)}h old (threshold ${NEWS_STALE_HOURS}h)` }
    : { name: "news_freshness", status: "ok", detail: `newest article ${age.toFixed(1)}h old` };
}

async function checkModelRechecks(db: Db): Promise<WatchdogCheck> {
  const { data, error } = await db
    .from("models")
    .select("quality_checked_at")
    .not("quality_checked_at", "is", null)
    .order("quality_checked_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { name: "model_rechecks", status: "unknown", detail: `no readable quality_checked_at (${error?.message || "none set"})` };
  }
  const age = hoursSince(data.quality_checked_at);
  if (age === null) {
    return { name: "model_rechecks", status: "unknown", detail: "unparseable quality_checked_at" };
  }
  return age > WORKER_STALE_HOURS
    ? { name: "model_rechecks", status: "fail", detail: `last worker recheck ${age.toFixed(1)}h old (threshold ${WORKER_STALE_HOURS}h)` }
    : { name: "model_rechecks", status: "ok", detail: `last worker recheck ${age.toFixed(1)}h old` };
}

async function checkActionsRuns(): Promise<WatchdogCheck> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?status=success&per_page=1`,
      {
        headers: { Accept: "application/vnd.github+json", "User-Agent": "modelverse-watchdog" },
        signal: AbortSignal.timeout(10_000),
        // Corroboration only — never cache a stale "healthy" verdict.
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return { name: "actions_runs", status: "unknown", detail: `GitHub API HTTP ${res.status}` };
    }
    const payload = (await res.json()) as { workflow_runs?: Array<{ updated_at?: string }> };
    const lastRun = payload.workflow_runs?.[0];
    const age = hoursSince(lastRun?.updated_at);
    if (age === null) {
      return { name: "actions_runs", status: "unknown", detail: "no successful runs returned by API" };
    }
    return age > ACTIONS_STALE_HOURS
      ? { name: "actions_runs", status: "fail", detail: `last successful workflow run ${age.toFixed(1)}h ago (threshold ${ACTIONS_STALE_HOURS}h)` }
      : { name: "actions_runs", status: "ok", detail: `last successful workflow run ${age.toFixed(1)}h ago` };
  } catch (err) {
    return { name: "actions_runs", status: "unknown", detail: `GitHub API unreachable: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function postDiscordAlert(checks: WatchdogCheck[]): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("⚠️ DISCORD_WEBHOOK_URL not configured; alert not sent");
    return false;
  }
  const failed = checks.filter((c) => c.status === "fail").map((c) => `- ${c.name}: ${c.detail}`).join("\n");
  const unknown = checks.filter((c) => c.status === "unknown").map((c) => `- ${c.name}: ${c.detail}`).join("\n");
  const content = [
    "🚨 **[Modelverse] Pipeline watchdog alarm**",
    "",
    failed,
    unknown ? `\nUnknown (not alarming): \n${unknown}` : "",
    "",
    "_The content pipeline looks stalled. Check GitHub Actions billing/run history and worker health._",
  ].join("\n");

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch (err) {
    console.error("❌ Discord alert failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
  const db = makeDb(supabaseUrl, supabaseKey);

  const checks = await Promise.all([
    checkNewsFreshness(db),
    checkModelRechecks(db),
    checkActionsRuns(),
  ]);

  const healthy = !checks.some((c) => c.status === "fail");
  let alerted = false;
  if (!healthy) {
    alerted = await postDiscordAlert(checks);
  }

  return NextResponse.json({ checkedAt: new Date().toISOString(), healthy, alerted, checks });
}
