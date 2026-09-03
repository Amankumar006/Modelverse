/**
 * src/lib/sanitize-article-content.ts
 *
 * Automatically sanitizes, cleans, and formats raw article text from Google Spark / Docs.
 * - Strips all raw frontmatter & loose metadata lines (slug, author, tags, published_at, etc.)
 * - Strips isolated tag quotes and duplicate titles at the top
 * - Auto-formats Section Headings (##, ###)
 * - Auto-formats Bullet points & Highlights
 * - Auto-formats Specification Tables
 * - Auto-formats Python / cURL / JS Code Blocks with syntax fences
 */

export interface SanitizedArticle {
  title?: string;
  summary?: string;
  category?: string;
  source_name?: string;
  source_url?: string;
  content: string;
}

export function sanitizeArticleContent(rawText: string, fallbackTitle?: string): SanitizedArticle {
  const text = rawText.trim();
  let extractedTitle: string | undefined;
  let extractedSummary: string | undefined;
  let extractedCategory: string | undefined;
  let extractedSourceName: string | undefined;
  let extractedSourceUrl: string | undefined;

  // 1. Extract metadata from raw text
  const titleMatch = text.match(/(?:^|\n)title:\s*["']?([^"'\n\r]+)["']?/i);
  if (titleMatch) extractedTitle = titleMatch[1].trim();

  const summaryMatch = text.match(/(?:^|\n)summary:\s*["']?([^"'\n\r]+)["']?/i);
  if (summaryMatch) extractedSummary = summaryMatch[1].trim();

  const catMatch = text.match(/(?:^|\n)category:\s*["']?([^"'\n\r]+)["']?/i);
  if (catMatch) extractedCategory = catMatch[1].trim();

  const srcNameMatch = text.match(/(?:^|\n)source_name:\s*["']?([^"'\n\r]+)["']?/i);
  if (srcNameMatch) extractedSourceName = srcNameMatch[1].trim();

  const srcUrlMatch = text.match(/(?:^|\n)source_url:\s*["']?([^"'\n\r]+)["']?/i);
  if (srcUrlMatch) extractedSourceUrl = srcUrlMatch[1].trim();

  // 2. Strip all frontmatter and loose metadata lines from content body
  const lines = text.split("\n");
  let startIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;

    // Check if line is metadata / YAML / tags / quotes
    if (
      /^(?:slug|title|category|summary|author|name|role|source_name|source_url|cover_image|tags|published_at|is_published|reading_time)\s*:/i.test(l) ||
      /^[-*]\s*["']?[A-Za-z0-9\s._-]+["']?$/.test(l) ||
      /^["'][A-Za-z0-9\s._-]+["']$/.test(l) ||
      l === "---" ||
      l.toLowerCase() === "markdown"
    ) {
      startIdx = i + 1;
    } else if (l.toLowerCase() === (extractedTitle || "").toLowerCase()) {
      startIdx = i + 1;
    } else {
      break;
    }
  }

  let body = lines.slice(startIdx).join("\n").trim();

  // Strip isolated quotes at the start of body
  body = body.replace(/^(?:\s*["'][^"'\n]+["']\s*\n+)+/i, "");
  // Strip duplicate title if repeated immediately at the start of body
  if (extractedTitle) {
    const titleRegex = new RegExp(`^#*\\s*${escapeRegExp(extractedTitle)}\\s*\\n+`, "i");
    body = body.replace(titleRegex, "");
  }

  // Remove any stray mid-content metadata lines
  body = body.replace(/^(?:slug|category|author|name|role|source_name|source_url|cover_image|tags|published_at|is_published|reading_time)\s*:\s*.*$/gim, "");

  // 3. Format Headings & Subsections
  body = body.replace(/(?:\.\s*|\n+)(Key Breakthroughs|Key Architectural Advancements|Architectural and System Advancements|Architectural Advancements)\b/gi, ".\n\n## Key Breakthroughs\n\n");
  body = body.replace(/(?:\.\s*|\n+)(Technical Specifications.*?|Platform Overview.*?|Benchmark Overview.*?)\b/gi, ".\n\n## Technical Specifications & Benchmark Overview\n\n");
  body = body.replace(/(?:\.\s*|\n+)(Verified Integration & API Usage|Integration & API Usage|API Usage & Integration)\b/gi, "\n\n## Verified Integration & API Usage\n\n");

  // Format numbered breakthroughs (e.g. "1. Hybrid Attention:..." or "2. Four-Branch...")
  body = body.replace(/(?:\.\s*|\n+)(\d+\.\s+[A-Za-z0-9\s\-–—:()+/]+?)(?=\s+[A-Z*]|:\s|\n\n)/g, ".\n\n### $1\n\n");

  // Format bold key bullet items (e.g. "Decoupled Signal Routing: Distinct channels...")
  body = body.replace(/(?:\.\s*|\n+)([A-Za-z0-9\s\-–—()+/]{4,50}\s+(?:Layers|Streams|Tables|Optimization|Conditioning|Interpolation|Drafting|Referencing|Synthesis|Routing|Precision|Lookups|Offloading|Splitting|Scaling|Discovery|Watermarking|Pretraining|Diarization|Endpointing|Coverage|Context|Biasing)):\s+/g, ".\n\n* **$1**: ");

  // 4. Auto-format Code Blocks
  if (!body.includes("```python") && !body.includes("```bash") && !body.includes("```json")) {
    const codeMatch = body.match(/(?:from\s+[a-z0-9_]+\s+import|import\s+[a-z0-9_]+|client\s*=|const\s+[a-z0-9_]+\s*=)[\s\S]+?(?=https:\/\/docs\.google\.com|$)/i);
    if (codeMatch) {
      const rawCode = codeMatch[0].trim();
      body = body.replace(rawCode, `\n\n\`\`\`python\n${rawCode}\n\`\`\`\n\n`);
    }
  }

  // Remove trailing Google Docs URLs
  body = body.replace(/https:\/\/docs\.google\.com\/document\/[^\s]+/gi, "").trim();

  // 5. Clean up any weird pipe characters or duplicate headers
  body = body.replace(/\|---\|/g, "");
  body = body.replace(/\n{3,}/g, "\n\n").trim();

  return {
    title: extractedTitle || fallbackTitle,
    summary: extractedSummary,
    category: extractedCategory || "Architecture",
    source_name: extractedSourceName || "Modelverse Research",
    source_url: extractedSourceUrl,
    content: body,
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
