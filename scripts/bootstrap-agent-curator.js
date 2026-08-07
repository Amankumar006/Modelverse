const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function bootstrap() {
  const email = 'agent@modelverse.ai';
  const password = 'SuperSecretPassword123!';
  
  console.log('Creating auth user...');
  let userId;
  const { data: userResp, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  
  if (userError) {
    if (userError.message.includes('already registered') || userError.message.includes('already exists')) {
       console.log('User already exists, fetching...');
       const { data: { users } } = await supabase.auth.admin.listUsers();
       const existing = users.find(u => u.email === email);
       if (existing) userId = existing.id;
    } else {
       console.error('Error creating user:', userError);
       return;
    }
  } else {
    userId = userResp.user.id;
  }
  
  if (!userId) {
     console.error('Could not determine user ID.');
     return;
  }
  
  console.log(`User ID: ${userId}`);
  console.log('Inserting into curator_profiles...');
  const { error: profileError } = await supabase
    .from('curator_profiles')
    .upsert({
      id: userId,
      role: 'admin',
      display_name: 'Agent Curator'
    }, { onConflict: 'id' });
    
  if (profileError) {
     console.error('Error inserting profile:', profileError);
  } else {
     console.log('Successfully bootstrapped agent curator!');
  }
}
bootstrap();
