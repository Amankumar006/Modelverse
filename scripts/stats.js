const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await adminClient
    .from('models')
    .select('primary_task, family, verification_status')
    .eq('needs_review', true);
    
  if (error) {
    console.error(error);
    return;
  }
  
  const grouped = data.reduce((acc, model) => {
    const task = model.primary_task || 'Unknown Task';
    if (!acc[task]) acc[task] = { total: 0, disputed: 0 };
    acc[task].total++;
    if (model.verification_status === 'DISPUTED') acc[task].disputed++;
    return acc;
  }, {});

  console.log(`Total models needing review: ${data.length}`);
  console.log(`Total task groups: ${Object.keys(grouped).length}`);
  console.log(JSON.stringify(grouped, null, 2));
}

run();
