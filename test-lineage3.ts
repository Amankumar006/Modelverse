import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function run() {
  const { data: models } = await supabase.from('models').select('name');
  if(models) {
    console.log(models.filter(m => m.name.toLowerCase().includes('qwen')).map(m => m.name));
  }
}
run();
