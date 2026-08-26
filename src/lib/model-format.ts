/* ------------------------------------------------------------------ */
/*  Pure model display formatters                                      */
/*                                                                     */
/*  Kept free of any DB/network imports (unlike `models.ts`, which     */
/*  creates a module-scope Supabase client) so client components can   */
/*  use them without pulling @supabase/supabase-js into the bundle.    */
/* ------------------------------------------------------------------ */

/** Format parameters display string including active parameters if present */
export function formatParameters(model: { parameters?: string | unknown; activeParameters?: string | unknown }): string {
  if (!model.parameters) return "Undisclosed";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let p: any = model.parameters;
  if (typeof p === "object" && p !== null) {
    if (Array.isArray(p)) {
      if (p.length > 0 && typeof p[0] === 'object') {
        p = "Undisclosed";
      } else {
        p = p.join(" / ");
      }
    } else {
      p = Object.values(p).join(" / ");
    }
  }

  p = String(p);

  if (model.activeParameters) {
    const active = String(model.activeParameters).toLowerCase().includes("active")
      ? String(model.activeParameters)
      : `${model.activeParameters} active`;
    if (p.includes("(") || p.toLowerCase().includes("active")) {
      return p;
    }
    return `${p} (${active})`;
  }
  return p;
}

/** Flatten modality array or object to string array */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getModalities(mod: any): string[] {
  if (Array.isArray(mod)) return mod;
  if (typeof mod === "object" && mod !== null) {
    const allMods = new Set<string>();
    if (mod.input && Array.isArray(mod.input)) {
      mod.input.forEach((m: string) => allMods.add(m));
    }
    if (mod.output && Array.isArray(mod.output)) {
      mod.output.forEach((m: string) => allMods.add(m));
    }
    return Array.from(allMods);
  }
  return [];
}

/** Compact token count for display: 128000 → "128K", 1500000 → "1.5M" */
function formatTokenCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (n >= 1_000) {
    const k = n / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return n.toLocaleString("en-US");
}

/**
 * Human-readable context window. Sources store several shapes — plain
 * strings, bare numbers, and objects keyed by native/tokens/max — and the
 * raw-JSON fallback this replaces rendered `{"tokens":128000}` straight into
 * the stat tiles.
 */
export function formatContextWindow(
  contextWindow?: string | number | Record<string, unknown> | null,
): string {
  if (contextWindow === null || contextWindow === undefined || contextWindow === "") {
    return "Undisclosed";
  }
  if (typeof contextWindow === "number") {
    const formatted = formatTokenCount(contextWindow);
    return formatted ? `${formatted} tokens` : "Undisclosed";
  }
  if (typeof contextWindow === "object") {
    // Known key conventions first, then any finite numeric value on the record.
    const preferred = contextWindow as { native?: unknown; tokens?: unknown; max?: unknown };
    const candidate =
      [preferred.native, preferred.tokens, preferred.max].find(
        (v) => typeof v === "number" && Number.isFinite(v),
      ) ??
      Object.values(contextWindow).find(
        (v) => typeof v === "number" && Number.isFinite(v),
      );
    if (typeof candidate === "number") {
      const formatted = formatTokenCount(candidate);
      if (formatted) return `${formatted} tokens`;
    }
    return "Undisclosed";
  }
  return String(contextWindow);
}
