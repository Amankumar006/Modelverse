const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  const newsDir = path.join(process.cwd(), 'legacy_local_data', 'news');
  if (!fs.existsSync(newsDir)) {
    console.error("Directory not found:", newsDir);
    return;
  }

  const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} news files.`);
  
  let success = 0;
  let errors = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(newsDir, file), 'utf8'));
      
      const { error } = await supabase
        .from('news_items')
        .upsert({
          slug: data.slug,
          title: data.title,
          body: data.body || '', // CRUCIAL FIX: Read body from JSON instead of looking for markdown files
          excerpt: data.excerpt || null,
          cover_image: data.coverImage || null,
          author: data.author || 'Modelverse Editorial',
          category: data.category || 'short-news',
          publish_date: data.publishDate || new Date().toISOString().split('T')[0],
          read_time: data.readTime || null,
          status: data.status || 'published',
          confidence_level: data.confidenceLevel || 'confirmed',
          external_sources: data.externalSources || [],
          related_models: data.relatedModels || [],
          tags: data.tags || []
        }, { onConflict: 'slug' });
        
      if (error) {
        console.error(`Error with ${data.slug}:`, error.message);
        errors++;
      } else {
        success++;
      }
    } catch (err) {
      console.error(`Exception processing file ${file}:`, err);
      errors++;
    }
  }
  
  console.log(`Migration done. Success: ${success}, Errors: ${errors}`);
}

migrate().catch(console.error);
