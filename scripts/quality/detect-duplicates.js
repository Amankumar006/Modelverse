"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { jaccardSimilarity, shingleSet } = require("./score-content");

const DEFAULT_INDEX_PATH = path.join(process.cwd(), "data", "cache", "content-fingerprints.json");
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

function contentFor(item) {
  if (!item || typeof item !== "object") return "";
  return [item.title, item.body, item.description, item.excerpt, item.pageOverview].filter((value) => typeof value === "string").join("\n");
}

function fingerprintFor(item) {
  const content = contentFor(item);
  return {
    slug: typeof item?.slug === "string" ? item.slug : "unknown-item",
    title: typeof item?.title === "string" ? item.title : "",
    contentHash: crypto.createHash("sha256").update(content).digest("hex"),
    shingles: [...shingleSet(content)],
    checkedAt: new Date().toISOString(),
  };
}

function normalizeCorpus(corpus) {
  if (Array.isArray(corpus)) return corpus;
  if (corpus && typeof corpus === "object") return Object.values(corpus.entries || corpus.items || corpus);
  return [];
}

function findNearDuplicates(newItem, existingCorpusArray, { threshold = 0.75 } = {}) {
  try {
    const current = fingerprintFor(newItem);
    let bestMatch = null;
    for (const entry of normalizeCorpus(existingCorpusArray)) {
      if (!entry || entry.slug === current.slug) continue;
      const existingShingles = new Set(Array.isArray(entry.shingles) ? entry.shingles : [...shingleSet(contentFor(entry))]);
      const similarity = entry.contentHash === current.contentHash ? 1 : jaccardSimilarity(new Set(current.shingles), existingShingles);
      if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
        bestMatch = { slug: entry.slug || "unknown-item", similarity: Number(similarity.toFixed(3)) };
      }
    }
    return bestMatch;
  } catch {
    return null;
  }
}

function loadFingerprintIndex(indexPath = DEFAULT_INDEX_PATH) {
  try {
    if (!fs.existsSync(indexPath)) return { entries: {} };
    const parsed = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    return { entries: parsed?.entries && typeof parsed.entries === "object" ? parsed.entries : {} };
  } catch {
    return { entries: {} };
  }
}

function appendFingerprint(item, { indexPath = DEFAULT_INDEX_PATH, now = new Date() } = {}) {
  try {
    const index = loadFingerprintIndex(indexPath);
    const cutoff = now.getTime() - WINDOW_MS;
    for (const [slug, entry] of Object.entries(index.entries)) {
      const timestamp = Date.parse(entry?.checkedAt || "");
      if (!Number.isFinite(timestamp) || timestamp < cutoff) delete index.entries[slug];
    }
    const fingerprint = fingerprintFor(item);
    index.entries[fingerprint.slug] = fingerprint;
    fs.mkdirSync(path.dirname(indexPath), { recursive: true });
    fs.writeFileSync(indexPath, `${JSON.stringify({ generatedAt: now.toISOString(), entries: index.entries }, null, 2)}\n`);
    return fingerprint;
  } catch {
    return null;
  }
}

module.exports = { findNearDuplicates, loadFingerprintIndex, appendFingerprint, fingerprintFor };
