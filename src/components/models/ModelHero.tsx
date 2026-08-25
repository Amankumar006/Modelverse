import Link from "next/link";
import { type ModelEntry } from "@/lib/models";
import { formatParameters } from "@/lib/model-format";
import { formatContextWindow } from "@/lib/model-sections";
import ShareBar from "@/components/ui/ShareBar";
import CopyButton from "@/components/ui/CopyButton";
import { ShieldCheck } from "lucide-react";

interface ModelHeroProps {
  model: ModelEntry;
}

/**
 * Server-rendered page identity header: breadcrumb, title + verification
 * pills, copyable API identifier, share actions, and the quick stat tiles.
 */
export default function ModelHero({ model }: ModelHeroProps) {
  return (
    <section id="identity" className="section-anchor space-y-4">
      {/* Breadcrumb Path */}
      <nav aria-label="Breadcrumb" className="text-xs text-[var(--muted)] font-medium flex items-center gap-1.5 flex-wrap">
        <Link href="/models" className="hover:text-[var(--text)]">Models</Link>
        <span>/</span>
        <Link href={`/models/developer/${encodeURIComponent(model.developer)}`} className="hover:text-[var(--text)]">
          {model.developer}
        </Link>
        {model.family && (
          <>
            <span>/</span>
            <Link href={`/models/family/${encodeURIComponent(model.family)}`} className="hover:text-[var(--text)]">
              {model.family}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-[var(--text)] font-semibold">{model.name}</span>
      </nav>

      {/* Title & Top Action Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight">
              {model.name}
            </h1>
            {model.verified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <ShieldCheck size={13} />
                Verified Model
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                Community Record
              </span>
            )}
            <span className="capitalize px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold">
              {model.status || "Active"}
            </span>
          </div>

          {/* API Identifier Copy Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--muted)] font-medium">API Model ID:</span>
            <div className="inline-flex items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--muted)]/10 px-2.5 py-1 rounded-[var(--radius-control)] shadow-sm">
              <code className="text-xs font-mono font-bold text-[var(--accent)]">{model.slug}</code>
              <CopyButton value={model.slug} label="Copy API identifier" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <ShareBar title={model.name} type="model" variant="header" />
        </div>
      </div>

      {/* Quick Stat Pill Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
          <span className="text-[var(--muted)] font-medium text-[11px] block">Developer</span>
          <span className="font-bold text-[var(--text)] truncate block">{model.developer}</span>
        </div>
        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
          <span className="text-[var(--muted)] font-medium text-[11px] block">Parameters</span>
          <span className="font-mono tabular-nums font-bold text-[var(--text)] truncate block">
            {formatParameters(model)}
          </span>
        </div>
        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
          <span className="text-[var(--muted)] font-medium text-[11px] block">Context Window</span>
          <span className="font-mono tabular-nums font-bold text-[var(--text)] truncate block">
            {formatContextWindow(model.contextWindow)}
          </span>
        </div>
        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
          <span className="text-[var(--muted)] font-medium text-[11px] block">License</span>
          <span className="font-bold text-[var(--text)] truncate block">
            {model.license && typeof model.license === "object"
              ? (model.license as { name?: string }).name || "Custom"
              : model.license || "Not specified"}
          </span>
        </div>
      </div>
    </section>
  );
}
