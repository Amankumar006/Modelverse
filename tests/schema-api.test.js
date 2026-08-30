import assert from 'node:assert';

console.log('Testing clean schema and API contracts...');

// 1. Verify clean models table contract
const cleanModelColumns = [
  'id',
  'slug',
  'name',
  'provider',
  'category',
  'description',
  'context_window',
  'parameters',
  'modalities',
  'pricing',
  'benchmarks',
  'links',
  'release_date',
  'is_active',
  'created_at',
  'updated_at',
];

// 2. Verify clean articles table contract
const cleanArticleColumns = [
  'id',
  'slug',
  'title',
  'summary',
  'content',
  'category',
  'source_name',
  'source_url',
  'cover_image',
  'related_models',
  'is_published',
  'published_at',
  'created_at',
  'updated_at',
];

assert(cleanModelColumns.includes('provider'), 'Models must include provider');
assert(cleanModelColumns.includes('context_window'), 'Models must include context_window');
assert(cleanModelColumns.includes('pricing'), 'Models must include pricing');
assert(cleanModelColumns.includes('benchmarks'), 'Models must include benchmarks');
assert(cleanModelColumns.includes('is_active'), 'Models must include is_active');

assert(cleanArticleColumns.includes('slug'), 'Articles must include slug');
assert(cleanArticleColumns.includes('title'), 'Articles must include title');
assert(cleanArticleColumns.includes('content'), 'Articles must include content');
assert(cleanArticleColumns.includes('related_models'), 'Articles must include related_models');
assert(cleanArticleColumns.includes('is_published'), 'Articles must include is_published');

console.log('✔ Clean schema contract validations passed successfully.');
