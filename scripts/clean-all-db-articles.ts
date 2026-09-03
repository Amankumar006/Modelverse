import { createClient } from "@supabase/supabase-js";
import { sanitizeArticleContent } from "../src/lib/sanitize-article-content";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zmfyclrjbiewmwqiswqk.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanAll() {
  const { data: articles, error } = await supabase.from("articles").select("*");
  if (error || !articles) {
    console.error("Error fetching articles:", error);
    return;
  }

  console.log(`Found ${articles.length} articles in database. Sanitizing...`);

  for (const art of articles) {
    const sanitized = sanitizeArticleContent(art.content, art.title);
    
    // Update article in DB
    const { error: updateErr } = await supabase
      .from("articles")
      .update({
        title: sanitized.title || art.title,
        summary: sanitized.summary || art.summary,
        category: sanitized.category || art.category,
        source_name: sanitized.source_name || art.source_name,
        source_url: sanitized.source_url || art.source_url,
        content: sanitized.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", art.id);

    if (updateErr) {
      console.error(`Error updating ${art.slug}:`, updateErr);
    } else {
      console.log(`✅ Cleaned and formatted: ${art.slug}`);
    }
  }

  console.log("🎉 All articles successfully cleaned and formatted!");
}

cleanAll();
