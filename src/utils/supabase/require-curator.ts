import { createClient } from '@/utils/supabase/server'

/**
 * Server-side gate for admin surfaces (Server Actions, admin pages).
 *
 * Verifies the caller is authenticated AND holds a curator_profiles row.
 * This complements RLS rather than replacing it: RLS is the last line of
 * defense for data access, this keeps non-curators out of admin logic,
 * errors, and UI entirely.
 *
 * Throws 'Authentication required' or 'Curator access required'.
 */
export async function requireCurator() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Authentication required')
  }

  const { data: profile } = await supabase
    .from('curator_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile?.role) {
    throw new Error('Curator access required')
  }

  return { supabase, user, role: profile.role as string }
}
