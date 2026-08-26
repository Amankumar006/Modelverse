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
