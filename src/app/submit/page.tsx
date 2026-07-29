"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, Clipboard, Mail, Check, Sparkle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function SubmitModelPage() {
  const [name, setName] = useState("");
  const [developer, setDeveloper] = useState("");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState("open-weights");
  const [license, setLicense] = useState("Apache-2.0");
  const [primaryTask, setPrimaryTask] = useState("code-generation");
  const [contextWindow, setContextWindow] = useState("128k");
  const [parameters, setParameters] = useState("");
  const [inputPrice, setInputPrice] = useState("");
  const [outputPrice, setOutputPrice] = useState("");
  const [sweBench, setSweBench] = useState("");
  const [aider, setAider] = useState("");
  const [gpqa, setGpqa] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const [copied, setCopied] = useState(false);

  // Generate TOML config in real-time
  const tomlCode = useMemo(() => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    let toml = `[model]\n`;
    toml += `id = "${slug || "model-slug"}"\n`;
    toml += `name = "${name || "Model Name"}"\n`;
    toml += `developer = "${developer || "Developer"}"\n`;
    toml += `releaseDate = "${releaseDate}"\n`;
    toml += `type = "${type}"\n`;
    toml += `status = "active"\n`;
    toml += `vendorApiStatus = "supported"\n`;
    toml += `license = "${license}"\n`;
    
    if (primaryTask) {
      toml += `primaryTask = "${primaryTask}"\n`;
    }
    
    toml += `modalities = ["text"]\n`;
    toml += `contextWindow = "${contextWindow || "Unknown"}"\n`;
    
    if (parameters) {
      toml += `parameters = "${parameters}"\n`;
    }
    
    if (inputPrice || outputPrice) {
      toml += `\n[model.pricing]\n`;
      toml += `input = ${inputPrice ? parseFloat(inputPrice) : 0}\n`;
      toml += `output = ${outputPrice ? parseFloat(outputPrice) : 0}\n`;
    }
    
    if (sweBench || aider || gpqa) {
      toml += `\n[[model.benchmarks]]\n`;
      if (sweBench) {
        toml += `name = "SWE-bench Verified"\nscore = ${parseFloat(sweBench)}\n\n[[model.benchmarks]]\n`;
      }
      if (aider) {
        toml += `name = "Aider Polyglot"\nscore = ${parseFloat(aider)}\n\n[[model.benchmarks]]\n`;
      }
      if (gpqa) {
        toml += `name = "GPQA Diamond"\nscore = ${parseFloat(gpqa)}\n`;
      }
      // Trim trailing markers
      toml = toml.replace(/\n\[\[model\.benchmarks\]\]\n$/, "");
    }
    
    return toml;
  }, [name, developer, releaseDate, type, license, primaryTask, contextWindow, parameters, inputPrice, outputPrice, sweBench, aider, gpqa]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tomlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailSubject = encodeURIComponent(`Model Suggestion: ${name || "New AI Model"}`);
  const emailBody = encodeURIComponent(tomlCode + `\n\nSource URL/Announcement: ${sourceUrl || "Not provided"}`);

  return (
    <div className="bg-[#0C120F] text-[#E2E8E4] min-h-screen relative font-sans overflow-x-hidden">
      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full z-[100]">
        <Navbar theme="dark" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Back Link */}
        <div className="mb-8 text-left">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8C9E91] hover:text-[#E2E8E4] transition-colors border border-[#243629] bg-[#121A15] px-4 py-2 rounded-full backdrop-blur-sm shadow-md"
          >
            <ChevronLeft size={12} />
            Back to Home
          </Link>
        </div>

        {/* Heading */}
        <div className="mb-10 text-left">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4ADE80] mb-3">
            <Sparkle size={12} strokeWidth={2} />
            <span>Community Contributions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Submit an AI Model
          </h1>
          <p className="text-sm text-[#8C9E91] mt-2 max-w-2xl leading-relaxed">
            Fill in the model details to generate a structured TOML configuration snippet. You can copy the code to open a PR on GitHub or email it directly to our curators.
          </p>
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-[#121A15] border border-[#243629] rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Model Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Claude 4.5 Sonnet"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Developer */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Developer</label>
                <input
                  type="text"
                  placeholder="e.g. Anthropic"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Model Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Model Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="open-weights">Open Weights</option>
                  <option value="closed-source">Closed Source</option>
                  <option value="api-only">API Only</option>
                  <option value="research-preview">Research Preview</option>
                </select>
              </div>

              {/* License */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">License</label>
                <input
                  type="text"
                  placeholder="e.g. Apache-2.0 or Custom commercial"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Primary Task */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Primary Task</label>
                <select
                  value={primaryTask}
                  onChange={(e) => setPrimaryTask(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="code-generation">Code Generation</option>
                  <option value="chat-reasoning">Chat Reasoning</option>
                  <option value="multimodal-general">Multimodal General</option>
                  <option value="image-generation">Image Generation</option>
                  <option value="audio-speech">Audio & Speech</option>
                  <option value="text-embeddings">Text Embeddings</option>
                </select>
              </div>

              {/* Context Window */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Context Window</label>
                <input
                  type="text"
                  placeholder="e.g. 128k or 1M"
                  value={contextWindow}
                  onChange={(e) => setContextWindow(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Parameters */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Parameters (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 70B or 1.5T"
                  value={parameters}
                  onChange={(e) => setParameters(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Release Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Release Date</label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-[#243629] pt-5">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Pricing Specs (per 1M tokens in USD)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Input Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 3.00"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Output Price</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15.00"
                    value={outputPrice}
                    onChange={(e) => setOutputPrice(e.target.value)}
                    className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#243629] pt-5">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developer Benchmarks (Verified % scores)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">SWE-bench Verified</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 48.2"
                    value={sweBench}
                    onChange={(e) => setSweBench(e.target.value)}
                    className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Aider Polyglot</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 85.0"
                    value={aider}
                    onChange={(e) => setAider(e.target.value)}
                    className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">GPQA Diamond</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 68.3"
                    value={gpqa}
                    onChange={(e) => setGpqa(e.target.value)}
                    className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#243629] pt-5 flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Source announcement URL</label>
              <input
                type="url"
                placeholder="e.g. https://openai.com/blog/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="bg-[#0C120F] border border-[#243629] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Column: Code Preview & Action Buttons */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            
            {/* Live TOML Preview */}
            <div className="bg-[#121A15] border border-[#243629] rounded-2xl p-5 flex-1 flex flex-col justify-between text-left shadow-lg min-h-[380px] lg:h-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#243629] pb-3 mb-4 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">Live TOML Generator</span>
                <span className="text-[10px] bg-[#1A261D] text-[#4ADE80] border border-[#243629] px-2 py-0.5 rounded font-mono">toml</span>
              </div>

              <pre className="text-[11px] font-mono text-emerald-300 leading-[1.6] select-all bg-[#0C120F] p-4 rounded-xl border border-[#243629] overflow-x-auto flex-1 h-[280px] lg:h-[calc(100%-80px)] scrollbar-thin">
                <code>{tomlCode}</code>
              </pre>
            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-[#4ADE80]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Clipboard size={16} />
                    <span>Copy TOML Code</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:corrections@modelverse.ai?subject=${emailSubject}&body=${emailBody}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-colors cursor-pointer"
              >
                <Mail size={16} />
                <span>Email Curation Team</span>
              </a>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
