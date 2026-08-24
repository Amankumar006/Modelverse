"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { approveStaged, rejectStaged } from "@/app/admin/actions";

// Friendly labels for the staged field keys we surface in the diff.
const FIELD_LABELS: Record<string, string> = {
  developer: "Developer",
  release_date: "Release date",
  type: "Type",
  vendor_api_status: "Vendor API status",
  family: "Family",
  tier: "Tier",
  previous_version: "Previous version",
  base_model: "Base model",
  parameters: "Parameters",
  active_parameters: "Active parameters (MoE)",
  context_window: "Context window",
  license: "License",
  modality: "Modality",
  deployment: "Deployment",
  primary_task: "Primary task",
  capabilities: "Capabilities",
  description: "Description",
  card_summary: "Card summary",
  page_overview: "Page overview",
  editorial_note: "Editorial note",
  key_features: "Key features",
  tags: "Tags",
  pricing: "Pricing",
  cost_tiers: "Cost tiers",
  benchmarks: "Benchmarks",
  api_availability: "API availability",
  chatgpt_availability: "ChatGPT availability",
  links: "Links",
  sources: "Sources",
  logo: "Logo",
  aliases: "Aliases",
  field_confidence: "Field confidence",
};

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "(empty)";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length === 0 ? "(empty)" : value.join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "[object]";
    }
  }
  return String(value);
}

interface StagedChangesPanelProps {
  slug: string;
  stagedChanges: Record<string, unknown>;
  stagedAt?: string | null;
  liveValues: Record<string, unknown>;
}

export default function StagedChangesPanel({
  slug,
  stagedChanges,
  stagedAt,
  liveValues,
}: StagedChangesPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fields = Object.keys(stagedChanges);
  if (fields.length === 0) return null;

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      try {
        await approveStaged(slug);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Approve failed");
      }
    });
  };

  const handleReject = () => {
    setError(null);
    startTransition(async () => {
      try {
        await rejectStaged(slug, feedback.trim() || undefined);
        setFeedback("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Reject failed");
      }
    });
  };

  return (
    <div className="bg-daylight-card rounded-xl shadow-md border-2 border-daylight-accent/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-daylight-muted/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-daylight-accent" />
          <h2 className="text-lg font-bold text-daylight-text">
            {fields.length} staged {fields.length === 1 ? "change" : "changes"} awaiting review
          </h2>
          {stagedAt && (
            <span className="text-xs text-daylight-muted">
              staged {new Date(stagedAt).toLocaleString()}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-daylight-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-daylight-muted" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-daylight-muted/20">
          <div className="divide-y divide-daylight-muted/10">
            {fields.map((field) => (
              <div key={field} className="grid grid-cols-1 md:grid-cols-3 gap-3 px-6 py-4">
                <div className="font-medium text-daylight-text">
                  {FIELD_LABELS[field] ?? field}
                  <div className="text-xs text-daylight-muted font-normal mt-1">{field}</div>
                </div>
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wider text-red-600 font-bold mb-1">
                    Current
                  </div>
                  <pre className="text-xs text-daylight-text whitespace-pre-wrap font-mono">
                    {stringify(liveValues[field])}
                  </pre>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-lg p-3">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold mb-1">
                    Proposed
                  </div>
                  <pre className="text-xs text-daylight-text whitespace-pre-wrap font-mono">
                    {stringify(stagedChanges[field])}
                  </pre>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 bg-daylight-bg/30 border-t border-daylight-muted/10 space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional feedback for the next research pass (rejection only)…"
              rows={2}
              className="w-full px-3 py-2 bg-daylight-bg border border-daylight-muted/20 rounded-lg text-sm text-daylight-text focus:outline-none focus:ring-1 focus:ring-daylight-accent"
            />
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={handleReject}
                disabled={isPending}
                className="px-4 py-2 bg-red-500/10 text-red-600 font-medium rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject all
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="px-5 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isPending ? "Working…" : `Approve ${fields.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
