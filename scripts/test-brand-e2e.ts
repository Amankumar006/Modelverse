/**
 * Comprehensive Opaque-Box E2E Brand Verification & Acceptance Test Suite
 *
 * Verifies "TheModelverse" brand standardization, title suffix deduplication,
 * structured data, and high-intent long-tail SEO positioning across Tiers 1-4.
 *
 * Usage:
 *   npx tsx scripts/test-brand-e2e.ts [--baseline] [--json]
 */

import fs from 'fs';
import path from 'path';

// --- Console Formatting ---
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

// --- Test Infrastructure Types ---
export type Tier = 1 | 2 | 3 | 4;

export interface TestResult {
  id: string;
  tier: Tier;
  feature: string;
  name: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  error?: string;
  details?: string;
}

export interface TestCase {
  id: string;
  tier: Tier;
  feature: string;
  name: string;
  run: () => Promise<void> | void;
}

const ROOT_DIR = process.cwd();
const SRC_APP_DIR = path.join(ROOT_DIR, 'src/app');
const SRC_COMPONENTS_DIR = path.join(ROOT_DIR, 'src/components');
const NEXT_BUILD_APP_DIR = path.join(ROOT_DIR, '.next/server/app');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// --- Helper Functions ---
function readFileSafe(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function normalizeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©');
}

function extractTagContent(html: string, tagName: string): string[] {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'gi');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(normalizeEntities(match[1].trim()));
  }
  return matches;
}

function extractJsonLdBlocks(html: string): Record<string, unknown>[] {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const jsonLdBlocks: Record<string, unknown>[] = [];
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      jsonLdBlocks.push(parsed as Record<string, unknown>);
    } catch {
      // ignore parse errors
    }
  }
  return jsonLdBlocks;
}

