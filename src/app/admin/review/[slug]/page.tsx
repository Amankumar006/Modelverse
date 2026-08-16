import { mapRowToModelEntry } from '@/lib/models'
import { notFound, redirect } from 'next/navigation'
import LiveModelEditor from './LiveModelEditor'
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

  return <LiveModelEditor initialModel={model} />
}
