const supabase = require('../src/lib/supabase.js');
async function test() {
  const { data, error } = await supabase.from('models').select('slug, name, verified, verification_status').order('release_date', { ascending: false }).limit(5);
  console.log(data);
}
test();
