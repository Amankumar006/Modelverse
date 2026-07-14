import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "models");
const INDEX_PATH = path.join(DATA_DIR, "_index.json");

function buildIndex() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json") && f !== "_index.json");
  const index = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // Push minimal index fields
    index.push({
      id: data.id,
      name: data.name,
      slug: data.slug,
      developer: data.developer,
      releaseDate: data.releaseDate,
      type: data.type,
      featured: data.featured,
      boost: data.boost,
      family: data.family,
    });
  }

  // Sort newest first
  index.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  console.log(`Successfully rebuilt index with ${index.length} models.`);
}

buildIndex();
