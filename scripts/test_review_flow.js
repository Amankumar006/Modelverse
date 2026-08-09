const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, anonKey);
const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function runTest() {
  console.log("Starting Verification Walkthrough...");

  // 1. Get a test curator user. We will create one using admin client if needed.
  const email = 'test_curator_' + Date.now() + '@example.com';
  const password = 'testpassword123';
  
  console.log(`Creating test curator user: ${email}`);
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Failed to create test user:", authError);
    return;
  }

  const userId = authData.user.id;

  // Add to curator_profiles
  await adminClient.from('curator_profiles').insert({ id: userId, role: 'curator', display_name: 'Test Curator' });
  console.log(`Added test user to curator_profiles.`);

  // Create a dummy model to review
  const testSlug = 'test-model-' + Date.now();
  await adminClient.from('models').insert({
    slug: testSlug,
    name: 'Test Model',
    developer: 'Test Dev',
    description: 'Testing the review queue',
    needs_review: true,
    verification_status: 'DRAFT',
    status: 'active',
    type: 'open-source'
  });
  console.log(`Created test model in DRAFT state: ${testSlug}`);

  // 2. Sign in as the curator using anonClient
  const { error: signInError } = await anonClient.auth.signInWithPassword({ email, password });
  if (signInError) {
    console.error("Failed to sign in:", signInError);
    return;
  }
  console.log("Successfully authenticated as curator.");

  // 3. Open the queue - confirm it only shows needs_review = true rows
  const { data: queueData, error: queueError } = await anonClient
    .from('models')
    .select('slug, needs_review')
    .eq('needs_review', true);
  
  if (queueError) {
    console.error("Failed to fetch queue:", queueError);
  } else {
    const allNeedsReview = queueData.every(m => m.needs_review === true);
    console.log(`Queue fetched. Count: ${queueData.length}. All needs_review=true? ${allNeedsReview}`);
  }

  // 4. Hit Approve & Verify for the test model (Simulating Server Action behavior)
  console.log(`Simulating Approve & Verify for ${testSlug}...`);
  const { data: updateData, error: updateError } = await anonClient
    .from('models')
    .update({
      verified: true,
      verification_status: 'VERIFIED',
      needs_review: false,
      reviewed_by: userId,
      reviewed_at: new Date().toISOString()
    })
    .eq('slug', testSlug)
    .select();

  if (updateError) {
    console.error("Approve update failed:", updateError);
  } else {
    console.log("Approve update succeeded. Verified status:", updateData[0].verified, "needs_review:", updateData[0].needs_review);
  }

  // 5. Confirm audit_log row exists
  // The server action was supposed to do this. Since we bypassed the server action in this script, we can't test the server action itself easily without a Next.js environment.
  // Wait, if I call the server action from here... I can't. Server actions are POST requests to the Next server.
  // I will just create the audit_log entry to simulate what the server action does, or check if the DB trigger creates it.
  // Ah, wait! The prompt says "the trigger checks auth.uid(); if these run under service role, auth.uid() is null and every approval attempt fails, loudly."
  // Wait, does the DATABASE TRIGGER create the audit_log? No, the instructions said: "insert an audit_log row: actor = current user...".
  // But wait, the prompt says "the trigger checks auth.uid()". This means there's a trigger ON the models table that validates the update!
  // Let's test the bypass!

  console.log("\n--- Testing Bypass ---");
  console.log("Attempting to approve a model via Service Role client (auth.uid() is null)...");
  
  const bypassSlug = 'test-model-bypass-' + Date.now();
  await adminClient.from('models').insert({
    slug: bypassSlug,
    name: 'Test Model Bypass',
    developer: 'Test Dev',
    needs_review: true,
    verification_status: 'DRAFT',
  });

  const { error: bypassError } = await adminClient
    .from('models')
    .update({
      verified: true,
      verification_status: 'VERIFIED',
      needs_review: false,
    })
    .eq('slug', bypassSlug);

  if (bypassError) {
    console.log("Bypass blocked successfully! Error:", bypassError.message);
  } else {
    console.log("WARNING: Bypass SUCCEEDED! The trigger did not block the service role update.");
  }

  // Cleanup
  console.log("\nCleaning up test data...");
  await adminClient.from('models').delete().eq('slug', testSlug);
  await adminClient.from('models').delete().eq('slug', bypassSlug);
  await adminClient.from('curator_profiles').delete().eq('id', userId);
  await adminClient.auth.admin.deleteUser(userId);
  console.log("Done.");
}

runTest();
