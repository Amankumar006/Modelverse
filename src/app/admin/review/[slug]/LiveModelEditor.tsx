"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ModelEntry, type Benchmark } from "@/lib/models";
import { evaluateModelQualityClient } from "@/lib/scoreModelClient";
import { saveModelEdits, approveModel, markDisputed, overrideVerification } from "../../actions";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RotateCcw,
  ArrowLeft,
  Eye,
  Edit3,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
} from "lucide-react";

interface LiveModelEditorProps {
  initialModel: ModelEntry;
}

const COMMON_BENCHMARK_PRESETS = [
  { name: "MMLU-Pro", category: "Reasoning", metric: "% Accuracy" },
  { name: "SWE-bench Verified", category: "Code", metric: "% Solved" },
  { name: "LiveCodeBench", category: "Code", metric: "Pass@1" },
  { name: "GSM8K", category: "Math", metric: "% Accuracy" },
  { name: "MATH-500", category: "Math", metric: "% Accuracy" },
  { name: "GPQA Diamond", category: "Reasoning", metric: "% Accuracy" },
  { name: "HumanEval", category: "Code", metric: "Pass@1" },
  { name: "Aider Polyglot", category: "Code", metric: "% Benchmark" },
  { name: "BFCL v2 Tool Calling", category: "Agentic", metric: "% Accuracy" },
  { name: "Arena Hard Auto", category: "General", metric: "Elo / Score" },
];

