import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';

const FrontmatterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  category: z.string().min(1, "Category is required"),
  summary: z.string().min(140).max(160, "Summary must be 140-160 characters for SEO"),
  author: z.object({
    name: z.string(),
    role: z.string(),
    avatar_url: z.string().optional(),
  }),
  source_name: z.string().optional(),
  source_url: z.string().url().optional(),
  cover_image: z.string().min(1, "Cover image is required"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  published_at: z.union([
    z.string().datetime({ offset: true }),
    z.date()
  ]), // ISO 8601 string or YAML parsed Date
  is_published: z.boolean(),
  reading_time: z.number().optional(), // Can be auto-calculated if missing
});

async function validateArticles() {
  const articlesDir = path.join(process.cwd(), 'content/articles');
  
  let files;
  try {
    files = await fs.readdir(articlesDir);
  } catch {
    console.error(`Could not read directory ${articlesDir}`);
    process.exit(1);
  }

  const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  const slugs = new Set<string>();
  let hasErrors = false;

  for (const file of mdFiles) {
    const filePath = path.join(articlesDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Parse frontmatter
    const { data, content: body } = matter(content);

    // 1. Validate Schema
    const result = FrontmatterSchema.safeParse(data);
    if (!result.success) {
      console.error(`\n❌ Validation error in ${file}:`);
      result.error.issues.forEach(issue => {
        console.error(`   - [${issue.path.join('.')}] ${issue.message}`);
      });
      hasErrors = true;
      continue;
    }

    const frontmatter = result.data;

    // 2. Validate Duplicate Slugs
    if (slugs.has(frontmatter.slug)) {
      console.error(`\n❌ Duplicate slug found in ${file}: ${frontmatter.slug}`);
      hasErrors = true;
    }
    slugs.add(frontmatter.slug);

    // 3. Validate Cover Image Existence (if local)
    if (frontmatter.cover_image.startsWith('/')) {
      const imagePath = path.join(process.cwd(), 'public', frontmatter.cover_image);
      try {
        await fs.access(imagePath);
      } catch {
        console.error(`\n❌ Cover image not found for ${file}: ${frontmatter.cover_image}`);
        hasErrors = true;
      }
    }

    // 4. Validate Minimum Word Count
    const wordCount = body.trim().split(/\s+/).length;
    if (wordCount < 300 && frontmatter.is_published) {
      console.warn(`\n⚠️ Warning in ${file}: Word count is only ${wordCount} (recommended >= 300 for published articles).`);
    }
  }

  if (hasErrors) {
    console.error('\n💥 Validation failed! Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ All articles validated successfully!');
  }
}

validateArticles().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
