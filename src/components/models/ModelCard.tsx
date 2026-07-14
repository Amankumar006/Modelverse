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
    <span className="text-[10px] font-medium bg-black/5 text-[#6f6f6f] px-2.5 py-1 rounded-full shrink-0 tracking-wide">
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
    <span className="text-[10px] font-medium bg-black/5 text-[#6f6f6f] px-2.5 py-1 rounded-full shrink-0 tracking-wide">
      {typeMap[type] || type}
    </span>
  );
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
  const description = isDetailed ? (model as ModelEntry).description : "";
  const primaryTask = isDetailed ? (model as ModelEntry).primaryTask : undefined;
  
  const contextWindow = isDetailed ? (model as ModelEntry).contextWindow : undefined;
  const parameters = isDetailed ? (model as ModelEntry).parameters : undefined;

  let statValue = "N/A";
  if (contextWindow && contextWindow !== "Unknown") {
    statValue = contextWindow.includes("context") ? contextWindow : `${contextWindow} Context`;
  } else if (parameters && parameters !== "Unknown") {
    statValue = parameters.includes("params") ? parameters : `${parameters} Params`;
  }

  const targetHref = familySlug ? `/models/family/${familySlug}` : `/models/${model.slug}`;

  if (variant === "row") {
    return (
      <Link
        href={targetHref}
        className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_0.8fr_0.6fr_0.5fr_auto] items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl hover:bg-black/[0.04] transition-colors border border-transparent hover:border-black/10"
      >
        {/* Name + developer */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-[#0a0a0a] truncate group-hover:text-brand-orange transition-colors">
              {model.name}
            </p>
            {familyVariantCount && (
              <span className="text-[10px] font-semibold bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded-full shrink-0">
                {familyVariantCount} variants
              </span>
            )}
          </div>
          <p className="text-xs text-[#6f6f6f] truncate">{model.developer}</p>
        </div>

        {/* Developer (wider screens) */}
        <p className="hidden sm:block text-sm text-[#6f6f6f] truncate">
          {model.developer}
        </p>

        {/* Type badge */}
        <div className="flex justify-end sm:justify-start">
          <TypeBadge type={model.type} />
        </div>

        {/* Date */}
        <p className="text-xs text-[#6f6f6f]/60 tabular-nums whitespace-nowrap">
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
    <Link
      href={targetHref}
      className="group relative flex flex-col justify-between h-full rounded-2xl bg-white border border-black/10 hover:border-black/20 hover:shadow-sm hover:-translate-y-[3px] active:scale-95 transition-all duration-300 w-full text-left overflow-hidden"
    >
      <div className="flex flex-col flex-1 p-5 lg:p-6 pb-0">
        {/* Top Pill */}
        <div className="mb-4 flex items-start">
          {variant === "family" && primaryTask ? (
            <TaskBadge task={primaryTask} />
          ) : (
            <SimpleTypeBadge type={model.type} />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 mb-5">
          <h3
            className={`font-semibold text-[#0a0a0a] group-hover:text-brand-orange transition-colors mb-1 ${
              isFeatured ? "text-2xl sm:text-3xl line-clamp-2" : "text-lg sm:text-xl line-clamp-1"
            }`}
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            {variant === "family" && familySlug ? (
              // Basic capitalization for family slugs, with special case for GPT
              familySlug.replace(/^gpt/i, "GPT").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
            ) : (
              model.name
            )}
          </h3>
          <p className="text-xs text-[#6f6f6f] mb-3">{model.developer}</p>

          {description && (
            <p className={`text-sm text-[#6f6f6f] leading-relaxed ${isFeatured ? "line-clamp-3" : "line-clamp-2"}`}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Stat Strip Footer */}
      <div className="flex border-t border-black/10 divide-x divide-black/10 mt-auto">
        <div className="flex-1 min-w-0 px-2 sm:px-3 py-3 flex items-center justify-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6f6f6f] truncate">
            {statValue}
          </span>
        </div>
        <div className="flex-1 min-w-0 px-2 sm:px-3 py-3 flex items-center justify-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#6f6f6f] truncate">
            {formattedDate}
          </span>
        </div>
        <div className="flex-1 min-w-0 px-2 sm:px-3 py-3 flex items-center justify-center text-center group-hover:bg-black/[0.02] transition-colors">
          {variant === "family" && familyVariantCount ? (
            <div className="flex items-center gap-1 text-brand-orange min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] truncate">
                {familyVariantCount} vars
              </span>
              <ArrowUpRight size={14} className="shrink-0" />
            </div>
          ) : (
            <ArrowUpRight
              size={18}
              className="text-black/20 group-hover:text-black/60 transition-colors shrink-0"
            />
          )}
        </div>
      </div>
    </Link>
  );
}
