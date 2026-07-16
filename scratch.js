const fs = require('fs');

const indexData = JSON.parse(fs.readFileSync('data/models/_index.json', 'utf8'));
const googleData = JSON.parse(fs.readFileSync('help/google_models.json', 'utf8'));

// Slugify function similar to what we used for Anthropic
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Format new models
const newModels = googleData.map(m => {
  const slug = m.id || slugify(m.developer + '-' + m.name);
  return {
    id: slug,
    slug: slug,
    ...m,
    links: {
      website: m.website || "",
      paper: m.paper || "",
      huggingface: m.huggingFace || "",
      github: m.github || "",
      blogPost: m.blogPost || ""
    }
  };
});

// Remove existing ones with same slug
const existingSlugs = new Set(newModels.map(m => m.slug));
const filteredIndex = indexData.filter(m => !existingSlugs.has(m.slug));

// Append new
const updatedIndex = [...filteredIndex, ...newModels];
fs.writeFileSync('data/models/_index.json', JSON.stringify(updatedIndex, null, 2));
console.log('Added Google models.');
