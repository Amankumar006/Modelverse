'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveModel, saveModelEdits, markDisputed } from '../../actions'
import StatusDots, { StatusValue } from '@/components/StatusDots'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReviewForm({ model }: { model: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Scalar states
  const [name, setName] = useState(model.name || '')
  const [developer, setDeveloper] = useState(model.developer || '')
  const [description, setDescription] = useState(model.description || '')
  const [type, setType] = useState(model.type || 'open-source')
  const [status, setStatus] = useState(model.status || 'active')
  const [releaseDate, setReleaseDate] = useState(model.releaseDate || '')
  const [family, setFamily] = useState(model.family || '')
  const [tier, setTier] = useState(model.tier || '')
  const [institution, setInstitution] = useState(model.institution || '')
  const [sources, setSources] = useState(model.sources ? model.sources.join('\n') : '')

  // JSON states
  const [pricing, setPricing] = useState(model.pricing ? JSON.stringify(model.pricing, null, 2) : '')
  const [benchmarks, setBenchmarks] = useState(model.benchmarks ? JSON.stringify(model.benchmarks, null, 2) : '')
  const [parameters, setParameters] = useState(model.parameters ? JSON.stringify(model.parameters, null, 2) : '')
  const [contextWindow, setContextWindow] = useState(model.contextWindow ? JSON.stringify(model.contextWindow, null, 2) : '')

  const [curatorNotes, setCuratorNotes] = useState(model.curatorNotes || '')

  const handleAction = async (actionFn: () => Promise<any>) => {
    setLoading(true)
    setError(null)
    try {
      await actionFn()
      router.push('/admin/review')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getEdits = () => ({
    name, developer, description, type, status, release_date: releaseDate, family, tier, institution,
    pricing, benchmarks, parameters, context_window: contextWindow,
    sources: sources.split('\n').map((s: string) => s.trim()).filter(Boolean)
  })

  const validateJson = () => {
    const fields = [
      { name: 'Pricing', val: pricing },
      { name: 'Benchmarks', val: benchmarks },
      { name: 'Parameters', val: parameters },
      { name: 'Context Window', val: contextWindow }
    ]
    for (const f of fields) {
      if (f.val.trim()) {
        try {
          JSON.parse(f.val)
        } catch (e) {
          setError(`Invalid JSON in ${f.name}`)
          return false
        }
      }
    }
    return true
  }

  const onApprove = () => {
    if (!validateJson()) return
    handleAction(() => approveModel(model.slug, getEdits()))
  }

  const onSave = () => {
    if (!validateJson()) return
    handleAction(() => saveModelEdits(model.slug, getEdits()))
  }

  const onDispute = () => {
    handleAction(() => markDisputed(model.slug, curatorNotes))
  }

  const fieldConf = model.fieldConfidence || {}

  const ConfidenceBadge = ({ conf }: { conf?: string }) => {
    if (!conf) return null
    return (
      <span className="ml-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-daylight-bg border border-daylight-muted/10 text-xs font-mono tracking-wide">
        <StatusDots status={conf as StatusValue} />
        {conf}
      </span>
    )
  }

  const inputClass = "w-full p-2.5 bg-daylight-bg border border-daylight-muted/20 rounded-lg text-daylight-text focus:outline-none focus:ring-1 focus:ring-daylight-accent focus:border-daylight-accent placeholder-daylight-muted/50"
  const labelClass = "block text-sm font-medium mb-1.5 text-daylight-text"

  return (
    <div className="space-y-8 mt-6">
      {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20">{error}</div>}

      <div className="space-y-2">
        <label className={labelClass}>Sources (Verification Material, one URL per line)</label>
        <textarea 
          value={sources}
          onChange={e => setSources(e.target.value)}
          rows={3}
          className={`${inputClass} font-mono text-[13px] leading-relaxed`}
          placeholder="https://..."
        />
        {sources.trim() && (
          <div className="flex flex-wrap gap-4 mt-2">
            {sources.split('\n').map((s: string) => s.trim()).filter(Boolean).map((src: string, i: number) => (
              <a key={i} href={src} target="_blank" rel="noreferrer" className="text-xs text-daylight-accent hover:underline flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                {src.length > 50 ? src.substring(0, 47) + '...' : src}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Scalars */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold border-b border-daylight-muted/10 pb-2 text-daylight-text">Scalar Fields</h2>
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Developer</label>
            <input type="text" value={developer} onChange={e => setDeveloper(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <input type="text" value={type} onChange={e => setType(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <input type="text" value={status} onChange={e => setStatus(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Release Date</label>
              <input type="date" value={releaseDate} onChange={e => setReleaseDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Family</label>
              <input type="text" value={family} onChange={e => setFamily(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tier</label>
              <input type="text" value={tier} onChange={e => setTier(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Institution</label>
              <input type="text" value={institution} onChange={e => setInstitution(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* JSON Fields */}
        <div className="space-y-5">
          <h2 className="text-lg font-semibold border-b border-daylight-muted/10 pb-2 text-daylight-text">Complex Fields (JSON)</h2>
          <div>
            <label className={`${labelClass} flex items-center`}>
              Pricing <ConfidenceBadge conf={fieldConf.pricing} />
            </label>
            <textarea value={pricing} onChange={e => setPricing(e.target.value)} rows={4} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center`}>
              Benchmarks <ConfidenceBadge conf={fieldConf.benchmarks} />
            </label>
            <textarea value={benchmarks} onChange={e => setBenchmarks(e.target.value)} rows={4} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center`}>
              Parameters <ConfidenceBadge conf={fieldConf.parameters} />
            </label>
            <textarea value={parameters} onChange={e => setParameters(e.target.value)} rows={3} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
          </div>
          <div>
            <label className={`${labelClass} flex items-center`}>
              Context Window <ConfidenceBadge conf={fieldConf.contextWindow} />
            </label>
            <textarea value={contextWindow} onChange={e => setContextWindow(e.target.value)} rows={3} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
          </div>
        </div>
      </div>

      <div className="pt-8 mt-8 border-t border-daylight-muted/10">
        <label className={labelClass}>Curator Notes (Internal)</label>
        <textarea 
          value={curatorNotes} 
          onChange={e => setCuratorNotes(e.target.value)} 
          rows={3} 
          placeholder="Add notes explaining why a model is disputed, or what needs fixing..."
          className={inputClass} 
        />
      </div>

      <div className="flex gap-4 pt-4 border-t border-daylight-muted/10">
        <button 
          onClick={onApprove} 
          disabled={loading}
          className="px-6 py-2.5 bg-daylight-accent text-daylight-bg rounded-lg hover:opacity-90 font-medium disabled:opacity-50 transition-colors"
        >
          Approve & Verify
        </button>
        <button 
          onClick={onSave} 
          disabled={loading}
          className="px-6 py-2.5 border border-daylight-muted/20 text-daylight-text rounded-lg hover:bg-daylight-muted/5 font-medium disabled:opacity-50 transition-colors"
        >
          Save without verifying
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={onDispute} 
          disabled={loading}
          className="px-6 py-2.5 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500/10 font-medium disabled:opacity-50 transition-colors"
        >
          Mark Disputed
        </button>
      </div>
    </div>
  )
}
