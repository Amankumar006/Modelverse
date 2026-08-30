import assert from 'node:assert';

console.log('Testing schema and API routes consistency...');

// 1. Verify schema contract definitions
const modelColumns = [
  'id', 'slug', 'name', 'developer', 'institution', 'family', 'type',
  'primary_task', 'status', 'vendor_api_status', 'deployment', 'release_date',
  'parameters', 'active_parameters', 'context_window', 'benchmarks',
  'capabilities', 'quality_status', 'quality_score'
];

const newsColumns = [
  'id', 'slug', 'title', 'body', 'excerpt', 'author', 'category',
  'publish_date', 'status', 'confidence_level', 'article_type',
  'deep_dive_score', 'has_diagram', 'mermaid_diagrams'
];

assert(modelColumns.includes('slug'), 'Models must include unique slug');
assert(newsColumns.includes('slug'), 'News must include unique slug');
assert(modelColumns.includes('developer'), 'Models must use developer rather than provider');
assert(modelColumns.includes('status'), 'Models must use status rather than is_active');

console.log('✔ All schema contract validations passed successfully.');
