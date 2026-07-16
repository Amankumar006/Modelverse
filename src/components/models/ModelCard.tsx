import Link from "next/link";
import type { ModelIndex, ModelEntry } from "@/lib/models";
import TypeBadge from "@/components/ui/TypeBadge";
import { ArrowUpRight } from "lucide-react";

function TaskBadge({ task }: { task: string }) {
  const taskNames: Record<string, string> = {
    "chat-reasoning": "Chat & Reasoning",
    "code-generation": "Coding",
    "image-generation": "Image Gen",
    "video-generation": "Video Gen",
    "audio-speech": "Audio & Speech",
    "embedding": "Embedding",
    "agentic": "Agentic",
    "multimodal-general": "Multimodal",
    "translation": "Translation",
    "search-retrieval": "Search & RAG",
    "other": "Specialized",
  };
  const label = taskNames[task] || task;

  return (
    <span className="text-[10px] font-medium bg-white/20 text-brand-orange px-2.5 py-1 rounded-full shrink-0 tracking-wide border border-white/5 flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
      {label}
    </span>
  );
}

function SimpleTypeBadge({ type }: { type: string }) {
  const typeMap: Record<string, string> = {
    "open-weights": "Open Weights",
    "closed-source": "Closed Source",
    "api-only": "API Only",
  };
  return (
    <span className="text-[10px] font-medium bg-white/20 text-gray-400 px-2.5 py-1 rounded-full shrink-0 tracking-wide border border-white/5">
      {typeMap[type] || type}
    </span>
  );
}

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
}: {
  model: ModelIndex | ModelEntry;
  variant?: "single" | "family" | "row" | "card"; // Support "card" for backward compatibility if any
  familyVariantCount?: number;
  familySlug?: string;
  isFeatured?: boolean;
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
            <p className="text-sm font-medium text-white truncate group-hover:text-brand-orange transition-colors">
              {model.name}
            </p>
            {familyVariantCount && (
              <span className="text-[10px] font-semibold bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded-full shrink-0">
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

        {/* Type badge */}
        <div className="flex justify-end sm:justify-start">
          <TypeBadge type={model.type} />
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
      className="group relative flex flex-col justify-center h-full rounded-xl bg-[#0b0f19]/5 border border-white/10 hover:border-white/20 hover:bg-[#0b0f19]/10 transition-colors duration-200 w-full text-left overflow-hidden z-0"
    >
      <Link
        href={targetHref}
        className="absolute inset-0 z-10"
        aria-label={`View ${model.name}`}
      />

      <div className="flex flex-col p-4 relative z-20 pointer-events-none">
        {/* Main Content */}
        <div className="flex items-start justify-between min-w-0 mb-2">
          <div className="flex flex-wrap items-center gap-1.5 truncate">
            {variant !== "family" && (
              <span className="text-gray-400 font-normal text-sm md:text-base">{model.developer} /</span>
            )}
            <h3 className="font-semibold text-white text-sm md:text-base truncate">
              {variant === "family" && familySlug ? (
                familySlug.replace(/^gpt/i, "GPT").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
              ) : (
                model.name
              )}
            </h3>
          </div>
          {variant === "family" && familyVariantCount && (
            <span className="text-[10px] font-semibold bg-[#0b0f19]/10 text-gray-300 px-1.5 py-0.5 rounded-full shrink-0 border border-white/10 ml-2">
              {familyVariantCount} vars
            </span>
          )}
        </div>

        {/* Badges & Stats Row */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] text-gray-400 mt-1">
          {/* Task */}
          {primaryTask && (
             <span className="flex items-center gap-1 font-medium bg-white/20 px-2 py-0.5 rounded border border-white/5">
               <svg className="w-3 h-3 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
               </svg>
               {primaryTask.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
             </span>
          )}

          {/* Type Badge (open weights, etc) */}
          <span className="flex items-center gap-1 font-medium bg-white/20 px-2 py-0.5 rounded border border-white/5">
             <SimpleTypeBadge type={model.type} />
          </span>
          
          <span className="text-gray-600">•</span>
          
          {/* Params */}
          {hasValidParams && parameters !== "undisclosed" && (
            <>
              <span className="flex items-center gap-1 font-mono">
                <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {parameters}
              </span>
              <span className="text-gray-600">•</span>
            </>
          )}

          {/* Date */}
          <span className="truncate flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formattedDate}
          </span>
        </div>
      </div>
    </div>
  );
}