export default function LiveModelEditor({ initialModel }: LiveModelEditorProps) {
  const router = useRouter();

  // Model Working State
  const [model, setModel] = useState<ModelEntry>({ ...initialModel });
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "benchmarks" | "resources" | "custom">("overview");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [inspectorOpen, setInspectorOpen] = useState(false);

  // Modals & Action Status
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState("");

  // Live Client Quality Evaluation
  const quality = useMemo(() => evaluateModelQualityClient(model), [model]);

  // Handle Field Updates
  const updateField = <K extends keyof ModelEntry>(key: K, value: ModelEntry[K]) => {
    setModel((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedLink = (key: string, value: string) => {
    setModel((prev) => ({
      ...prev,
      links: { ...(prev.links || {}), [key]: value },
    }));
  };

  // Feature List Builder Helpers
  const addKeyFeature = () => {
    const current = Array.isArray(model.keyFeatures) ? [...model.keyFeatures] : [];
    setModel((prev) => ({ ...prev, keyFeatures: [...current, "New technical capability or feature"] }));
  };

  const updateKeyFeature = (index: number, val: string) => {
    const current = Array.isArray(model.keyFeatures) ? [...model.keyFeatures] : [];
    current[index] = val;
    setModel((prev) => ({ ...prev, keyFeatures: current }));
  };

  const removeKeyFeature = (index: number) => {
    const current = Array.isArray(model.keyFeatures) ? [...model.keyFeatures] : [];
    current.splice(index, 1);
    setModel((prev) => ({ ...prev, keyFeatures: current }));
  };

  // Benchmark Builder Helpers
  const addBenchmark = (preset?: { name: string; category: string; metric: string }) => {
    const current = Array.isArray(model.benchmarks) ? [...model.benchmarks] : [];
    current.push({
      name: preset?.name || "New Benchmark",
      score: "85.0",
      verified: true,
      category: preset?.category || "Reasoning",
      sourceType: "independent-eval",
      subCategory: preset?.metric || "% Accuracy",
    });
    setModel((prev) => ({ ...prev, benchmarks: current }));
  };

  const updateBenchmark = (index: number, updates: Partial<Benchmark & { citation?: string; source?: string }>) => {
    const current = Array.isArray(model.benchmarks) ? [...model.benchmarks] : [];
    current[index] = { ...current[index], ...updates };
    setModel((prev) => ({ ...prev, benchmarks: current }));
  };

  const removeBenchmark = (index: number) => {
    const current = Array.isArray(model.benchmarks) ? [...model.benchmarks] : [];
    current.splice(index, 1);
    setModel((prev) => ({ ...prev, benchmarks: current }));
  };

  // Source URL Builder Helpers
  const addSourceUrl = () => {
    const current = Array.isArray(model.sources) ? [...model.sources] : [];
    setModel((prev) => ({ ...prev, sources: [...current, "https://"] }));
  };

  const updateSourceUrl = (index: number, val: string) => {
    const current = Array.isArray(model.sources) ? [...model.sources] : [];
    current[index] = val;
    setModel((prev) => ({ ...prev, sources: current }));
  };

  const removeSourceUrl = (index: number) => {
    const current = Array.isArray(model.sources) ? [...model.sources] : [];
    current.splice(index, 1);
    setModel((prev) => ({ ...prev, sources: current }));
  };

  // Custom Sections Builder Helpers
  const customSections = Array.isArray(model.customSections) ? model.customSections : [];

  const addCustomSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "New Custom Section",
      content: "Write technical documentation, configuration parameters, or deployment code snippets here.",
    };
    setModel((prev) => ({ ...prev, customSections: [...(prev.customSections || []), newSection] }));
  };

  const updateCustomSection = (index: number, field: "title" | "content", val: string) => {
    const current = [...customSections];
    current[index] = { ...current[index], [field]: val };
    setModel((prev) => ({ ...prev, customSections: current }));
  };

  const removeCustomSection = (index: number) => {
    const current = [...customSections];
    current.splice(index, 1);
    setModel((prev) => ({ ...prev, customSections: current }));
  };

  // Server Actions
  const handleSave = async () => {
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const payload: Record<string, unknown> = {
        name: model.name,
        developer: model.developer,
        description: model.description,
        card_summary: model.cardSummary,
        page_overview: model.pageOverview,
        editorial_note: model.editorialNote,
        primary_task: model.primaryTask,
        type: model.type,
        status: model.status,
        release_date: model.releaseDate,
        family: model.family,
        tier: model.tier,
        institution: model.institution,
        parameters: model.parameters,
        active_parameters: model.activeParameters,
        context_window: model.contextWindow,
        license: model.license,
        key_features: model.keyFeatures,
        benchmarks: model.benchmarks,
        sources: model.sources,
        links: model.links,
        pricing: model.pricing,
        tags: model.tags,
        curator_notes: model.curatorNotes,
        metadata: {
          custom_sections: model.customSections || [],
        },
      };

      await saveModelEdits(model.slug, payload);
      setActionSuccess("Changes saved successfully to database.");
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setSaving(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const payload: Record<string, unknown> = {
        name: model.name,
        developer: model.developer,
        description: model.description,
        card_summary: model.cardSummary,
        page_overview: model.pageOverview,
        editorial_note: model.editorialNote,
        primary_task: model.primaryTask,
        type: model.type,
        status: model.status,
        release_date: model.releaseDate,
        family: model.family,
        parameters: model.parameters,
        context_window: model.contextWindow,
        license: model.license,
        key_features: model.keyFeatures,
        benchmarks: model.benchmarks,
        sources: model.sources,
        links: model.links,
        pricing: model.pricing,
        metadata: {
          custom_sections: model.customSections || [],
        },
      };

      const res = await approveModel(model.slug, payload);
      if (res.quality_status === "indexed") {
        setActionSuccess("Model approved and published to Indexed catalog!");
        setTimeout(() => router.push("/admin/review"), 1500);
      } else {
        setActionError(`Model scored ${res.quality_score}/100 and remains in 'thin' status. Missing requirements.`);
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleOverride = async () => {
    if (!overrideReason || overrideReason.trim().length < 15) {
      setActionError("Override requires a detailed rationale explaining why automated checks were bypassed (min 15 chars).");
      return;
    }
    setSaving(true);
    try {
      await overrideVerification(model.slug, overrideReason);
      setOverrideModalOpen(false);
      setActionSuccess("Override applied successfully with full audit log.");
      setTimeout(() => router.push("/admin/review"), 1500);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDispute = async () => {
    setSaving(true);
    try {
      await markDisputed(model.slug, disputeNotes);
      setDisputeModalOpen(false);
      setActionSuccess("Model marked as Disputed and demoted from public index.");
      setTimeout(() => router.push("/admin/review"), 1500);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 px-3.5 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-sans";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-24 font-sans">
      {/* ── Top Sticky Command Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-b border-[var(--muted)]/15 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Identity & Back */}
          <div className="flex items-center gap-4">
            <Link
              href="/admin/review"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </Link>
            <div className="h-4 w-px bg-[var(--muted)]/20" />
            <div>
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider font-semibold block">
                Live Model Editor
              </span>
              <h1 className="text-base font-extrabold text-[var(--text)] truncate max-w-[280px] sm:max-w-md">
                {model.name}
              </h1>
            </div>
          </div>

          {/* Center: Live Quality Score HUD */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInspectorOpen(!inspectorOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-pill)] border text-xs font-mono font-bold transition-all cursor-pointer ${
                quality.status === "indexed"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-500"
              }`}
              title="Click to inspect live quality evaluation details"
            >
              {quality.status === "indexed" ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <span>
                Gate: {quality.score}/100 ({quality.status.toUpperCase()})
              </span>
              {inspectorOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15">
              <button
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "edit"
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Edit3 size={12} /> Edit Canvas
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                <Eye size={12} /> Public Preview
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModel({ ...initialModel })}
              disabled={saving}
              className="p-2 rounded-[var(--radius-control)] border border-[var(--muted)]/20 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors cursor-pointer"
              title="Reset all unsaved changes"
            >
              <RotateCcw size={14} />
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/20 hover:border-[var(--text)] text-xs font-bold text-[var(--text)] transition-all cursor-pointer shadow-sm"
            >
              <Save size={13} />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>

            <button
              onClick={handleApprove}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--radius-control)] bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-all cursor-pointer shadow-sm shadow-emerald-950/20"
            >
              <CheckCircle2 size={13} />
              <span>Approve & Publish</span>
            </button>

            <button
              onClick={() => setOverrideModalOpen(true)}
              className="p-2 rounded-[var(--radius-control)] border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
              title="Override provenance gate"
            >
              <Zap size={14} />
            </button>

            <button
              onClick={() => setDisputeModalOpen(true)}
              className="p-2 rounded-[var(--radius-control)] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Mark model as disputed"
            >
              <AlertTriangle size={14} />
            </button>
          </div>
        </div>

        {/* Expandable Live Quality Inspector Dropdown */}
        {inspectorOpen && (
          <div className="max-w-[1600px] mx-auto mt-3 p-4 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--muted)]/15 text-xs">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                <Shield size={15} className="text-[var(--accent)]" />
                Live Provenance & Quality Gate Inspector
              </h4>
              <span className="font-mono text-[11px] text-[var(--muted)]">Calculated live across all fields</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10">
                <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Metadata Completeness</span>
                <span className="font-bold font-mono text-sm text-[var(--text)]">
                  {quality.breakdown.metadata.score}/{quality.breakdown.metadata.max} pts
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10">
                <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Verified Benchmarks</span>
                <span className="font-bold font-mono text-sm text-[var(--text)]">
                  {quality.breakdown.benchmarks.score}/{quality.breakdown.benchmarks.max} pts ({quality.breakdown.benchmarks.count} verified)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10">
                <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Unique Content</span>
                <span className="font-bold font-mono text-sm text-[var(--text)]">
                  {quality.breakdown.content.score}/{quality.breakdown.content.max} pts
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10">
                <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Editorial Note</span>
                <span className="font-bold font-mono text-sm text-[var(--text)]">
                  {quality.breakdown.editorial.score}/{quality.breakdown.editorial.max} pts
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10">
                <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Features & Sources</span>
                <span className="font-bold font-mono text-sm text-[var(--text)]">
                  {quality.breakdown.features.score}/{quality.breakdown.features.max} pts
                </span>
              </div>
            </div>

            {quality.reasons.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                <p className="font-bold mb-1">Gate Issues to Address:</p>
                <ul className="list-disc list-inside space-y-1">
                  {quality.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Feedback Alerts */}
        {actionError && (
          <div className="max-w-[1600px] mx-auto mt-3 p-3 rounded-[var(--radius-control)] bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex justify-between items-center">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="font-bold underline cursor-pointer">Dismiss</button>
          </div>
        )}
        {actionSuccess && (
          <div className="max-w-[1600px] mx-auto mt-3 p-3 rounded-[var(--radius-control)] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            {actionSuccess}
          </div>
        )}
      </header>

      {/* ── Main Canvas ───────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 pt-8">
        {viewMode === "edit" ? (
          <div className="space-y-8">
            {/* Top Meta Bar */}
            <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-[var(--shadow-card)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className={labelClass}>Model Display Name</label>
                  <input
                    type="text"
                    value={model.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Developer / Organization</label>
                  <input
                    type="text"
                    value={model.developer || ""}
                    onChange={(e) => updateField("developer", e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Primary Modality / Task</label>
                  <select
                    value={model.primaryTask || "text-generation"}
                    onChange={(e) => updateField("primaryTask", e.target.value)}
                    className={inputClass}
                  >
                    <option value="text-generation">Text Generation / LLM</option>
                    <option value="reasoning">Reasoning / Thinking</option>
                    <option value="code-generation">Code Generation</option>
                    <option value="multimodal">Multimodal (Vision/Text)</option>
                    <option value="image-generation">Image Generation</option>
                    <option value="audio">Audio / Speech</option>
                    <option value="embedding">Embedding</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Release Date</label>
                  <input
                    type="date"
                    value={typeof model.releaseDate === "string" ? model.releaseDate.split("T")[0] : ""}
                    onChange={(e) => updateField("releaseDate", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Tab Navigation Controls */}
            <div className="flex gap-2 p-1.5 rounded-[var(--radius-pill)] bg-[var(--card-bg)] border border-[var(--muted)]/15 w-fit">
              {[
                { id: "overview", label: "Overview & Features" },
                { id: "specs", label: "Specifications & Pricing" },
                { id: "benchmarks", label: `Benchmarks (${(model.benchmarks || []).length})` },
                { id: "resources", label: "Resources & Links" },
                { id: "custom", label: `Custom Sections (${customSections.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-[var(--radius-pill)] text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── TAB 1: OVERVIEW ────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-5">
                  <h3 className="font-extrabold text-base text-[var(--text)] border-b border-[var(--muted)]/10 pb-3">
                    Model Descriptions & Editorial Insights
                  </h3>

                  <div>
                    <label className={labelClass}>Card Summary (Concise Single-Line Hook for Index Feeds)</label>
                    <input
                      type="text"
                      value={model.cardSummary || ""}
                      onChange={(e) => updateField("cardSummary", e.target.value)}
                      placeholder="e.g. 27B open-weights reasoning model with Multi-Head Latent Attention."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={labelClass}>Main Technical Description (Markdown Supported)</label>
                      <span className="text-[11px] font-mono text-[var(--muted)]">
                        {(model.description || "").length} chars
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={model.description || ""}
                      onChange={(e) => updateField("description", e.target.value)}
                      placeholder="Detailed architectural summary and capabilities..."
                      className={`${inputClass} leading-relaxed font-sans`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={labelClass}>Distinct Page Overview (Optional Extended Context)</label>
                    </div>
                    <textarea
                      rows={3}
                      value={model.pageOverview || ""}
                      onChange={(e) => updateField("pageOverview", e.target.value)}
                      placeholder="Provide additional architectural depth distinct from the description..."
                      className={`${inputClass} leading-relaxed`}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className={labelClass}>Editorial Note / Curator Analysis (Mandatory for Index Gate)</label>
                    </div>
                    <textarea
                      rows={4}
                      value={model.editorialNote || ""}
                      onChange={(e) => updateField("editorialNote", e.target.value)}
                      placeholder="Evaluated context on engineering trade-offs, target hardware, and evaluation notes..."
                      className={`${inputClass} leading-relaxed border-amber-500/20 focus:border-amber-500`}
                    />
                  </div>
                </div>

                {/* Key Capabilities / Features List Builder */}
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--muted)]/10 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[var(--text)]">Key Capabilities & Features</h3>
                      <p className="text-xs text-[var(--muted)]">Structured bullets highlighted on the overview tab.</p>
                    </div>
                    <button
                      onClick={addKeyFeature}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent-soft)]/80 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Add Capability
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(model.keyFeatures || []).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--muted)] w-6 text-right select-none">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => updateKeyFeature(idx, e.target.value)}
                          className={inputClass}
                        />
                        <button
                          onClick={() => removeKeyFeature(idx)}
                          className="p-2 text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove feature"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {(model.keyFeatures || []).length === 0 && (
                      <p className="text-xs text-[var(--muted)] italic py-2">No key capabilities recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: SPECIFICATIONS & PRICING ────────────────────────── */}
            {activeTab === "specs" && (
              <div className="space-y-6">
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-5">
                  <h3 className="font-extrabold text-base text-[var(--text)] border-b border-[var(--muted)]/10 pb-3">
                    Parameters & Architecture
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className={labelClass}>Total Parameters</label>
                      <input
                        type="text"
                        value={typeof model.parameters === "string" ? model.parameters : JSON.stringify(model.parameters || "")}
                        onChange={(e) => updateField("parameters", e.target.value)}
                        placeholder="e.g. 27B or 550B MoE"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Active Parameters</label>
                      <input
                        type="text"
                        value={typeof model.activeParameters === "string" ? model.activeParameters : JSON.stringify(model.activeParameters || "")}
                        onChange={(e) => updateField("activeParameters", e.target.value)}
                        placeholder="e.g. 39B active"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Context Window</label>
                      <input
                        type="text"
                        value={typeof model.contextWindow === "string" ? model.contextWindow : JSON.stringify(model.contextWindow || "")}
                        onChange={(e) => updateField("contextWindow", e.target.value)}
                        placeholder="e.g. 128,000 tokens"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>License</label>
                      <input
                        type="text"
                        value={typeof model.license === "string" ? model.license : JSON.stringify(model.license || "")}
                        onChange={(e) => updateField("license", e.target.value)}
                        placeholder="e.g. Apache 2.0 / MIT / Proprietary"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Model Family / Series</label>
                      <input
                        type="text"
                        value={model.family || ""}
                        onChange={(e) => updateField("family", e.target.value)}
                        placeholder="e.g. Qwen 3 / Claude 3.5"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Model Type</label>
                      <select
                        value={model.type || "open-source"}
                        onChange={(e) => updateField("type", e.target.value as ModelEntry["type"])}
                        className={inputClass}
                      >
                        <option value="open-source">Open Source (OSI Approved)</option>
                        <option value="open-weights">Open Weights (Custom License)</option>
                        <option value="closed-source">Closed Source / Commercial</option>
                        <option value="api-only">API Only</option>
                        <option value="research-preview">Research Preview</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing Tiers Editor */}
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--muted)]/10 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[var(--text)]">Pricing & API Cost Tiers</h3>
                      <p className="text-xs text-[var(--muted)]">Indexed rates per token or compute unit.</p>
                    </div>
                    <button
                      onClick={() => {
                        const current = Array.isArray(model.pricing) ? [...model.pricing] : [];
                        current.push({
                          tier: "Standard API",
                          amount: 0.15,
                          currency: "USD",
                          unit: "1M Input Tokens",
                          notes: "Batch pricing available",
                        });
                        updateField("pricing", current);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent-soft)]/80 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Add Pricing Tier
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg)] border-b border-[var(--muted)]/10 text-[var(--muted)] uppercase font-mono font-bold">
                        <tr>
                          <th className="p-3">Tier Name</th>
                          <th className="p-3">Unit</th>
                          <th className="p-3">Amount ($)</th>
                          <th className="p-3">Currency</th>
                          <th className="p-3">Notes</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--muted)]/10 font-sans">
                        {(model.pricing || []).map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-2">
                              <input
                                type="text"
                                value={p.tier || ""}
                                onChange={(e) => {
                                  const current = [...(model.pricing || [])];
                                  current[idx] = { ...current[idx], tier: e.target.value };
                                  updateField("pricing", current);
                                }}
                                className={inputClass}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={p.unit || ""}
                                onChange={(e) => {
                                  const current = [...(model.pricing || [])];
                                  current[idx] = { ...current[idx], unit: e.target.value };
                                  updateField("pricing", current);
                                }}
                                className={inputClass}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                step="0.0001"
                                value={p.amount}
                                onChange={(e) => {
                                  const current = [...(model.pricing || [])];
                                  current[idx] = { ...current[idx], amount: parseFloat(e.target.value) || 0 };
                                  updateField("pricing", current);
                                }}
                                className={inputClass}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={p.currency || "USD"}
                                onChange={(e) => {
                                  const current = [...(model.pricing || [])];
                                  current[idx] = { ...current[idx], currency: e.target.value };
                                  updateField("pricing", current);
                                }}
                                className={inputClass}
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={p.notes || ""}
                                onChange={(e) => {
                                  const current = [...(model.pricing || [])];
                                  current[idx] = { ...current[idx], notes: e.target.value };
                                  updateField("pricing", current);
                                }}
                                className={inputClass}
                              />
                            </td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => {
                                  const current = [...(model.pricing || [])];
                                  current.splice(idx, 1);
                                  updateField("pricing", current);
                                }}
                                className="p-2 text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 3: BENCHMARKS MANAGER ───────────────────────────────── */}
            {activeTab === "benchmarks" && (
              <div className="space-y-6">
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[var(--muted)]/10 pb-4">
                    <div>
                      <h3 className="font-extrabold text-base text-[var(--text)] flex items-center gap-2">
                        <TableIcon size={16} className="text-[var(--accent)]" />
                        Verified Numeric Benchmarks Table
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        Must contain at least 2 verified numeric benchmarks with live citation URLs to satisfy the quality gate.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addBenchmark()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent-soft)]/80 transition-colors cursor-pointer"
                      >
                        <Plus size={13} /> Add Custom Benchmark
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs font-mono text-[var(--muted)]">Quick Presets:</span>
                    {COMMON_BENCHMARK_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => addBenchmark(preset)}
                        className="px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15 text-[11px] font-mono text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Benchmarks Table */}
                  <div className="overflow-x-auto pt-4">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg)] border-b border-[var(--muted)]/10 text-[var(--muted)] uppercase font-mono font-bold">
                        <tr>
                          <th className="p-3 w-44">Benchmark Name</th>
                          <th className="p-3 w-28">Score</th>
                          <th className="p-3 w-32">Metric / Unit</th>
                          <th className="p-3 w-32">Category</th>
                          <th className="p-3 w-32">Evaluator</th>
                          <th className="p-3">Citation URL (Verification Material)</th>
                          <th className="p-3 w-16 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--muted)]/10 font-sans">
                        {(model.benchmarks || []).map((b, idx) => {
                          const citationVal = (b as unknown as { citation?: string; source?: string })?.citation || (b as unknown as { source?: string })?.source || "";
                          const isUrlValid = citationVal.startsWith("http://") || citationVal.startsWith("https://");

                          return (
                            <tr key={idx} className="hover:bg-[var(--bg)]/50 transition-colors">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={b.name || ""}
                                  onChange={(e) => updateBenchmark(idx, { name: e.target.value })}
                                  placeholder="e.g. SWE-bench Verified"
                                  className={inputClass}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={String(b.score ?? "")}
                                  onChange={(e) => updateBenchmark(idx, { score: e.target.value })}
                                  placeholder="e.g. 70.7"
                                  className={`${inputClass} font-mono font-bold text-emerald-400`}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={b.subCategory || ""}
                                  onChange={(e) => updateBenchmark(idx, { subCategory: e.target.value })}
                                  placeholder="e.g. % Solved"
                                  className={inputClass}
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={b.category || "Reasoning"}
                                  onChange={(e) => updateBenchmark(idx, { category: e.target.value })}
                                  className={inputClass}
                                >
                                  <option value="Reasoning">Reasoning</option>
                                  <option value="Code">Code</option>
                                  <option value="Math">Math</option>
                                  <option value="Knowledge">Knowledge</option>
                                  <option value="Vision">Vision</option>
                                  <option value="Agentic">Agentic</option>
                                  <option value="General">General</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <select
                                  value={b.sourceType || "independent-eval"}
                                  onChange={(e) => updateBenchmark(idx, { sourceType: e.target.value as Benchmark["sourceType"] })}
                                  className={inputClass}
                                >
                                  <option value="independent-eval">Independent Eval</option>
                                  <option value="vendor-reported">Vendor Reported</option>
                                </select>
                              </td>
                              <td className="p-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={citationVal}
                                    onChange={(e) => updateBenchmark(idx, { citation: e.target.value, source: e.target.value } as Partial<Benchmark>)}
                                    placeholder="https://arxiv.org/... or https://blogs.nvidia.com/..."
                                    className={`${inputClass} font-mono text-[12px] ${!isUrlValid ? "border-amber-500/50" : ""}`}
                                  />
                                  {isUrlValid && (
                                    <a
                                      href={citationVal}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2 text-[var(--accent)] hover:text-white transition-colors"
                                      title="Open citation source"
                                    >
                                      <ExternalLink size={14} />
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  onClick={() => removeBenchmark(idx)}
                                  className="p-2 text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Delete benchmark row"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 4: RESOURCES & CITATIONS ───────────────────────────── */}
            {activeTab === "resources" && (
              <div className="space-y-6">
                {/* Source URLs */}
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--muted)]/10 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[var(--text)]">Primary Verification Citations</h3>
                      <p className="text-xs text-[var(--muted)]">Sources crawled and verified for provenance.</p>
                    </div>
                    <button
                      onClick={addSourceUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent-soft)]/80 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Add Source URL
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(model.sources || []).map((src, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--muted)] w-6 text-right select-none">
                          [{idx + 1}]
                        </span>
                        <input
                          type="text"
                          value={src}
                          onChange={(e) => updateSourceUrl(idx, e.target.value)}
                          placeholder="https://..."
                          className={`${inputClass} font-mono text-[12px]`}
                        />
                        {src.startsWith("http") && (
                          <a
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-[var(--accent)] hover:text-white transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => removeSourceUrl(idx)}
                          className="p-2 text-[var(--muted)] hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ecosystem Links */}
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-5">
                  <h3 className="font-extrabold text-base text-[var(--text)] border-b border-[var(--muted)]/10 pb-3">
                    Official Links & Repository Endpoints
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Hugging Face Model Card</label>
                      <input
                        type="text"
                        value={model.links?.huggingface || ""}
                        onChange={(e) => updateNestedLink("huggingface", e.target.value)}
                        placeholder="https://huggingface.co/..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>GitHub Repository</label>
                      <input
                        type="text"
                        value={model.links?.github || ""}
                        onChange={(e) => updateNestedLink("github", e.target.value)}
                        placeholder="https://github.com/..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>ArXiv / Technical Paper</label>
                      <input
                        type="text"
                        value={model.links?.paper || ""}
                        onChange={(e) => updateNestedLink("paper", e.target.value)}
                        placeholder="https://arxiv.org/abs/..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Official Blog Announcement</label>
                      <input
                        type="text"
                        value={model.links?.blogPost || model.links?.official || ""}
                        onChange={(e) => updateNestedLink("blogPost", e.target.value)}
                        placeholder="https://openai.com/index/... or https://anthropic.com/news/..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 5: BRAND NEW CUSTOM SECTIONS BUILDER ───────────────── */}
            {activeTab === "custom" && (
              <div className="space-y-6">
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-4">
                  <div className="flex justify-between items-center border-b border-[var(--muted)]/10 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[var(--text)] flex items-center gap-2">
                        <Layers size={16} className="text-[var(--accent)]" />
                        Brand New Custom Documentation Sections
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        Add arbitrarily structured technical sections (e.g. Deployment Guides, Quantized Checkpoints, API Samples).
                      </p>
                    </div>
                    <button
                      onClick={addCustomSection}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent-soft)]/80 transition-colors cursor-pointer"
                    >
                      <Plus size={13} /> Add Custom Section
                    </button>
                  </div>

                  <div className="space-y-6 pt-2">
                    {customSections.map((sec, idx) => (
                      <div
                        key={sec.id || idx}
                        className="p-5 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--muted)]/15 space-y-4 shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-wider">
                            Custom Section #{idx + 1}
                          </span>
                          <button
                            onClick={() => removeCustomSection(idx)}
                            className="text-xs text-[var(--muted)] hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 size={13} /> Delete Section
                          </button>
                        </div>

                        <div>
                          <label className={labelClass}>Section Title</label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => updateCustomSection(idx, "title", e.target.value)}
                            placeholder="e.g. Deployment on VLLM & SGLang"
                            className={inputClass}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Section Content (Full Markdown Supported)</label>
                          <textarea
                            rows={6}
                            value={sec.content}
                            onChange={(e) => updateCustomSection(idx, "content", e.target.value)}
                            placeholder="Write code blocks, technical guides, or hardware compatibility notes..."
                            className={`${inputClass} font-mono text-xs leading-relaxed`}
                          />
                        </div>
                      </div>
                    ))}

                    {customSections.length === 0 && (
                      <div className="text-center py-8 border border-dashed border-[var(--muted)]/20 rounded-[var(--radius-card)]">
                        <Layers size={24} className="mx-auto text-[var(--muted)]/40 mb-2" />
                        <p className="text-xs text-[var(--muted)]">No custom sections added yet.</p>
                        <button
                          onClick={addCustomSection}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline cursor-pointer"
                        >
                          + Click here to add a custom section
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── LIVE READER PREVIEW MODE ────────────────────────────────────── */
          <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-[var(--shadow-card)] p-8 space-y-8">
            <div className="border-b border-[var(--muted)]/10 pb-6 flex justify-between items-start">
              <div>
                <p className="text-xs text-[var(--muted)] font-medium mb-1">
                  Models & pricing / <span className="text-[var(--text)] font-semibold">{model.developer}</span> / {model.name}
                </p>
                <h1 className="font-extrabold text-3xl text-[var(--text)] tracking-tight flex items-center gap-3">
                  {model.name}
                  {model.verified && <Shield size={22} className="text-emerald-500" />}
                </h1>
                <p className="text-sm text-[var(--muted)] mt-1">{model.cardSummary || model.description?.slice(0, 150)}</p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-mono font-bold uppercase">
                  {model.type || "open-source"}
                </span>
              </div>
            </div>

            {/* Overview Preview */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[var(--text)]">Overview</h2>
              <div className="prose prose-invert max-w-none text-sm text-[var(--text)] leading-relaxed">
                <MarkdownRenderer content={model.pageOverview || model.description || ""} />
              </div>

              {model.editorialNote && (
                <div className="p-5 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--muted)]/15">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent)] mb-2">Editorial Context</h4>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{model.editorialNote}</p>
                </div>
              )}

              {/* Benchmarks Preview */}
              {(model.benchmarks || []).length > 0 && (
                <div className="pt-6 border-t border-[var(--muted)]/10 space-y-3">
                  <h2 className="text-xl font-bold text-[var(--text)]">Verified Benchmarks</h2>
                  <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg)] border-b border-[var(--muted)]/10 text-[var(--muted)] uppercase font-mono font-bold">
                        <tr>
                          <th className="p-3">Benchmark</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Evaluation Type</th>
                          <th className="p-3">Citation Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--muted)]/10">
                        {(model.benchmarks || []).map((b, i) => {
                          const citation = (b as unknown as { citation?: string; source?: string })?.citation || (b as unknown as { source?: string })?.source;
                          return (
                            <tr key={i}>
                              <td className="p-3 font-bold text-[var(--text)]">{b.name}</td>
                              <td className="p-3 font-mono font-bold text-emerald-400">{String(b.score)} {b.subCategory}</td>
                              <td className="p-3 text-[var(--muted)]">{b.category}</td>
                              <td className="p-3 text-[var(--muted)]">{b.sourceType}</td>
                              <td className="p-3">
                                {citation ? (
                                  <a href={citation} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline flex items-center gap-1">
                                    Source Link <ExternalLink size={11} />
                                  </a>
                                ) : (
                                  <span className="text-[var(--muted)]">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Custom Sections Preview */}
              {customSections.map((sec, i) => (
                <div key={i} className="pt-6 border-t border-[var(--muted)]/10 space-y-3">
                  <h2 className="text-xl font-bold text-[var(--text)]">{sec.title}</h2>
                  <div className="prose prose-invert max-w-none text-sm text-[var(--text)] leading-relaxed">
                    <MarkdownRenderer content={sec.content} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: OVERRIDE PROVENANCE GATE ───────────────────────────────── */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--muted)]/20 space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              <Zap size={18} />
              Explicit Quality Gate Override
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              This action forces <strong>Indexed</strong> status and logs an explicit audit trail with your curator ID.
              A detailed rationale is mandatory (minimum 15 characters).
            </p>
            <div>
              <label className={labelClass}>Override Rationale</label>
              <textarea
                rows={4}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Verified benchmark claims against closed enterprise eval sheet from DeepMind team..."
                className={`${inputClass} text-xs`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-3.5 py-1.5 rounded-[var(--radius-control)] border border-[var(--muted)]/20 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleOverride}
                disabled={saving}
                className="px-4 py-1.5 rounded-[var(--radius-control)] bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black cursor-pointer"
              >
                {saving ? "Applying..." : "Confirm Override"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: DISPUTE MODEL ─────────────────────────────────────────── */}
      {disputeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--muted)]/20 space-y-4">
            <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle size={18} />
              Mark Model as Disputed
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              This model will immediately lose verified status and drop out of public indexed listings and the homepage.
            </p>
            <div>
              <label className={labelClass}>Dispute Reason / Curator Notes</label>
              <textarea
                rows={3}
                value={disputeNotes}
                onChange={(e) => setDisputeNotes(e.target.value)}
                placeholder="e.g. Benchmark claims unverified or source URL no longer substantiates numbers..."
                className={`${inputClass} text-xs`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="px-3.5 py-1.5 rounded-[var(--radius-control)] border border-[var(--muted)]/20 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDispute}
                disabled={saving}
                className="px-4 py-1.5 rounded-[var(--radius-control)] bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
              >
                {saving ? "Applying..." : "Confirm Dispute"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
