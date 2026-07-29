import Link from "next/link";
import type { ModelIndex, ModelEntry } from "@/lib/models";
import TypeBadge from "@/components/ui/TypeBadge";
import StatusBadge from "@/components/ui/StatusBadge";
import { ArrowUpRight } from "lucide-react";

function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const sub = text.slice(0, maxLength);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace === -1) return sub + "...";
  return sub.slice(0, lastSpace) + "...";
}

/**
 * Compact model card — used in the "Recently Added" homepage strip
 * and as the browse-page row/card.
 */
export default function ModelCard({
  model,
  variant = "single",
  familyVariantCount,
  familySlug,
  isFeatured = false,
  hideDeveloperPrefix = false,
}: {
  model: ModelIndex | ModelEntry;
  variant?: "single" | "family" | "row" | "card"; // Support "card" for backward compatibility if any
  familyVariantCount?: number;
  familySlug?: string;
  isFeatured?: boolean;
  hideDeveloperPrefix?: boolean;
}) {
  const formattedDate = new Date(model.releaseDate).toLocaleDateString(
    "en-US",
    { month: "short", year: "numeric" }
  );

  // Check if model has detailed entry fields
  const isDetailed = "description" in model;
  const rawDescription = isDetailed ? (model as ModelEntry).description : "";
  const description = truncateAtWordBoundary(rawDescription, isFeatured ? 160 : 110);
  const primaryTask = isDetailed ? (model as ModelEntry).primaryTask : undefined;
  
  const contextWindow = isDetailed ? (model as ModelEntry).contextWindow : undefined;
  const parameters = isDetailed ? (model as ModelEntry).parameters : undefined;

  let statValue = "N/A";
  const hasValidContext = contextWindow && contextWindow !== "Unknown" && contextWindow.toLowerCase() !== "undisclosed";
  const hasValidParams = parameters && parameters !== "Unknown" && parameters.toLowerCase() !== "undisclosed";

  if (hasValidContext) {
    statValue = contextWindow.includes("context") ? contextWindow : `${contextWindow} Context`;
  } else if (hasValidParams) {
    statValue = parameters.includes("params") ? parameters : `${parameters} Params`;
  } else if (contextWindow?.toLowerCase() === "undisclosed" || parameters?.toLowerCase() === "undisclosed") {
    statValue = "—";
  }

  const targetHref = familySlug ? `/models/family/${familySlug}` : `/models/${model.slug}`;

  if (variant === "row") {
    return (
      <Link
        href={targetHref}
        className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_0.8fr_0.6fr_0.5fr_auto] items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/10"
      >
        {/* Name + developer */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate group-hover:text-[#4ADE80] transition-colors">
              {model.name}
            </p>
            {familyVariantCount && (
              <span className="text-[10px] font-semibold bg-[#4ADE80]/10 text-[#4ADE80] px-1.5 py-0.5 rounded-full shrink-0">
                {familyVariantCount} variants
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 truncate">{model.developer}</p>
        </div>

        {/* Developer (wider screens) */}
        <p className="hidden sm:block text-sm text-gray-400 truncate">
          {model.developer}
        </p>

        {/* Type badge & Status badge */}
        <div className="flex justify-end sm:justify-start items-center gap-1.5">
          <TypeBadge type={model.type} />
          <StatusBadge status={model.status} vendorApiStatus={model.vendorApiStatus} />
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400/60 tabular-nums whitespace-nowrap">
          {formattedDate}
        </p>

        {/* Arrow */}
        <ArrowUpRight
          size={14}
          className="hidden sm:block text-black/20 group-hover:text-black/60 transition-colors"
        />
      </Link>
    );
  }

  /* Redesigned Card variant (single or family) */
  return (
    <div
      className="group relative flex flex-col justify-center h-full rounded-xl bg-[#0E0E10] border border-white/5 hover:border-emerald-500/20 hover:bg-[#141416] hover:-translate-y-0.5 shadow-md hover:shadow-[0_8px_30px_rgba(16,185,129,0.03)] transition-all duration-300 w-full text-left overflow-hidden z-0"
    >
      <Link
        href={targetHref}
        className="absolute inset-0 z-10"
        aria-label={`View ${model.name}`}
      />

      <div className="flex flex-col p-5 relative z-20 pointer-events-none">
        {/* Main Content */}
        <div className="flex flex-col min-w-0 mb-3.5">
          {variant !== "family" && !hideDeveloperPrefix && (
            <span className="text-zinc-500 uppercase tracking-widest font-mono text-[9px] mb-1.5 block">
              {model.developer}
            </span>
          )}
          <div className="flex items-start justify-between min-w-0">
            <h3 className="font-semibold text-white text-base md:text-lg leading-snug truncate group-hover:text-emerald-400 transition-colors">
              {variant === "family" && familySlug ? (
                familySlug.replace(/^gpt/i, "GPT").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
              ) : (
                model.name
              )}
            </h3>
            {variant === "family" && familyVariantCount && (
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full shrink-0 border border-emerald-500/20 ml-2">
                {familyVariantCount} vars
              </span>
            )}
          </div>
        </div>

        {/* Badges & Stats Row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[11px] text-gray-400">
          {/* Task */}
          {primaryTask && (
             <span className="flex items-center gap-1 font-medium bg-zinc-800/40 text-zinc-300 px-2 py-0.5 rounded border border-white/5">
               <svg className="w-3 h-3 text-[#4ADE80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
               {primaryTask.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
             </span>
          )}

          {/* Type Badge (open weights, etc) */}
          <span className="flex items-center gap-1 font-medium bg-zinc-800/40 text-zinc-300 px-2 py-0.5 rounded border border-white/5">
            {(() => {
              const typeMap: Record<string, string> = {
                "open-weights": "Open Weights",
                "closed-source": "Closed Source",
                "api-only": "API Only",
                "research-preview": "Research Preview",
              };
              return typeMap[model.type] || model.type;
            })()}
          </span>
          
          <StatusBadge status={model.status} vendorApiStatus={model.vendorApiStatus} />
          
          <span className="text-zinc-700 font-mono select-none px-0.5">•</span>
          
          {/* Params */}
          {hasValidParams && parameters !== "undisclosed" && (
            <>
              <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {parameters}
              </span>
              <span className="text-zinc-700 font-mono select-none px-0.5">•</span>
            </>
          )}

          {/* Date */}
          <span className="truncate flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
            <svg className="w-3 h-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
