'use client';

import React, { useEffect, useState } from 'react';

interface Benchmark {
  name: string;
  score: string;
  verified: boolean;
  sourceType?: 'vendor-reported' | 'independent-eval';
}

interface PendingModel {
  filename: string;
  id: string;
  name: string;
  slug: string;
  developer: string;
  releaseDate: string;
  type?: string;
  status?: string;
  parameters: string;
  activeParameters?: string;
  contextWindow?: string;
  license: string;
  description?: string;
  keyFeatures?: string[];
  modality?: string[];
  benchmarks?: Benchmark[];
  links?: Record<string, string>;
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

  // Editing Modal State
  const [activeModalModel, setActiveModalModel] = useState<PendingModel | null>(null);
  const [editForm, setEditForm] = useState<Partial<PendingModel>>({});
  const [modalTab, setModalTab] = useState<'edit' | 'preview' | 'json'>('edit');
  const [newBenchName, setNewBenchName] = useState('');
  const [newBenchScore, setNewBenchScore] = useState('');
  const [bulkBenchText, setBulkBenchText] = useState('');
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');

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

  const autoSanitizeBenchmarks = (benchmarks: Benchmark[]): Benchmark[] => {
    if (!benchmarks || benchmarks.length === 0) return [];
    const cleanList: Benchmark[] = [];

    for (const item of benchmarks) {
      const combined = `${item.name || ''} ${item.score || ''}`;
      
      // Handle Markdown Table glued in single benchmark entry
      if (combined.includes('|')) {
        const lines = combined.split(/\r?\n/);
        let parsedCount = 0;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.includes('|')) continue;
          const parts = trimmed.split('|').map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            const col1 = parts[0];
            const col2 = parts[1];
            if (
              col1.toLowerCase().includes('benchmark') ||
              col1.startsWith(':---') ||
              col1.startsWith('---') ||
              col2.startsWith(':---') ||
              col2.startsWith('---')
            ) {
              continue;
            }
            if (col1 && col2) {
              cleanList.push({
                name: col1,
                score: col2.endsWith('%') ? col2 : `${col2}%`,
                verified: true,
                sourceType: 'independent-eval',
              });
              parsedCount++;
            }
          }
        }
        if (parsedCount > 0) continue;
      }

      // Detect if combined contains multiple glued benchmarks (e.g. "BenchmarkDeepSeek V4-Flash... 82.7NL2Repo54.2")
      if (combined.match(/[0-9]+\.[0-9]+[A-Za-z]/) || combined.length > 50) {
        const cleanInput = combined.replace(/^Benchmark[A-Za-z0-9\-_]*/i, '');
        const gluedRegex = /([A-Za-z0-9'_\-\/\s\†\‡\(\)\:]+?)\s*([0-9]+\.[0-9]+%?|[0-9]+%)/g;
        let match;
        let count = 0;
        while ((match = gluedRegex.exec(cleanInput)) !== null) {
          let name = match[1].trim();
          const score = match[2].trim();
          name = name.replace(/^Benchmark[A-Za-z0-9\-_]*/i, '').trim();
          if (name && score) {
            cleanList.push({
              name,
              score: score.endsWith('%') ? score : `${score}%`,
              verified: true,
              sourceType: 'independent-eval',
            });
            count++;
          }
        }
        if (count === 0) cleanList.push(item);
      } else {
        cleanList.push(item);
      }
    }

    return cleanList;
  };

  const openEditModal = (model: PendingModel) => {
    setActiveModalModel(model);
    const cloned = JSON.parse(JSON.stringify(model));
    if (cloned.benchmarks) {
      cloned.benchmarks = autoSanitizeBenchmarks(cloned.benchmarks);
    }
    setEditForm(cloned);
    setRawJsonText(JSON.stringify(cloned, null, 2));
    setJsonError('');
    setBulkBenchText('');
    setModalTab('edit');
  };

  const closeEditModal = () => {
    setActiveModalModel(null);
    setEditForm({});
    setRawJsonText('');
    setJsonError('');
  };

  const handleTabChange = (tab: 'edit' | 'preview' | 'json') => {
    if (tab === 'json') {
      setRawJsonText(JSON.stringify(editForm, null, 2));
    } else if (modalTab === 'json') {
      // Sync from json tab if valid
      try {
        const parsed = JSON.parse(rawJsonText);
        setEditForm(parsed);
        setJsonError('');
      } catch (e: any) {
        setJsonError(`Invalid JSON format: ${e.message}`);
        return;
      }
    }
    setModalTab(tab);
  };

  const handleAction = async (filename: string, action: 'approve' | 'reject' | 'save_draft', payload?: any) => {
    let finalModel = payload?.editedModel || editForm;
    if (modalTab === 'json') {
      try {
        finalModel = JSON.parse(rawJsonText);
      } catch (e: any) {
        setActionMessage(`❌ Cannot save: Invalid JSON format (${e.message})`);
        return;
      }
    }

    setActionMessage(`Processing ${action} for ${filename}...`);
    try {
      const res = await fetch('/api/admin/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-curator-secret': curatorSecret || 'curator-secret-123',
        },
        body: JSON.stringify({
          filename,
          action,
          secret: curatorSecret,
          editedModel: finalModel,
          humanNotes: payload?.humanNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✅ ${data.message}`);
        closeEditModal();
        fetchPendingModels();
      } else {
        setActionMessage(`❌ Error: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`❌ Failed to complete action: ${err.message}`);
    }
  };

  const handleAddBenchmark = () => {
    if (!newBenchName.trim() || !newBenchScore.trim()) return;
    const current = editForm.benchmarks || [];
    const updated = [
      ...current,
      { name: newBenchName.trim(), score: newBenchScore.trim(), verified: true, sourceType: 'independent-eval' as const },
    ];
    setEditForm({ ...editForm, benchmarks: updated });
    setRawJsonText(JSON.stringify({ ...editForm, benchmarks: updated }, null, 2));
    setNewBenchName('');
    setNewBenchScore('');
  };

  const handleBulkParseBenchmarks = () => {
    if (!bulkBenchText.trim()) return;
    const input = bulkBenchText.trim();
    const newItems: Benchmark[] = [];

    // 1. Try JSON array/object first
    if (input.startsWith('[') || input.startsWith('{')) {
      try {
        const parsed = JSON.parse(input);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of arr) {
          if (item.name && item.score) {
            newItems.push({
              name: String(item.name).trim(),
              score: String(item.score).trim(),
              verified: true,
              sourceType: 'independent-eval',
            });
          }
        }
      } catch (e) {}
    }

    // 2. Try Markdown Pipe Table (| Benchmark | Score |)
    if (newItems.length === 0 && input.includes('|')) {
      const lines = input.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.includes('|')) continue;
        const parts = trimmed.split('|').map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          const col1 = parts[0];
          const col2 = parts[1];
          if (
            col1.toLowerCase().includes('benchmark') ||
            col1.startsWith(':---') ||
            col1.startsWith('---') ||
            col2.startsWith(':---') ||
            col2.startsWith('---')
          ) {
            continue;
          }
          if (col1 && col2) {
            newItems.push({
              name: col1,
              score: col2.endsWith('%') ? col2 : `${col2}%`,
              verified: true,
              sourceType: 'independent-eval',
            });
          }
        }
      }
    }

    // 3. Fallback to line-by-line parsing: "MMLU: 86.4%" or "GPQA Diamond - 59.4%"
    if (newItems.length === 0) {
      const lines = input.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const match = trimmed.match(/^([^:\-\|\t]+)[:\-\|\t]\s*(.+)$/);
        if (match) {
          newItems.push({
            name: match[1].trim(),
            score: match[2].trim(),
            verified: true,
            sourceType: 'independent-eval',
          });
        } else {
          const spaceMatch = trimmed.match(/^(.+?)\s+([0-9\.]+%?)$/);
          if (spaceMatch) {
            newItems.push({
              name: spaceMatch[1].trim(),
              score: spaceMatch[2].trim(),
              verified: true,
              sourceType: 'independent-eval',
            });
          }
        }
      }
    }

    // 4. Fallback to glued-table single-line extractor (e.g. copied HTML/PDF tables without line breaks)
    if (newItems.length === 0) {
      // Strip title prefix if present (e.g. "BenchmarkDeepSeek-V4-Flash-0731")
      const cleanInput = input.replace(/^Benchmark[A-Za-z0-9\-_]*/i, '');
      const gluedRegex = /([A-Za-z0-9'_\-\/\s\†\‡\(\)\:]+?)\s*([0-9]+\.[0-9]+%?|[0-9]+%)/g;
      let match;
      while ((match = gluedRegex.exec(cleanInput)) !== null) {
        let name = match[1].trim();
        const score = match[2].trim();

        // Clean up residual header prefix
        name = name.replace(/^Benchmark[A-Za-z0-9\-_]*/i, '').trim();

        if (name && score) {
          newItems.push({
            name,
            score: score.endsWith('%') ? score : `${score}%`,
            verified: true,
            sourceType: 'independent-eval',
          });
        }
      }
    }

    if (newItems.length > 0) {
      const current = editForm.benchmarks || [];
      const updated = [...current, ...newItems];
      setEditForm({ ...editForm, benchmarks: updated });
      setRawJsonText(JSON.stringify({ ...editForm, benchmarks: updated }, null, 2));
      setBulkBenchText('');
    }
  };

  const handleRemoveBenchmark = (index: number) => {
    const current = [...(editForm.benchmarks || [])];
    current.splice(index, 1);
    setEditForm({ ...editForm, benchmarks: current });
    setRawJsonText(JSON.stringify({ ...editForm, benchmarks: current }, null, 2));
  };

  const handleClearAllBenchmarks = () => {
    setEditForm({ ...editForm, benchmarks: [] });
    setRawJsonText(JSON.stringify({ ...editForm, benchmarks: [] }, null, 2));
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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Modelverse Curator Review Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review, inspect, edit, and approve staged AI model candidates prior to production publishing.
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
          <div className="p-4 bg-slate-900 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-mono">
            {actionMessage}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-mono">Loading pending models from staging area...</div>
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
                        onClick={() => openEditModal(model)}
                        className="px-4 py-2 bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 text-sm font-semibold rounded-lg transition flex items-center gap-1.5"
                      >
                        <span>✏️</span>
                        <span>Inspect & Edit</span>
                      </button>
                      <button
                        onClick={() => handleAction(model.filename, 'reject')}
                        className="px-4 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-sm font-semibold rounded-lg transition"
                      >
                        Reject
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

      {/* Curator Inspection & Edit Modal */}
      {activeModalModel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>✏️ Curator Model Inspector & Editor</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300">
                    {activeModalModel.filename}
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => handleTabChange('edit')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      modalTab === 'edit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ✏️ Form Fields
                  </button>
                  <button
                    onClick={() => handleTabChange('json')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      modalTab === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {`{ }`} Raw JSON
                  </button>
                  <button
                    onClick={() => handleTabChange('preview')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      modalTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    👁️ In-Modal Preview
                  </button>
                </div>
                <a
                  href={`/admin/review/preview?filename=${encodeURIComponent(activeModalModel.filename)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 text-xs font-semibold rounded-lg transition flex items-center gap-1"
                >
                  <span>↗️</span>
                  <span>Full Page Tab</span>
                </a>
                <button
                  onClick={closeEditModal}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {modalTab === 'edit' ? (
                <div className="space-y-6 text-sm">
                  {/* Grid Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Model Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Developer / Organization</label>
                      <input
                        type="text"
                        value={editForm.developer || ''}
                        onChange={(e) => setEditForm({ ...editForm, developer: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Total Parameters (e.g. 671B or 70B)</label>
                      <input
                        type="text"
                        value={editForm.parameters || ''}
                        onChange={(e) => setEditForm({ ...editForm, parameters: e.target.value })}
                        placeholder="e.g. 671B or 671B (37B active)"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Active Parameters (MoE, e.g. 37B active)</label>
                      <input
                        type="text"
                        value={editForm.activeParameters || ''}
                        onChange={(e) => setEditForm({ ...editForm, activeParameters: e.target.value })}
                        placeholder="e.g. 37B active"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">License</label>
                      <input
                        type="text"
                        value={editForm.license || ''}
                        onChange={(e) => setEditForm({ ...editForm, license: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Context Window (e.g. 128k, 1M)</label>
                      <input
                        type="text"
                        value={editForm.contextWindow || ''}
                        onChange={(e) => setEditForm({ ...editForm, contextWindow: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">Release Date (YYYY-MM-DD)</label>
                      <input
                        type="text"
                        value={editForm.releaseDate || ''}
                        onChange={(e) => setEditForm({ ...editForm, releaseDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>

                  {/* Benchmarks Manager */}
                  <div className="space-y-4 border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                        📊 Benchmark Scores Manager ({editForm.benchmarks?.length || 0})
                      </h4>
                      {(editForm.benchmarks || []).length > 0 && (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const sanitized = autoSanitizeBenchmarks(editForm.benchmarks || []);
                              setEditForm({ ...editForm, benchmarks: sanitized });
                              setRawJsonText(JSON.stringify({ ...editForm, benchmarks: sanitized }, null, 2));
                            }}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
                          >
                            <span>🧹</span> Auto-Repair Glued Benchmarks
                          </button>
                          <button
                            type="button"
                            onClick={handleClearAllBenchmarks}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-mono"
                          >
                            Clear All
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Existing Benchmarks List */}
                    {(editForm.benchmarks || []).length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(editForm.benchmarks || []).map((b, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <input
                              type="text"
                              value={b.name}
                              onChange={(e) => {
                                const current = [...(editForm.benchmarks || [])];
                                current[idx].name = e.target.value;
                                setEditForm({ ...editForm, benchmarks: current });
                              }}
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white flex-1"
                            />
                            <input
                              type="text"
                              value={b.score}
                              onChange={(e) => {
                                const current = [...(editForm.benchmarks || [])];
                                current[idx].score = e.target.value;
                                setEditForm({ ...editForm, benchmarks: current });
                              }}
                              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-emerald-400 font-mono w-28 font-bold"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveBenchmark(idx)}
                              className="text-rose-400 hover:text-rose-300 text-xs px-2 py-1 bg-rose-950/40 rounded border border-rose-800/40"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 📋 Bulk Paste Benchmarks Textarea */}
                    <div className="p-4 bg-slate-950 border border-emerald-500/20 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                          <span>📋</span>
                          <span>BULK PASTE ALL BENCHMARKS AT ONCE</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-mono">Supports "MMLU: 86.4%" or JSON array</span>
                      </div>
                      <textarea
                        rows={4}
                        placeholder={`Paste full benchmark list at once, e.g.:\n\nMMLU: 86.4%\nGPQA Diamond: 59.4%\nSWE-Bench Verified: 49.2%\nHumanEval: 92.1%\nGSM8K: 95.0%`}
                        value={bulkBenchText}
                        onChange={(e) => setBulkBenchText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleBulkParseBenchmarks}
                          disabled={!bulkBenchText.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg transition flex items-center gap-1.5"
                        >
                          <span>⚡</span>
                          <span>Parse & Add All Scores</span>
                        </button>
                      </div>
                    </div>

                    {/* Single Addition Fallback */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                      <input
                        type="text"
                        placeholder="Single Benchmark Name (e.g. GPQA Diamond)"
                        value={newBenchName}
                        onChange={(e) => setNewBenchName(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Score (e.g. 68.4%)"
                        value={newBenchScore}
                        onChange={(e) => setNewBenchScore(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white w-32"
                      />
                      <button
                        type="button"
                        onClick={handleAddBenchmark}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                      >
                        + Add Single
                      </button>
                    </div>
                  </div>

                  {/* Curator Notes */}
                  <div className="border-t border-slate-800 pt-4">
                    <label className="block text-xs font-mono text-slate-400 mb-1">Curator Notes & Approval Rationale</label>
                    <textarea
                      rows={2}
                      value={editForm.curatorNotes || ''}
                      onChange={(e) => setEditForm({ ...editForm, curatorNotes: e.target.value })}
                      placeholder="Add rationale for manual approval or fact correction..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : modalTab === 'json' ? (
                /* Raw JSON Code Editor Mode */
                <div className="space-y-4 font-mono">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase">
                      Edit Full Raw Candidate JSON
                    </label>
                    <span className="text-xs text-slate-500">Changes sync instantly with form and preview</span>
                  </div>

                  {jsonError && (
                    <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-lg text-xs">
                      ⚠️ {jsonError}
                    </div>
                  )}

                  <textarea
                    rows={18}
                    value={rawJsonText}
                    onChange={(e) => {
                      setRawJsonText(e.target.value);
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setEditForm(parsed);
                        setJsonError('');
                      } catch (err: any) {
                        setJsonError(`Invalid JSON: ${err.message}`);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                  />
                </div>
              ) : (
                /* Live Preview Mode */
                <div className="bg-[#141414] border border-[#282828] rounded-xl p-6 text-white space-y-6 font-sans">
                  {/* Hero Header */}
                  <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-1">
                        <span>LIVE MODEL PAGE PREVIEW</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{editForm.name || 'Untitled Model'}</h2>
                      <p className="text-sm text-[var(--accent)] font-medium mt-1">{editForm.developer || 'Unknown Developer'}</p>
                    </div>
                    <a
                      href={`/admin/review/preview?filename=${encodeURIComponent(activeModalModel.filename)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold hover:bg-emerald-600/30 transition flex items-center gap-1"
                    >
                      <span>↗️ Open Full Screen Preview</span>
                    </a>
                  </div>

                  {/* Spec Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#1C1C1E] rounded-xl border border-[#282828]">
                    <div>
                      <span className="text-xs text-gray-400 block font-mono">Parameters</span>
                      <span className="text-sm font-semibold text-white font-mono">{editForm.parameters || 'Undisclosed'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-mono">License</span>
                      <span className="text-sm font-semibold text-white">{editForm.license || 'Proprietary'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-mono">Context Window</span>
                      <span className="text-sm font-semibold text-emerald-400 font-mono">{editForm.contextWindow || 'Unknown'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block font-mono">Release Date</span>
                      <span className="text-sm font-semibold text-white">{editForm.releaseDate || '2026'}</span>
                    </div>
                  </div>

                  {/* Trust Banner */}
                  <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                    <span>ℹ️</span>
                    <span><strong>Trust Status: APPROVED (PREVIEW)</strong> — Facts corroborated against primary source.</span>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-gray-400 uppercase mb-2">Model Description</h4>
                    <p className="text-sm text-gray-300 leading-relaxed bg-[#1C1C1E] p-4 rounded-xl border border-[#282828]">
                      {editForm.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Key Capabilities */}
                  {editForm.keyFeatures && editForm.keyFeatures.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono font-semibold text-gray-400 uppercase mb-2">Key Capabilities ({editForm.keyFeatures.length})</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {editForm.keyFeatures.map((feat, i) => (
                          <li key={i} className="text-xs text-gray-300 bg-[#1C1C1E] p-3 rounded-lg border border-[#282828] flex items-start gap-2">
                            <span className="text-emerald-400">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benchmarks Grid */}
                  <div>
                    <h4 className="text-xs font-mono font-semibold text-gray-400 uppercase mb-2">Benchmark Scores ({editForm.benchmarks?.length || 0})</h4>
                    {(editForm.benchmarks || []).length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {editForm.benchmarks?.map((b, i) => (
                          <div key={i} className="p-3.5 bg-[#1C1C1E] border border-[#282828] rounded-xl flex flex-col gap-1">
                            <span className="text-xs text-gray-400 font-medium">{b.name}</span>
                            <span className="text-lg font-bold text-emerald-400 font-mono">{b.score}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No benchmark scores added yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between font-sans">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAction(activeModalModel.filename, 'save_draft', { editedModel: editForm })}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  💾 Save Draft Edits
                </button>
                <button
                  onClick={() => handleAction(activeModalModel.filename, 'approve', { editedModel: editForm })}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
                >
                  <span>✅</span>
                  <span>Save & Approve to Production</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
