"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  code: string;
  filename?: string;
}

export default function CodeBlock({ language = "bash", code, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div className="my-6 rounded-2xl overflow-hidden bg-[#0A0F0D] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-mono text-xs sm:text-sm">
      {/* Terminal Window Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.04] border-b border-white/10 select-none">
        {/* macOS Window Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]/80 hover:bg-[#FF5F56] transition-colors border border-black/20 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/80 hover:bg-[#FFBD2E] transition-colors border border-black/20 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]/80 hover:bg-[#27C93F] transition-colors border border-black/20 inline-block" />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-sans text-gray-300">
            <Terminal size={12} className="text-[#4ADE80]" />
            <span className="font-medium text-white/90">{filename || language}</span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-gray-300 hover:text-white transition-all text-xs font-sans border border-white/10 cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[#4ADE80]" />
              <span className="text-[#4ADE80] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-gray-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Surface */}
      <div className="p-5 overflow-x-auto leading-relaxed bg-[#060908] text-gray-200 selection:bg-[#4ADE80]/30 selection:text-white">
        <pre className="m-0 p-0 whitespace-pre font-mono text-xs sm:text-sm leading-relaxed tracking-normal">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
