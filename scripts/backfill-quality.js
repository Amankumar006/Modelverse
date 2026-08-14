"use strict";

require("dotenv").config({ path: ".env.local", quiet: true });
require("dotenv").config({ quiet: true });

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { scoreModelPage, scoreNewsArticle } = require("./quality/score-content");

const REPORT_PATH = path.join(process.cwd(), "data", "quality-report.json");
const SOURCE_TIMEOUT_MS = 12_000;

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  return createClient(url, key);
}

function textFromHtml(html) {
  return String(html || "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50_000);
}

async function fetchSourceText(url) {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Modelverse-Quality-Backfill/1.0" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!response.ok) return "";
    return textFromHtml(await response.text());
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function modelForScore(row) {
  return {
    ...(row.metadata || {}),
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    releaseDate: row.release_date,
    parameters: row.parameters,
    contextWindow: row.context_window,
    license: row.license,
    description: row.description,
    descriptionDraft: row.description_draft,
    benchmarks: row.benchmarks,
    cardSummary: row.card_summary,
    pageOverview: row.page_overview,
    editorialNote: row.editorial_note,
  };
}

function newsForScore(row) {
  const sources = (Array.isArray(row.sources) && row.sources.length > 0)
    ? row.sources
    : (Array.isArray(row.external_sources) ? row.external_sources : []);
  return {
    slug: row.slug,
    title: row.title,
    body: row.body,
    sources,
    external_sources: row.external_sources || [],
  };
}

function sourceUrl(entry) {
  return typeof entry === "string" ? entry : entry?.url;
}

async function readAll(db, table) {
  const pageSize = 200;
  const rows = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await db.from(table).select("*").range(from, from + pageSize - 1);
    if (error) throw new Error(`${table} read failed: ${error.message || "unknown error"}`);
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
  }
}

function writeReport(report) {
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);
}

function emptyCounts() {
  return { total: 0, indexed: 0, thin: 0, unlisted: 0, failed: 0 };
}

function percentage(value, total) {
  return total ? Number(((value / total) * 100).toFixed(1)) : 0;
}

async function backfill({ dryRun = false } = {}) {
  const db = getClient();
  // A small, explicit schema preflight prevents status writes from silently
  // failing if someone runs this before the additive SQL migration.
  const { error: schemaError } = await db.from("models").select("quality_status", { head: true, count: "exact" });
  if (schemaError) {
    throw new Error("Quality migration is not applied. Apply database/migrations/20260814000000_add_quality_gate.sql before running this script.");
  }

  const [models, articles] = await Promise.all([readAll(db, "models"), readAll(db, "news_items")]);
  const report = {
    generatedAt: new Date().toISOString(),
    pipeline: "quality-backfill",
    dryRun,
    models: emptyCounts(),
    news: emptyCounts(),
  };

  for (const row of models) {
    try {
      const gate = scoreModelPage(modelForScore(row));
      report.models.total += 1;
      if (!dryRun) {
        const { error } = await db.from("models").update({
          quality_status: gate.status,
          quality_score: gate.score,
          quality_reasons: gate.reasons,
          quality_checked_at: new Date().toISOString(),
        }).eq("id", row.id);
        if (error) throw new Error(error.message || "model update failed");
      }
      if (gate.status === "indexed") report.models.indexed += 1;
      else report.models.thin += 1;
    } catch (error) {
      report.models.total += 1;
      report.models.failed += 1;
      console.error(`⚠️ Model ${row.slug || row.id} was not backfilled: ${error.message}`);
    }
  }

  for (const row of articles) {
    try {
      const article = newsForScore(row);
      const sourceUrls = article.sources.map(sourceUrl).filter((source) => typeof source === "string").slice(0, 3);
      const sourceTexts = (await Promise.all(sourceUrls.map(fetchSourceText))).filter(Boolean);
      const gate = scoreNewsArticle(article, sourceTexts);
      report.news.total += 1;
      if (!dryRun) {
        const { error } = await db.from("news_items").update({
          sources: (Array.isArray(row.sources) && row.sources.length > 0) ? row.sources : article.sources,
          quality_status: gate.status,
          quality_score: gate.score,
          quality_reasons: gate.reasons,
          quality_checked_at: new Date().toISOString(),
        }).eq("id", row.id);
        if (error) throw new Error(error.message || "news update failed");
      }
      if (gate.status === "indexed") report.news.indexed += 1;
      else report.news.unlisted += 1;
    } catch (error) {
      report.news.total += 1;
      report.news.failed += 1;
      console.error(`⚠️ News ${row.slug || row.id} was not backfilled: ${error.message}`);
    }
  }

  const total = report.models.total + report.news.total;
  const indexed = report.models.indexed + report.news.indexed;
  const unlistedOrThin = report.models.thin + report.news.unlisted;
  report.summary = {
    total,
    indexed,
    unlistedOrThin,
    failed: report.models.failed + report.news.failed,
    indexedPercent: percentage(indexed, total),
    thinOrUnlistedPercent: percentage(unlistedOrThin, total),
  };
  // Keep the flat keys used by existing workflow digest readers.
  report.indexed = indexed;
  report.unlistedOrThin = unlistedOrThin;
  report.quarantined = 0; // Existing published content is not moved by a backfill.
  writeReport(report);
  console.log(JSON.stringify(report.summary));
  return report;
}

if (require.main === module) {
  backfill({ dryRun: process.argv.includes("--dry-run") }).catch((error) => {
    console.error(`❌ Quality backfill stopped: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { backfill, modelForScore, newsForScore, textFromHtml };
