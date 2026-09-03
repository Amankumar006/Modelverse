import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabase = createClient("https://zmfyclrjbiewmwqiswqk.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

function cleanRawDoc(text: string, currentTitle: string) {
  const cleaned = text.trim();

  // 1. Extract metadata if present
  const titleMatch = cleaned.match(/(?:^|\n)title:\s*["']?([^"'\n\r]+)["']?/i);
  const title = titleMatch ? titleMatch[1].trim() : currentTitle;

  const summaryMatch = cleaned.match(/(?:^|\n)summary:\s*["']?([^"'\n\r]+)["']?/i);
  const summary = summaryMatch ? summaryMatch[1].trim() : "";

  // 2. Strip all frontmatter/metadata header lines
  const lines = cleaned.split("\n");
  let startIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;

    if (
      /^(?:slug|title|category|summary|author|name|role|source_name|source_url|cover_image|tags|published_at|is_published|reading_time)\s*:/i.test(l) ||
      /^[-*]\s*["']?[A-Za-z0-9\s._-]+["']?$/.test(l) ||
      /^["'][A-Za-z0-9\s._-]+["']$/.test(l) ||
      l === "---" ||
      l.toLowerCase() === "markdown" ||
      l.toLowerCase() === title.toLowerCase() ||
      l.toLowerCase() === currentTitle.toLowerCase()
    ) {
      startIdx = i + 1;
    } else {
      break;
    }
  }

  let body = lines.slice(startIdx).join("\n").trim();

  // Strip repeated title at the very beginning of the body
  if (body.toLowerCase().startsWith(title.toLowerCase())) {
    body = body.substring(title.length).trim();
  }

  // Strip stray metadata lines
  body = body.replace(/^(?:slug|category|author|name|role|source_name|source_url|cover_image|tags|published_at|is_published|reading_time)\s*:\s*.*$/gim, "");
  body = body.replace(/^(?:\s*["'][^"'\n]+["']\s*\n+)+/i, "");

  // 3. Format Section Headings
  body = body.replace(/(?:\.\s*|\n+)(Key Breakthroughs|Key Architectural Advancements|Architectural and System Advancements|Architectural Advancements)\b/gi, ".\n\n## Key Breakthroughs\n\n");
  body = body.replace(/(?:\.\s*|\n+)(Technical Specifications.*?|Platform Overview.*?|Benchmark Overview.*?)\b/gi, ".\n\n## Technical Specifications & Benchmark Overview\n\n");
  body = body.replace(/(?:\.\s*|\n+)(Verified Integration & API Usage|Integration & API Usage|API Usage & Integration)\b/gi, "\n\n## Verified Integration & API Usage\n\n");

  // Format numbered breakthroughs (e.g. "1. From Passive Ingestion...", "2. Dynamic Multi-Rate...")
  body = body.replace(/(?:\.\s*|\n+)(\d+\.\s+[A-Za-z0-9\s\-–—:()+/]+?)(?=\n[A-Z*]|:\s|\n\n)/g, ".\n\n### $1\n\n");

  // Format bold key bullet items (e.g. "Autonomous Ingestion Planning: Rather than...")
  body = body.replace(/(?:\.\s*|\n+)([A-Za-z0-9\s\-–—()+/]{4,50}\s+(?:Layers|Streams|Tables|Optimization|Conditioning|Interpolation|Drafting|Referencing|Synthesis|Routing|Precision|Lookups|Offloading|Splitting|Scaling|Discovery|Watermarking|Pretraining|Diarization|Endpointing|Coverage|Context|Biasing|Planning|Tools|Search|Resampling|Densification|Resolution|Counting|Indexing|Verification|Synchronization|Reduction|Savings|Improvements|Dominance|Workflows|Fees|Convergence)):\s+/g, ".\n\n* **$1**: ");

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

  // Clean empty lines
  body = body.replace(/\|---\|/g, "");
  body = body.replace(/\n{3,}/g, "\n\n").trim();

  return { title, summary, content: body };
}

async function run() {
  const { data: articles, error } = await supabase.from("articles").select("*");
  if (error || !articles) {
    console.error(error);
    return;
  }

  const sqlStatements: string[] = [];

  for (const art of articles) {
    const cleaned = cleanRawDoc(art.content, art.title);
    const cleanContent = cleaned.content.replace(/'/g, "''");
    const cleanTitle = (cleaned.title || art.title).replace(/'/g, "''");
    const cleanSummary = (cleaned.summary || art.summary || cleanTitle).replace(/'/g, "''");

    sqlStatements.push(`
UPDATE public.articles
SET 
  title = '${cleanTitle}',
  summary = '${cleanSummary}',
  content = '${cleanContent}',
  updated_at = NOW()
WHERE id = '${art.id}';
`);
  }

  fs.writeFileSync("/tmp/update_articles.sql", sqlStatements.join("\n"));
  console.log("Written cleaned SQL for", articles.length, "articles.");
}

run();
