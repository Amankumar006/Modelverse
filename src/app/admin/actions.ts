'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

function parseJsonFields(edits: Record<string, unknown>) {
  const jsonFields = ['pricing', 'benchmarks', 'parameters', 'context_window'];
  const parsed = { ...edits };

  for (const field of jsonFields) {
    if (parsed[field]) {
      if (typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field] as string);
        } catch {
          // If it fails to parse as JSON, keep it as a string
          // This allows users to type "128K" or "72B" without quotes in the form
        }
      }
    }
  }
  return parsed;
}

export async function approveModel(slug: string, edits: Record<string, unknown>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const parsedEdits = parseJsonFields(edits);

  const updates = {
    ...parsedEdits,
    verified: true,
    verification_status: 'VERIFIED',
    needs_review: false,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from('models')
    .update(updates)
    .eq('slug', slug);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to update model');
  }

  // Insert audit log
  const { error: auditError } = await supabase
    .from('audit_log')
    .insert({
      actor: user.id,
      action: 'approve_model',
      target_type: 'model',
      target_id: slug,
      metadata: { fields_changed: Object.keys(edits) }
    });

  if (auditError) {
    console.error('Audit log failed:', auditError);
    // Depending on strictness, we might throw here, but usually audit log failure shouldn't fail the action completely.
    // Given the prompt requirements, let's keep it robust.
  }

  revalidatePath('/admin/review');
  revalidatePath(`/admin/review/${slug}`);
  revalidatePath(`/models/${slug}`); // Revalidate public page if it exists
  
  return { success: true };
}

export async function saveModelEdits(slug: string, edits: Record<string, unknown>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const parsedEdits = parseJsonFields(edits);

  const { error: updateError } = await supabase
    .from('models')
    .update(parsedEdits)
    .eq('slug', slug);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to update model');
  }

  revalidatePath('/admin/review');
  revalidatePath(`/admin/review/${slug}`);
  revalidatePath(`/models/${slug}`);
  
  return { success: true };
}

export async function markDisputed(slug: string, notes: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const updates = {
    verification_status: 'DISPUTED',
    needs_review: true,
    curator_notes: notes,
  };

  const { error: updateError } = await supabase
    .from('models')
    .update(updates)
    .eq('slug', slug);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to update model');
  }

  // Insert audit log
  const { error: auditError } = await supabase
    .from('audit_log')
    .insert({
      actor: user.id,
      action: 'mark_disputed',
      target_type: 'model',
      target_id: slug,
      metadata: { notes }
    });

  if (auditError) {
    console.error('Audit log failed:', auditError);
  }

  revalidatePath('/admin/review');
  revalidatePath(`/admin/review/${slug}`);

  return { success: true };
}

export async function dismissModels(slugs: string[]) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // To dismiss, we set needs_review = false and perhaps verification_status = 'DRAFT' or we leave it.
  // The user prompt says "dismiss them together... irrelevant entries". 
  // There is no specific "DISMISSED" status for models in the prompt, but we can set needs_review = false.
  const { error: updateError } = await supabase
    .from('models')
    .update({ needs_review: false })
    .in('slug', slugs);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to dismiss models');
  }

  // Audit log
  await supabase.from('audit_log').insert({
    actor: user.id,
    action: 'bulk_dismiss_models',
    target_type: 'model',
    target_id: 'multiple',
    metadata: { slugs }
  });

  revalidatePath('/admin/review');
  return { success: true };
}

export async function approveModels(slugs: string[]) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { error: updateError } = await supabase
    .from('models')
    .update({ 
      verified: true, 
      verification_status: 'VERIFIED', 
      needs_review: false, 
      reviewed_by: user.id, 
      reviewed_at: new Date().toISOString() 
    })
    .in('slug', slugs);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to approve models');
  }

  await supabase.from('audit_log').insert({
    actor: user.id,
    action: 'bulk_approve_models',
    target_type: 'model',
    target_id: 'multiple',
    metadata: { slugs }
  });

  revalidatePath('/admin/review');
  return { success: true };
}


export async function triageNews(id: string, action: 'approve' | 'dismiss', slug?: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const updates: Record<string, unknown> = {
    review_status: action === 'approve' ? 'approved' : 'dismissed',
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  if (action === 'approve' && slug) {
    updates.related_model_slug = slug;
  }

  const { error: updateError } = await supabase
    .from('news_triage')
    .update(updates)
    .eq('id', id);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to triage news');
  }

  // Audit log
  await supabase.from('audit_log').insert({
    actor: user.id,
    action: `triage_news_${action}`,
    target_type: 'news_triage',
    target_id: id,
    metadata: updates
  });

  revalidatePath('/admin/news');
  return { success: true };
}

export async function inviteCurator(email: string, displayName: string) {
  const supabase = await createClient();

  // Check if current user is admin
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: profile } = await supabase
    .from('curator_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can invite curators');
  }

  // Use service role to invite user
  const { createClient: createAdminClient } = await import('@supabase/supabase-js');
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email);

  if (inviteError) {
    console.error('Invite failed:', inviteError);
    throw new Error('Failed to invite user: ' + inviteError.message);
  }

  const newUserId = inviteData.user.id;

  // Insert into curator_profiles using the authenticated client to respect RLS
  const { error: insertError } = await supabase
    .from('curator_profiles')
    .insert({
      id: newUserId,
      display_name: displayName,
      role: 'curator'
    });

  if (insertError) {
    // If it fails (e.g. because of policy), log it. The prompt says "Uses the curator_profiles insert/update policies"
    console.error('Insert profile failed:', insertError);
    throw new Error('Failed to create curator profile: ' + insertError.message);
  }

  revalidatePath('/admin/curators');
  return { success: true };
}
