import Link from "next/link";
import type { ModelIndex } from "@/lib/models";
import TypeBadge from "@/components/ui/TypeBadge";
import { ArrowUpRight } from "lucide-react";

/**
 * Compact model card — used in the "Recently Added" homepage strip
 * and as the browse-page row/card.
 */
export default function ModelCard({
  model,
  variant = "card",
}: {
  model: ModelIndex;
  variant?: "card" | "row";
}) {
  const formattedDate = new Date(model.releaseDate).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  if (variant === "row") {
    return (
      <Link
        href={`/models/${model.slug}`}
        className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_0.8fr_0.6fr_0.5fr_auto] items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/[0.06]"
      >
        {/* Name + developer */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-brand-orange transition-colors">
            {model.name}
          </p>
          <p className="text-xs text-white/50 truncate">{model.developer}</p>
        </div>

        {/* Developer (wider screens) */}
        <p className="hidden sm:block text-sm text-white/60 truncate">
          {model.developer}
        </p>

        {/* Type badge */}
        <div className="flex justify-end sm:justify-start">
          <TypeBadge type={model.type} />
        </div>

        {/* Date */}
        <p className="text-xs text-white/40 tabular-nums whitespace-nowrap">
          {formattedDate}
        </p>

        {/* Arrow */}
        <ArrowUpRight
          size={14}
          className="hidden sm:block text-white/20 group-hover:text-white/60 transition-colors"
        />
      </Link>
    );
  }

  /* Card variant — for the homepage strip */
  return (
    <Link
      href={`/models/${model.slug}`}
      className="group flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all w-full"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className="text-base font-semibold text-white truncate group-hover:text-brand-orange transition-colors"
            style={{
              fontFamily:
                "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            {model.name}
          </p>
          <p className="text-sm text-white/50 mt-0.5">{model.developer}</p>
        </div>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-white/20 group-hover:text-white/60 transition-colors mt-1"
        />
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <TypeBadge type={model.type} />
        <span className="text-xs text-white/30">{formattedDate}</span>
      </div>
    </Link>
  );
}
