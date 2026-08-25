/**
 * Module-customization hooks letting plain `node tests/*.test.js` scripts
 * dynamic-import the repo's TypeScript sources, whose internal relative
 * imports are written extensionless (bundler-style resolution).
 *
 * Loaded via `module.register()` from the requiring test script.
 */
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (
      err?.code === "ERR_MODULE_NOT_FOUND" &&
      (specifier.startsWith("./") || specifier.startsWith("../"))
    ) {
      for (const candidate of [`${specifier}.ts`, `${specifier}/index.ts`]) {
        try {
          return await next(candidate, context);
        } catch {
          // Try the next candidate.
        }
      }
    }
    throw err;
  }
}
