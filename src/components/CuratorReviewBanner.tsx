"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Check, CheckCircle2, Lock, ExternalLink } from "lucide-react";

interface ModelProps {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  needsReview?: boolean;
  description: string;
  descriptionDraft?: string;
  keyFeatures: string[];
  keyFeaturesDraft?: string[];
  sources: string[];
}

export default function CuratorReviewBanner({ model }: { model: ModelProps }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const curateMode = searchParams.get("curate") === "true";

  const [viewingDraft, setViewingDraft] = useState(true);
  const [loading, setLoading] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Show if needs review or explicitly forced via ?curate=true
  const shouldShow = model.needsReview === true || model.verified === false || curateMode;

  if (!shouldShow && !verifiedSuccess) {
    return null;
  }

  async function handleVerify(promoteDraft: boolean) {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/models/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: model.slug, id: model.id, promoteDraft }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify model");
      }

      setVerifiedSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during verification");
    } finally {
      setLoading(false);
    }
  }

  if (verifiedSuccess) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between animate-fadeIn">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="font-semibold text-xs">
            Model &quot;{model.name}&quot; has been successfully verified and saved!
          </span>
        </div>
        <span className="text-xs text-emerald-400/70 font-mono">Reloading...</span>
      </div>
    );
  }

  const hasDraftDescription = Boolean(model.descriptionDraft);
  const hasDraftFeatures = Boolean(model.keyFeaturesDraft && model.keyFeaturesDraft.length > 0);

  return (
    <div className="mb-8 rounded-2xl bg-[#1C1C1E] border border-[#282828] p-6 shadow-2xl relative overflow-hidden">
      {/* Website Emerald Theme Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />

      {/* Top Banner Warning Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#282828]">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#242426] text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
            <AlertTriangle size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3
                className="text-xl font-normal text-white"
                style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
              >
                Curator Review Mode
              </h3>
              <span className="text-[10px] uppercase font-mono font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#242426] text-amber-400 border border-amber-500/30">
                Needs Verification
              </span>
            </div>
            <p className="text-xs text-[#90908F] mt-1 leading-relaxed max-w-xl">
              This model entry was auto-enriched or backfilled. Review proposed draft prose and primary sources below before promoting to verified status.
            </p>
          </div>
        </div>

        {/* Primary Approve Action Buttons (Website Emerald Theme) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleVerify(false)}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-[#E1E1E0] hover:text-white bg-[#242426] hover:bg-[#2A2A2D] rounded-xl border border-[#333333] transition-all active:scale-95 disabled:opacity-50"
          >
            Approve As-Is
          </button>
          <button
            onClick={() => handleVerify(true)}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 active:scale-95 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>Approve & Promote Draft</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error & Read-Only Alert Box */}
      {errorMsg && (
        <div className="mt-4 p-3.5 rounded-xl bg-[#242426] border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <Lock size={16} className="shrink-0 text-amber-400 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold block mb-0.5 text-white">Read-Only Serverless Environment</span>
            <span className="text-[#90908F]">{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Draft Prose Comparison Section */}
      {(hasDraftDescription || hasDraftFeatures) && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#90908F] uppercase tracking-wider">
              Draft Metadata Preview
            </span>
            <div className="flex items-center bg-[#141414] rounded-lg p-0.5 border border-[#282828]">
              <button
                onClick={() => setViewingDraft(true)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  viewingDraft
                    ? "bg-[#242426] text-emerald-400 border border-emerald-500/30 font-semibold"
                    : "text-[#90908F] hover:text-white"
                }`}
              >
                Draft Prose
              </button>
              <button
                onClick={() => setViewingDraft(false)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  !viewingDraft
                    ? "bg-[#242426] text-white border border-[#333333] font-semibold"
                    : "text-[#90908F] hover:text-white"
                }`}
              >
                Live Production Specs
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#141414] border border-[#282828]">
            {viewingDraft ? (
              <div className="space-y-3">
                {hasDraftDescription && (
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                      Proposed Description Draft
                    </span>
                    <p className="text-sm text-[#E1E1E0] leading-relaxed font-sans">
                      {model.descriptionDraft}
                    </p>
                  </div>
                )}
                {hasDraftFeatures && (
                  <div className="pt-3 border-t border-[#282828]">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                      Proposed Key Features
                    </span>
                    <ul className="space-y-1 text-xs text-[#E1E1E0]">
                      {model.keyFeaturesDraft?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500">—</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-[#90908F] uppercase tracking-wider block mb-1">
                    Current Live Description
                  </span>
                  <p className="text-sm text-[#E1E1E0] leading-relaxed font-sans">
                    {model.description}
                  </p>
                </div>
                {model.keyFeatures.length > 0 && (
                  <div className="pt-3 border-t border-[#282828]">
                    <span className="text-[11px] font-semibold text-[#90908F] uppercase tracking-wider block mb-2">
                      Current Live Key Features
                    </span>
                    <ul className="space-y-1 text-xs text-[#E1E1E0]">
                      {model.keyFeatures.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#90908F]">—</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sources Inspector */}
      {model.sources && model.sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#282828] flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#90908F] font-medium">Data Sources:</span>
          {model.sources.map((src, idx) => (
            <a
              key={idx}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-[#E1E1E0] bg-[#242426] hover:border-emerald-500/50 hover:text-emerald-400 px-2.5 py-1 rounded-md border border-[#333333] transition-all flex items-center gap-1 truncate max-w-xs"
            >
              <span className="truncate">{src.replace(/^https?:\/\//, "")}</span>
              <ExternalLink size={10} className="text-[#90908F] shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
