import Link from "next/link";
import type { ModelIndex, ModelEntry } from "@/lib/models";
import { ArrowUpRight } from "lucide-react";

function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const sub = text.slice(0, maxLength);
  const lastSpace = sub.lastIndexOf(" ");
  if (lastSpace === -1) return sub + "...";
  return sub.slice(0, lastSpace) + "...";
}

function StatusDot({ status, verified }: { status?: string; verified?: boolean }) {
  if (verified) {
    return (
      <span
        aria-label="Verified model"
        title="Verified by curators"
        className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shrink-0 shadow-sm"
      />
    );
  }
  if (status === "unverified" || status === "draft") {
    return (
      <span
        aria-label="Unverified model"
        title="Unverified"
        className="w-2.5 h-2.5 rounded-full border-2 border-[var(--accent)] bg-transparent shrink-0"
      />
    );
  }
  return (
    <span
      aria-label="Skeleton entry"
      title="Skeleton entry"
      className="w-2.5 h-2.5 rounded-full border border-dashed border-[var(--muted)] opacity-60 shrink-0"
    />
  );
}

export default function ModelCard({
  model,
  variant = "single",
  familyVariantCount,
  familySlug,
  isFeatured = false,
  hideDeveloperPrefix = false,
}: {
  model: ModelIndex | ModelEntry;
  variant?: "single" | "family" | "row" | "card";
  familyVariantCount?: number;
  familySlug?: string;
  isFeatured?: boolean;
  hideDeveloperPrefix?: boolean;
}) {
  const formattedDate = new Date(model.releaseDate).toLocaleDateString(
    "en-US",
    { month: "short", year: "numeric" }
  );

  const isDetailed = "description" in model;
  const rawDescription = isDetailed ? (model as ModelEntry).description : "";
  const description = truncateAtWordBoundary(rawDescription, isFeatured ? 160 : 110);

  
  let modality = isDetailed ? (model as ModelEntry).modality : [];
  if (modality && !Array.isArray(modality) && typeof modality === "object") {
    const allMods: string[] = [];
    Object.values(modality).forEach((v) => {
      if (Array.isArray(v)) allMods.push(...v);
    });
    modality = allMods;
  }

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const contextWindow = typeof (model as ModelEntry).contextWindow === "object" && (model as ModelEntry).contextWindow !== null ? String(((model as ModelEntry).contextWindow as any).native) : (model as ModelEntry).contextWindow;
  let parameters = isDetailed ? (model as ModelEntry).parameters : undefined;
  if (typeof parameters === "object" && parameters !== null) {
    parameters = Object.values(parameters).join(" / ");
  }
  const isVerified = "verified" in model ? Boolean((model as ModelEntry).verified) : false;

  const targetHref = familySlug ? `/models/family/${familySlug}` : `/models/${model.slug}`;
  const effectiveFeatured = isFeatured;

  if (variant === "row") {
    return (
      <Link
        href={targetHref}
        className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_0.8fr_0.6fr_0.5fr_auto] items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-[14px] bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--muted)]/10 hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]/5 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
              {model.name}
            </p>
            {familyVariantCount && (
              <span className="text-[10px] font-medium bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-full shrink-0">
                {familyVariantCount} variants
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] truncate">{model.developer}</p>
        </div>

        <p className="hidden sm:block text-sm text-[var(--muted)] truncate">
          {model.developer}
        </p>

        <div className="flex justify-end sm:justify-start items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] font-medium">
            {model.type === "open-weights" ? "Open" : "API"}
          </span>
          <StatusDot status={model.status} verified={isVerified} />
        </div>

        <p className="text-xs text-[var(--muted)] tabular-nums whitespace-nowrap">
          {formattedDate}
        </p>

        <ArrowUpRight
          size={14}
          className="hidden sm:block text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
        />
      </Link>
    );
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-[20px] bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--muted)]/10 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-400 w-full text-left overflow-hidden z-0 ${
        effectiveFeatured
          ? "col-span-1 md:col-span-2 p-7 text-base"
          : "col-span-1 p-5.5 text-xs"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <Link
        href={targetHref}
        className="absolute inset-0 z-10"
        aria-label={`View ${model.name}`}
      />

      <div className="flex flex-col relative z-20 pointer-events-none h-full justify-between">
        <div>
          {/* Header Row: Modality Tag Pill (left) + Status Dot (right) */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {modality && modality.length > 0 ? (
                modality.slice(0, 2).map((m) => (
                  <span
                    key={m}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tag-bg)] text-[var(--tag-text)] uppercase tracking-wider"
                  >
                    {m}
                  </span>
                ))
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tag-bg)] text-[var(--tag-text)] uppercase tracking-wider">
                  Text
                </span>
              )}

              {effectiveFeatured && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>

            <StatusDot status={model.status} verified={isVerified} />
          </div>

          {/* Title & Developer */}
          <div className="mb-2">
            {!hideDeveloperPrefix && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] block mb-0.5">
                {model.developer}
              </span>
            )}
            <h3
              className={`font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug truncate ${
                effectiveFeatured ? "text-xl md:text-2xl" : "text-base md:text-lg"
              }`}
            >
              {variant === "family" && familySlug
                ? familySlug.replace(/^gpt/i, "GPT").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                : model.name}
            </h3>
          </div>

          {/* Description */}
          {description && (
            <p className="text-[var(--muted)] text-xs md:text-sm line-clamp-2 leading-relaxed mb-4">
              {description}
            </p>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="pt-3 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] text-[var(--muted)]">
          <div className="flex items-center gap-2 font-mono tabular-nums">
            {contextWindow && contextWindow !== "Unknown" && (
              <span>{contextWindow as React.ReactNode}</span>
            )}
            {parameters && parameters !== "Unknown" && (
              <span>• {parameters as React.ReactNode}</span>
            )}
          </div>

          <span className="font-mono tabular-nums">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
