/**
 * scripts/generate-brand-logos.js
 * 
 * Generates lightweight, crisp SVG brand logos in public/logos/
 * to guarantee 100% local availability for all referenced model developers.
 */

const fs = require("fs");
const path = require("path");

const LOGOS_DIR = path.join(__dirname, "../public/logos");

if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

const BRAND_SVGS = {
  "openai.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
  <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.98 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zM8.307 15.347l-2.02-1.164a.08.08 0 0 1-.038-.057V8.543a4.5 4.5 0 0 1 7.37-3.454l-.142.08L8.7 7.928a.795.795 0 0 0-.393.681v6.738z"/>
</svg>`,
  "anthropic.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
  <path d="M17.472 3.125h-3.957l6.528 17.75h3.957L17.472 3.125zm-10.944 0L0 20.875h3.957l1.378-3.784h6.398l1.379 3.784h3.957L10.53 3.125H6.528zm.056 10.972l2.02-5.545 2.02 5.545H6.584z"/>
</svg>`,
  "google.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
</svg>`,
  "google-deepmind.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path fill="#4285F4" d="M12 2L2 7l10 5 10-5-10-5zm0 9l-8-4v6l8 4 8-4v-6l-8 4zm0 6l-8-4v3l8 4 8-4v-3l-8 4z"/>
</svg>`,
  "meta.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0081FB">
  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
</svg>`,
  "mistral.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <rect width="4" height="4" x="2" y="2" fill="#FF7000"/>
  <rect width="4" height="4" x="18" y="2" fill="#FF7000"/>
  <rect width="4" height="4" x="2" y="6" fill="#FF7000"/>
  <rect width="4" height="4" x="6" y="6" fill="#FF7000"/>
  <rect width="4" height="4" x="14" y="6" fill="#FF7000"/>
  <rect width="4" height="4" x="18" y="6" fill="#FF7000"/>
  <rect width="4" height="4" x="2" y="10" fill="#FF7000"/>
  <rect width="4" height="4" x="6" y="10" fill="#FF7000"/>
  <rect width="4" height="4" x="10" y="10" fill="#FF7000"/>
  <rect width="4" height="4" x="14" y="10" fill="#FF7000"/>
  <rect width="4" height="4" x="18" y="10" fill="#FF7000"/>
  <rect width="4" height="4" x="2" y="14" fill="#FF7000"/>
  <rect width="4" height="4" x="10" y="14" fill="#FF7000"/>
  <rect width="4" height="4" x="18" y="14" fill="#FF7000"/>
  <rect width="4" height="4" x="2" y="18" fill="#FF7000"/>
  <rect width="4" height="4" x="18" y="18" fill="#FF7000"/>
</svg>`,
  "alibaba.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF6A00">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.93V18h-2v-1.07c-2.45-.49-4-2.22-4-4.43h2.1c0 1.34 1.01 2.35 2.4 2.35 1.35 0 2.2-.82 2.2-1.92 0-1.3-1.02-1.78-2.67-2.3-2.18-.68-3.53-1.63-3.53-3.56 0-1.95 1.5-3.53 3.5-3.95V2h2v1.08c2.09.43 3.5 1.95 3.6 3.92h-2.1c-.13-1.12-.95-1.85-2-1.85-1.15 0-1.9.72-1.9 1.68 0 1.15.85 1.62 2.4 2.15 2.4.82 3.8 1.78 3.8 3.82 0 2.22-1.64 3.73-3.8 4.13z"/>
</svg>`,
  "deepseek.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0066FF">
  <circle cx="12" cy="12" r="10" fill="#0066FF"/>
  <path d="M7 12l3.5 4 6.5-8" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  "cohere.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#39594C">
  <circle cx="12" cy="12" r="9" fill="#39594C"/>
  <circle cx="12" cy="12" r="4" fill="#D5E4D8"/>
</svg>`,
  "microsoft.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022"/>
  <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00"/>
  <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF"/>
  <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900"/>
</svg>`,
  "xai.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
</svg>`,
  "nvidia.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#76B900">
  <path d="M8.94 4.79C4.83 5.48 1.7 8.87 1.7 13.06c0 4.6 3.73 8.33 8.33 8.33 3.9 0 7.18-2.69 8.08-6.32h-3.41c-.72 1.84-2.52 3.14-4.67 3.14-2.76 0-5-2.24-5-5 0-2.45 1.76-4.5 4.1-4.92V4.79z"/>
  <circle cx="15" cy="9" r="2.5" fill="#76B900"/>
</svg>`,
  "stability.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#8B5CF6">
  <circle cx="6" cy="12" r="4" fill="#8B5CF6"/>
  <circle cx="18" cy="12" r="4" fill="#8B5CF6"/>
  <circle cx="12" cy="6" r="3" fill="#8B5CF6"/>
  <circle cx="12" cy="18" r="3" fill="#8B5CF6"/>
</svg>`,
  "moonshot.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#00D26A">
  <circle cx="12" cy="12" r="9" stroke="#00D26A" stroke-width="2" fill="none"/>
  <path d="M12 5a7 7 0 1 0 7 7 5.5 5.5 0 0 1-7-7z" fill="#00D26A"/>
</svg>`,
  "bytedance.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#3B82F6">
  <rect x="3" y="3" width="7" height="18" rx="2" fill="#3B82F6"/>
  <rect x="14" y="8" width="7" height="13" rx="2" fill="#60A5FA"/>
</svg>`,
  "minimax.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#EC4899">
  <circle cx="12" cy="12" r="10" fill="#EC4899"/>
  <path d="M7 14l5-6 5 6" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round"/>
</svg>`,
  "tencent.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0052D9">
  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3.5 13.5l-3.5-2.1-3.5 2.1 1-3.9-3-2.6 4-.3L12 5l1.5 3.7 4 .3-3 2.6z"/>
</svg>`,
  "midjourney.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
  <path d="M12 2L2 19h20L12 2zm0 5l5.5 10h-11L12 7z"/>
</svg>`,
  "runway.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#10B981">
  <path d="M3 20l9-16 9 16H3zm9-11.5L6.5 17h11L12 8.5z"/>
</svg>`,
  "suno.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#F59E0B">
  <circle cx="12" cy="12" r="9" fill="#F59E0B"/>
  <path d="M9 8v8l7-4-7-4z" fill="#FFFFFF"/>
</svg>`,
  "apple.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.94-.92.04-2.02.62-2.67 1.38-.58.67-1.09 1.76-.95 2.82 1.02.08 2.05-.48 2.68-1.26z"/>
</svg>`,
  "bfl.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#18181B">
  <rect width="24" height="24" rx="4" fill="#18181B"/>
  <path d="M6 18V6h6a3 3 0 0 1 0 6 3 3 0 0 1 0 6H6zm2-8h4a1 1 0 0 0 0-2H8v2zm0 6h4a1 1 0 0 0 0-2H8v2z" fill="#FAFAFA"/>
</svg>`,
  "kuaishou.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FF5000">
  <rect width="24" height="24" rx="6" fill="#FF5000"/>
  <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
</svg>`,
  "sakana.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#EF4444">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14L12 14.5 7.5 16l1-5-3.5-3.5 5-.5L12 3l2 4 5 .5-3.5 3.5 1 5z"/>
</svg>`,
  "academic.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#4B5563">
  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
</svg>`,
  "huggingface.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFD21E">
  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm-3 7a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 9 9zm6 0a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 15 9zm-3 8a5 5 0 0 1-4.24-2.35.75.75 0 0 1 1.28-.79 3.5 3.5 0 0 0 5.92 0 .75.75 0 0 1 1.28.79A5 5 0 0 1 12 17z"/>
</svg>`,
};

for (const [filename, svgContent] of Object.entries(BRAND_SVGS)) {
  const filePath = path.join(LOGOS_DIR, filename);
  fs.writeFileSync(filePath, svgContent.trim(), "utf8");
  console.log(`✅ Generated logo: public/logos/${filename}`);
}

console.log(`\n🎉 Generated ${Object.keys(BRAND_SVGS).length} brand logo SVGs successfully.`);
