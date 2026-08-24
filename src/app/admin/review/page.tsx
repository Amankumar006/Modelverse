import { createClient } from '@/utils/supabase/server'
import QueueList from './QueueList'

export const metadata = {
  title: 'Review Queue - Admin',
}

export default async function ReviewQueuePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams;
  const statusFilter = params.status;

  // Ensure only authenticated curators can view this page
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div>Access Denied</div>
  }

  // Fetch pending models. needs_review=true already covers any model with
  // staged changes (scripts/lib/staged-write.js raises it on every proposal),
  // so the existing filter is sufficient.
  let query = supabase
    .from('models')
    .select('slug, name, developer, verification_status, updated_at, primary_task, family, boost, featured, staged_changes, needs_review')

  if (statusFilter === 'VERIFIED') {
    query = query.eq('verification_status', 'VERIFIED')
  } else {
    query = query.eq('needs_review', true)
    if (statusFilter) {
      query = query.eq('verification_status', statusFilter)
    }
  }

  const { data: models, error } = await query;

  if (error) {
    console.error('Error fetching review queue:', error)
    return <div className="text-red-500 p-8">Failed to load pending models.</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-daylight-text">Pending Models</h1>
        <p className="text-daylight-muted mt-2">Review, group, and manage pending model submissions.</p>
      </div>
      <QueueList models={models || []} />
    </div>
  )
}
