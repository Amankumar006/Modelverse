'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, updateTag } from 'next/cache'

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

  const { data: existingModel, error: fetchError } = await supabase
    .from('models')
    .select('*')
    .eq('slug', slug)
    .single();

  if (fetchError || !existingModel) {
    throw new Error('Model not found');
  }

  const parsedEdits = parseJsonFields(edits);
  const mergedModel = {
    ...existingModel,
    ...parsedEdits,
  };

  // Evaluate deterministic quality gate on the curated model
  // Human edits only promote to 'indexed' if benchmarks and provenance rules pass
  const { scoreModelPage } = await import('@/../scripts/quality/score-content');
  const gate = scoreModelPage(mergedModel);

  const updates = {
    ...parsedEdits,
    ...(parsedEdits.metadata || parsedEdits.quickstart
      ? {
          metadata: {
            ...(existingModel.metadata || {}),
            ...((parsedEdits.metadata as Record<string, unknown>) || {}),
            ...(parsedEdits.quickstart ? { quickstart: parsedEdits.quickstart } : {}),
          },
        }
      : {}),
    verified: gate.status === 'indexed',
    verification_status: gate.status === 'indexed' ? 'VERIFIED' : 'LIKELY',
    quality_status: gate.status,
    quality_score: gate.score,
    quality_reasons: gate.reasons,
    quality_checked_at: new Date().toISOString(),
    needs_review: false,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
  await supabase
    .from('audit_log')
    .insert({
      actor: user.id,
      action: 'approve_model',
      target_type: 'model',
      target_id: slug,
      metadata: { 
        fields_changed: Object.keys(edits),
        quality_status: gate.status,
        quality_score: gate.score,
        quality_reasons: gate.reasons,
      }
    });

  updateTag('models');
  revalidatePath('/admin/review');
  revalidatePath(`/admin/review/${slug}`);
  revalidatePath(`/models/${slug}`);
  revalidatePath('/models');
  revalidatePath('/');
  
  return { success: true, quality_status: gate.status, quality_score: gate.score };
}

export async function saveModelEdits(slug: string, edits: Record<string, unknown>) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const parsedEdits = parseJsonFields(edits);

  if (parsedEdits.metadata || parsedEdits.quickstart) {
    const { data: existing } = await supabase
      .from('models')
      .select('metadata')
      .eq('slug', slug)
      .single();
    parsedEdits.metadata = {
      ...(existing?.metadata || {}),
      ...((parsedEdits.metadata as Record<string, unknown>) || {}),
      ...(parsedEdits.quickstart ? { quickstart: parsedEdits.quickstart } : {}),
    };
  }

  const { error: updateError } = await supabase
    .from('models')
    .update({
      ...parsedEdits,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to update model');
  }

  // Insert audit log
  await supabase
    .from('audit_log')
    .insert({
      actor: user.id,
      action: 'edit_model_draft',
      target_type: 'model',
      target_id: slug,
      metadata: { fields_changed: Object.keys(edits) }
    });

  updateTag('models');
  revalidatePath('/admin/review');
  revalidatePath(`/admin/review/${slug}`);
  revalidatePath(`/models/${slug}`);
  revalidatePath('/models');
  revalidatePath('/');
  
  return { success: true };
}

export async function markDisputed(slug: string, notes: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  // When a model is disputed, it immediately loses verified status and drops out of indexed feeds
  const updates = {
    verified: false,
    verification_status: 'DISPUTED',
    quality_status: 'thin',
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
  await supabase
    .from('audit_log')
    .insert({
      actor: user.id,
      action: 'mark_disputed',
      target_type: 'model',
      target_id: slug,
      metadata: { notes, action: 'revoked_indexed_status' }
    });

  updateTag('models');
  revalidatePath('/admin/review');
  revalidatePath(`/admin/review/${slug}`);
  revalidatePath(`/models/${slug}`);
  revalidatePath('/models');
  revalidatePath('/');

  return { success: true };
}

export async function dismissModels(slugs: string[]) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { error: updateError } = await supabase
    .from('models')
    .update({ needs_review: false })
    .in('slug', slugs);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to dismiss models');
  }

  await supabase.from('audit_log').insert({
    actor: user.id,
    action: 'bulk_dismiss_models',
    target_type: 'model',
    target_id: 'multiple',
    metadata: { slugs }
  });

  updateTag('models');
  revalidatePath('/admin/review');
  revalidatePath('/models');
  revalidatePath('/');
  return { success: true };
}

export async function approveModels(slugs: string[]) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: models, error: fetchError } = await supabase
    .from('models')
    .select('*')
    .in('slug', slugs);

  if (fetchError || !models) {
    throw new Error('Failed to fetch models for bulk approval');
  }

  const { scoreModelPage } = await import('@/../scripts/quality/score-content');
  const now = new Date().toISOString();
  const updatePromises = models.map((model) => {
    const gate = scoreModelPage(model);
    return supabase
      .from('models')
      .update({ 
        verified: gate.status === 'indexed', 
        verification_status: gate.status === 'indexed' ? 'VERIFIED' : 'LIKELY', 
        quality_status: gate.status,
        quality_score: gate.score,
        quality_reasons: gate.reasons,
        quality_checked_at: now,
        needs_review: false, 
        reviewed_by: user.id, 
        reviewed_at: now,
        updated_at: now
      })
      .eq('slug', model.slug);
  });

  await Promise.all(updatePromises);

  await supabase.from('audit_log').insert({
    actor: user.id,
    action: 'bulk_approve_models',
    target_type: 'model',
    target_id: 'multiple',
    metadata: { slugs }
  });

  updateTag('models');
  revalidatePath('/admin/review');
  revalidatePath('/models');
  revalidatePath('/');
  return { success: true };
}

export async function overrideVerification(slug: string, reason: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  if (!reason || reason.trim().length < 15) {
    throw new Error('Override requires a detailed reason explaining why automated verification was bypassed (min 15 chars).');
  }

  // Explicit override: forces indexed status with explicit audit trace
  const updates = {
    verified: true,
    verification_status: 'VERIFIED',
    quality_status: 'indexed',
    needs_review: false,
    curator_notes: `OVERRIDE: ${reason.trim()}`,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from('models')
    .update(updates)
    .eq('slug', slug);

  if (updateError) {
    console.error('Override failed:', updateError);
    throw new Error('Failed to apply override');
  }

  // Audit log with dedicated override action
  await supabase.from('audit_log').insert({
    actor: user.id,
    action: 'override_provenance_gate',
    target_type: 'model',
    target_id: slug,
    metadata: { 
      reason: reason.trim(),
      curator_override: true,
    }
  });

  updateTag('models');
  revalidatePath('/admin/review');
  revalidatePath(`/admin/review/${slug}`);
  revalidatePath(`/models/${slug}`);
  revalidatePath('/models');
  revalidatePath('/');

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
  revalidatePath('/news');
  return { success: true };
}

export async function approveDeepDiveArticle(slug: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { error: updateError } = await supabase
    .from('news_items')
    .update({
      curator_reviewed: true,
      quality_status: 'indexed',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('slug', slug)
    .eq('article_type', 'deep-dive');

  if (updateError) {
    console.error('Failed to approve deep-dive article:', updateError);
    throw new Error('Failed to approve deep-dive article');
  }

  await supabase.from('audit_log').insert({
    actor: user.id,
    action: 'approve_deep_dive_article',
    target_type: 'news_item',
    target_id: slug,
    metadata: { curator_id: user.id }
  });

  revalidatePath('/admin/news');
  revalidatePath(`/news/${slug}`);
  revalidatePath('/news');
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
