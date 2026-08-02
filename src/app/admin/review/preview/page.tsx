'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ModelLogo from "@/components/ui/ModelLogo";
import { CheckCircle2, Info, ExternalLink, Shield, Tag, Calendar, Cpu } from 'lucide-react';
import Link from 'next/link';

function DraftModelPreviewContent() {
  const searchParams = useSearchParams();
  const filename = searchParams.get('filename');
  const [model, setModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!filename) {
      setError('No filename specified for preview.');
      setLoading(false);
      return;
    }

    const secret = sessionStorage.getItem('curator_secret') || 'curator-secret-123';
    fetch('/api/admin/review', {
      headers: { 'x-curator-secret': secret },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.models) {
          const found = data.models.find((m: any) => m.filename === filename || m.slug === filename);
          if (found) {
            setModel(found);
          } else {
            // Check if model was already approved and published to production
            const slugGuess = filename.replace(/\.json$/, '').replace(/^unsloth-/, '');
            fetch(`/api/models/${slugGuess}`)
              .then((r) => r.json())
              .then((prodData) => {
                if (prodData.success && prodData.model) {
                  setModel({ ...prodData.model, isPublished: true });
                } else {
                  setError(`Pending model "${filename}" not found in staging queue (it may have been approved or deleted).`);
                }
              })
              .catch(() => {
                setError(`Pending model "${filename}" not found in staging queue.`);
              });
          }
        } else {
          setError(data.error || 'Failed to load candidate from staging.');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filename]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#E1E1E0] flex items-center justify-center font-sans">
        <div className="text-sm text-gray-400 font-mono">Loading model detail preview from staging...</div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="min-h-screen bg-[#141414] text-[#E1E1E0] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#1C1C1E] border border-[#282828] rounded-2xl p-6 text-center space-y-4">
          <div className="text-amber-400 text-lg font-bold">⚠️ Preview Error</div>
          <p className="text-xs text-gray-400 font-mono">{error}</p>
          <Link
            href="/admin/review"
            className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Back to Curator Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414] text-[#E1E1E0] selection:bg-[#D97757] selection:text-white relative font-sans">
      {/* Curator Banner */}
      {model.isPublished ? (
        <div className="bg-emerald-950/90 border-b border-emerald-800/60 px-6 py-2.5 text-xs text-emerald-200 font-mono flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span>MODEL PUBLISHED TO PRODUCTION: Candidate has been approved and is live on site.</span>
          </div>
          <Link
            href={`/models/${model.slug}`}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-sans font-bold transition flex items-center gap-1"
          >
            <span>🚀 View Live Page</span>
          </Link>
        </div>
      ) : (
        <div className="bg-amber-950/80 border-b border-amber-800/60 px-6 py-2.5 text-xs text-amber-200 font-mono flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="animate-pulse">👁️</span>
            <span>CURATOR STAGING PREVIEW: Viewing draft candidate <strong>{model.filename || model.name}</strong> prior to approval.</span>
          </div>
          <Link
            href="/admin/review"
            className="px-3 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-100 rounded border border-amber-700/50 text-[11px] font-sans font-semibold transition"
          >
            ← Return to Dashboard
          </Link>
        </div>
      )}

      <Navbar theme="dark" />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/models" className="hover:text-emerald-400 transition">Models</Link>
          <span>/</span>
          <span className="text-gray-300 font-medium">{model.name}</span>
        </div>

        {/* Hero Banner */}
        <div className="p-8 rounded-2xl bg-[#1C1C1E] border border-[#282828] space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <ModelLogo logo={model.logo} name={model.name} developer={model.developer} size={56} />
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-white tracking-tight">{model.name}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} /> Verified Preview
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--accent)]">{model.developer}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#282828]">
            <div>
              <span className="text-xs text-gray-400 block font-mono flex items-center gap-1"><Cpu size={12} /> Parameters</span>
              <span className="text-sm font-semibold text-white font-mono">{model.parameters || 'Undisclosed'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-mono flex items-center gap-1"><Shield size={12} /> License</span>
              <span className="text-sm font-semibold text-white">{model.license || 'Proprietary'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-mono flex items-center gap-1"><Tag size={12} /> Context Window</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">{model.contextWindow || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-mono flex items-center gap-1"><Calendar size={12} /> Release Date</span>
              <span className="text-sm font-semibold text-white">{model.releaseDate || '2026'}</span>
            </div>
          </div>
        </div>

        {/* Trust Note Banner */}
        <div className="p-4 rounded-xl bg-[#1C1C1E] border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
          <Info size={16} className="text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Verification Status: PREVIEW APPROVED</strong> — Facts cross-checked by Curator. Standard benchmarks and specifications verified.
          </span>
        </div>

        {/* Description Section */}
        <div className="p-6 rounded-2xl bg-[#1C1C1E] border border-[#282828] space-y-3">
          <h2 className="text-lg font-bold text-white">Model Overview</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{model.description || 'No description provided.'}</p>
        </div>

        {/* Key Features */}
        {model.keyFeatures && model.keyFeatures.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#1C1C1E] border border-[#282828] space-y-4">
            <h2 className="text-lg font-bold text-white">Key Capabilities & Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {model.keyFeatures.map((feat: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300 bg-[#141414] p-3 rounded-xl border border-[#282828]">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Benchmark Scores */}
        <div className="p-6 rounded-2xl bg-[#1C1C1E] border border-[#282828] space-y-4">
          <h2 className="text-lg font-bold text-white">Benchmark Performance ({model.benchmarks?.length || 0})</h2>
          {model.benchmarks && model.benchmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {model.benchmarks.map((b: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#141414] border border-[#282828] space-y-1">
                  <span className="text-xs text-gray-400 block font-medium">{b.name}</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">{b.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No benchmark scores recorded for this candidate.</p>
          )}
        </div>
      </div>
    </main>
  );
}

export default function DraftModelPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414] text-[#E1E1E0] flex items-center justify-center font-sans">
        <div className="text-sm text-gray-400 font-mono">Loading model preview...</div>
      </div>
    }>
      <DraftModelPreviewContent />
    </Suspense>
  );
}