// Bare "Modelverse" detector: matches "Modelverse" without preceding "The" or "the"
// Excludes internal code tokens, file imports, and GitHub URLs.
export function hasBareModelverse(text: string): boolean {
  const clean = text
    .replace(/https?:\/\/github\.com\/[^\s"']+/g, '')
    .replace(/ModelverseLogo/g, '')
    .replace(/\/logos\/[^\s"']+/g, '')
    .replace(/import\s+[\s\S]*?from\s+["'][^"']+["']/g, '');

  return /(?<!The)(?<!the)\bModelverse\b/.test(clean);
}

// --- Test Suite Definition ---
export const tests: TestCase[] = [
  // ==========================================
  // TIER 1: FEATURE COVERAGE (F1 - F14)
  // ==========================================

  // F1: Root Layout Metadata & Title Template
  {
    id: 'T1-F1-01',
    tier: 1,
    feature: 'F1',
    name: 'Root Layout: Metadata Base URL is set to https://www.themodelverse.in',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      if (!content.includes('https://www.themodelverse.in')) {
        throw new Error('Root layout metadataBase does not reference https://www.themodelverse.in');
      }
    },
  },
  {
    id: 'T1-F1-02',
    tier: 1,
    feature: 'F1',
    name: 'Root Layout: Title template is standardized to "%s | TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      const templateMatch = content.match(/template:\s*["']([^"']+)["']/);
      if (!templateMatch) {
        throw new Error('Title template not found in src/app/layout.tsx');
      }
      const template = templateMatch[1];
      if (template !== '%s | TheModelverse') {
        throw new Error(`Expected title template "%s | TheModelverse", but found "${template}"`);
      }
    },
  },
  {
    id: 'T1-F1-03',
    tier: 1,
    feature: 'F1',
    name: 'Root Layout: Default title uses "TheModelverse" with high-intent positioning',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      const defaultMatch = content.match(/default:\s*["']([^"']+)["']/);
      if (!defaultMatch) {
        throw new Error('Default title not found in src/app/layout.tsx');
      }
      const defaultTitle = defaultMatch[1];
      if (!defaultTitle.includes('TheModelverse')) {
        throw new Error(`Default title must contain "TheModelverse", found: "${defaultTitle}"`);
      }
      if (!defaultTitle.includes('Foundation Model Catalog')) {
        throw new Error(`Default title must contain "Foundation Model Catalog", found: "${defaultTitle}"`);
      }
      if (!defaultTitle.includes('LLM Benchmark Database')) {
        throw new Error(`Default title must contain "LLM Benchmark Database", found: "${defaultTitle}"`);
      }
    },
  },
  {
    id: 'T1-F1-04',
    tier: 1,
    feature: 'F1',
    name: 'Root Layout: Creator and publisher declared as "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      if (!content.match(/creator:\s*["']TheModelverse["']/)) {
        throw new Error('Root layout creator is not "TheModelverse"');
      }
      if (!content.match(/publisher:\s*["']TheModelverse["']/)) {
        throw new Error('Root layout publisher is not "TheModelverse"');
      }
    },
  },
  {
    id: 'T1-F1-05',
    tier: 1,
    feature: 'F1',
    name: 'Root Layout: OpenGraph siteName and title declared as "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      if (!content.match(/siteName:\s*["']TheModelverse["']/)) {
        throw new Error('Root layout openGraph.siteName is not "TheModelverse"');
      }
      const ogTitle = content.match(/openGraph:\s*\{[\s\S]*?title:\s*["']([^"']+)["']/);
      if (!ogTitle || !ogTitle[1].includes('TheModelverse')) {
        throw new Error(`Root layout openGraph.title does not contain "TheModelverse": ${ogTitle ? ogTitle[1] : 'none'}`);
      }
    },
  },

  // F2: Route Title Suffix Deduplication (No hardcoded "— Modelverse")
  {
    id: 'T1-F2-01',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /about title has no hardcoded "— Modelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'about/page.tsx'));
      const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch && (titleMatch[1].endsWith('— Modelverse') || titleMatch[1].includes('Modelverse —'))) {
        throw new Error(`About page has hardcoded bare brand suffix in title: "${titleMatch[1]}"`);
      }
    },
  },
  {
    id: 'T1-F2-02',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /terms title has no hardcoded "— Modelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'terms/page.tsx'));
      const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch && titleMatch[1].endsWith('— Modelverse')) {
        throw new Error(`Terms page has hardcoded "— Modelverse" suffix in title: "${titleMatch[1]}"`);
      }
    },
  },
  {
    id: 'T1-F2-03',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /privacy title has no hardcoded "— Modelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'privacy/page.tsx'));
      const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch && titleMatch[1].endsWith('— Modelverse')) {
        throw new Error(`Privacy page has hardcoded "— Modelverse" suffix in title: "${titleMatch[1]}"`);
      }
    },
  },
  {
    id: 'T1-F2-04',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /security title has no hardcoded "— Modelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'security/page.tsx'));
      const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch && titleMatch[1].endsWith('— Modelverse')) {
        throw new Error(`Security page has hardcoded "— Modelverse" suffix in title: "${titleMatch[1]}"`);
      }
    },
  },
  {
    id: 'T1-F2-05',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /methodology title has no hardcoded "— Modelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'methodology/page.tsx'));
      const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch && titleMatch[1].endsWith('— Modelverse')) {
        throw new Error(`Methodology page has hardcoded "— Modelverse" suffix in title: "${titleMatch[1]}"`);
      }
    },
  },
  {
    id: 'T1-F2-06',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /submit title has no hardcoded "— Modelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'submit/layout.tsx'));
      const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
      if (titleMatch && titleMatch[1].endsWith('— Modelverse')) {
        throw new Error(`Submit page has hardcoded "— Modelverse" suffix in title: "${titleMatch[1]}"`);
      }
    },
  },
  {
    id: 'T1-F2-07',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /articles/[slug] title generator has no hardcoded "— Modelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'articles/[slug]/page.tsx'));
      if (content.includes('— Modelverse Intelligence') || content.includes('— Modelverse"')) {
        throw new Error('Articles slug title generator contains hardcoded "— Modelverse" suffix');
      }
    },
  },
  {
    id: 'T1-F2-08',
    tier: 1,
    feature: 'F2',
    name: 'Route Title Suffix Deduplication: /compare/[slug] title generator has no hardcoded duplicate suffix',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'compare/[slug]/page.tsx'));
      const match = content.match(/title\s*=\s*`\$\{model1\.name\}[^`]+`/);
      if (match && (match[0].includes('— Modelverse') || match[0].includes('| TheModelverse'))) {
        throw new Error(`compare/[slug] title generator includes hardcoded brand suffix: ${match[0]}`);
      }
    },
  },

  // F3: Route Titles & Meta Descriptions Standardization
  {
    id: 'T1-F3-01',
    tier: 1,
    feature: 'F3',
    name: 'Route Titles & Meta: /models default title targets "Foundation Model Catalog & Architecture Directory"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'models/page.tsx'));
      if (!content.includes('Foundation Model Catalog & Architecture Directory')) {
        throw new Error('/models metadata title does not match high-intent phrase "Foundation Model Catalog & Architecture Directory"');
      }
    },
  },
  {
    id: 'T1-F3-02',
    tier: 1,
    feature: 'F3',
    name: 'Route Titles & Meta: /compare title targets "Compare Foundation Models & LLM Benchmark Matrix"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'compare/page.tsx'));
      if (!content.includes('Compare Foundation Models & LLM Benchmark Matrix')) {
        throw new Error('/compare metadata title does not match "Compare Foundation Models & LLM Benchmark Matrix"');
      }
    },
  },
  {
    id: 'T1-F3-03',
    tier: 1,
    feature: 'F3',
    name: 'Route Titles & Meta: /articles title targets "AI Model Architecture & Intelligence Hub"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'articles/page.tsx'));
      if (!content.includes('AI Model Architecture & Intelligence Hub')) {
        throw new Error('/articles metadata title does not match "AI Model Architecture & Intelligence Hub"');
      }
    },
  },
  {
    id: 'T1-F3-04',
    tier: 1,
    feature: 'F3',
    name: 'Route Titles & Meta: Core routes descriptions use "TheModelverse"',
    run: () => {
      const routesToCheck = [
        'page.tsx',
        'models/page.tsx',
        'compare/page.tsx',
        'articles/page.tsx',
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
      ];
      for (const route of routesToCheck) {
        const fullPath = path.join(SRC_APP_DIR, route);
        const content = readFileSafe(fullPath);
        const descMatch =
          content.match(/description:\s*["`']([^"`']+)["`']/) ||
          content.match(/(?:let|const)\s+description\s*=\s*[`"']([^`"']+)[`"']/);
        if (!descMatch) {
          throw new Error(`No description found in ${route}`);
        }
        if (!descMatch[1].includes('TheModelverse')) {
          throw new Error(`Description in ${route} does not reference "TheModelverse": "${descMatch[1]}"`);
        }
      }
    },
  },

  // F4: OpenGraph & Twitter Social Cards
  {
    id: 'T1-F4-01',
    tier: 1,
    feature: 'F4',
    name: 'Social Cards: Root layout twitter.creator is "@themodelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      if (!content.includes('creator: "@themodelverse"') && !content.includes("creator: '@themodelverse'")) {
        throw new Error('layout.tsx twitter.creator is not "@themodelverse"');
      }
    },
  },
  {
    id: 'T1-F4-02',
    tier: 1,
    feature: 'F4',
    name: 'Social Cards: Core routes openGraph.title explicitly ends with "| TheModelverse"',
    run: () => {
      const routes = ['compare/page.tsx', 'articles/page.tsx'];
      for (const r of routes) {
        const content = readFileSafe(path.join(SRC_APP_DIR, r));
        const ogTitleMatch = content.match(/openGraph:\s*\{[\s\S]*?title:\s*["']([^"']+)["']/);
        if (!ogTitleMatch || !ogTitleMatch[1].endsWith('| TheModelverse')) {
          throw new Error(`Route ${r} openGraph.title does not end with "| TheModelverse": "${ogTitleMatch ? ogTitleMatch[1] : 'none'}"`);
        }
      }
    },
  },

  // F5: JSON-LD Structured Data Schema Alignment
  {
    id: 'T1-F5-01',
    tier: 1,
    feature: 'F5',
    name: 'Structured Data: WebSiteJsonLd declares WebSite name "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      if (!content.match(/"@type":\s*"WebSite"[\s\S]*?(?:"name"|name):\s*"TheModelverse"/)) {
        throw new Error('WebSiteJsonLd does not declare WebSite name as "TheModelverse"');
      }
    },
  },
  {
    id: 'T1-F5-02',
    tier: 1,
    feature: 'F5',
    name: 'Structured Data: WebSiteJsonLd declares Organization name "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      if (!content.match(/"@type":\s*"Organization"[\s\S]*?(?:"name"|name):\s*"TheModelverse"/)) {
        throw new Error('WebSiteJsonLd does not declare Organization name as "TheModelverse"');
      }
    },
  },
  {
    id: 'T1-F5-03',
    tier: 1,
    feature: 'F5',
    name: 'Structured Data: DatasetJsonLd declares publisher "TheModelverse" and default name contains "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      if (!content.includes('export function DatasetJsonLd')) {
        throw new Error('DatasetJsonLd not found in JsonLd.tsx');
      }
      const publisherSection = content.match(/publisher:\s*\{[\s\S]*?\}/);
      if (!publisherSection || !publisherSection[0].includes('"TheModelverse"')) {
        throw new Error('DatasetJsonLd publisher does not declare "TheModelverse"');
      }
      const defaultNameMatch = content.match(/name\s*=\s*["']([^"']+)["']/);
      if (defaultNameMatch && !defaultNameMatch[1].includes('TheModelverse')) {
        throw new Error(`DatasetJsonLd default name does not contain "TheModelverse": "${defaultNameMatch[1]}"`);
      }
    },
  },
  {
    id: 'T1-F5-04',
    tier: 1,
    feature: 'F5',
    name: 'Structured Data: ModelJsonLd declares publisher "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      const modelSection = content.match(/export function ModelJsonLd[\s\S]*?export function/);
      if (!modelSection || !modelSection[0].includes('name: "TheModelverse"')) {
        throw new Error('ModelJsonLd publisher does not declare "TheModelverse"');
      }
    },
  },
  {
    id: 'T1-F5-05',
    tier: 1,
    feature: 'F5',
    name: 'Structured Data: ArticleJsonLd declares publisher "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      const articleSection = content.match(/export function ArticleJsonLd[\s\S]*?export function/);
      if (!articleSection || !articleSection[0].includes('name: "TheModelverse"')) {
        throw new Error('ArticleJsonLd publisher does not declare "TheModelverse"');
      }
    },
  },
  {
    id: 'T1-F5-06',
    tier: 1,
    feature: 'F5',
    name: 'Structured Data: ComparisonJsonLd declares publisher "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      const compareSection = content.match(/export function ComparisonJsonLd[\s\S]*$/);
      if (!compareSection || !compareSection[0].includes('name: "TheModelverse"')) {
        throw new Error('ComparisonJsonLd publisher does not declare "TheModelverse"');
      }
    },
  },

  // F6: Manifest & RSS Feeds Alignment
  {
    id: 'T1-F6-01',
    tier: 1,
    feature: 'F6',
    name: 'Manifest & Feeds: manifest.ts app name and short_name set to "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'manifest.ts'));
      if (!content.match(/name:\s*["']TheModelverse["']/)) {
        throw new Error('manifest.ts name is not "TheModelverse"');
      }
      if (!content.match(/short_name:\s*["']TheModelverse["']/)) {
        throw new Error('manifest.ts short_name is not "TheModelverse"');
      }
    },
  },
  {
    id: 'T1-F6-02',
    tier: 1,
    feature: 'F6',
    name: 'Manifest & Feeds: feed.xml channel title starts with "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'feed.xml/route.ts'));
      const channelTitleMatch = content.match(/<channel>\s*<title>([^<]+)<\/title>/);
      if (!channelTitleMatch || !channelTitleMatch[1].startsWith('TheModelverse')) {
        throw new Error(`feed.xml channel title does not start with "TheModelverse": "${channelTitleMatch ? channelTitleMatch[1] : 'not found'}"`);
      }
    },
  },
  {
    id: 'T1-F6-03',
    tier: 1,
    feature: 'F6',
    name: 'Manifest & Feeds: news/feed.xml channel title starts with "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'news/feed.xml/route.ts'));
      const channelTitleMatch = content.match(/<channel>\s*<title>([^<]+)<\/title>/);
      if (!channelTitleMatch || !channelTitleMatch[1].startsWith('TheModelverse')) {
        throw new Error(`news/feed.xml channel title does not start with "TheModelverse": "${channelTitleMatch ? channelTitleMatch[1] : 'not found'}"`);
      }
    },
  },

  // F7: Dynamic OG Image Generator Alignment
  {
    id: 'T1-F7-01',
    tier: 1,
    feature: 'F7',
    name: 'OG Generator: src/app/opengraph-image.tsx displays "THEMODELVERSE"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'opengraph-image.tsx'));
      if (!content.includes('THEMODELVERSE')) {
        throw new Error('opengraph-image.tsx does not display visual brand "THEMODELVERSE"');
      }
    },
  },
  {
    id: 'T1-F7-02',
    tier: 1,
    feature: 'F7',
    name: 'OG Generator: src/app/opengraph-image.tsx alt text uses "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'opengraph-image.tsx'));
      const altMatch = content.match(/export const alt\s*=\s*["']([^"']+)["']/);
      if (!altMatch || !altMatch[1].includes('TheModelverse')) {
        throw new Error(`opengraph-image.tsx alt text does not contain "TheModelverse": "${altMatch ? altMatch[1] : 'none'}"`);
      }
    },
  },
  {
    id: 'T1-F7-03',
    tier: 1,
    feature: 'F7',
    name: 'OG Generator: models/[slug]/opengraph-image.tsx displays "THEMODELVERSE"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'models/[slug]/opengraph-image.tsx'));
      if (!content.includes('THEMODELVERSE')) {
        throw new Error('models/[slug]/opengraph-image.tsx does not display visual brand "THEMODELVERSE"');
      }
    },
  },
  {
    id: 'T1-F7-04',
    tier: 1,
    feature: 'F7',
    name: 'OG Generator: articles/[slug]/opengraph-image.tsx displays "THEMODELVERSE"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'articles/[slug]/opengraph-image.tsx'));
      if (!content.includes('THEMODELVERSE')) {
        throw new Error('articles/[slug]/opengraph-image.tsx does not display visual brand "THEMODELVERSE"');
      }
    },
  },

  // F8: Header, Logo & Navigation Brand Marks
  {
    id: 'T1-F8-01',
    tier: 1,
    feature: 'F8',
    name: 'UI Brand Marks: ModelverseLogo.tsx image alt attributes are "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'ui/ModelverseLogo.tsx'));
      const altMatches = [...content.matchAll(/alt=["']([^"']+)["']/g)].map(m => m[1]);
      if (altMatches.length === 0) {
        throw new Error('No alt attributes found in ModelverseLogo.tsx');
      }
      for (const alt of altMatches) {
        if (alt !== 'TheModelverse') {
          throw new Error(`ModelverseLogo.tsx alt text must be exactly "TheModelverse", found: "${alt}"`);
        }
      }
    },
  },
  {
    id: 'T1-F8-02',
    tier: 1,
    feature: 'F8',
    name: 'UI Brand Marks: Navbar.tsx home brand link has aria-label="TheModelverse Home"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'layout/Navbar.tsx'));
      if (!content.includes('aria-label="TheModelverse Home"')) {
        throw new Error('Navbar.tsx root logo Link missing accessible attribute aria-label="TheModelverse Home"');
      }
    },
  },

  // F9: Footer Copyright & Links
  {
    id: 'T1-F9-01',
    tier: 1,
    feature: 'F9',
    name: 'Footer Copyright: Footer.tsx renders "TheModelverse" copyright notice',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'layout/Footer.tsx'));
      if (!content.match(/©|&copy;/) || !content.includes('TheModelverse. All rights reserved.')) {
        throw new Error('Footer.tsx does not render copyright notice for "TheModelverse. All rights reserved."');
      }
    },
  },

  // F10: Homepage Hero H1 & Search Intent
  {
    id: 'T1-F10-01',
    tier: 1,
    feature: 'F10',
    name: 'Hero H1: HeroSection.tsx H1 is "The Foundation Model Catalog & LLM Benchmark Database"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'hero/HeroSection.tsx'));
      if (!content.includes('The Foundation Model Catalog & LLM Benchmark Database')) {
        throw new Error('HeroSection.tsx does not contain target H1 "The Foundation Model Catalog & LLM Benchmark Database"');
      }
    },
  },

  // F11: Catalog Page H1 & Long-Tail Positioning
  {
    id: 'T1-F11-01',
    tier: 1,
    feature: 'F11',
    name: 'Catalog H1: ModelsPageHeader.tsx H1 is "Foundation Model Catalog"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'models/ModelsPageHeader.tsx'));
      const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      const h1Text = h1Match ? normalizeEntities(h1Match[1]).trim() : '';
      if (!h1Text.includes('Foundation Model Catalog')) {
        throw new Error(`ModelsPageHeader.tsx H1 does not contain "Foundation Model Catalog", found: "${h1Text}"`);
      }
    },
  },

  // F12: Comparison Engine H1 & Hardware Sizing
  {
    id: 'T1-F12-01',
    tier: 1,
    feature: 'F12',
    name: 'Compare H1: compare/page.tsx H1 is "LLM Benchmark Database & Hardware Sizing"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'compare/page.tsx'));
      const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      const h1Text = h1Match ? normalizeEntities(h1Match[1]).trim() : '';
      if (!h1Text.includes('LLM Benchmark Database & Hardware Sizing')) {
        throw new Error(`compare/page.tsx H1 does not contain "LLM Benchmark Database & Hardware Sizing", found: "${h1Text}"`);
      }
    },
  },

  // F13: Intelligence Hub H1 & Architecture Focus
  {
    id: 'T1-F13-01',
    tier: 1,
    feature: 'F13',
    name: 'Articles H1: ArticlesHeader.tsx H1 is "AI Model Architecture & Intelligence"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'articles/ArticlesHeader.tsx'));
      const h1Match = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      const h1Text = h1Match ? normalizeEntities(h1Match[1]).trim() : '';
      if (!h1Text.includes('AI Model Architecture & Intelligence')) {
        throw new Error(`ArticlesHeader.tsx H1 does not contain "AI Model Architecture & Intelligence", found: "${h1Text}"`);
      }
    },
  },

  // F14: Informational & Policy Copy
  {
    id: 'T1-F14-01',
    tier: 1,
    feature: 'F14',
    name: 'Informational Copy: /about body text introduces "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_APP_DIR, 'about/page.tsx'));
      if (content.includes('Modelverse is an independent') && !content.includes('TheModelverse is an independent')) {
        throw new Error('about/page.tsx body still introduces bare "Modelverse is an independent..."');
      }
    },
  },
  {
    id: 'T1-F14-02',
    tier: 1,
    feature: 'F14',
    name: 'Component Copy: CookieConsent.tsx references "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'common/CookieConsent.tsx'));
      if (content.includes('Modelverse uses cookies') && !content.includes('TheModelverse uses cookies')) {
        throw new Error('CookieConsent.tsx references bare "Modelverse uses cookies..."');
      }
    },
  },
  {
    id: 'T1-F14-03',
    tier: 1,
    feature: 'F14',
    name: 'Component Copy: TrendingClient.tsx references "TheModelverse"',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'trending/TrendingClient.tsx'));
      if (content.includes('Ranked by Modelverse Benchmark') && !content.includes('Ranked by TheModelverse Benchmark')) {
        throw new Error('TrendingClient.tsx references bare "Ranked by Modelverse Benchmark..."');
      }
    },
  },

  // ==========================================
  // TIER 2: BOUNDARY & CORNER CASES
  // ==========================================

  // Suffix Duplication
  {
    id: 'T2-BC-01',
    tier: 2,
    feature: 'BC',
    name: 'Suffix Duplication: Zero instances of "— Modelverse — Modelverse"',
    run: () => {
      const filesToCheck = [
        'layout.tsx',
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
        'submit/layout.tsx',
        'articles/page.tsx',
        'compare/page.tsx',
      ];
      for (const f of filesToCheck) {
        const content = readFileSafe(path.join(SRC_APP_DIR, f));
        if (content.includes('— Modelverse — Modelverse')) {
          throw new Error(`Found duplicate suffix "— Modelverse — Modelverse" in src/app/${f}`);
        }
      }
    },
  },
  {
    id: 'T2-BC-02',
    tier: 2,
    feature: 'BC',
    name: 'Suffix Duplication: Zero instances of "| TheModelverse | TheModelverse"',
    run: () => {
      const filesToCheck = [
        'layout.tsx',
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
        'submit/layout.tsx',
        'articles/page.tsx',
        'compare/page.tsx',
      ];
      for (const f of filesToCheck) {
        const content = readFileSafe(path.join(SRC_APP_DIR, f));
        if (content.includes('| TheModelverse | TheModelverse')) {
          throw new Error(`Found duplicate suffix "| TheModelverse | TheModelverse" in src/app/${f}`);
        }
      }
    },
  },
  {
    id: 'T2-BC-03',
    tier: 2,
    feature: 'BC',
    name: 'Suffix Duplication: Zero instances of "— Modelverse | TheModelverse"',
    run: () => {
      const filesToCheck = [
        'layout.tsx',
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
        'submit/layout.tsx',
        'articles/page.tsx',
        'compare/page.tsx',
      ];
      for (const f of filesToCheck) {
        const content = readFileSafe(path.join(SRC_APP_DIR, f));
        if (content.includes('— Modelverse | TheModelverse')) {
          throw new Error(`Found collision suffix "— Modelverse | TheModelverse" in src/app/${f}`);
        }
      }
    },
  },
  {
    id: 'T2-BC-04',
    tier: 2,
    feature: 'BC',
    name: 'Suffix Duplication: Zero instances of "— TheModelverse — TheModelverse"',
    run: () => {
      const filesToCheck = [
        'layout.tsx',
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
      ];
      for (const f of filesToCheck) {
        const content = readFileSafe(path.join(SRC_APP_DIR, f));
        if (content.includes('— TheModelverse — TheModelverse')) {
          throw new Error(`Found duplicate suffix "— TheModelverse — TheModelverse" in src/app/${f}`);
        }
      }
    },
  },

  // Bare Brand Matcher
  {
    id: 'T2-BC-06',
    tier: 2,
    feature: 'BC',
    name: 'Bare Brand Matcher: Zero unbranded bare "Modelverse" in exported route titles',
    run: () => {
      const routeFiles = [
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
        'submit/layout.tsx',
      ];
      for (const rf of routeFiles) {
        const content = readFileSafe(path.join(SRC_APP_DIR, rf));
        const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
        if (titleMatch) {
          const title = titleMatch[1];
          if (hasBareModelverse(title)) {
            throw new Error(`Bare "Modelverse" found in title of ${rf}: "${title}"`);
          }
        }
      }
    },
  },
  {
    id: 'T2-BC-07',
    tier: 2,
    feature: 'BC',
    name: 'Bare Brand Matcher: Zero unbranded bare "Modelverse" in exported meta descriptions',
    run: () => {
      const routeFiles = [
        'layout.tsx',
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
        'submit/layout.tsx',
        'compare/page.tsx',
        'articles/page.tsx',
        'models/page.tsx',
      ];
      for (const rf of routeFiles) {
        const content = readFileSafe(path.join(SRC_APP_DIR, rf));
        const descMatch = content.match(/description:\s*["`']([^"`']+)["`']/);
        if (descMatch) {
          const desc = descMatch[1];
          if (hasBareModelverse(desc)) {
            throw new Error(`Bare "Modelverse" found in description of ${rf}: "${desc}"`);
          }
        }
      }
    },
  },
  {
    id: 'T2-BC-08',
    tier: 2,
    feature: 'BC',
    name: 'Bare Brand Matcher: Zero unbranded bare "Modelverse" in OpenGraph/Twitter titles',
    run: () => {
      const routeFiles = [
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
        'submit/layout.tsx',
      ];
      for (const rf of routeFiles) {
        const content = readFileSafe(path.join(SRC_APP_DIR, rf));
        const ogTitle = content.match(/openGraph:\s*\{[\s\S]*?title:\s*["']([^"']+)["']/);
        if (ogTitle && hasBareModelverse(ogTitle[1])) {
          throw new Error(`Bare "Modelverse" found in openGraph.title of ${rf}: "${ogTitle[1]}"`);
        }
      }
    },
  },
  {
    id: 'T2-BC-09',
    tier: 2,
    feature: 'BC',
    name: 'Bare Brand Matcher: Zero unbranded bare "Modelverse" in JsonLd entity names',
    run: () => {
      const content = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      const entityNameMatches = [...content.matchAll(/name:\s*["']Modelverse["']/g)];
      if (entityNameMatches.length > 0) {
        throw new Error(`Found ${entityNameMatches.length} instances of bare name: "Modelverse" in JsonLd.tsx`);
      }
    },
  },
  {
    id: 'T2-BC-10',
    tier: 2,
    feature: 'BC',
    name: 'Brand Case Sensitivity: No unstandardized "themodelverse" or "The Modelverse" in site titles',
    run: () => {
      const files = ['layout.tsx', 'about/page.tsx', 'compare/page.tsx', 'models/page.tsx'];
      for (const f of files) {
        const content = readFileSafe(path.join(SRC_APP_DIR, f));
        const titleMatch = content.match(/title:\s*["']([^"']+)["']/);
        if (titleMatch) {
          if (titleMatch[1].includes('The Modelverse')) {
            throw new Error(`Title in ${f} contains separated "The Modelverse" instead of unified "TheModelverse": "${titleMatch[1]}"`);
          }
        }
      }
    },
  },
  {
    id: 'T2-BC-11',
    tier: 2,
    feature: 'BC',
    name: 'Empty/Missing Tags: Ensure every route exports non-empty title and description',
    run: () => {
      const routes = [
        'about/page.tsx',
        'terms/page.tsx',
        'privacy/page.tsx',
        'security/page.tsx',
        'methodology/page.tsx',
        'compare/page.tsx',
        'articles/page.tsx',
      ];
      for (const r of routes) {
        const content = readFileSafe(path.join(SRC_APP_DIR, r));
        const titleMatch = content.match(/title:\s*["']([^"']*)["']/);
        if (!titleMatch || titleMatch[1].trim().length === 0) {
          throw new Error(`Route ${r} has empty or missing title`);
        }
        const descMatch = content.match(/description:\s*["`']([^"`']*)["`']/);
        if (!descMatch || descMatch[1].trim().length === 0) {
          throw new Error(`Route ${r} has empty or missing description`);
        }
      }
    },
  },

  // ==========================================
  // TIER 3: CROSS-FEATURE COMBINATIONS
  // ==========================================

  {
    id: 'T3-XF-01',
    tier: 3,
    feature: 'XF',
    name: 'Layout Template Synergy: Simulating child route with "%s | TheModelverse" template',
    run: () => {
      const layoutContent = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      const templateMatch = layoutContent.match(/template:\s*["']([^"']+)["']/);
      if (!templateMatch) {
        throw new Error('Title template missing in root layout');
      }
      const template = templateMatch[1];
      const sampleChildTitle = 'About';
      const rendered = template.replace('%s', sampleChildTitle);
      if (rendered !== 'About | TheModelverse') {
        throw new Error(`Simulated title expected "About | TheModelverse", got "${rendered}"`);
      }
    },
  },
  {
    id: 'T3-XF-02',
    tier: 3,
    feature: 'XF',
    name: 'OG Banner ↔ Schema Entity Sync: opengraph-image alt text matches Organization name',
    run: () => {
      const ogContent = readFileSafe(path.join(SRC_APP_DIR, 'opengraph-image.tsx'));
      const jsonLdContent = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      if (!ogContent.includes('TheModelverse')) {
        throw new Error('opengraph-image.tsx does not reference "TheModelverse"');
      }
      if (!jsonLdContent.match(/name:\s*["']TheModelverse["']/)) {
        throw new Error('JsonLd.tsx does not declare Organization "TheModelverse"');
      }
    },
  },
  {
    id: 'T3-XF-03',
    tier: 3,
    feature: 'XF',
    name: 'Manifest ↔ WebSite Schema Sync: manifest.ts name matches WebSiteJsonLd',
    run: () => {
      const manifestContent = readFileSafe(path.join(SRC_APP_DIR, 'manifest.ts'));
      const jsonLdContent = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'seo/JsonLd.tsx'));
      const manifestNameMatch = manifestContent.match(/name:\s*["']([^"']+)["']/);
      if (!manifestNameMatch || manifestNameMatch[1] !== 'TheModelverse') {
        throw new Error(`manifest.ts name "${manifestNameMatch ? manifestNameMatch[1] : 'none'}" does not match "TheModelverse"`);
      }
      if (!jsonLdContent.match(/name:\s*["']TheModelverse["']/)) {
        throw new Error('WebSiteJsonLd name does not match "TheModelverse"');
      }
    },
  },
  {
    id: 'T3-XF-04',
    tier: 3,
    feature: 'XF',
    name: 'RSS Feed Channel ↔ Base URL Sync: feed.xml links match https://www.themodelverse.in',
    run: () => {
      const feedContent = readFileSafe(path.join(SRC_APP_DIR, 'feed.xml/route.ts'));
      if (!feedContent.includes('https://www.themodelverse.in')) {
        throw new Error('feed.xml does not set fallback baseUrl to https://www.themodelverse.in');
      }
    },
  },
  {
    id: 'T3-XF-05',
    tier: 3,
    feature: 'XF',
    name: 'Hero H1 ↔ Default Title Intent Sync: Hero H1 matches root title intent',
    run: () => {
      const heroContent = readFileSafe(path.join(SRC_COMPONENTS_DIR, 'hero/HeroSection.tsx'));
      const layoutContent = readFileSafe(path.join(SRC_APP_DIR, 'layout.tsx'));
      if (!heroContent.includes('The Foundation Model Catalog & LLM Benchmark Database')) {
        throw new Error('HeroSection H1 does not contain "The Foundation Model Catalog & LLM Benchmark Database"');
      }
      if (!layoutContent.includes('Foundation Model Catalog & LLM Benchmark Database')) {
        throw new Error('Root layout default title does not harmonize with hero H1 intent');
      }
    },
  },

  // ==========================================
  // TIER 4: REAL-WORLD APPLICATION SCENARIOS
  // (Pre-rendered HTML, Feeds & Webmanifest Audit)
  // ==========================================

  {
    id: 'T4-RW-01',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered HTML Audit: index.html title contains "TheModelverse"',
    run: () => {
      const htmlPath = path.join(NEXT_BUILD_APP_DIR, 'index.html');
      if (!fileExists(htmlPath)) {
        throw new Error(`Pre-rendered build artifact not found: ${htmlPath}. Run 'npm run build' first.`);
      }
      const html = readFileSafe(htmlPath);
      const titles = extractTagContent(html, 'title');
      if (titles.length === 0) {
        throw new Error('index.html has no <title> tag');
      }
      if (!titles[0].includes('TheModelverse')) {
        throw new Error(`index.html <title> does not contain "TheModelverse": "${titles[0]}"`);
      }
      if (titles[0].includes('— Modelverse — Modelverse')) {
        throw new Error(`index.html <title> has duplicate brand suffix: "${titles[0]}"`);
      }
    },
  },
  {
    id: 'T4-RW-02',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered HTML Audit: about.html title ends in "| TheModelverse" with no duplicates',
    run: () => {
      const htmlPath = path.join(NEXT_BUILD_APP_DIR, 'about.html');
      if (!fileExists(htmlPath)) {
        throw new Error(`Pre-rendered build artifact not found: ${htmlPath}`);
      }
      const html = readFileSafe(htmlPath);
      const titles = extractTagContent(html, 'title');
      if (titles.length === 0) {
        throw new Error('about.html has no <title> tag');
      }
      const title = titles[0];
      if (!title.endsWith('| TheModelverse')) {
        throw new Error(`about.html <title> does not end with "| TheModelverse", found: "${title}"`);
      }
      if (title.includes('— Modelverse — Modelverse') || title.includes('| TheModelverse | TheModelverse')) {
        throw new Error(`about.html <title> has duplicate brand suffix: "${title}"`);
      }
      if (hasBareModelverse(title)) {
        throw new Error(`about.html <title> contains bare "Modelverse": "${title}"`);
      }
    },
  },
  {
    id: 'T4-RW-03',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered HTML Audit: terms.html title ends in "| TheModelverse" with no duplicates',
    run: () => {
      const htmlPath = path.join(NEXT_BUILD_APP_DIR, 'terms.html');
      if (!fileExists(htmlPath)) {
        throw new Error(`Pre-rendered build artifact not found: ${htmlPath}`);
      }
      const html = readFileSafe(htmlPath);
      const titles = extractTagContent(html, 'title');
      if (titles.length === 0) throw new Error('terms.html has no <title>');
      const title = titles[0];
      if (!title.endsWith('| TheModelverse')) {
        throw new Error(`terms.html <title> does not end with "| TheModelverse", found: "${title}"`);
      }
      if (title.includes('— Modelverse — Modelverse')) {
        throw new Error(`terms.html <title> has duplicate brand suffix: "${title}"`);
      }
      if (hasBareModelverse(title)) {
        throw new Error(`terms.html <title> contains bare "Modelverse": "${title}"`);
      }
    },
  },
  {
    id: 'T4-RW-04',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered HTML Audit: privacy.html title ends in "| TheModelverse" with no duplicates',
    run: () => {
      const htmlPath = path.join(NEXT_BUILD_APP_DIR, 'privacy.html');
      if (!fileExists(htmlPath)) throw new Error(`Pre-rendered build artifact not found: ${htmlPath}`);
      const html = readFileSafe(htmlPath);
      const titles = extractTagContent(html, 'title');
      if (titles.length === 0) throw new Error('privacy.html has no <title>');
      const title = titles[0];
      if (!title.endsWith('| TheModelverse')) {
        throw new Error(`privacy.html <title> does not end with "| TheModelverse", found: "${title}"`);
      }
      if (hasBareModelverse(title)) {
        throw new Error(`privacy.html <title> contains bare "Modelverse": "${title}"`);
      }
    },
  },
  {
    id: 'T4-RW-05',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered HTML Audit: compare.html title ends in "| TheModelverse"',
    run: () => {
      const htmlPath = path.join(NEXT_BUILD_APP_DIR, 'compare.html');
      if (!fileExists(htmlPath)) throw new Error(`Pre-rendered build artifact not found: ${htmlPath}`);
      const html = readFileSafe(htmlPath);
      const titles = extractTagContent(html, 'title');
      if (titles.length === 0) throw new Error('compare.html has no <title>');
      const title = titles[0];
      if (!title.endsWith('| TheModelverse')) {
        throw new Error(`compare.html <title> does not end with "| TheModelverse", found: "${title}"`);
      }
    },
  },
  {
    id: 'T4-RW-06',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered HTML Audit: articles.html title ends in "| TheModelverse"',
    run: () => {
      const htmlPath = path.join(NEXT_BUILD_APP_DIR, 'articles.html');
      if (!fileExists(htmlPath)) throw new Error(`Pre-rendered build artifact not found: ${htmlPath}`);
      const html = readFileSafe(htmlPath);
      const titles = extractTagContent(html, 'title');
      if (titles.length === 0) throw new Error('articles.html has no <title>');
      const title = titles[0];
      if (!title.endsWith('| TheModelverse')) {
        throw new Error(`articles.html <title> does not end with "| TheModelverse", found: "${title}"`);
      }
    },
  },
  {
    id: 'T4-RW-07',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered HTML Audit: Structured data JSON-LD in index.html has WebSite name "TheModelverse"',
    run: () => {
      const htmlPath = path.join(NEXT_BUILD_APP_DIR, 'index.html');
      if (!fileExists(htmlPath)) throw new Error(`Pre-rendered build artifact not found: ${htmlPath}`);
      const html = readFileSafe(htmlPath);
      const jsonLds = extractJsonLdBlocks(html);
      let foundWebSite = false;
      for (const ld of jsonLds) {
        if (Array.isArray(ld['@graph'])) {
          for (const item of ld['@graph'] as Record<string, unknown>[]) {
            if (item['@type'] === 'WebSite' && item['name'] === 'TheModelverse') {
              foundWebSite = true;
            }
          }
        }
      }
      if (!foundWebSite) {
        throw new Error('index.html JSON-LD does not contain WebSite schema with name: "TheModelverse"');
      }
    },
  },
  {
    id: 'T4-RW-08',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered Feeds: feed.xml.body channel title starts with "TheModelverse"',
    run: () => {
      const feedPath = path.join(NEXT_BUILD_APP_DIR, 'feed.xml.body');
      if (!fileExists(feedPath)) throw new Error(`Pre-rendered build artifact not found: ${feedPath}`);
      const xml = readFileSafe(feedPath);
      const channelTitleMatch = xml.match(/<channel>[\s\S]*?<title>([^<]+)<\/title>/);
      if (!channelTitleMatch || !channelTitleMatch[1].startsWith('TheModelverse')) {
        throw new Error(`Pre-rendered feed.xml channel title does not start with "TheModelverse": "${channelTitleMatch ? channelTitleMatch[1] : 'none'}"`);
      }
    },
  },
  {
    id: 'T4-RW-09',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered Feeds: news/feed.xml.body channel title starts with "TheModelverse"',
    run: () => {
      const feedPath = path.join(NEXT_BUILD_APP_DIR, 'news/feed.xml.body');
      if (!fileExists(feedPath)) throw new Error(`Pre-rendered build artifact not found: ${feedPath}`);
      const xml = readFileSafe(feedPath);
      const channelTitleMatch = xml.match(/<channel>[\s\S]*?<title>([^<]+)<\/title>/);
      if (!channelTitleMatch || !channelTitleMatch[1].startsWith('TheModelverse')) {
        throw new Error(`Pre-rendered news/feed.xml channel title does not start with "TheModelverse": "${channelTitleMatch ? channelTitleMatch[1] : 'none'}"`);
      }
    },
  },
  {
    id: 'T4-RW-10',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered Webmanifest: manifest.webmanifest.body name and short_name are "TheModelverse"',
    run: () => {
      const manifestPath = path.join(NEXT_BUILD_APP_DIR, 'manifest.webmanifest.body');
      if (!fileExists(manifestPath)) throw new Error(`Pre-rendered build artifact not found: ${manifestPath}`);
      const raw = readFileSafe(manifestPath);
      const manifest = JSON.parse(raw);
      if (manifest.name !== 'TheModelverse') {
        throw new Error(`Pre-rendered manifest name is "${manifest.name}", expected "TheModelverse"`);
      }
      if (manifest.short_name !== 'TheModelverse') {
        throw new Error(`Pre-rendered manifest short_name is "${manifest.short_name}", expected "TheModelverse"`);
      }
    },
  },
  {
    id: 'T4-RW-11',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered Articles Audit: Crawl all articles/*.html titles end with "| TheModelverse" without duplication',
    run: () => {
      const articlesDir = path.join(NEXT_BUILD_APP_DIR, 'articles');
      if (!fileExists(articlesDir)) {
        throw new Error(`Articles build directory not found: ${articlesDir}. Run 'npm run build' first.`);
      }
      const htmlFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
      if (htmlFiles.length === 0) {
        throw new Error(`No pre-rendered article HTML files found in ${articlesDir}`);
      }
      for (const file of htmlFiles) {
        const html = readFileSafe(path.join(articlesDir, file));
        const titles = extractTagContent(html, 'title');
        if (titles.length === 0) {
          throw new Error(`Article ${file} has no <title> tag`);
        }
        const title = titles[0];
        if (!title.endsWith('| TheModelverse')) {
          throw new Error(`Article ${file} title does not end with "| TheModelverse": "${title}"`);
        }
        if (title.includes('— Modelverse — Modelverse') || title.includes('| TheModelverse | TheModelverse')) {
          throw new Error(`Article ${file} title has duplicate brand suffix: "${title}"`);
        }
        if (hasBareModelverse(title)) {
          throw new Error(`Article ${file} title contains bare "Modelverse": "${title}"`);
        }
      }
    },
  },
  {
    id: 'T4-RW-12',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered Articles Audit: Crawl all articles/*.html meta descriptions and author tags have zero bare "Modelverse"',
    run: () => {
      const articlesDir = path.join(NEXT_BUILD_APP_DIR, 'articles');
      if (!fileExists(articlesDir)) {
        throw new Error(`Articles build directory not found: ${articlesDir}`);
      }
      const htmlFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
      if (htmlFiles.length === 0) {
        throw new Error(`No pre-rendered article HTML files found in ${articlesDir}`);
      }
      for (const file of htmlFiles) {
        const html = readFileSafe(path.join(articlesDir, file));

        const descMatch =
          html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
          html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
        if (!descMatch || descMatch[1].trim().length === 0) {
          throw new Error(`Article ${file} has missing or empty meta description`);
        }
        if (hasBareModelverse(descMatch[1])) {
          throw new Error(`Article ${file} meta description contains bare "Modelverse": "${descMatch[1]}"`);
        }

        const authorMetaMatches = [
          ...html.matchAll(/<meta\s+(?:property|name)=["'](?:article:author|author)["']\s+content=["']([^"']*)["']/gi),
          ...html.matchAll(/<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["'](?:article:author|author)["']/gi),
        ];
        for (const match of authorMetaMatches) {
          const author = match[1];
          if (hasBareModelverse(author)) {
            throw new Error(`Article ${file} author meta tag contains bare "Modelverse": "${author}"`);
          }
        }

        const keywordsMatch =
          html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i) ||
          html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']keywords["']/i);
        if (keywordsMatch && hasBareModelverse(keywordsMatch[1])) {
          throw new Error(`Article ${file} keywords meta tag contains bare "Modelverse": "${keywordsMatch[1]}"`);
        }
      }
    },
  },
  {
    id: 'T4-RW-13',
    tier: 4,
    feature: 'RW',
    name: 'Pre-rendered Articles Audit: Crawl all articles/*.html JSON-LD schemas and DOM for zero bare brand leaks',
    run: () => {
      const articlesDir = path.join(NEXT_BUILD_APP_DIR, 'articles');
      if (!fileExists(articlesDir)) {
        throw new Error(`Articles build directory not found: ${articlesDir}`);
      }
      const htmlFiles = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
      if (htmlFiles.length === 0) {
        throw new Error(`No pre-rendered article HTML files found in ${articlesDir}`);
      }
      for (const file of htmlFiles) {
        const html = readFileSafe(path.join(articlesDir, file));

        const jsonLdBlocks = extractJsonLdBlocks(html);
        for (const ld of jsonLdBlocks) {
          const checkObjectForBareModelverse = (obj: unknown, pathStr = ''): void => {
            if (!obj || typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
              obj.forEach((item, idx) => checkObjectForBareModelverse(item, `${pathStr}[${idx}]`));
              return;
            }
            const record = obj as Record<string, unknown>;
            for (const [key, value] of Object.entries(record)) {
              if (typeof value === 'string') {
                if (key === 'url' || key === '@id' || key === 'sameAs') {
                  if (value.includes('github.com')) continue;
                }
                if (hasBareModelverse(value)) {
                  throw new Error(`Article ${file} JSON-LD at ${pathStr}.${key} has bare "Modelverse": "${value}"`);
                }
              } else if (typeof value === 'object') {
                checkObjectForBareModelverse(value, `${pathStr}.${key}`);
              }
            }
          };
          checkObjectForBareModelverse(ld, 'root');
        }

        if (hasBareModelverse(html)) {
          throw new Error(`Article ${file} contains unbranded bare "Modelverse" in pre-rendered output`);
        }
      }
    },
  },
  {
    id: 'T4-RW-14',
    tier: 4,
    feature: 'RW',
    name: 'SVG Visual Assets Audit: Universal cover SVGs render wordmark "TheModelverse"',
    run: () => {
      const svgPaths = [
        path.join(PUBLIC_DIR, 'images/articles/universal-cover.svg'),
        path.join(PUBLIC_DIR, 'images/universal-cover.svg'),
      ];
      for (const svgPath of svgPaths) {
        const relativePath = path.relative(ROOT_DIR, svgPath);
        if (!fileExists(svgPath)) {
          throw new Error(`Universal cover SVG not found: ${relativePath}`);
        }
        const content = readFileSafe(svgPath);
        const textMatches = extractTagContent(content, 'text');
        if (textMatches.length === 0) {
          throw new Error(`SVG ${relativePath} has no <text> tag for wordmark`);
        }
        const wordmark = textMatches[0];
        if (wordmark !== 'TheModelverse') {
          throw new Error(`SVG ${relativePath} wordmark text expected "TheModelverse", found: "${wordmark}"`);
        }
        if (hasBareModelverse(content)) {
          throw new Error(`SVG ${relativePath} contains unbranded bare "Modelverse"`);
        }
      }
    },
  },
  {
    id: 'T4-RW-15',
    tier: 4,
    feature: 'RW',
    name: 'SVG Directory Crawl: All public SVG assets contain zero bare "Modelverse" references',
    run: () => {
      if (!fileExists(PUBLIC_DIR)) {
        throw new Error(`Public directory not found: ${PUBLIC_DIR}`);
      }
      function findSvgFiles(dir: string): string[] {
        let results: string[] = [];
        const list = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of list) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(findSvgFiles(fullPath));
          } else if (entry.isFile() && entry.name.endsWith('.svg')) {
            results.push(fullPath);
          }
        }
        return results;
      }
      const svgFiles = findSvgFiles(PUBLIC_DIR);
      if (svgFiles.length === 0) {
        throw new Error('No SVG assets found in public directory');
      }
      for (const svgFile of svgFiles) {
        const relativePath = path.relative(ROOT_DIR, svgFile);
        const content = readFileSafe(svgFile);
        if (hasBareModelverse(content)) {
          throw new Error(`SVG asset ${relativePath} contains unbranded bare "Modelverse"`);
        }
      }
    },
  },
];

// --- Test Runner Execution ---
export async function runAllTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  results: TestResult[];
}> {
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}      TheModelverse E2E Brand Verification & Acceptance Suite    ${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  const results: TestResult[] = [];
  let passedCount = 0;
  let failedCount = 0;
  const skippedCount = 0;

  for (const tc of tests) {
    const start = Date.now();
    let status: 'PASSED' | 'FAILED' | 'SKIPPED' = 'PASSED';
    let errorMessage: string | undefined;

    try {
      await tc.run();
      passedCount++;
    } catch (err: unknown) {
      status = 'FAILED';
      failedCount++;
      errorMessage = err instanceof Error ? err.message : String(err);
    }

    const durationMs = Date.now() - start;

    results.push({
      id: tc.id,
      tier: tc.tier,
      feature: tc.feature,
      name: tc.name,
      status,
      durationMs,
      error: errorMessage,
    });
  }

  // Print grouped by tier
  for (const tier of [1, 2, 3, 4] as Tier[]) {
    const tierTests = results.filter(r => r.tier === tier);
    const tierPassed = tierTests.filter(r => r.status === 'PASSED').length;

    const tierTitle =
      tier === 1
        ? 'Tier 1: Feature Coverage (F1 - F14)'
        : tier === 2
        ? 'Tier 2: Boundary & Corner Cases (Deduplication & Regex)'
        : tier === 3
        ? 'Tier 3: Cross-Feature Combinations & Invariants'
        : 'Tier 4: Real-World Scenarios (Pre-rendered HTML & Feeds)';

    console.log(`\n${BOLD}${CYAN}--- ${tierTitle} (${tierPassed}/${tierTests.length} passed) ---${RESET}`);

    for (const r of tierTests) {
      const icon = r.status === 'PASSED' ? `${GREEN}✔ PASS${RESET}` : `${RED}✖ FAIL${RESET}`;
      console.log(`  [${r.id}] ${icon} ${r.name} ${DIM}(${r.durationMs}ms)${RESET}`);
      if (r.status === 'FAILED') {
        console.log(`         ${RED}Error: ${r.error}${RESET}`);
      }
    }
  }

  // Summary
  console.log(`\n${BOLD}${CYAN}================================================================${RESET}`);
  console.log(`${BOLD}SUMMARY REPORT:${RESET}`);
  console.log(`  Total Tests:   ${BOLD}${tests.length}${RESET}`);
  console.log(`  Passed:        ${GREEN}${BOLD}${passedCount}${RESET}`);
  console.log(`  Failed:        ${RED}${BOLD}${failedCount}${RESET}`);
  console.log(`  Skipped:       ${YELLOW}${BOLD}${skippedCount}${RESET}`);
  console.log(`${BOLD}${CYAN}================================================================${RESET}\n`);

  return {
    total: tests.length,
    passed: passedCount,
    failed: failedCount,
    skipped: skippedCount,
    results,
  };
}

// Execute if run directly
if (require.main === module || process.argv[1]?.endsWith('test-brand-e2e.ts')) {
  runAllTests()
    .then(summary => {
      if (summary.failed > 0) {
        console.log(`${YELLOW}Baseline run recorded ${summary.failed} expected initial failures prior to milestone implementation.${RESET}\n`);
      } else {
        console.log(`${GREEN}All ${summary.total} tests passed successfully!${RESET}\n`);
      }
      if (process.argv.includes('--baseline')) {
        process.exit(0);
      }
      process.exit(summary.failed > 0 ? 1 : 0);
    })
    .catch(err => {
      console.error('Test suite failed with unexpected error:', err);
      process.exit(1);
    });
}
