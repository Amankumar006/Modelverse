"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
        body: JSON.stringify({ slug: model.slug, promoteDraft }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to verify model");
      }

      setVerifiedSuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1000);
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
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold text-sm">
            Model "{model.name}" has been successfully verified and saved!
          </span>
        </div>
        <span className="text-xs text-emerald-400/70">Reloading page...</span>
      </div>
    );
  }

  const hasDraftDescription = Boolean(model.descriptionDraft);
  const hasDraftFeatures = Boolean(model.keyFeaturesDraft && model.keyFeaturesDraft.length > 0);

  return (
    <div className="mb-8 rounded-2xl bg-[#0F1713] border border-amber-500/30 p-6 shadow-xl relative overflow-hidden">
      {/* Top Banner Warning Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Curator Review Mode</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Needs Verification
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1">
              This model was auto-enriched or backfilled. Review draft prose and sources below before promoting to verified status.
            </p>
          </div>
        </div>

        {/* Primary Approve Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => handleVerify(false)}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white/80 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors disabled:opacity-50"
          >
            Approve As-Is
          </button>
          <button
            onClick={() => handleVerify(true)}
            disabled={loading}
            className="px-4 py-2 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve & Promote Draft</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Draft Prose Comparison Section */}
      {(hasDraftDescription || hasDraftFeatures) && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
              Draft Metadata Preview
            </span>
            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
              <button
                onClick={() => setViewingDraft(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  viewingDraft
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Draft Prose
              </button>
              <button
                onClick={() => setViewingDraft(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  !viewingDraft
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Live Production Specs
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10">
            {viewingDraft ? (
              <div className="space-y-3">
                {hasDraftDescription && (
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider block mb-1">
                      Proposed Description Draft
                    </span>
                    <p className="text-sm text-white/90 leading-relaxed font-sans">
                      {model.descriptionDraft}
                    </p>
                  </div>
                )}
                {hasDraftFeatures && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-emerald-400/80 uppercase tracking-wider block mb-2">
                      Proposed Key Features
                    </span>
                    <ul className="list-disc list-inside text-xs text-white/80 space-y-1">
                      {model.keyFeaturesDraft?.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
                    Current Live Description
                  </span>
                  <p className="text-sm text-white/80 leading-relaxed font-sans">
                    {model.description}
                  </p>
                </div>
                {model.keyFeatures.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-2">
                      Current Live Key Features
                    </span>
                    <ul className="list-disc list-inside text-xs text-white/70 space-y-1">
                      {model.keyFeatures.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
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
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/50 font-medium">Data Sources:</span>
          {model.sources.map((src, idx) => (
            <a
              key={idx}
              href={src}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400/90 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-md border border-emerald-500/20 transition-all truncate max-w-xs"
            >
              {src.replace(/^https?:\/\//, "")}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
