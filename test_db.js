const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('models').select('id, name, slug, needs_review, status').ilike('name', '%Qwen%3.7%');
  if (error) console.error(error);
  else console.log(data);
}
run();
