const fs = require('fs');
const path = require('path');
const supabase = require('../src/lib/supabase');

async function migrateNews() {
  console.log('📰 Starting News Migration to Supabase...');

  const indexPath = path.join(process.cwd(), 'data', 'news', '_index.json');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Could not find _index.json!');
    process.exit(1);
  }

  const newsItems = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  console.log(`Found ${newsItems.length} news items to migrate.`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of newsItems) {
    // Read the content from the markdown file if it exists
    let content = '';
    if (item.filePath) {
      const mdPath = path.join(process.cwd(), item.filePath);
      if (fs.existsSync(mdPath)) {
        content = fs.readFileSync(mdPath, 'utf-8');
      }
    }

    const { error } = await supabase
      .from('news_items')
      .upsert(
        {
          title: item.title,
          slug: item.slug,
          body: content || item.description || item.title,
          excerpt: item.description ? item.description.slice(0, 200) : null,
          cover_image: item.imageUrl || null,
          external_sources: item.link ? [item.link] : [],
          publish_date: item.date || new Date().toISOString().split('T')[0],
          status: 'published'
        },
        { onConflict: 'slug' }
      );

    if (error) {
      console.error(`❌ Error migrating "${item.slug}":`, error.message);
      errorCount++;
    } else {
      successCount++;
    }
  }

  console.log('✅ Migration Complete!');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed: ${errorCount}`);
}

migrateNews().catch(console.error);
