// Manual diagnostic: condition audit of public.models (READ-ONLY).
// Run: node tests/db-models-condition.test.js
// Covers curation detail, field completeness, and data hygiene dimensions
// via plain supabase-js SELECTs (aggregated locally — no RPC assumed).
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // local-only, never printed
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const pct = (n, d) => (d ? ((100 * n) / d).toFixed(1) : '0') + '%';
const bucket = (m, k) => { const o = {}; for (const r of m) { const v = r[k] ?? '<null>'; o[v] = (o[v] || 0) + 1; } return o; };

(async () => {
  // One pass over all rows with every column this diagnostic needs.
  const COLS = 'slug,name,developer,description,description_draft,primary_task,type,status,' +
    'source,vendor_api_status,release_date,created_at,reviewed_at,verification_status,' +
    'verified,needs_review,featured,boost,is_legacy_curated,quality_status,quality_score,' +
    'quality_reasons,pricing,cost_tiers,context_window,benchmarks,parameters,' +
    'active_parameters,capabilities,license,api_availability,chatgpt_availability,' +
    'links,sources,pricing_last_verified,aliases,tags,modality,logo,family,curator_notes';
  const { data: rows, error } = await db.from('models').select(COLS).limit(2000);
  if (error) { console.error('QUERY ERROR:', error.message); process.exit(1); }
  const n = rows.length;
  console.log(`# total models fetched: ${n}\n`);

  // --- curation ---
  const nr = rows.filter((r) => r.needs_review);
  console.log('## needs_review breakdown:', JSON.stringify(
    nr.reduce((a, r) => { const k = `${r.verification_status}/${r.quality_status ?? 'none'}`; a[k] = (a[k] || 0) + 1; return a; }, {})));
  console.log('needs_review but reviewed_at set:', nr.filter((r) => r.reviewed_at).map((r) => r.slug));

  const disp = rows.filter((r) => r.verification_status === 'DISPUTED');
  console.log('\n## DISPUTED models:');
  for (const d of disp) console.log(` - ${d.slug} | ${d.name} | ${d.developer} | notes: ${(d.curator_notes ?? '(none)').slice(0, 160)} | reasons: ${JSON.stringify(d.quality_reasons).slice(0, 120)} | needs_review=${d.needs_review}`);

  const verifiedNoCurator = rows.filter((r) => r.verification_status === 'VERIFIED' && !r.reviewed_at);
  console.log(`\nVERIFIED with no reviewed_at: ${verifiedNoCurator.length}`);
  const flagMismatch = rows.filter((r) => r.verified !== (r.verification_status === 'VERIFIED'));
  console.log('verified flag vs status mismatches:', flagMismatch.length,
    JSON.stringify(bucket(flagMismatch, 'verification_status')));

  // --- featured ---
  const featThin = rows.filter((r) => r.featured && r.quality_status === 'thin')
    .sort((a, b) => b.boost - a.boost).slice(0, 12);
  console.log('\n## featured-but-thin (top boost):');
  for (const f of featThin) console.log(` - ${f.slug} boost=${f.boost} score=${f.quality_score} ${f.verification_status}`);

  // --- field completeness by tier ---
  for (const tier of ['indexed', 'thin']) {
    const t = rows.filter((r) => r.quality_status === tier);
    const nn = (k) => t.filter((r) => r[k] !== null && r[k] !== undefined).length;
    console.log(`\n## tier=${tier} (n=${t.length}) non-null rates:`);
    for (const k of ['description', 'primary_task', 'type', 'developer', 'release_date', 'family',
      'modality', 'tags', 'logo', 'pricing', 'cost_tiers', 'context_window', 'benchmarks',
      'parameters', 'active_parameters', 'capabilities', 'license', 'api_availability',
      'chatgpt_availability', 'links', 'sources', 'pricing_last_verified', 'aliases']) {
      console.log(`   ${String(nn(k)).padStart(4)}  ${pct(nn(k), t.length).padStart(6)}  ${k}`);
    }
  }

  // --- description stats ---
  const descs = rows.filter((r) => typeof r.description === 'string' && r.description.length > 0);
  const lens = descs.map((r) => r.description.length).sort((a, b) => a - b);
  console.log(`\n## description: n=${descs.length}, min=${lens[0] ?? '-'}, p50=${lens[Math.floor(lens.length / 2)] ?? '-'}, avg=${lens.length ? Math.round(lens.reduce((a, b) => a + b, 0) / lens.length) : '-'}, max=${lens.at(-1) ?? '-'}, <120 chars=${lens.filter((l) => l < 120).length}`);
  console.log('draft-without-live:', rows.filter((r) => r.description_draft && !r.description).length);

  // --- hygiene: duplicates ---
  const byName = {};
  for (const r of rows) { const k = (r.name || '').trim().toLowerCase(); (byName[k] ||= []).push(r.slug); }
  const dupes = Object.entries(byName).filter(([, v]) => v.length > 1);
  console.log(`\n## duplicate names: ${dupes.length}`);
  for (const [k, v] of dupes.slice(0, 15)) console.log(` - "${k}" x${v.length}: ${v.join(', ')}`);

  // --- hygiene: enums ---
  for (const k of ['status', 'type', 'source', 'vendor_api_status']) {
    console.log(`\n## ${k}:`, JSON.stringify(Object.entries(bucket(rows, k)).sort((a, b) => b[1] - a[1]).slice(0, 15)));
  }

  // --- hygiene: timestamps ---
  const now = Date.now();
  console.log('\n## timestamp sanity:',
    JSON.stringify({
      created_before_2020: rows.filter((r) => new Date(r.created_at) < new Date('2020-01-01')).length,
      created_future: rows.filter((r) => new Date(r.created_at) > now).length,
      release_far_future: rows.filter((r) => r.release_date && new Date(r.release_date) > now + 90 * 864e5).length,
      release_ancient: rows.filter((r) => r.release_date && new Date(r.release_date) < new Date('2010-01-01')).length,
    }));

  // --- hygiene: quality reasons ---
  const reasons = {};
  for (const r of rows) for (const x of r.quality_reasons || []) reasons[x] = (reasons[x] || 0) + 1;
  console.log('\n## top quality_reasons:', JSON.stringify(Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 12)));

  // --- hygiene: jsonb shapes ---
  const classify = (v) => {
    if (v === null || v === undefined) return 'null';
    if (Array.isArray(v)) return v.length ? 'array' : 'empty_array';
    if (typeof v !== 'object') return typeof v;
    const keys = Object.keys(v);
    if (!keys.length) return 'empty_object';
    if (typeof v === 'object' && Object.keys(v).length === 1 && typeof Object.values(v)[0] === 'string'
      && /^[[{]/.test(Object.values(v)[0])) return 'double_encoded';
    return 'object';
  };
  const shapeCols = ['pricing', 'cost_tiers', 'context_window', 'benchmarks', 'parameters',
    'active_parameters', 'capabilities', 'license', 'links', 'sources',
    'api_availability', 'chatgpt_availability'];
  console.log('\n## jsonb/array shapes:');
  for (const c of shapeCols) console.log(`   ${c}:`, JSON.stringify(bucket(rows.map((r) => ({ v: classify(r[c]) })), 'v')));

  // context_window numeric sanity
  const cwNums = rows.filter((r) => typeof r.context_window === 'number');
  const cwStr = rows.filter((r) => typeof r.context_window === 'string' && /^\d+$/.test(r.context_window));
  console.log(`context_window numbers: ${cwNums.length}, >1e9: ${cwNums.filter((r) => r.context_window > 1e9).length}, <=0: ${cwNums.filter((r) => r.context_window <= 0).length}; numeric strings: ${cwStr.length}`);

  // empty arrays & non-https logos
  console.log('\n## array/url hygiene:',
    JSON.stringify({
      tags_empty: rows.filter((r) => Array.isArray(r.tags) && !r.tags.length).length,
      modality_empty: rows.filter((r) => Array.isArray(r.modality) && !r.modality.length).length,
      aliases_empty: rows.filter((r) => Array.isArray(r.aliases) && !r.aliases.length).length,
      logo_non_https: rows.filter((r) => r.logo && !/^https:\/\//.test(r.logo)).length,
    }));

  console.log('\nDone.');
})().catch((e) => { console.error(e); process.exit(1); });
