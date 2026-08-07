import fs from "fs";
import path from "path";
import { ModelSchema } from "../data/schema/model.schema";
import { DEVELOPERS } from "../data/schema/developers";
import { LICENSES } from "../data/schema/licenses";

function validateFile(filePath: string): boolean {
  if (path.basename(filePath).startsWith("_")) {
    return true;
  }
  console.log(`Validating: ${path.basename(filePath)}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File does not exist at ${filePath}`);
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(raw);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error(`Error: Failed to parse JSON: ${e.message}`);
    return false;
  }

  const result = ModelSchema.safeParse(data);

  if (result.success) {
    console.log(`✓ Validated successfully!`);
    return true;
  }

  // Handle errors and special validation warning flags for unrecognized developers or licenses
  let hasErrors = false;
  const issues = result.error.issues;

  for (const issue of issues) {
    const pathStr = issue.path.join(".");
    
    if (pathStr === "developer" && (issue.code as string) === "invalid_enum_value") {
      const received = data.developer;
      console.warn(`\n[WARNING] Unrecognized developer: "${received}" in ${path.basename(filePath)}`);
      console.warn(`Please confirm if this is a typo or if it should be added to data/schema/developers.ts`);
      console.warn(`Allowed developers: ${DEVELOPERS.filter(d => d !== "Other").join(", ")}\n`);
      
      // If they used a fallback or we want to flag it instead of hard failing:
      // We will count it as a warning but not a hard failure if they use "Other" or if it is flagged.
      // But since developer is z.enum(DEVELOPERS), it is technically a Zod error.
      hasErrors = true;
    } else if (pathStr === "license" && (issue.code as string) === "invalid_enum_value") {
      const received = data.license;
      console.warn(`\n[WARNING] Unrecognized license: "${received}" in ${path.basename(filePath)}`);
      console.warn(`Please confirm if this is a typo or if it should be added to data/schema/licenses.ts`);
      console.warn(`Allowed licenses: ${LICENSES.filter(l => l !== "Other/Custom").join(", ")}\n`);
      
      hasErrors = true;
    } else {
      console.error(`Error in [${pathStr}]: ${issue.message}`);
      hasErrors = true;
    }
  }

  return !hasErrors;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: npx tsx scripts/validate-model.ts <file-path-1> <file-path-2> ...");
    process.exit(1);
  }

  // Expand wildcards manually if needed (handled by shell mostly)
  let allSuccess = true;
  for (const filePath of args) {
    const success = validateFile(filePath);
    if (!success) {
      allSuccess = false;
    }
  }

  if (!allSuccess) {
    console.error("\nValidation failed.");
    process.exit(1);
  }

  console.log("\nAll files passed validation successfully.");
}

main();
