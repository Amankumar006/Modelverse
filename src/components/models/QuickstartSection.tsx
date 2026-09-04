"use client";

import React, { useState } from "react";
import { Terminal, Copy, Check, Code, BookOpen, Box } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface QuickstartSectionProps {
  model: ModelRow;
}

type TabType = "python" | "node" | "curl" | "cli" | "docker" | "bibtex";

interface TabButtonProps {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  activeTab: TabType;
  onSelect: (id: TabType) => void;
  show?: boolean;
}

function TabButton({ id, label, icon: Icon, activeTab, onSelect, show = true }: TabButtonProps) {
  if (!show) return null;
  const isActive = activeTab === id;
  return (
    <button
      onClick={() => onSelect(id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${isActive ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--muted)]/5"}`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

export default function QuickstartSection({ model }: QuickstartSectionProps) {
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  const [activeTab, setActiveTab] = useState<TabType>("python");
  const [copied, setCopied] = useState(false);

  const modelId = model.slug || model.name || "model";
  const provider = model.provider?.toLowerCase() || "";
  const apiKeyEnv = `${model.provider?.toUpperCase().replace(/\s+/g, '_') || 'API'}_KEY`;

  let pythonCode = "";
  let nodeCode = "";
  let curlCode = "";

  if (provider === "anthropic") {
    pythonCode = `import os\nfrom anthropic import Anthropic\n\nclient = Anthropic(api_key=os.environ.get("${apiKeyEnv}"))\n\nresponse = client.messages.create(\n    model="${modelId}",\n    max_tokens=1024,\n    messages=[\n        {"role": "user", "content": "Explain quantum superposition in 2 sentences."}\n    ]\n)\nprint(response.content[0].text)`;
    nodeCode = `import Anthropic from "@anthropic-ai/sdk";\n\nconst anthropic = new Anthropic({\n  apiKey: process.env.${apiKeyEnv},\n});\n\nasync function main() {\n  const msg = await anthropic.messages.create({\n    model: "${modelId}",\n    max_tokens: 1024,\n    messages: [{ role: "user", content: "Hello world!" }],\n  });\n  console.log(msg.content[0].text);\n}\nmain();`;
    curlCode = `curl https://api.anthropic.com/v1/messages \\\n  -H "x-api-key: $${apiKeyEnv}" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -H "content-type: application/json" \\\n  -d '{\n    "model": "${modelId}",\n    "max_tokens": 1024,\n    "messages": [{"role": "user", "content": "Hello world!"}]\n  }'`;
  } else if (provider === "google") {
    pythonCode = `import os\nfrom google import genai\n\nclient = genai.Client(api_key=os.environ.get("${apiKeyEnv}"))\n\nresponse = client.models.generate_content(\n    model="${modelId}",\n    contents="Explain quantum superposition in 2 sentences.",\n)\nprint(response.text)`;
    nodeCode = `import { GoogleGenAI } from "@google/genai";\n\nconst ai = new GoogleGenAI({ apiKey: process.env.${apiKeyEnv} });\n\nasync function main() {\n  const response = await ai.models.generateContent({\n    model: "${modelId}",\n    contents: "Hello world!",\n  });\n  console.log(response.text);\n}\nmain();`;
    curlCode = `curl "https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=$${apiKeyEnv}" \\\n  -H 'Content-Type: application/json' \\\n  -d '{\n    "contents": [{"parts": [{"text": "Explain quantum superposition in 2 sentences."}]}]\n  }'`;
  } else {
    pythonCode = `import os\nfrom openai import OpenAI\n\nclient = OpenAI(\n    api_key=os.environ.get("${apiKeyEnv}", "EMPTY"),\n    base_url="${isOpenWeights ? 'http://localhost:8000/v1' : 'https://api.openai.com/v1'}"\n)\n\nresponse = client.chat.completions.create(\n    model="${modelId}",\n    messages=[{"role": "user", "content": "Explain quantum superposition in 2 sentences."}]\n)\nprint(response.choices[0].message.content)`;
    nodeCode = `import OpenAI from "openai";\n\nconst openai = new OpenAI({\n  apiKey: process.env.${apiKeyEnv} || "EMPTY",\n  baseURL: "${isOpenWeights ? 'http://localhost:8000/v1' : 'https://api.openai.com/v1'}",\n});\n\nasync function main() {\n  const completion = await openai.chat.completions.create({\n    model: "${modelId}",\n    messages: [{ role: "user", content: "Hello world!" }],\n  });\n  console.log(completion.choices[0].message.content);\n}\nmain();`;
    curlCode = `curl ${isOpenWeights ? 'http://localhost:8000/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions'} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer $${apiKeyEnv}" \\\n  -d '{\n    "model": "${modelId}",\n    "messages": [{"role": "user", "content": "Hello world!"}]\n  }'`;
  }

  const cliCode = isOpenWeights
    ? `# 1. Run with Ollama (Local Zero-Config)\nollama run ${model.slug || modelId}\n\n# 2. Host with vLLM (High-Performance Server)\npython3 -m vllm.entrypoints.openai.api_server --model ${model.slug || modelId} --port 8000`
    : `# Proprietary API Endpoint\n# Use official SDK or cURL commands above to invoke this model.`;

  const dockerCode = isOpenWeights
    ? `version: '3.8'\nservices:\n  vllm:\n    image: vllm/vllm-openai:latest\n    runtime: nvidia\n    ports:\n      - "8000:8000"\n    volumes:\n      - ~/.cache/huggingface:/root/.cache/huggingface\n    environment:\n      - HUGGING_FACE_HUB_TOKEN=\${HF_TOKEN}\n    command: --model ${model.slug || modelId} --gpu-memory-utilization 0.95 --max-model-len ${model.context_window || 4096}`
    : `# Managed Cloud Service\n# No local container manifest required for proprietary models.`;

  const bibtexCode = `@misc{themodelverse_${(model.slug || 'model').replace(/[^a-zA-Z0-9_]/g, '_')},\n  title={${model.name}: Technical Profile and Sizing Specifications},\n  author={${model.provider || 'TheModelverse Research Lab'}},\n  year={${model.release_date ? new Date(model.release_date).getFullYear() : 2025}},\n  publisher={TheModelverse Architecture Database},\n  howpublished={\\url{https://www.themodelverse.in/models/${model.slug}}}\n}`;

  const getActiveCode = () => {
    switch (activeTab) {
      case "python": return pythonCode;
      case "node": return nodeCode;
      case "curl": return curlCode;
      case "cli": return cliCode;
      case "docker": return dockerCode;
      case "bibtex": return bibtexCode;
      default: return "";
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
          <span>Integration &amp; Deployment</span>
        </div>
        <button onClick={handleCopy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15 text-xs font-medium text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer">
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          <span>{copied ? "Copied!" : "Copy Code"}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--muted)]/10 pb-2">
        <TabButton id="python" label="Python" icon={Code} activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton id="node" label="Node.js" icon={Code} activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton id="curl" label="cURL" icon={Terminal} activeTab={activeTab} onSelect={setActiveTab} />
        <TabButton id="cli" label="Local CLI" icon={Terminal} activeTab={activeTab} onSelect={setActiveTab} show={isOpenWeights} />
        <TabButton id="docker" label="Docker" icon={Box} activeTab={activeTab} onSelect={setActiveTab} show={isOpenWeights} />
        <TabButton id="bibtex" label="BibTeX" icon={BookOpen} activeTab={activeTab} onSelect={setActiveTab} />
      </div>

      <div className="relative rounded-[var(--radius-control)] bg-[#1a1714] text-[#f5efe6] p-4 overflow-x-auto font-mono text-[13px] leading-relaxed border border-[#332c25] transition-opacity duration-300">
        <pre className="whitespace-pre-wrap break-words">{getActiveCode()}</pre>
      </div>
    </section>
  );
}
