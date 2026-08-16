/**
 * Extracts official URLs (GitHub, arXiv, official blogs) from a HuggingFace Model Card.
 */

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchReadme(repoId) {
  try {
    const cleanRepo = repoId.replace(/^https?:\/\/huggingface\.co\//, "").replace(/\/$/, "");
    const headers = {
      "User-Agent": BROWSER_UA,
      "Accept": "text/plain,text/markdown,application/json,*/*",
    };
    if (process.env.HF_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.HF_TOKEN}`;
    }

    // 1. Try main branch
    let url = `https://huggingface.co/${cleanRepo}/raw/main/README.md`;
    let response = await fetch(url, { headers });

    // 2. Try master branch if main is 404
    if (!response.ok) {
      url = `https://huggingface.co/${cleanRepo}/raw/master/README.md`;
      response = await fetch(url, { headers });
    }

    if (response.ok) {
      const text = await response.text();
      if (text && text.length > 50) return text;
    }

    // 3. Fallback to HF API model details
    const apiUrl = `https://huggingface.co/api/models/${cleanRepo}`;
    const apiRes = await fetch(apiUrl, { headers });
    if (apiRes.ok) {
      const json = await apiRes.json();
      const card = json.cardData;
      const desc = (card && card.description) || json.description || (card && JSON.stringify(card));
      if (desc && desc.length > 30) {
        return `# ${json.id}\n\n${desc}\n\n${(json.tags || []).join(", ")}`;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error fetching README for ${repoId}:`, error.message);
    return null;
  }
}

function extractUrlsFromMarkdown(markdown) {
  const links = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  
  // Also catch raw URLs not in markdown links
  const rawUrlRegex = /(?<!\()(https?:\/\/(?:github\.com|arxiv\.org|openai\.com|meta\.com|deepmind\.google|mistral\.ai|anthropic\.com|cohere\.com)[^\s\)]+)/g;
  while ((match = rawUrlRegex.exec(markdown)) !== null) {
    if (!links.find(l => l.url === match[1])) {
      links.push({ text: "Raw URL", url: match[1] });
    }
  }

  return links;
}

const OFFICIAL_DOMAINS = [
  "openai.com", "meta.com", "deepmind.google", "mistral.ai", 
  "anthropic.com", "cohere.com", "x.ai", "qwenlm.github.io",
  "ai.meta.com", "google.com"
];

async function extractOfficialUrls(repoId) {
  const markdown = await fetchReadme(repoId);
  if (!markdown) return null;

  const allLinks = extractUrlsFromMarkdown(markdown);
  
  const results = {
    githubUrls: new Set(),
    arxivUrls: new Set(),
    officialBlogUrls: new Set()
  };

  for (const link of allLinks) {
    const url = link.url;
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();
      
      if (hostname === "github.com") {
        // Avoid generic links like github.com/sponsors
        if (!url.includes("/sponsors/") && !url.includes("/features/")) {
          results.githubUrls.add(url);
        }
      } else if (hostname === "arxiv.org") {
        results.arxivUrls.add(url);
      } else {
        // Check if it's an official domain
        for (const domain of OFFICIAL_DOMAINS) {
          if (hostname === domain || hostname.endsWith("." + domain)) {
            // Avoid generic homepage links
            if (parsedUrl.pathname.length > 1) {
              results.officialBlogUrls.add(url);
            }
          }
        }
      }
    } catch (e) {
      // Invalid URL
    }
  }

  return {
    githubUrls: Array.from(results.githubUrls),
    arxivUrls: Array.from(results.arxivUrls),
    officialBlogUrls: Array.from(results.officialBlogUrls)
  };
}

module.exports = { extractOfficialUrls, fetchReadme };

// Allow CLI execution for testing
if (require.main === module) {
  const repoId = process.argv[2] || "meta-llama/Meta-Llama-3-8B";
  console.log(`Extracting official URLs for ${repoId}...`);
  extractOfficialUrls(repoId).then((result) => {
    console.log(JSON.stringify(result, null, 2));
  });
}
