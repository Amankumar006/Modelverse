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
    <div className="not-prose my-6 relative rounded-xl bg-[#18181B] border border-white/5 shadow-xl font-mono text-xs sm:text-sm group">
      {/* Sleek top-right Copy Button */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.8 rounded-md bg-white/5 hover:bg-white/10 active:scale-95 text-zinc-400 hover:text-white transition-all text-[11px] font-sans border border-white/10 cursor-pointer select-none z-10"
        title="Copy code"
      >
        {copied ? (
          <>
            <Check size={11} className="text-emerald-400" />
            <span className="text-emerald-400 font-medium">Copied</span>
          </>
        ) : (
          <>
            <Copy size={11} />
            <span>Copy</span>
          </>
        )}
      </button>

      {/* Code Surface */}
      <div className="p-5 pr-20 overflow-x-auto leading-relaxed bg-[#0E0E10] text-[#E4E4E7] selection:bg-emerald-500/20 selection:text-white rounded-xl">
        <pre className="m-0 p-0 whitespace-pre font-mono text-xs sm:text-sm leading-relaxed tracking-normal">
          <code className="text-[#E4E4E7] bg-transparent p-0 border-0">{code}</code>
        </pre>
      </div>
    </div>
  );
}
