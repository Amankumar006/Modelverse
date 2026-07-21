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
    <div className="my-6 rounded-2xl overflow-hidden bg-[#0F1713] border border-white/10 shadow-2xl font-mono text-xs text-gray-200">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10 text-gray-400 select-none">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#4ADE80]" />
          <span className="font-semibold text-white/80">{filename || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-[11px] font-sans border border-white/10"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[#4ADE80]" />
              <span className="text-[#4ADE80] font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto leading-relaxed bg-[#0C120F] text-gray-200">
        <pre className="m-0 p-0 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
