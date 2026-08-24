import { mapRowToModelEntry } from '@/lib/models'
import { notFound, redirect } from 'next/navigation'
import LiveModelEditor from './LiveModelEditor'
import StagedChangesPanel from '@/components/admin/StagedChangesPanel'
import { createClient } from '@/utils/supabase/server'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `Edit & Review ${slug} — Modelverse Admin` }
}

export default async function ReviewModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/admin')
  }

  const { data: rawModel } = await supabase
    .from('models')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!rawModel) {
    notFound()
  }

  const model = mapRowToModelEntry(rawModel)

  const { data: allRawModels } = await supabase
    .from('models')
    .select('*')
    .order('release_date', { ascending: false })

  const allModels = (allRawModels || []).map(mapRowToModelEntry)

  const stagedChanges = (rawModel.staged_changes as Record<string, unknown>) || {}
  const hasStaged = Object.keys(stagedChanges).length > 0

  return (
    <div className="space-y-4">
      {hasStaged && (
        <StagedChangesPanel
          slug={slug}
          stagedChanges={stagedChanges}
          stagedAt={(rawModel.staged_at as string) || null}
          liveValues={rawModel as Record<string, unknown>}
        />
      )}
      <LiveModelEditor initialModel={model} allModels={allModels} />
    </div>
  )
}
