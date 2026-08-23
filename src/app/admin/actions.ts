'use server'

import { requireCurator } from '@/utils/supabase/require-curator'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath, updateTag } from 'next/cache'

type Db = Awaited<ReturnType<typeof createClient>>

// Audit entries are best-effort: a failed insert must not fail a curation
// action whose DB mutation already applied, but it must never be silently
// dropped either — surface it in server logs.
async function logAudit(
  db: Db,
  entry: {
    actor: string;
    action: string;
    target_type: string;
    target_id: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await db.from('audit_log').insert(entry);
  if (error) {
    console.error('Audit log insert failed:', error.message);
  }
}

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
  const { supabase, user } = await requireCurator();

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
  await logAudit(supabase, {
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
  const { supabase, user } = await requireCurator();

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
  await logAudit(supabase, {
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
  const { supabase, user } = await requireCurator();

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
  await logAudit(supabase, {
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
  const { supabase, user } = await requireCurator();

  const { error: updateError } = await supabase
    .from('models')
    .update({ needs_review: false })
    .in('slug', slugs);

  if (updateError) {
    console.error('Update failed:', updateError);
    throw new Error('Failed to dismiss models');
  }

  await logAudit(supabase, {
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
  const { supabase, user } = await requireCurator();

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

  await logAudit(supabase, {
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
  const { supabase, user } = await requireCurator();

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
  await logAudit(supabase, {
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
  const { supabase, user } = await requireCurator();

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
  await logAudit(supabase, {
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

export async function approveNewsItem(slugOrId: string) {
  const { supabase, user } = await requireCurator();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  const query = supabase
    .from('news_items')
    .update({
      status: 'published',
      quality_status: 'indexed',
      curator_reviewed: true,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    });

  const { data, error: updateError } = isUUID
    ? await query.eq('id', slugOrId).select('slug').single()
    : await query.eq('slug', slugOrId).select('slug').single();

  if (updateError) {
    console.error('Failed to approve news item:', updateError);
    throw new Error('Failed to approve news item: ' + updateError.message);
  }

  await logAudit(supabase, {
    actor: user.id,
    action: 'approve_news_item',
    target_type: 'news_items',
    target_id: slugOrId,
    metadata: { curator_id: user.id }
  });

  const slug = data?.slug || slugOrId;
  revalidatePath('/admin/news');
  revalidatePath(`/news/${slug}`);
  revalidatePath('/news');
  return { success: true, slug };
}

export async function updateNewsItemStatus(slugOrId: string, status: string, qualityStatus: string) {
  const { supabase, user } = await requireCurator();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  const query = supabase
    .from('news_items')
    .update({
      status,
      quality_status: qualityStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    });

  const { data, error: updateError } = isUUID
    ? await query.eq('id', slugOrId).select('slug').single()
    : await query.eq('slug', slugOrId).select('slug').single();

  if (updateError) {
    console.error('Failed to update news status:', updateError);
    throw new Error('Failed to update news status: ' + updateError.message);
  }

  await logAudit(supabase, {
    actor: user.id,
    action: 'update_news_status',
    target_type: 'news_items',
    target_id: slugOrId,
    metadata: { status, quality_status: qualityStatus }
  });

  const slug = data?.slug || slugOrId;
  revalidatePath('/admin/news');
  revalidatePath(`/news/${slug}`);
  revalidatePath('/news');
  return { success: true, slug };
}

export async function deleteNewsItem(slugOrId: string) {
  const { supabase, user } = await requireCurator();

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  const query = supabase.from('news_items').delete();

  const { error: deleteError } = isUUID
    ? await query.eq('id', slugOrId)
    : await query.eq('slug', slugOrId);

  if (deleteError) {
    console.error('Failed to delete news item:', deleteError);
    throw new Error('Failed to delete news item: ' + deleteError.message);
  }

  await logAudit(supabase, {
    actor: user.id,
    action: 'delete_news_item',
    target_type: 'news_items',
    target_id: slugOrId,
    metadata: { deleted_by: user.id }
  });

  revalidatePath('/admin/news');
  revalidatePath('/news');
  return { success: true };
}

export async function inviteCurator(email: string, displayName: string) {
  // requireCurator() already verifies the caller holds a curator_profiles row;
  // inviting additionally demands the admin role.
  const { role } = await requireCurator();

  if (role !== 'admin') {
    throw new Error('Only admins can invite curators');
  }

  // Service-role client: this action is admin-only, and curator_profiles has no
  // public INSERT policy, so the profile insert must bypass RLS here.
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

  // Insert into curator_profiles with the service-role client — there is no
  // INSERT policy on this table, so the authenticated client would always fail.
  const { error: insertError } = await adminClient
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
