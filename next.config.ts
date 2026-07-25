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
      { protocol: 'https', hostname: '**' },
    ],
  },
};
export default nextConfig;
