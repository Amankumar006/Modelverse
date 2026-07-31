'use client';

import React, { useEffect, useState } from 'react';

interface PendingModel {
  filename: string;
  id: string;
  name: string;
  developer: string;
  releaseDate: string;
  parameters: string;
  license: string;
  verificationStatus?: 'VERIFIED' | 'LIKELY' | 'DRAFT' | 'DISPUTED';
  fieldConfidence?: Record<string, string>;
  sources?: string[];
  curatorNotes?: string;
}

export default function AdminReviewPage() {
  const [models, setModels] = useState<PendingModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [curatorSecret, setCuratorSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');

  useEffect(() => {
    const savedSecret = typeof window !== 'undefined' ? sessionStorage.getItem('curator_secret') : null;
    if (savedSecret) {
      setCuratorSecret(savedSecret);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  const fetchPendingModels = async (secretOverride?: string) => {
    setLoading(true);
    const token = secretOverride || curatorSecret || 'curator-secret-123';
    try {
      const res = await fetch('/api/admin/review', {
        headers: { 'x-curator-secret': token },
      });
      const data = await res.json();
      if (res.status === 401 || !data.success) {
        setIsAuthenticated(false);
        setActionMessage(`🔒 ${data.error || 'Unauthorized: Invalid curator secret key'}`);
      } else {
        setIsAuthenticated(true);
        setModels(data.models || []);
      }
    } catch (err) {
      console.error('Failed fetching pending models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingModels();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcodeInput.trim()) return;
    sessionStorage.setItem('curator_secret', passcodeInput.trim());
    setCuratorSecret(passcodeInput.trim());
    setIsAuthenticated(true);
    fetchPendingModels(passcodeInput.trim());
  };

  const handleAction = async (filename: string, action: 'approve' | 'reject') => {
    setActionMessage(`Processing ${action} for ${filename}...`);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-curator-secret': curatorSecret || 'curator-secret-123',
        },
        body: JSON.stringify({ filename, action, secret: curatorSecret }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✅ ${data.message}`);
        fetchPendingModels();
      } else {
        setActionMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`❌ Failed to complete action: ${err.message}`);
    }
  };

  const handleBulkApproveClean = async () => {
    setActionMessage('Processing bulk approval for clean candidates...');
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-curator-secret': curatorSecret || 'curator-secret-123',
        },
        body: JSON.stringify({ action: 'approve_all_clean', filename: 'bulk', secret: curatorSecret }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`⚡ ${data.message}`);
        fetchPendingModels();
      } else {
        setActionMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`❌ Failed bulk approval: ${err.message}`);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('curator_secret');
    setCuratorSecret('');
    setIsAuthenticated(false);
    setPasscodeInput('');
    setActionMessage('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400 text-xl font-bold">
              🔒
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Curator Portal Locked</h2>
            <p className="text-xs text-slate-400">
              Enter your Curator Secret Key to access staging reviews and approve model candidates.
            </p>
          </div>

          {actionMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-lg text-xs font-mono">
              {actionMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-1.5">
                Curator Secret Key
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter secret key..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-sm text-white focus:outline-none transition"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-lg shadow-indigo-950 transition text-sm"
            >
              Unlock Curator Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Modelverse Curator Review Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review staged AI model candidates. Facts require multi-source verification or explicit curator approval to be published.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkApproveClean}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-950 transition flex items-center gap-2"
            >
              <span>⚡</span>
              <span>Approve All Clean Candidates</span>
            </button>
            <button
              onClick={() => fetchPendingModels()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg transition"
            >
              Refresh Staging
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-lg transition"
              title="Lock Session"
            >
              🔒 Lock
            </button>
          </div>
        </header>

        {actionMessage && (
          <div className="p-4 bg-slate-900 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm">
            {actionMessage}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading pending models from staging area...</div>
        ) : models.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <h3 className="text-lg font-semibold text-slate-300">Staging Area Clean</h3>
            <p className="text-slate-500 text-sm mt-1">There are no unverified pending models requiring review right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {models.map((model) => {
              const isDisputed = model.verificationStatus === 'DISPUTED';
              return (
                <div
                  key={model.filename}
                  className={`bg-slate-900 border rounded-xl p-6 transition ${
                    isDisputed ? 'border-amber-500/50 bg-amber-950/10' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-white">{model.name}</h2>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-800 text-slate-300">
                          {model.developer}
                        </span>
                        {model.verificationStatus && (
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                              model.verificationStatus === 'VERIFIED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : model.verificationStatus === 'DISPUTED'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {model.verificationStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-mono">ID: {model.id} • File: {model.filename}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAction(model.filename, 'reject')}
                        className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-sm font-semibold rounded-lg transition"
                      >
                        Reject & Delete
                      </button>
                      <button
                        onClick={() => handleAction(model.filename, 'approve')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-950 transition"
                      >
                        Approve & Publish
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-950/50 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-mono">Parameters</span>
                      <span className="text-sm font-semibold text-slate-200">{model.parameters || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-mono">License</span>
                      <span className="text-sm font-semibold text-slate-200">{model.license || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-mono">Release Date</span>
                      <span className="text-sm font-semibold text-slate-200">{model.releaseDate || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block uppercase font-mono">Sources</span>
                      <span className="text-sm font-semibold text-slate-200">{model.sources?.length || 0} attached</span>
                    </div>
                  </div>

                  {model.fieldConfidence && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                        Per-Field Confidence Analysis
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(model.fieldConfidence).map(([field, status]) => (
                          <div
                            key={field}
                            className={`text-xs px-3 py-1.5 rounded-md flex items-center gap-2 border font-mono ${
                              status === 'VERIFIED'
                                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                                : status === 'DISPUTED'
                                ? 'bg-amber-950/60 border-amber-800/60 text-amber-300 font-bold'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="capitalize">{field}:</span>
                            <span className="font-bold">{status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {model.curatorNotes && (
                    <div className="mt-4 p-3 bg-slate-950/80 rounded border border-slate-800 text-xs text-slate-400 font-mono">
                      <span className="text-slate-500 block font-sans font-semibold mb-1">Ingestion & Curator Notes:</span>
                      {model.curatorNotes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
