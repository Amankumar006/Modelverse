"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface QuickstartSectionProps {
  model: ModelRow;
}

export default function QuickstartSection({ model }: QuickstartSectionProps) {
  const [activeTab, setActiveTab] = useState<"curl" | "python" | "node">("python");
  const [copied, setCopied] = useState(false);

  const modelId = model.slug;

  const pythonCode = `import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("${model.provider.toUpperCase()}_API_KEY"),
)

response = client.chat.completions.create(
    model="${modelId}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum superposition in 2 sentences."}
    ],
    temperature=0.7,
)

print(response.choices[0].message.content)`;

  const curlCode = `curl https://api.${model.provider.toLowerCase().replace(/\s+/g, '')}.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $${model.provider.toUpperCase()}_API_KEY" \\
  -d '{
    "model": "${modelId}",
    "messages": [
      {"role": "user", "content": "Hello world!"}
    ]
  }'`;

  const nodeCode = `import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.${model.provider.toUpperCase()}_API_KEY,
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: "${modelId}",
    messages: [{ role: "user", content: "Hello world!" }],
  });

  console.log(completion.choices[0].message.content);
}

main();`;

  const getActiveCode = () => {
    switch (activeTab) {
      case "python":
        return pythonCode;
      case "curl":
        return curlCode;
      case "node":
        return nodeCode;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <Terminal size={16} />
          <span>API Quickstart Integration</span>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15 text-xs text-[var(--text)] hover:border-[var(--accent)] transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          <span>{copied ? "Copied!" : "Copy Snippet"}</span>
        </button>
      </div>

      {/* Language Switcher Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--muted)]/10 pb-2">
        <button
          onClick={() => setActiveTab("python")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
            activeTab === "python"
              ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          Python SDK
        </button>
        <button
          onClick={() => setActiveTab("node")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
            activeTab === "node"
              ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          TypeScript / Node
        </button>
        <button
          onClick={() => setActiveTab("curl")}
          className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
            activeTab === "curl"
              ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold"
              : "text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          cURL
        </button>
      </div>

      {/* Code Viewer */}
      <div className="relative rounded-[var(--radius-control)] bg-[#1a1714] text-[#f5efe6] p-4 overflow-x-auto font-mono text-xs leading-relaxed border border-[#332c25]">
        <pre>{getActiveCode()}</pre>
      </div>
    </section>
  );
}
