"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Check, Copy } from "lucide-react";

export default function SubmitModelPage() {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [category, setCategory] = useState("LLM");
  const [contextWindow, setContextWindow] = useState("");
  const [parameters, setParameters] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [copied, setCopied] = useState(false);

  const modelPayload = JSON.stringify(
    {
      name: name || "Model Name",
      provider: provider || "Lab / Developer",
      category,
      context_window: contextWindow ? parseInt(contextWindow, 10) : null,
      parameters: parameters || "Proprietary",
      source_url: sourceUrl || "https://...",
      description: description || "Short technical summary...",
    },
    null,
    2
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(modelPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 flex flex-col gap-8">
      <div>
        <Link
          href="/models"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-4"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Send size={14} />
          <span>Community Submissions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Submit an AI Model
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
          Help expand the open intelligence index. Submit missing frontier models, fine-tunes, or open-weight checkpoints.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)]">Model Name *</label>
              <input
                type="text"
                placeholder="e.g. Claude 3.5 Sonnet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)]">Provider / Lab *</label>
              <input
                type="text"
                placeholder="e.g. Anthropic, OpenAI"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="LLM">LLM</option>
                <option value="Multimodal">Multimodal</option>
                <option value="Reasoning">Reasoning</option>
                <option value="Code">Code</option>
                <option value="Vision">Vision</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)]">Context Window (tokens)</label>
              <input
                type="number"
                placeholder="e.g. 128000"
                value={contextWindow}
                onChange={(e) => setContextWindow(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text)]">Parameters</label>
              <input
                type="text"
                placeholder="e.g. 70B, 671B MoE"
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                className="w-full bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">Announcement / Paper URL</label>
            <input
              type="url"
              placeholder="https://arxiv.org/abs/... or https://..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">Summary / Description</label>
            <textarea
              rows={3}
              placeholder="Brief description of key architectural breakthroughs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] p-3 text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* Payload Preview & Submission Column */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] block mb-3">
                Generated JSON Payload
              </span>
              <pre className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 font-mono text-xs text-[var(--text)] overflow-x-auto leading-relaxed max-h-[300px]">
                <code>{modelPayload}</code>
              </pre>
            </div>

            <div className="pt-4 border-t border-[var(--muted)]/10 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Payload"}</span>
              </button>

              <a
                href={`mailto:curation@modelverse.ai?subject=Model%20Submission:%20${encodeURIComponent(name || "New Model")}&body=${encodeURIComponent(modelPayload)}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Send size={14} />
                <span>Submit to Curators</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
