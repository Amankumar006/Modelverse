const { extractOfficialUrls } = require("./extract-official-urls");

// Utility to fetch raw text with timeout
async function fetchRawText(url, timeoutMs = 5000) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    return null;
  }
}

// Convert a github repo URL to its raw README.md URL
async function fetchGithubReadme(githubUrl) {
  // e.g. https://github.com/meta-llama/llama3
  let rawUrl = githubUrl.replace("github.com", "raw.githubusercontent.com");
  // Some github urls might end with / or .git
  rawUrl = rawUrl.replace(/\/$/, "").replace(/\.git$/, "");
  
  // Try main first, then master
  let md = await fetchRawText(`${rawUrl}/main/README.md`);
  if (!md) {
    md = await fetchRawText(`${rawUrl}/master/README.md`);
  }
  return md;
}

// Scrape basic text from an official blog
async function fetchBlogText(blogUrl) {
  try {
    const html = await fetchRawText(blogUrl, 10000);
    if (!html) return null;
    // Strip scripts, styles, and html tags to get raw text for LLM
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    text = text.replace(/<[^>]+>/g, " ");
    return text.replace(/\s+/g, " ").trim();
  } catch(e) {
    return null;
  }
}

/**
 * Given a HuggingFace repo ID, traverses to the absolute deepest official source
 * (Official Blog -> GitHub -> HuggingFace README) and returns the Markdown/Text.
 */
async function crawlDeepOfficialSource(hfRepoId) {
  if (!hfRepoId) return null;

  // 1. Get the URLs from the Hugging Face README
  const urls = await extractOfficialUrls(hfRepoId);
  if (!urls) return null; // Couldn't even get HF README

  // 2. Prioritize Official Blogs first (they usually have the clearest benchmark tables & press release)
  if (urls.officialBlogUrls && urls.officialBlogUrls.length > 0) {
    console.log(`    🌐 Crawling Official Blog: ${urls.officialBlogUrls[0]}`);
    const blogText = await fetchBlogText(urls.officialBlogUrls[0]);
    if (blogText && blogText.length > 500) return blogText;
  }

  // 3. Fallback to GitHub README
  if (urls.githubUrls && urls.githubUrls.length > 0) {
    console.log(`    🐙 Crawling Official GitHub: ${urls.githubUrls[0]}`);
    const ghText = await fetchGithubReadme(urls.githubUrls[0]);
    if (ghText && ghText.length > 500) return ghText;
  }

  // 4. Final Fallback: The original HuggingFace README itself
  console.log(`    🤗 Crawling HuggingFace README as fallback: ${hfRepoId}`);
  const { fetchReadme } = require("./extract-official-urls");
  return await fetchReadme(hfRepoId);
}

module.exports = { crawlDeepOfficialSource };

// Allow CLI execution for testing
if (require.main === module) {
  const repoId = process.argv[2] || "meta-llama/Meta-Llama-3-8B";
  console.log(`Crawling deepest source for ${repoId}...`);
  crawlDeepOfficialSource(repoId).then((result) => {
    if (result) {
      console.log(`\nSuccessfully extracted ${result.length} characters of raw text.`);
    } else {
      console.log("\nFailed to extract any text.");
    }
  });
}
