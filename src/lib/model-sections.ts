/* ------------------------------------------------------------------ */
/*  Pure helpers describing the /models/[slug] page structure          */
/*                                                                     */
/*  React-free and side-effect-free so both server components and      */
/*  assert-based test scripts can consume them (see                    */
/*  tests/model-facts.test.js).                                        */
/* ------------------------------------------------------------------ */

export interface SectionMeta {
  /** Anchor target id — MUST match the rendered section ids verbatim (SEO deep links). */
  id: string;
  label: string;
}

export interface SectionGroup {
  title: "Understand" | "Evaluate" | "Reference";
  items: SectionMeta[];
}

export interface SectionAvailabilityFlags {
  hasKeyFeatures: boolean;
  hasEditorial: boolean;
  hasComparable: boolean;
  hasQuickstart: boolean;
  hasCustomSections: boolean;
  hasReadme: boolean;
  hasEvidence: boolean;
  hasSources: boolean;
}

/**
 * Build the tiered navigator structure for a model page, omitting sections
 * whose content flag is false so no nav entry ever points at a missing
 * anchor. Order defines reading order: Understand → Evaluate → Reference.
 */
export function buildSectionGroups(flags: SectionAvailabilityFlags): SectionGroup[] {
  const understand: SectionMeta[] = [
    { id: "overview", label: "Overview" },
    ...(flags.hasKeyFeatures ? [{ id: "key-features", label: "Key features" }] : []),
    ...(flags.hasEditorial ? [{ id: "editorial-analysis", label: "Editorial analysis" }] : []),
  ];

  const evaluate: SectionMeta[] = [
    { id: "lineage-spec", label: "Lineage & specs" },
    { id: "capabilities", label: "Capabilities" },
    ...(flags.hasComparable ? [{ id: "comparable-models", label: "Comparable models" }] : []),
    { id: "benchmarks", label: "Benchmarks" },
    { id: "pricing", label: "API pricing" },
    ...(flags.hasQuickstart ? [{ id: "getting-started", label: "Getting started" }] : []),
  ];

  const reference: SectionMeta[] = [
    ...(flags.hasCustomSections ? [{ id: "custom-sections", label: "Integration guides" }] : []),
    ...(flags.hasReadme ? [{ id: "readme-docs", label: "Technical readme" }] : []),
    ...(flags.hasEvidence ? [{ id: "provenance", label: "Verified citations" }] : []),
    ...(flags.hasSources ? [{ id: "sources", label: "Sources" }] : []),
  ];

  // Annotated before .filter() — chaining would lose the contextual literal
  // type on `title` and widen it to string.
  const groups: SectionGroup[] = [
    { title: "Understand", items: understand },
    { title: "Evaluate", items: evaluate },
    { title: "Reference", items: reference },
  ];
  return groups.filter((group) => group.items.length > 0);
}

/** Flatten groups into the ordered section list used by the spy + chip bar. */
export function flattenSections(groups: SectionGroup[]): SectionMeta[] {
  return groups.flatMap((group) => group.items);
}
