import Link from "next/link";
import { type ModelEntry, type ModelIndex, type ModelEvidence } from "@/lib/models";
import Navbar from "@/components/layout/Navbar";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import QuickstartSection from "./QuickstartSection";
import LineageSpecSection from "./LineageSpecSection";
import CapabilitiesMatrix from "./CapabilitiesMatrix";
import ProvenanceEvidenceDrawer from "./ProvenanceEvidenceDrawer";
import CustomSectionsView from "./CustomSectionsView";
import BenchmarksSection from "./BenchmarksSection";
import PricingSection from "./PricingSection";
import ComparableModelsSection from "./ComparableModelsSection";
import SourcesSection from "./SourcesSection";
import ModelHero from "./ModelHero";
import ShareBar from "@/components/ui/ShareBar";
import { ActiveSectionProvider } from "./ActiveSectionProvider";
import { SectionNavRail, SectionChipBar } from "./SectionNav";
import QuickFactsRail from "./QuickFactsRail";
import {
  buildSectionGroups,
  flattenSections,
  deriveAlwaysOnFacts,
  deriveContextualFacts,
} from "@/lib/model-sections";
import {
  Sparkles,
  FileCode2,
  ChevronDown,
} from "lucide-react";

interface ModelDocsLayoutProps {
  model: ModelEntry;
  markdownContent: string | null;
  familyMembers: (ModelIndex | ModelEntry)[];
  relatedModels: (ModelIndex | ModelEntry)[];
  evidence?: ModelEvidence[];
}

export default function ModelDocsLayout({
  model,
  markdownContent,
  familyMembers = [],
  relatedModels = [],
  evidence = [],
}: ModelDocsLayoutProps) {
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

  // Tiered navigator config — one source of truth for the desktop rail,
  // mobile chip bar, and scroll-spy. Flags mirror the conditional sections
  // below so no nav entry ever points at a missing anchor.
  const sectionGroups = buildSectionGroups({
    hasKeyFeatures,
    hasEditorial: Boolean(editorialNote),
    hasComparable: relatedModels.length > 0,
    hasQuickstart,
    hasCustomSections,
    hasReadme: Boolean(markdownContent),
    hasEvidence: evidence.length > 0,
    hasSources: true, // SourcesSection always renders
  });
  const sections = flattenSections(sectionGroups);

  // Quick-facts rail data — derived once server-side, shipped as plain
  // strings so the client island carries no data logic.
  const hasComparable = relatedModels.length > 0;
  const alwaysOnFacts = deriveAlwaysOnFacts(model);
  const contextualFacts = deriveContextualFacts(model, evidence);
  const sectionLabels = Object.fromEntries(sections.map((s) => [s.id, s.label]));

  // Left Navigation Menu
  const renderLeftNav = () => (
    <>
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
      {/* Single scroll-spy owner for rail + chip bar (+ quick-facts in M3).
          Children are server-rendered and never re-render on scroll. */}
      <ActiveSectionProvider sections={sections}>
      {/* ── Global Top Navbar ────────────────────────────── */}
      <Navbar theme="dark" />

      {/* ── Mobile section chip bar (<lg) ─────────────────── */}
      <SectionChipBar sections={sections} />

      {/* ── Three-Column Documentation Grid ───────────────────────── */}
      <div className="mx-auto grid w-full max-w-[1700px] px-4 md:px-6 py-6 gap-8 grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_280px]">
        {/* LEFT COLUMN: Section navigator + catalog links */}
        <aside className="w-full shrink-0 hidden lg:block rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 space-y-6 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto border border-[var(--muted)]/10">
          <div>
            <p className="px-2 pb-2 flex items-center gap-1.5 text-xs font-bold text-[var(--text)] uppercase tracking-wider">
              <span className="w-1.5 h-3.5 bg-[var(--accent)] rounded-full" />
              On this page
            </p>
            <SectionNavRail groups={sectionGroups} />
          </div>

          {renderLeftNav()}
        </aside>

        {/* CENTER COLUMN: Main Reading Area */}
        <main className="flex-1 max-w-[880px] py-2 space-y-10 min-w-0">
          {/* Mobile catalog collapsible — page sections live in the sticky
              chip bar above; this only carries catalog/site links now. */}
          <details className="lg:hidden group rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 mb-6">
            <summary className="p-4 font-bold text-[var(--text)] text-sm cursor-pointer list-none flex justify-between items-center">
              <span>Browse model catalog</span>
              <ChevronDown size={16} className="text-[var(--muted)] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 pt-0 space-y-6">{renderLeftNav()}</div>
          </details>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 1. MODEL HEADER / IDENTITY (server-rendered hero)           */}
          {/* ══════════════════════════════════════════════════════════ */}
          <ModelHero model={model} />

          {/* At-a-glance strip — same derived facts as the xl rail, zero JS */}
          <section aria-label="At a glance" className="xl:hidden grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {alwaysOnFacts.priceFrom && (
              <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
                <span className="text-[var(--muted)] font-medium text-[11px] block">Price from</span>
                <span className="font-mono tabular-nums font-bold text-[var(--accent)] truncate block">{alwaysOnFacts.priceFrom}</span>
              </div>
            )}
            <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
              <span className="text-[var(--muted)] font-medium text-[11px] block">Context</span>
              <span className="font-mono tabular-nums font-bold text-[var(--text)] truncate block">{alwaysOnFacts.contextWindow}</span>
            </div>
            <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
              <span className="text-[var(--muted)] font-medium text-[11px] block">Params</span>
              <span className="font-bold text-[var(--text)] truncate block">{alwaysOnFacts.parameters}</span>
            </div>
            {alwaysOnFacts.capabilitiesSupported !== null && (
              <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
                <span className="text-[var(--muted)] font-medium text-[11px] block">Capabilities</span>
                <span className="font-bold text-[var(--text)] truncate block">
                  {alwaysOnFacts.capabilitiesSupported}/{alwaysOnFacts.capabilitiesTotal}
                </span>
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* 9. OVERVIEW & DESCRIPTIONS                                 */}
          {/* ══════════════════════════════════════════════════════════ */}
          <section id="overview" className="section-anchor space-y-4 pt-4 border-t border-[var(--muted)]/10">
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
            <section id="key-features" className="section-anchor space-y-4 pt-6 border-t border-[var(--muted)]/10">
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
          {/* 2.5 TECHNICAL CAPABILITIES MATRIX                           */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div id="capabilities" className="section-anchor">
            <CapabilitiesMatrix capabilities={model.capabilities} modelName={model.name} />
          </div>

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
            <section id="editorial-analysis" className="section-anchor space-y-4 pt-6 border-t border-[var(--muted)]/10">
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
            <section id="readme-docs" className="section-anchor space-y-4 pt-6 border-t border-[var(--muted)]/10">
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
          {/* 9.5 VERIFIED EVIDENCE & PROVENANCE DRAWER                  */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div id="provenance" className="section-anchor">
            <ProvenanceEvidenceDrawer evidence={evidence} modelName={model.name} />
          </div>

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

        {/* RIGHT COLUMN: Quick-facts vitals rail (xl+) */}
        <aside className="w-full shrink-0 hidden xl:block rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto border border-[var(--muted)]/10">
          <QuickFactsRail
            alwaysOn={alwaysOnFacts}
            contextual={contextualFacts}
            sectionLabels={sectionLabels}
            showCompareCta={hasComparable}
          />
        </aside>
      </div>
      </ActiveSectionProvider>
    </div>
  );
}
