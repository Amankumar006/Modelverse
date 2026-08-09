import { mapRowToModelEntry } from '@/lib/models'
import { notFound, redirect } from 'next/navigation'
import ReviewForm from './ReviewForm'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import StatusDots from '@/components/StatusDots'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `Review ${slug} - Admin` }
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

  return (
    <div className="bg-daylight-card rounded-2xl p-8 border border-daylight-muted/10 shadow-card max-w-5xl mx-auto">
      <div className="mb-6 pb-6 border-b border-daylight-muted/10">
        <Link href="/admin/review" className="text-sm text-daylight-accent hover:underline mb-4 inline-block">&larr; Back to Queue</Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-daylight-text">{model.name}</h1>
            <p className="text-xl text-daylight-muted mt-1">{model.developer}</p>
          </div>
          <div className="flex items-center gap-3 bg-daylight-bg border border-daylight-muted/10 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-daylight-text">
              {model.verificationStatus || 'DRAFT'}
            </span>
            <StatusDots status={model.verificationStatus || 'DRAFT'} />
          </div>
        </div>
      </div>

      <ReviewForm model={model} />
    </div>
  )
}
