import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

// Load local environment if running outside GitHub Actions
try {
  process.loadEnvFile('.env.local');
} catch {
  // Ignore if running in CI with process.env already set
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://zmfyclrjbiewmwqiswqk.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL = process.env.SITE_URL || 'https://www.themodelverse.in';
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

if (!SUPABASE_KEY) {
  console.warn('⚠️ [Warning] SUPABASE_SERVICE_ROLE_KEY is not configured in GitHub Secrets / environment.');
  console.warn('👉 To enable automated database syncing, add `SUPABASE_SERVICE_ROLE_KEY` to your GitHub Repository Secrets:');
  console.warn('   Settings -> Secrets and variables -> Actions -> New repository secret');
  console.warn('ℹ️ Skipping database sync step for now.');
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncArticles() {
  const articlesDir = path.join(process.cwd(), 'content/articles');
  
  let files;
  try {
    files = await fs.readdir(articlesDir);
  } catch {
    console.log('ℹ️ No content/articles directory found. Skipping sync.');
    return;
  }

  const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  console.log(`\n📚 Found ${mdFiles.length} article(s) in content/articles/ to sync...`);

  let syncedCount = 0;
  const syncedSlugs = [];

  for (const file of mdFiles) {
    const filePath = path.join(articlesDir, file);
    const raw = await fs.readFile(filePath, 'utf-8');
    const { data: frontmatter, content: body } = matter(raw);

    if (!frontmatter.slug || !frontmatter.title) {
      console.warn(`⚠️ Skipping ${file}: missing required slug or title.`);
      continue;
    }

    const payload = {
      slug: frontmatter.slug,
      title: frontmatter.title,
      summary: frontmatter.summary || frontmatter.title,
      content: body.trim(),
      category: frontmatter.category || 'Architecture',
      source_name: typeof frontmatter.author === 'object' ? frontmatter.author.name : (frontmatter.source_name || 'Modelverse Intelligence'),
      source_url: frontmatter.source_url || null,
      cover_image: (frontmatter.cover_image && !frontmatter.cover_image.toLowerCase().includes('placeholder')) 
        ? frontmatter.cover_image 
        : '/images/articles/universal-cover.svg',
      is_published: frontmatter.is_published !== false,
      published_at: frontmatter.published_at instanceof Date 
        ? frontmatter.published_at.toISOString() 
        : (frontmatter.published_at || new Date().toISOString()),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('articles')
      .upsert(payload, { onConflict: 'slug' });

    if (error) {
      console.error(`❌ Error syncing article "${payload.slug}":`, error.message);
    } else {
      console.log(`✅ Synced: ${payload.title} (${payload.slug})`);
      syncedCount++;
      syncedSlugs.push(payload.slug);
    }
  }

  console.log(`\n🎉 Synchronized ${syncedCount} of ${mdFiles.length} article(s) to Supabase.`);

  // Export URLs for indexing script if running in CI
  if (process.env.GITHUB_OUTPUT && syncedSlugs.length > 0) {
    const urls = syncedSlugs.map(slug => `${SITE_URL}/articles/${slug}`);
    await fs.appendFile(process.env.GITHUB_OUTPUT, `synced_urls=${urls.join(' ')}\n`);
  }

  // Trigger On-Demand Next.js Cache Revalidation
  if (SITE_URL && REVALIDATION_SECRET && syncedSlugs.length > 0) {
    console.log(`\n🔄 Triggering on-demand cache revalidation at ${SITE_URL}/api/revalidate...`);
    try {
      const res = await fetch(`${SITE_URL}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${REVALIDATION_SECRET}`,
        },
        body: JSON.stringify({ tag: 'articles' }),
      });
      if (res.ok) {
        console.log('⚡ Edge cache revalidated successfully!');
      } else {
        console.warn(`⚠️ Revalidation returned status ${res.status}`);
      }
    } catch (revalErr) {
      console.warn('⚠️ Could not trigger cache revalidation:', revalErr.message);
    }
  }
}

syncArticles().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
