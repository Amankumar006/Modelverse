import fs from "fs";
import path from "path";
import { ModelSchema } from "../data/schema/model.schema";
import { DEVELOPERS } from "../data/schema/developers";
import { LICENSES } from "../data/schema/licenses";

interface TriageItem {
  name: string;
  link: string;
  devName: string;
  institution?: string;
  reason: string;
}

const triageResultsPath = path.join(__dirname, "triage_results.json");
const modelsDir = path.join(__dirname, "..", "data", "models");

function getPrimaryTask(name: string): any {
  const norm = name.toLowerCase();
  if (norm.includes("robot") || norm.includes("agent") || norm.includes("action")) return "agentic";
  if (norm.includes("image") || norm.includes("relight") || norm.includes("draw")) return "image-generation";
  if (norm.includes("video") || norm.includes("motion") || norm.includes("phys")) return "video-generation";
  if (norm.includes("audio") || norm.includes("tts") || norm.includes("speech") || norm.includes("music") || norm.includes("voice")) return "audio-speech";
  if (norm.includes("code") || norm.includes("program")) return "code-generation";
  return "other";
}

function getModality(name: string): string[] {
  const norm = name.toLowerCase();
  const modalities = ["text"];
  if (norm.includes("image") || norm.includes("relight") || norm.includes("view") || norm.includes("3d") || norm.includes("human") || norm.includes("avatar")) {
    modalities.push("image");
  }
  if (norm.includes("video") || norm.includes("motion") || norm.includes("phys")) {
    modalities.push("video");
  }
  if (norm.includes("audio") || norm.includes("tts") || norm.includes("speech") || norm.includes("music") || norm.includes("voice")) {
    modalities.push("audio");
  }
  return modalities;
}

async function main() {
  if (!fs.existsSync(triageResultsPath)) {
    console.error("Error: triage_results.json not found in scratch folder");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(triageResultsPath, "utf-8"));
  const includes: TriageItem[] = data.include;

  console.log(`Starting ingestion of ${includes.length} validated candidates...`);

  let successCount = 0;

  for (const item of includes) {
    const cleanName = item.name.replace(/\s*\(.*\)/g, "").trim();
    let developer = item.devName;
    let institution = item.institution || "";

    if (institution.toLowerCase() === "nvidia") {
      developer = "NVIDIA";
      institution = "";
    } else if (institution.toLowerCase() === "apple") {
      developer = "Apple";
      institution = "";
    } else if (institution.toLowerCase() === "stability-ai" || institution.toLowerCase() === "stability ai") {
      developer = "Stability AI";
      institution = "";
    }
    
    // Ensure developer is in DEVELOPERS enum
    if (!DEVELOPERS.includes(developer as any)) {
      developer = "Other";
    }

    let id = "";
    let slug = "";
    const nameSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (developer === "Academic/Research") {
      id = `academic-research-${nameSlug}`;
      slug = `academic-research-${nameSlug}`;
    } else {
      const devSlug = developer.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      id = `${devSlug}-${nameSlug}`;
      slug = `${devSlug}-${nameSlug}`;
    }

    id = id.replace(/-+/g, "-").replace(/(^-|-$)/g, "");
    slug = slug.replace(/-+/g, "-").replace(/(^-|-$)/g, "");

    const primaryTask = getPrimaryTask(cleanName);
    const modality = getModality(cleanName);

    const modelJson: any = {
      id,
      name: cleanName,
      slug,
      developer,
      releaseDate: "2026-07-15",
      updatedAt: "2026-07-15",
      type: "research-preview",
      modality,
      primaryTask,
      deployment: ["self-hostable"],
      license: "Other/Custom",
      parameters: "undisclosed",
      contextWindow: "undisclosed",
      description: `A research preview model focusing on ${primaryTask.replace("-", " ")}: ${cleanName}. Published by ${institution || developer}.`,
      keyFeatures: [],
      benchmarks: [],
      family: null,
      previousVersion: null,
      links: {
        "Website": item.link
      },
      logo: null,
      tags: ["research-preview", primaryTask],
      sources: [item.link],
      verified: false,
      featured: false,
      boost: 1,
      curatorNotes: `Ingested research preview via bulk triage. Affiliation: ${institution || developer}. Traction signal: Initial release.`
    };

    if (institution) {
      modelJson.institution = institution;
    }

    // Validate against schema
    const validationResult = ModelSchema.safeParse(modelJson);
    if (!validationResult.success) {
      console.error(`❌ Validation failed for ${id}:`);
      console.error(validationResult.error.issues);
      process.exit(1);
    }

    const targetPath = path.join(modelsDir, `${id}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(modelJson, null, 2));
    successCount++;
  }

  console.log(`\n🎉 Ingested and validated ${successCount} models successfully!`);
}

main().catch(console.error);
