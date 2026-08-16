"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type ModelEntry, type Benchmark } from "@/lib/models";
import { evaluateModelQualityClient } from "@/lib/scoreModelClient";
import { saveModelEdits, approveModel, markDisputed, overrideVerification } from "../../actions";
import ModelDetailTabs from "@/components/models/ModelDetailTabs";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import MarkdownFieldEditor from "@/components/admin/MarkdownFieldEditor";
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
  Search,
  Copy,
  Check,
  Columns,
  X,
  SlidersHorizontal,
} from "lucide-react";

interface LiveModelEditorProps {
  initialModel: ModelEntry;
  allModels?: ModelEntry[];
}

interface VisibleBenchmarkCols {
  metric: boolean;
  category: boolean;
  evaluator: boolean;
  citation: boolean;
}

const DEFAULT_VISIBLE_BENCHMARK_COLS: VisibleBenchmarkCols = {
  metric: true,
  category: true,
  evaluator: true,
  citation: true,
};

const DEFAULT_BENCHMARK_PRESETS = [
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

function normalizeModelEntry(raw: ModelEntry): ModelEntry {
  let pricingArray: { tier?: string; unit: string; amount: number; currency: string; notes?: string }[] = [];
  if (Array.isArray(raw.pricing)) {
    pricingArray = raw.pricing;
  } else if (raw.pricing && typeof raw.pricing === "object") {
    pricingArray = Object.entries(raw.pricing).map(([k, v]) => ({
      tier: k,
      unit: typeof v === "number" ? "1M tokens" : "Standard",
      amount: typeof v === "number" ? v : parseFloat(String(v)) || 0,
      currency: "USD",
      notes: typeof v === "string" ? v : undefined,
    }));
  }

  let benchmarksArray: Benchmark[] = [];
  if (Array.isArray(raw.benchmarks)) {
    benchmarksArray = raw.benchmarks;
  } else if (raw.benchmarks && typeof raw.benchmarks === "object") {
    benchmarksArray = Object.entries(raw.benchmarks).map(([k, v]) => ({
      name: k,
      score: typeof v === "number" || typeof v === "string" ? v : (v as { score?: number | string })?.score || 0,
      verified: true,
      category: "Reasoning",
      subCategory: "% Accuracy",
    }));
  }

  let customSectionsArray: { id: string; title: string; content: string }[] = [];
  if (Array.isArray(raw.customSections)) {
    customSectionsArray = raw.customSections;
  } else if (Array.isArray((raw as unknown as { metadata?: { custom_sections?: unknown[] } })?.metadata?.custom_sections)) {
    customSectionsArray = (raw as unknown as { metadata: { custom_sections: { id: string; title: string; content: string }[] } }).metadata.custom_sections;
  }

  return {
    ...raw,
    keyFeatures: Array.isArray(raw.keyFeatures) ? raw.keyFeatures : [],
    sources: Array.isArray(raw.sources) ? raw.sources : [],
    benchmarks: benchmarksArray,
    pricing: pricingArray,
    links: raw.links && typeof raw.links === "object" ? raw.links : {},
    customSections: customSectionsArray,
  };
}

export default function LiveModelEditor({ initialModel, allModels = [] }: LiveModelEditorProps) {
  const router = useRouter();

  // Model Working State - Safely normalized
  const [model, setModel] = useState<ModelEntry>(() => normalizeModelEntry(initialModel));
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "benchmarks" | "resources" | "custom">("overview");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewSearch, setPreviewSearch] = useState("");

  // Benchmark Custom Columns & Column Visibility Management
  const [customBenchmarkCols, setCustomBenchmarkCols] = useState<string[]>(() => {
    const fromMeta = (initialModel as unknown as { metadata?: { benchmark_columns?: string[] } })?.metadata?.benchmark_columns;
    if (Array.isArray(fromMeta)) return fromMeta;
    const fromBenchs = Array.from(
      new Set((initialModel.benchmarks || []).flatMap((b) => Object.keys(b.customColumns || {})))
    );
    return fromBenchs;
  });

  const [visibleCols, setVisibleCols] = useState<VisibleBenchmarkCols>(() => {
    const fromMeta = (initialModel as unknown as { metadata?: { visible_benchmark_cols?: VisibleBenchmarkCols } })?.metadata?.visible_benchmark_cols;
    return fromMeta ? { ...DEFAULT_VISIBLE_BENCHMARK_COLS, ...fromMeta } : DEFAULT_VISIBLE_BENCHMARK_COLS;
  });

  const [showAddColModal, setShowAddColModal] = useState(false);
  const [showColManagerPopover, setShowColManagerPopover] = useState(false);
  const [newColName, setNewColName] = useState("");

  // Benchmark Presets Management
  const [presets, setPresets] = useState(DEFAULT_BENCHMARK_PRESETS);
  const [showAddPresetModal, setShowAddPresetModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetCategory, setNewPresetCategory] = useState("Reasoning");
  const [newPresetMetric, setNewPresetMetric] = useState("% Accuracy");

  // Modals & Action Status
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState("");
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeNotes, setDisputeNotes] = useState("");

  // Safe Arrays for Rendering
  const pricingList = Array.isArray(model.pricing) ? model.pricing : [];
  const benchmarksList = Array.isArray(model.benchmarks) ? model.benchmarks : [];
  const keyFeaturesList = Array.isArray(model.keyFeatures) ? model.keyFeatures : [];
  const sourcesList = Array.isArray(model.sources) ? model.sources : [];
  const customSectionsList = Array.isArray(model.customSections) ? model.customSections : [];

  // Comparison Models for Public Preview
  const familyMembers = useMemo(() => {
    return model.family ? allModels.filter((m) => m.family === model.family && m.id !== model.id) : [];
  }, [allModels, model.family, model.id]);

  const comparisonModels = useMemo(() => {
    return [
      model,
      ...allModels.filter((m) => m.id !== model.id && m.verified && m.primaryTask === model.primaryTask).slice(0, 3),
    ];
  }, [allModels, model]);

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
    setModel((prev) => ({ ...prev, keyFeatures: [...(Array.isArray(prev.keyFeatures) ? prev.keyFeatures : []), "New technical capability or feature"] }));
  };

  const updateKeyFeature = (index: number, val: string) => {
    const current = [...keyFeaturesList];
    current[index] = val;
    setModel((prev) => ({ ...prev, keyFeatures: current }));
  };

  const removeKeyFeature = (index: number) => {
    const current = [...keyFeaturesList];
    current.splice(index, 1);
    setModel((prev) => ({ ...prev, keyFeatures: current }));
  };

  // Benchmark Builder Helpers
  const addBenchmark = (preset?: { name: string; category: string; metric: string }) => {
    const newBenchmark: Benchmark = {
      name: preset?.name || "New Benchmark",
      score: "85.0",
      verified: true,
      category: preset?.category || "Reasoning",
      sourceType: "independent-eval",
      subCategory: preset?.metric || "% Accuracy",
      customColumns: {},
    };
    setModel((prev) => ({ ...prev, benchmarks: [...(Array.isArray(prev.benchmarks) ? prev.benchmarks : []), newBenchmark] }));
  };

  const updateBenchmark = (index: number, updates: Partial<Benchmark & { citation?: string; source?: string }>) => {
    const current = [...benchmarksList];
    current[index] = { ...current[index], ...updates };
    setModel((prev) => ({ ...prev, benchmarks: current }));
  };

  const updateBenchmarkCustomCell = (benchIdx: number, colName: string, val: string) => {
    const current = [...benchmarksList];
    current[benchIdx] = {
      ...current[benchIdx],
      customColumns: {
        ...(current[benchIdx].customColumns || {}),
        [colName]: val,
      },
    };
    setModel((prev) => ({ ...prev, benchmarks: current }));
  };

  const removeBenchmark = (index: number) => {
    const current = [...benchmarksList];
    current.splice(index, 1);
    setModel((prev) => ({ ...prev, benchmarks: current }));
  };

  // Benchmark Column Management Helpers
  const handleAddBenchmarkColumn = () => {
    const clean = newColName.trim();
    if (!clean) return;
    if (customBenchmarkCols.includes(clean)) {
      setActionError(`Column "${clean}" already exists.`);
      return;
    }
    setCustomBenchmarkCols((prev) => [...prev, clean]);
    setNewColName("");
    setShowAddColModal(false);
  };

  const handleRemoveBenchmarkColumn = (colName: string) => {
    setCustomBenchmarkCols((prev) => prev.filter((c) => c !== colName));
    setModel((prev) => ({
      ...prev,
      benchmarks: (prev.benchmarks || []).map((b) => {
        const copy = { ...(b.customColumns || {}) };
        delete copy[colName];
        return { ...b, customColumns: copy };
      }),
    }));
  };

  const toggleStandardCol = (key: keyof VisibleBenchmarkCols) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const resetAllColumns = () => {
    setVisibleCols(DEFAULT_VISIBLE_BENCHMARK_COLS);
  };

  // Benchmark Preset Helpers
  const handleAddPreset = () => {
    if (!newPresetName.trim()) return;
    setPresets((prev) => [
      ...prev,
      {
        name: newPresetName.trim(),
        category: newPresetCategory.trim() || "Reasoning",
        metric: newPresetMetric.trim() || "% Accuracy",
      },
    ]);
    setNewPresetName("");
    setShowAddPresetModal(false);
  };

  // Source URL Builder Helpers
  const addSourceUrl = () => {
    setModel((prev) => ({ ...prev, sources: [...(Array.isArray(prev.sources) ? prev.sources : []), "https://"] }));
  };

  const updateSourceUrl = (index: number, val: string) => {
    const current = [...sourcesList];
    current[index] = val;
    setModel((prev) => ({ ...prev, sources: current }));
  };

  const removeSourceUrl = (index: number) => {
    const current = [...sourcesList];
    current.splice(index, 1);
    setModel((prev) => ({ ...prev, sources: current }));
  };

  // Custom Sections Builder Helpers
  const addCustomSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: "New Custom Section",
      content: "Write technical documentation, configuration parameters, or deployment code snippets here.",
    };
    setModel((prev) => ({ ...prev, customSections: [...(Array.isArray(prev.customSections) ? prev.customSections : []), newSection] }));
  };

  const updateCustomSection = (index: number, field: "title" | "content", val: string) => {
    const current = [...customSectionsList];
    current[index] = { ...current[index], [field]: val };
    setModel((prev) => ({ ...prev, customSections: current }));
  };

  const removeCustomSection = (index: number) => {
    const current = [...customSectionsList];
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
        key_features: keyFeaturesList,
        benchmarks: benchmarksList,
        sources: sourcesList,
        links: model.links || {},
        pricing: pricingList,
        tags: model.tags || [],
        curator_notes: model.curatorNotes,
        metadata: {
          custom_sections: customSectionsList,
          benchmark_columns: customBenchmarkCols,
          visible_benchmark_cols: visibleCols,
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
        key_features: keyFeaturesList,
        benchmarks: benchmarksList,
        sources: sourcesList,
        links: model.links || {},
        pricing: pricingList,
        metadata: {
          custom_sections: customSectionsList,
          benchmark_columns: customBenchmarkCols,
          visible_benchmark_cols: visibleCols,
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

  const handleCopyPage = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputClass =
    "w-full rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 px-3.5 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-sans";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5";

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-24 font-sans">
      {/* ── Global Datalists for Combobox Experience ─────────────────────── */}
      <datalist id="category-presets">
        <option value="Reasoning" />
        <option value="Code" />
        <option value="Math" />
        <option value="Knowledge" />
        <option value="Vision" />
        <option value="Agentic" />
        <option value="Instruction Following" />
        <option value="Safety & Alignment" />
        <option value="Long Context" />
        <option value="Multilingual" />
        <option value="Speed & Latency" />
        <option value="General" />
      </datalist>

      <datalist id="metric-presets">
        <option value="% Accuracy" />
        <option value="Pass@1" />
        <option value="Pass@5" />
        <option value="% Solved" />
        <option value="Elo / Arena Score" />
        <option value="Score (0-100)" />
        <option value="Tokens/sec" />
        <option value="Latency (ms)" />
        <option value="F1 Score" />
        <option value="BLEU / ROUGE" />
      </datalist>

      <datalist id="evaluator-presets">
        <option value="independent-eval" />
        <option value="vendor-reported" />
        <option value="LMSYS Chatbot Arena" />
        <option value="SWE-bench Leaderboard" />
        <option value="Scale AI SEAL Leaderboard" />
        <option value="Artificial Analysis" />
        <option value="LiveCodeBench Leaderboard" />
      </datalist>

      {/* ── Top Sticky Command Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[var(--card-bg)]/95 backdrop-blur-md border-b border-[var(--muted)]/15 px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-4">
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
              onClick={() => setModel(normalizeModelEntry(initialModel))}
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
          <div className="max-w-[1700px] mx-auto mt-3 p-4 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--muted)]/15 text-xs">
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
          <div className="max-w-[1700px] mx-auto mt-3 p-3 rounded-[var(--radius-control)] bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex justify-between items-center">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="font-bold underline cursor-pointer">Dismiss</button>
          </div>
        )}
        {actionSuccess && (
          <div className="max-w-[1700px] mx-auto mt-3 p-3 rounded-[var(--radius-control)] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            {actionSuccess}
          </div>
        )}
      </header>

      {/* ── Main Canvas ───────────────────────────────────────────────────── */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-8 pt-8">
        {viewMode === "edit" ? (
          <div className="max-w-[1400px] mx-auto space-y-8">
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
                { id: "benchmarks", label: `Benchmarks (${benchmarksList.length})` },
                { id: "resources", label: "Resources & Links" },
                { id: "custom", label: `Custom Sections (${customSectionsList.length})` },
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

                  <MarkdownFieldEditor
                    label="Main Technical Description"
                    sublabel="Markdown bullet lists, bolding, and headings supported."
                    value={model.description || ""}
                    onChange={(val) => updateField("description", val)}
                    placeholder="Detailed architectural summary and capabilities..."
                    rows={6}
                    minChars={100}
                  />

                  <MarkdownFieldEditor
                    label="Distinct Page Overview"
                    sublabel="Optional extended context rendered on the overview tab."
                    value={model.pageOverview || ""}
                    onChange={(val) => updateField("pageOverview", val)}
                    placeholder="Provide additional architectural depth, structured bullets, or technical specs..."
                    rows={6}
                  />

                  <MarkdownFieldEditor
                    label="Editorial Note / Curator Analysis"
                    sublabel="Evaluated context on engineering trade-offs, target hardware, and evaluation notes (min 80 chars)."
                    value={model.editorialNote || ""}
                    onChange={(val) => updateField("editorialNote", val)}
                    placeholder="Evaluated context on engineering trade-offs, target hardware, and evaluation notes..."
                    rows={5}
                    minChars={80}
                    highlightBorder
                  />
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
                    {keyFeaturesList.map((feat, idx) => (
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
                    {keyFeaturesList.length === 0 && (
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
                        const newTier = {
                          tier: "Standard API",
                          amount: 0.15,
                          currency: "USD",
                          unit: "1M Input Tokens",
                          notes: "Batch pricing available",
                        };
                        updateField("pricing", [...pricingList, newTier]);
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
                        {pricingList.map((p, idx) => (
                          <tr key={idx}>
                            <td className="p-2">
                              <input
                                type="text"
                                value={p.tier || ""}
                                onChange={(e) => {
                                  const current = [...pricingList];
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
                                  const current = [...pricingList];
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
                                  const current = [...pricingList];
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
                                  const current = [...pricingList];
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
                                  const current = [...pricingList];
                                  current[idx] = { ...current[idx], notes: e.target.value };
                                  updateField("pricing", current);
                                }}
                                className={inputClass}
                              />
                            </td>
                            <td className="p-2 text-right">
                              <button
                                onClick={() => {
                                  const current = [...pricingList];
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

            {/* ── TAB 3: BENCHMARKS MANAGER (EXPANDABLE, REMOVABLE & EDITABLE) ─ */}
            {activeTab === "benchmarks" && (
              <div className="space-y-6">
                <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-4 border-b border-[var(--muted)]/10 pb-4">
                    <div>
                      <h3 className="font-extrabold text-base text-[var(--text)] flex items-center gap-2">
                        <TableIcon size={16} className="text-[var(--accent)]" />
                        Verified Numeric Benchmarks & Custom Dimensions
                      </h3>
                      <p className="text-xs text-[var(--muted)]">
                        Click <span className="font-mono text-rose-400">✕</span> on any column header to remove/hide it, or customize visible columns below.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Column Manager Dropdown / Toggle Button */}
                      <div className="relative">
                        <button
                          onClick={() => setShowColManagerPopover(!showColManagerPopover)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 hover:border-[var(--text)] text-[var(--text)] text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          <SlidersHorizontal size={13} className="text-[var(--accent)]" /> Customize Columns
                        </button>

                        {/* Column Manager Popover */}
                        {showColManagerPopover && (
                          <div className="absolute right-0 top-full mt-2 w-64 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/20 shadow-2xl p-4 z-50 space-y-3 text-xs">
                            <div className="flex justify-between items-center border-b border-[var(--muted)]/10 pb-2">
                              <span className="font-bold text-[var(--text)]">Visible Columns</span>
                              <button
                                onClick={resetAllColumns}
                                className="text-[10px] text-[var(--accent)] hover:underline cursor-pointer"
                              >
                                Reset All
                              </button>
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
                                <input
                                  type="checkbox"
                                  checked={visibleCols.metric}
                                  onChange={() => toggleStandardCol("metric")}
                                  className="rounded border-[var(--muted)]/30 text-[var(--accent)] focus:ring-0"
                                />
                                <span>Metric / Unit</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
                                <input
                                  type="checkbox"
                                  checked={visibleCols.category}
                                  onChange={() => toggleStandardCol("category")}
                                  className="rounded border-[var(--muted)]/30 text-[var(--accent)] focus:ring-0"
                                />
                                <span>Category</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
                                <input
                                  type="checkbox"
                                  checked={visibleCols.evaluator}
                                  onChange={() => toggleStandardCol("evaluator")}
                                  className="rounded border-[var(--muted)]/30 text-[var(--accent)] focus:ring-0"
                                />
                                <span>Evaluator / Source</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-[var(--text)]">
                                <input
                                  type="checkbox"
                                  checked={visibleCols.citation}
                                  onChange={() => toggleStandardCol("citation")}
                                  className="rounded border-[var(--muted)]/30 text-[var(--accent)] focus:ring-0"
                                />
                                <span>Citation URL</span>
                              </label>
                            </div>

                            {customBenchmarkCols.length > 0 && (
                              <div className="border-t border-[var(--muted)]/10 pt-2 space-y-1.5">
                                <span className="text-[10px] uppercase font-mono text-[var(--muted)] block">Custom Columns</span>
                                {customBenchmarkCols.map((col) => (
                                  <div key={col} className="flex justify-between items-center text-[var(--text)] py-0.5">
                                    <span className="font-mono truncate">{col}</span>
                                    <button
                                      onClick={() => handleRemoveBenchmarkColumn(col)}
                                      className="text-[var(--muted)] hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                                      title={`Delete ${col}`}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button
                              onClick={() => {
                                setShowColManagerPopover(false);
                                setShowAddColModal(true);
                              }}
                              className="w-full mt-2 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-center hover:bg-[var(--accent-soft)]/80 transition-colors cursor-pointer"
                            >
                              + Add New Column
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setShowAddColModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 hover:border-[var(--accent)] text-[var(--text)] text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        <Columns size={13} className="text-[var(--accent)]" /> + Add Column
                      </button>

                      <button
                        onClick={() => addBenchmark()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent-soft)]/80 transition-colors cursor-pointer"
                      >
                        <Plus size={13} /> Add Benchmark Row
                      </button>
                    </div>
                  </div>

                  {/* Quick Preset Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-xs font-mono text-[var(--muted)]">Quick Presets:</span>
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => addBenchmark(preset)}
                        className="px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15 text-[11px] font-mono text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer"
                        title={`Category: ${preset.category} | Metric: ${preset.metric}`}
                      >
                        + {preset.name}
                      </button>
                    ))}
                    <button
                      onClick={() => setShowAddPresetModal(true)}
                      className="px-2 py-1 rounded-[var(--radius-pill)] border border-dashed border-[var(--accent)]/40 text-[11px] font-mono text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all cursor-pointer"
                    >
                      + New Preset
                    </button>
                  </div>

                  {/* Benchmarks Table */}
                  <div className="overflow-x-auto pt-4">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className="bg-[var(--bg)] border-b border-[var(--muted)]/10 text-[var(--muted)] uppercase font-mono font-bold">
                        <tr>
                          {/* Required: Benchmark Name */}
                          <th className="p-3 min-w-[170px]">Benchmark Name</th>

                          {/* Required: Score */}
                          <th className="p-3 min-w-[95px]">Score</th>

                          {/* Optional: Metric / Unit */}
                          {visibleCols.metric && (
                            <th className="p-3 min-w-[130px]">
                              <div className="flex items-center justify-between gap-1">
                                <span>Metric / Unit</span>
                                <button
                                  onClick={() => toggleStandardCol("metric")}
                                  className="text-[var(--muted)] hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                  title="Hide Metric column"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </th>
                          )}

                          {/* Optional: Category */}
                          {visibleCols.category && (
                            <th className="p-3 min-w-[140px]">
                              <div className="flex items-center justify-between gap-1">
                                <span>Category</span>
                                <button
                                  onClick={() => toggleStandardCol("category")}
                                  className="text-[var(--muted)] hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                  title="Hide Category column"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </th>
                          )}

                          {/* Optional: Evaluator / Source */}
                          {visibleCols.evaluator && (
                            <th className="p-3 min-w-[140px]">
                              <div className="flex items-center justify-between gap-1">
                                <span>Evaluator / Source</span>
                                <button
                                  onClick={() => toggleStandardCol("evaluator")}
                                  className="text-[var(--muted)] hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                  title="Hide Evaluator column"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </th>
                          )}

                          {/* Optional: Citation URL */}
                          {visibleCols.citation && (
                            <th className="p-3 min-w-[200px]">
                              <div className="flex items-center justify-between gap-1">
                                <span>Citation URL (Source Link)</span>
                                <button
                                  onClick={() => toggleStandardCol("citation")}
                                  className="text-[var(--muted)] hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                  title="Hide Citation column"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </th>
                          )}

                          {/* Dynamic Custom Columns Headers with Remove Button */}
                          {customBenchmarkCols.map((col) => (
                            <th key={col} className="p-3 min-w-[140px] text-[var(--accent)] bg-[var(--accent-soft)]/10 border-l border-[var(--muted)]/15">
                              <div className="flex items-center justify-between gap-1">
                                <span className="truncate">{col}</span>
                                <button
                                  onClick={() => handleRemoveBenchmarkColumn(col)}
                                  className="text-[var(--muted)] hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                  title={`Remove ${col} column`}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </th>
                          ))}

                          <th className="p-3 w-14 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--muted)]/10 font-sans">
                        {benchmarksList.map((b, idx) => {
                          const citationVal = (b as unknown as { citation?: string; source?: string })?.citation || (b as unknown as { source?: string })?.source || "";
                          const isUrlValid = citationVal.startsWith("http://") || citationVal.startsWith("https://");

                          return (
                            <tr key={idx} className="hover:bg-[var(--bg)]/50 transition-colors">
                              {/* Benchmark Name */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={b.name || ""}
                                  onChange={(e) => updateBenchmark(idx, { name: e.target.value })}
                                  placeholder="e.g. SWE-bench Verified"
                                  className={inputClass}
                                />
                              </td>

                              {/* Score */}
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={String(b.score ?? "")}
                                  onChange={(e) => updateBenchmark(idx, { score: e.target.value })}
                                  placeholder="e.g. 70.7"
                                  className={`${inputClass} font-mono font-bold text-emerald-400`}
                                />
                              </td>

                              {/* Metric / Unit */}
                              {visibleCols.metric && (
                                <td className="p-2">
                                  <input
                                    list="metric-presets"
                                    type="text"
                                    value={b.subCategory || ""}
                                    onChange={(e) => updateBenchmark(idx, { subCategory: e.target.value })}
                                    placeholder="e.g. % Solved"
                                    className={inputClass}
                                  />
                                </td>
                              )}

                              {/* Category */}
                              {visibleCols.category && (
                                <td className="p-2">
                                  <input
                                    list="category-presets"
                                    type="text"
                                    value={b.category || ""}
                                    onChange={(e) => updateBenchmark(idx, { category: e.target.value })}
                                    placeholder="e.g. Reasoning"
                                    className={inputClass}
                                  />
                                </td>
                              )}

                              {/* Evaluator */}
                              {visibleCols.evaluator && (
                                <td className="p-2">
                                  <input
                                    list="evaluator-presets"
                                    type="text"
                                    value={b.sourceType || "independent-eval"}
                                    onChange={(e) => updateBenchmark(idx, { sourceType: e.target.value as Benchmark["sourceType"] })}
                                    placeholder="Evaluator Type"
                                    className={inputClass}
                                  />
                                </td>
                              )}

                              {/* Citation Link */}
                              {visibleCols.citation && (
                                <td className="p-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={citationVal}
                                      onChange={(e) => updateBenchmark(idx, { citation: e.target.value, source: e.target.value } as Partial<Benchmark>)}
                                      placeholder="https://arxiv.org/..."
                                      className={`${inputClass} font-mono text-[12px] ${!isUrlValid && citationVal ? "border-amber-500/50" : ""}`}
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
                              )}

                              {/* Dynamic Custom Column Cells */}
                              {customBenchmarkCols.map((col) => (
                                <td key={col} className="p-2 bg-[var(--accent-soft)]/5 border-l border-[var(--muted)]/15">
                                  <input
                                    type="text"
                                    value={b.customColumns?.[col] ?? ""}
                                    onChange={(e) => updateBenchmarkCustomCell(idx, col, e.target.value)}
                                    placeholder={`Value for ${col}`}
                                    className={`${inputClass} font-mono text-xs`}
                                  />
                                </td>
                              ))}

                              {/* Actions */}
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
                    {sourcesList.map((src, idx) => (
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
                    {customSectionsList.map((sec, idx) => (
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

                        <MarkdownFieldEditor
                          label="Section Content"
                          sublabel="Full Markdown, code blocks, bullet points, and tables supported."
                          value={sec.content}
                          onChange={(val) => updateCustomSection(idx, "content", val)}
                          placeholder="Write code blocks, technical guides, or hardware compatibility notes..."
                          rows={6}
                        />
                      </div>
                    ))}

                    {customSectionsList.length === 0 && (
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
          /* ── FULL-FIDELITY LIVE READER PREVIEW MODE (EXACT PRODUCTION LAYOUT) ─ */
          <div className="rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--muted)]/15 shadow-2xl overflow-hidden">
            {/* Top Preview Banner */}
            <div className="bg-[var(--card-bg)] px-6 py-2.5 border-b border-[var(--muted)]/10 flex justify-between items-center text-xs">
              <span className="font-mono text-[var(--muted)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Production Page Preview (/models/{model.slug})
              </span>
              <span className="font-mono text-[11px] text-[var(--muted)]">Interactive State Active</span>
            </div>

            {/* 3-Column Documentation Grid identical to ModelDocsLayout */}
            <div className="mx-auto grid w-full max-w-[1700px] px-4 md:px-6 py-6 gap-8 grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_240px]">
              {/* LEFT COLUMN: Sidebar Navigation */}
              <aside className="w-full shrink-0 hidden lg:block rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 space-y-6 border border-[var(--muted)]/10 h-fit">
                {/* Search Box */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Search docs..."
                    value={previewSearch}
                    onChange={(e) => setPreviewSearch(e.target.value)}
                    className="w-full rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 pl-8 pr-8 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--muted)]">
                    ⌘K
                  </span>
                </div>

                {/* Menu Sections */}
                <div className="space-y-1 text-xs">
                  <p className="px-2 py-1 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Models</p>
                  <span className="block px-3 py-2 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm">
                    Models overview
                  </span>
                  <span className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium">
                    Model IDs & versioning
                  </span>
                  {familyMembers.map((member) => (
                    <span
                      key={member.id}
                      className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] transition-colors truncate font-medium"
                    >
                      What&apos;s new in {member.name}
                    </span>
                  ))}
                  <span className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium">
                    Upgrade model versions
                  </span>
                  <span className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium">
                    Model cards & benchmarks
                  </span>
                </div>
              </aside>

              {/* CENTER COLUMN: Main Reading Area */}
              <main className="flex-1 max-w-[860px] py-4 space-y-8 min-w-0">
                {/* Breadcrumb & Header */}
                <div className="space-y-3">
                  <p className="text-xs text-[var(--muted)] font-medium">
                    Models & pricing / <span className="text-[var(--text)] font-semibold">Models</span> / {model.name}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h1 className="font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight flex items-center gap-3">
                        {model.name} Overview
                        {model.verified ? (
                          <Shield size={24} className="text-emerald-500" />
                        ) : (
                          <span
                            aria-label="Unverified model"
                            title="Unverified Data"
                            className="w-3 h-3 rounded-full border-2 border-amber-500 bg-transparent shrink-0 ml-2"
                          />
                        )}
                      </h1>
                      {model.verified ? (
                        <p className="text-xs text-[var(--muted)] font-mono">
                          Confirmed against {model.developer} documentation, {new Date(model.releaseDate || "2026-01-01").toLocaleString("default", { month: "long", year: "numeric" })}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600/80 dark:text-amber-500/80 font-mono">
                          This model&apos;s data has not been fully verified and benchmarks may be missing.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleCopyPage}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-xs font-bold text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer"
                    >
                      {copied ? <Check size={13} className="text-[var(--accent)]" /> : <Copy size={13} />}
                      <span>{copied ? "Copied!" : "Copy page"}</span>
                    </button>
                  </div>

                  <div className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-3xl font-normal">
                    <MarkdownRenderer
                      content={
                        model.description ||
                        `${model.name} is a state-of-the-art model developed by ${model.developer}. This documentation introduces the available model variants and compares their capability, context window, and pricing performance.`
                      }
                    />
                  </div>
                </div>

                {/* Section 1: Model Variant Overview */}
                <section id="preview-overview" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
                  <h2 className="text-2xl font-extrabold text-[var(--text)]">Model Lineage & Specification</h2>
                  <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
                    <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-mono font-bold">
                      {model.slug}
                    </code>{" "}
                    is {model.developer}&apos;s primary release in the {model.family || "current"} family.
                  </p>
                  <div className="p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                      <span className="text-[var(--muted)] font-medium">Developer</span>
                      <span className="text-[var(--text)] font-bold">{model.developer}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                      <span className="text-[var(--muted)] font-medium">API Identifier</span>
                      <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-mono font-bold">
                        {model.slug}
                      </code>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                      <span className="text-[var(--muted)] font-medium">Parameters</span>
                      <span className="text-[var(--text)] font-bold tabular-nums font-mono">
                        {model.parameters ? (typeof model.parameters === "object" ? Object.values(model.parameters).join(" / ") : model.parameters) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                      <span className="text-[var(--muted)] font-medium">Context Window</span>
                      <span className="text-[var(--text)] font-bold tabular-nums font-mono">
                        {model.contextWindow ? (typeof model.contextWindow === "object" ? (model.contextWindow as { native?: number }).native : model.contextWindow) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[var(--muted)] font-medium">License</span>
                      <span className="text-[var(--text)] font-bold">
                        {model.license && typeof model.license === "object" ? (model.license as { name?: string }).name || "Custom" : model.license || "Unknown"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Section 2: Latest Models Comparison Table */}
                {comparisonModels.length > 1 && (
                  <section id="preview-comparison" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
                    <h2 className="text-2xl font-extrabold text-[var(--text)]">Comparable models</h2>
                    <div className="hidden md:block overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
                      <table className="w-full text-left text-xs text-[var(--muted)]">
                        <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10 text-[var(--text)] font-bold">
                          <tr>
                            <th className="p-3.5 font-bold">Feature</th>
                            {comparisonModels.map((m) => (
                              <th key={m.id} className="p-3.5 font-bold text-[var(--text)]">
                                {m.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--muted)]/10">
                          <tr>
                            <td className="p-3.5 font-bold text-[var(--text)]">Description</td>
                            {comparisonModels.map((m) => (
                              <td key={m.id} className="p-3.5 text-[11px] leading-relaxed text-[var(--muted)]">
                                {m.description ? m.description.slice(0, 80) + "..." : "Frontier AI model"}
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-3.5 font-bold text-[var(--text)]">API Identifier</td>
                            {comparisonModels.map((m) => (
                              <td key={m.id} className="p-3.5 font-mono text-[11px]">
                                <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-bold">
                                  {m.slug}
                                </code>
                              </td>
                            ))}
                          </tr>
                          <tr>
                            <td className="p-3.5 font-bold text-[var(--text)]">Parameters</td>
                            {comparisonModels.map((m) => {
                              const p = m.parameters ? (typeof m.parameters === "object" && m.parameters !== null ? Object.values(m.parameters).join(" / ") : String(m.parameters)) : "—";
                              return (
                                <td key={m.id} className="p-3.5 font-mono tabular-nums text-[var(--text)] font-bold">
                                  {p}
                                </td>
                              );
                            })}
                          </tr>
                          <tr>
                            <td className="p-3.5 font-bold text-[var(--text)]">Context Window</td>
                            {comparisonModels.map((m) => {
                              const cw = m.contextWindow ? (typeof m.contextWindow === "object" && m.contextWindow !== null ? ((m.contextWindow as { native?: number }).native ?? JSON.stringify(m.contextWindow)) : String(m.contextWindow)) : "—";
                              return (
                                <td key={m.id} className="p-3.5 font-mono tabular-nums text-[var(--text)] font-bold">
                                  {cw}
                                </td>
                              );
                            })}
                          </tr>
                          <tr>
                            <td className="p-3.5 font-bold text-[var(--text)]">License / Type</td>
                            {comparisonModels.map((m) => (
                              <td key={m.id} className="p-3.5 text-[var(--muted)] capitalize font-medium">
                                {m.type?.replace("-", " ") || "open source"}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Section 3: Detailed Model Tabs */}
                <section id="preview-tabs" className="pt-6 border-t border-[var(--muted)]/10">
                  <ModelDetailTabs model={model} markdownContent={null} />
                </section>
              </main>

              {/* RIGHT COLUMN: Table of Contents */}
              <aside className="w-56 shrink-0 hidden xl:block p-5 border-l border-[var(--muted)]/10 sticky top-20 h-fit text-xs space-y-4">
                <div className="flex items-center gap-1.5 text-[var(--text)] font-bold">
                  <span className="w-1.5 h-3.5 bg-[var(--accent)] rounded-full" />
                  <span>Table of Contents</span>
                </div>

                <ul className="space-y-2.5 text-[var(--muted)] pl-2 border-l border-[var(--muted)]/10 font-medium">
                  <li>
                    <a href="#preview-overview" className="hover:text-[var(--accent)] transition-colors block">
                      {model.developer} model overview
                    </a>
                  </li>
                  {comparisonModels.length > 1 && (
                    <li>
                      <a href="#preview-comparison" className="hover:text-[var(--accent)] transition-colors block">
                        Comparable models
                      </a>
                    </li>
                  )}
                  <li>
                    <a href="#preview-tabs" className="hover:text-[var(--accent)] transition-colors block">
                      Benchmarks & specifications
                    </a>
                  </li>
                </ul>
              </aside>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD CUSTOM BENCHMARK COLUMN ────────────────────────────── */}
      {showAddColModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--muted)]/20 space-y-4">
            <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Columns size={16} className="text-[var(--accent)]" />
              Add Brand New Benchmark Column
            </h3>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Create an arbitrary custom column across your benchmark table (e.g. <code>Baseline (GPT-4o)</code>, <code>Hardware Setup</code>, <code>Test Split</code>, <code>Shots</code>, <code>Latency</code>).
            </p>
            <div>
              <label className={labelClass}>Column Header Title</label>
              <input
                type="text"
                autoFocus
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddBenchmarkColumn();
                }}
                placeholder="e.g. Baseline Score (GPT-4o)"
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddColModal(false);
                  setNewColName("");
                }}
                className="px-3.5 py-1.5 rounded-[var(--radius-control)] border border-[var(--muted)]/20 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBenchmarkColumn}
                disabled={!newColName.trim()}
                className="px-4 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent)] text-black text-xs font-bold hover:bg-[var(--accent)]/90 cursor-pointer disabled:opacity-50"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD CUSTOM BENCHMARK PRESET ────────────────────────────── */}
      {showAddPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[var(--radius-card)] bg-[var(--card-bg)] p-6 shadow-2xl border border-[var(--muted)]/20 space-y-4">
            <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Plus size={16} className="text-[var(--accent)]" />
              Add Custom Benchmark Quick Preset
            </h3>
            <div>
              <label className={labelClass}>Benchmark Name</label>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="e.g. FrontierMath"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <input
                list="category-presets"
                type="text"
                value={newPresetCategory}
                onChange={(e) => setNewPresetCategory(e.target.value)}
                placeholder="e.g. Math / Reasoning"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Default Metric</label>
              <input
                list="metric-presets"
                type="text"
                value={newPresetMetric}
                onChange={(e) => setNewPresetMetric(e.target.value)}
                placeholder="e.g. % Accuracy"
                className={inputClass}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddPresetModal(false)}
                className="px-3.5 py-1.5 rounded-[var(--radius-control)] border border-[var(--muted)]/20 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPreset}
                disabled={!newPresetName.trim()}
                className="px-4 py-1.5 rounded-[var(--radius-control)] bg-[var(--accent)] text-black text-xs font-bold hover:bg-[var(--accent)]/90 cursor-pointer disabled:opacity-50"
              >
                Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

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
