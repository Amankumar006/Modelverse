import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/models/chat', destination: '/models/openai-gpt-4o', permanent: true },
      { source: '/models/chatgpt-4o', destination: '/models/openai-gpt-4o', permanent: true },
      { source: '/models/chatgpt-image', destination: '/models/openai-dall-e-3', permanent: true },
      { source: '/models/babbage-002', destination: '/models/davinci-002', permanent: true },
      { source: '/models/computer-use', destination: '/models/openai-computer-using-agent', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn-uploads.huggingface.co' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'docs.perplexity.ai' },
      { protocol: 'https', hostname: 'huggingface.co' },
      { protocol: 'https', hostname: 'ko-fi.com' },
      { protocol: 'https', hostname: 'mistral.ai' },
      { protocol: 'https', hostname: 'openai.com' },
      { protocol: 'https', hostname: 'openrouter.ai' },
      { protocol: 'https', hostname: 'phaseo.app' },
      { protocol: 'https', hostname: 'platform.claude.com' },
      { protocol: 'https', hostname: 'poolside.ai' },
      { protocol: 'https', hostname: 'techcrunch.com' },
      { protocol: 'https', hostname: 'www.anthropic.com' },
      { protocol: 'https', hostname: 'www.marktechpost.com' },
      { protocol: 'https', hostname: 'www.themodelverse.in' },
      { protocol: 'https', hostname: 'www.upstage.ai' },
      { protocol: 'https', hostname: 'youtu.be' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://fundingchoicesmessages.google.com https://www.googletagmanager.com https://ep2.adtrafficquality.google; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://googleads.g.doubleclick.net https://ep2.adtrafficquality.google https://www.google.com;",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
