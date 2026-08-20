"use client";

import React, { useState } from "react";
import Link from "next/link";
import { type ModelEntry, type ModelIndex, formatParameters } from "@/lib/models";
import Navbar from "@/components/layout/Navbar";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import QuickstartSection from "./QuickstartSection";
import LineageSpecSection from "./LineageSpecSection";
import CustomSectionsView from "./CustomSectionsView";
import BenchmarksSection from "./BenchmarksSection";
import PricingSection from "./PricingSection";
import ComparableModelsSection from "./ComparableModelsSection";
import SourcesSection from "./SourcesSection";
import ShareBar from "@/components/ui/ShareBar";
import {
  Search,
  ChevronDown,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  FileCode2,
} from "lucide-react";

interface ModelDocsLayoutProps {
  model: ModelEntry;
  markdownContent: string | null;
  allModels?: (ModelIndex | ModelEntry)[];
  familyMembers: (ModelIndex | ModelEntry)[];
  relatedModels: (ModelIndex | ModelEntry)[];
}

export default function ModelDocsLayout({
  model,
  markdownContent,
  familyMembers = [],
  relatedModels = [],
}: ModelDocsLayoutProps) {
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopySlug = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(model.slug);
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    }
  };

  // Quickstart and custom sections detection
  const quickstartData = model.quickstart || model.metadata?.quickstart;
  const customSectionsData = model.customSections || model.metadata?.custom_sections || model.metadata?.customSections;
  const hasQuickstart = Boolean(quickstartData && typeof quickstartData === "object" && Object.keys(quickstartData).length > 0);
  const hasCustomSections = Boolean(Array.isArray(customSectionsData) && customSectionsData.length > 0);
  const hasKeyFeatures = Boolean(model.keyFeatures && model.keyFeatures.length > 0);
  const distinctCardSummary =
    model.cardSummary && model.cardSummary.trim() !== model.description.trim() ? model.cardSummary.trim() : null;
  const distinctPageOverview =
    model.pageOverview && model.pageOverview.trim() !== model.description.trim() && model.pageOverview.trim() !== distinctCardSummary
      ? model.pageOverview.trim()
      : null;
  const editorialNote = model.editorialNote?.trim();

  // Left Navigation Menu
  const renderLeftNav = () => (
    <>
      {/* Search Box */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 pl-8 pr-8 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--muted)]">
          ⌘K
        </span>
      </div>

      {/* Menu Sections */}
      <div className="space-y-1 text-xs">
        <p className="px-2 py-1 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Models Catalog</p>

        <Link
          href={`/models/${model.slug}`}
          className="block px-3 py-2 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
        >
          {model.name}
        </Link>

        <Link
          href={`/models/developer/${encodeURIComponent(model.developer)}`}
          className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium"
        >
          {model.developer} Models
        </Link>

        {model.family && (
          <Link
            href={`/models/family/${encodeURIComponent(model.family)}`}
            className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium"
          >
            {model.family} Generation
          </Link>
        )}

        {familyMembers.slice(0, 6).map((member) => {
          if (member.slug === model.slug) return null;
          return (
            <Link
              key={member.id}
              href={`/models/${member.slug}`}
              className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors truncate font-medium pl-5"
            >
              {member.name}
            </Link>
          );
        })}

        <Link
          href="/models/upgrade"
          className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium"
        >
          Upgrade paths &amp; migrations
        </Link>

        <Link
          href="/models/benchmarks"
          className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium"
        >
          Global leaderboard
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      {/* ── Global Top Navbar ────────────────────────────── */}
      <Navbar theme="dark" />

      {/* ── 3-Column Main Documentation Grid ──────────────────────── */}
      <div className="mx-auto grid w-full max-w-[1700px] px-4 md:px-6 py-6 gap-8 grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_240px]">
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside className="w-full shrink-0 hidden lg:block rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 space-y-6 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto border border-[var(--muted)]/10">
          {renderLeftNav()}
        </aside>

        {/* CENTER COLUMN: Main Reading Area */}
        <main className="flex-1 max-w-[880px] py-2 space-y-10 min-w-0">
          {/* Mobile Left Nav Collapsible */}
          <details className="lg:hidden group rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 mb-6">
            <summary className="p-4 font-bold text-[var(--text)] text-sm cursor-pointer list-none flex justify-between items-center">
              <span>Documentation Navigation</span>
              <ChevronDown size={16} className="text-[var(--muted)] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 pt-0 space-y-6">{renderLeftNav()}</div>
          </details>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 1. MODEL HEADER / IDENTITY                                  */}
          {/* ══════════════════════════════════════════════════════════ */}
          <section id="identity" className="space-y-4">
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
                    <button
                      type="button"
                      onClick={handleCopySlug}
                      className="text-[var(--muted)] hover:text-[var(--text)] p-0.5 transition-colors cursor-pointer"
                      title="Copy API identifier"
                    >
                      {copiedSlug ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
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
                  {typeof model.contextWindow === "object" && model.contextWindow !== null
                    ? (model.contextWindow as { native?: number }).native
                      ? `${(model.contextWindow as { native?: number }).native} tokens`
                      : JSON.stringify(model.contextWindow)
                    : model.contextWindow || "Undisclosed"}
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

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 9. OVERVIEW & DESCRIPTIONS                                 */}
          {/* ══════════════════════════════════════════════════════════ */}
          <section id="overview" className="space-y-4 pt-4 border-t border-[var(--muted)]/10">
            {/* Primary Description */}
            <div className="text-base sm:text-lg text-[var(--text)] leading-relaxed font-normal max-w-3xl">
              <MarkdownRenderer
                content={
                  model.description ||
                  `${model.name} is an advanced AI model developed by ${model.developer}, indexed and benchmarked in the Modelverse registry.`
                }
              />
            </div>

            {/* Card Summary (if distinct) */}
            {distinctCardSummary && (
              <div className="p-4 rounded-[var(--radius-card)] bg-[var(--accent-soft)]/15 border border-[var(--accent)]/20 text-sm text-[var(--text)] leading-relaxed">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--accent)] block mb-1">
                  Executive Summary
                </span>
                <MarkdownRenderer content={distinctCardSummary} />
              </div>
            )}

            {/* Page Overview (deep technical architecture breakdown) */}
            {distinctPageOverview && (
              <div className="space-y-2 pt-2">
                <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">
                  Architecture &amp; System Overview
                </h3>
                <div className="text-sm text-[var(--text)] leading-relaxed prose prose-invert max-w-none">
                  <MarkdownRenderer content={distinctPageOverview} />
                </div>
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 8. KEY FEATURES                                            */}
          {/* ══════════════════════════════════════════════════════════ */}
          {hasKeyFeatures && (
            <section id="key-features" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                <Sparkles size={14} />
                <span>Capabilities &amp; Highlights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {model.keyFeatures!.map((feature, idx) => {
                  const cleanFeature = feature.replace(/^[\s—–\-•*]+\s*/, "");
                  return (
                    <div
                      key={idx}
                      className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-3.5 border border-[var(--muted)]/10 flex items-start gap-2.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                      <span className="text-xs sm:text-sm text-[var(--text)] leading-relaxed font-medium">
                        {cleanFeature}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 2. MODEL LINEAGE & SPECIFICATION                           */}
          {/* ══════════════════════════════════════════════════════════ */}
          <LineageSpecSection model={model} />

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 3. GETTING STARTED                                         */}
          {/* ══════════════════════════════════════════════════════════ */}
          {hasQuickstart && (
            <QuickstartSection quickstart={quickstartData} modelName={model.name} developer={model.developer} />
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 4. CUSTOM DOCUMENTATION SECTIONS                           */}
          {/* ══════════════════════════════════════════════════════════ */}
          {hasCustomSections && <CustomSectionsView customSections={customSectionsData} />}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 7. COMPARABLE MODELS                                       */}
          {/* ══════════════════════════════════════════════════════════ */}
          {relatedModels.length > 0 && (
            <ComparableModelsSection currentModel={model} comparableModels={relatedModels} />
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 5. BENCHMARKS                                              */}
          {/* ══════════════════════════════════════════════════════════ */}
          <BenchmarksSection
            benchmarks={model.benchmarks}
            visibleCols={model.metadata?.visible_benchmark_cols}
            benchmarkColumns={model.metadata?.benchmark_columns}
            developer={model.developer}
          />

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 6. PRICING                                                 */}
          {/* ══════════════════════════════════════════════════════════ */}
          <PricingSection
            pricing={model.pricing}
            pricingLastVerified={model.pricingLastVerified}
            costTiers={model.costTiers}
            modelType={model.type}
          />

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 9. EDITORIAL ANALYSIS                                      */}
          {/* ══════════════════════════════════════════════════════════ */}
          {editorialNote && (
            <section id="editorial-analysis" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                <Sparkles size={14} className="text-[var(--accent)]" />
                <span>Expert Editorial Assessment</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                Modelverse Editorial Analysis
              </h2>
              <div className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 border border-[var(--accent)]/30 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--accent)]" />
                <div className="text-sm text-[var(--text)] leading-relaxed prose prose-invert max-w-none font-normal">
                  <MarkdownRenderer content={editorialNote} />
                </div>
              </div>
            </section>
          )}

          {/* Candidate Markdown Readme (if attached) */}
          {markdownContent && (
            <section id="readme-docs" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                <FileCode2 size={14} />
                <span>Supplementary Documentation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                Technical Readme
              </h2>
              <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10">
                <MarkdownRenderer content={markdownContent} />
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════ */}
          {/* COMMUNITY SHARING                                          */}
          {/* ══════════════════════════════════════════════════════════ */}
          <ShareBar title={model.name} type="model" variant="card" className="my-6" />

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 10. SOURCES & PROVENANCE                                   */}
          {/* ══════════════════════════════════════════════════════════ */}
          <SourcesSection
            sources={model.sources}
            links={model.links}
            developer={model.developer}
            modelName={model.name}
          />
        </main>

        {/* RIGHT COLUMN: Table of Contents */}
        <aside className="w-56 shrink-0 hidden xl:block p-5 border-l border-[var(--muted)]/10 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto text-xs space-y-4">
          <div className="flex items-center gap-1.5 text-[var(--text)] font-bold">
            <span className="w-1.5 h-3.5 bg-[var(--accent)] rounded-full" />
            <span>On This Page</span>
          </div>

          <ul className="space-y-2 text-[var(--muted)] pl-2 border-l border-[var(--muted)]/10 font-medium">
            <li>
              <a href="#identity" className="hover:text-[var(--accent)] transition-colors block">
                Overview &amp; Identity
              </a>
            </li>
            {hasKeyFeatures && (
              <li>
                <a href="#key-features" className="hover:text-[var(--accent)] transition-colors block">
                  Key features
                </a>
              </li>
            )}
            <li>
              <a href="#lineage-spec" className="hover:text-[var(--accent)] transition-colors block">
                Lineage &amp; specification
              </a>
            </li>
            {hasQuickstart && (
              <li>
                <a href="#getting-started" className="hover:text-[var(--accent)] transition-colors block">
                  Getting started
                </a>
              </li>
            )}
            {hasCustomSections && (
              <li>
                <a href="#custom-sections" className="hover:text-[var(--accent)] transition-colors block">
                  Integration guides
                </a>
              </li>
            )}
            {relatedModels.length > 0 && (
              <li>
                <a href="#comparable-models" className="hover:text-[var(--accent)] transition-colors block">
                  Comparable models
                </a>
              </li>
            )}
            <li>
              <a href="#benchmarks" className="hover:text-[var(--accent)] transition-colors block">
                Verified benchmarks
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-[var(--accent)] transition-colors block">
                API pricing
              </a>
            </li>
            {editorialNote && (
              <li>
                <a href="#editorial-analysis" className="hover:text-[var(--accent)] transition-colors block">
                  Editorial analysis
                </a>
              </li>
            )}
            {markdownContent && (
              <li>
                <a href="#readme-docs" className="hover:text-[var(--accent)] transition-colors block">
                  Technical readme
                </a>
              </li>
            )}
            <li>
              <a href="#sources" className="hover:text-[var(--accent)] transition-colors block">
                Sources &amp; provenance
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
