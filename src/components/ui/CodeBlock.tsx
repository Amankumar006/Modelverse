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

  const getTokens = (lang: string) => {
    if (lang === "python") {
      return [
        { type: "string", regex: /("{3}[\s\S]*?"{3}|'{3}[\s\S]*?'{3}|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.source },
        { type: "comment", regex: /(#[^\n]*)/.source },
        { type: "keyword1", regex: /(\b(?:import|from|as|in|return)\b)/.source },
        { type: "keyword2", regex: /(\b(?:def|class|if|else|elif|for|try|except|pass|with|raise|not|and|or|is|lambda|global|nonlocal|assert|yield|del|break|continue)\b)/.source },
        { type: "builtin", regex: /(\b(?:print|isinstance|sum|len|dict|list|set|tuple|int|str|float|bool|type|open|range|enumerate|zip|map|filter|any|all|max|min|abs|round|super|dir|help)\b)/.source },
        { type: "function", regex: /(\b\w+(?=\s*\())(?!\s*\b(?:if|for|while|with|print|isinstance|sum|len|dict|list|set|tuple|int|str)\b)/.source },
        { type: "decorator", regex: /(@\w+)/.source },
        { type: "number", regex: /(\b\d+(?:\.\d+)?\b)/.source }
      ];
    } else {
      // bash / shell / logs / config
      return [
        { type: "comment", regex: /(#[^\n]*)/.source },
        { type: "string", regex: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.source },
        { type: "keyword1", regex: /(\b(?:sudo|apt-get|npm|npx|node|pip|install|git|run|docker|python|uv|tool|curl|sh|mkdir|rm|cd|echo|export)\b)/.source },
        { type: "keyword2", regex: /(\b(?:default_model|providers|models|provider|max_context_size)\b)/.source },
        { type: "variable", regex: /(\$\w+)/.source },
        { type: "number", regex: /(\b\d+\b)/.source }
      ];
    }
  };

  const renderHighlighted = (rawCode: string, lang: string) => {
    const tokens = getTokens(lang);
    const masterRegex = new RegExp(tokens.map(t => t.regex).join("|"), "g");
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    masterRegex.lastIndex = 0;
    try {
      while ((match = masterRegex.exec(rawCode)) !== null) {
        if (match.index > lastIndex) {
          parts.push(rawCode.slice(lastIndex, match.index));
        }
        
        // Find which group matched
        let groupIndex = -1;
        for (let j = 1; j < match.length; j++) {
          if (match[j] !== undefined) {
            groupIndex = j - 1;
            break;
          }
        }
        
        const value = match[0];
        const tokenType = groupIndex >= 0 ? tokens[groupIndex].type : null;
        
        if (tokenType === "comment") {
          parts.push(<span key={match.index} className="text-[#6A9955] italic">{value}</span>);
        } else if (tokenType === "string") {
          parts.push(<span key={match.index} className="text-[#CE9178]">{value}</span>);
        } else if (tokenType === "keyword1") {
          parts.push(<span key={match.index} className="text-[#C586C0] font-medium">{value}</span>);
        } else if (tokenType === "keyword2") {
          parts.push(<span key={match.index} className="text-[#569CD6] font-medium">{value}</span>);
        } else if (tokenType === "builtin") {
          parts.push(<span key={match.index} className="text-[#4EC9B0]">{value}</span>);
        } else if (tokenType === "function") {
          parts.push(<span key={match.index} className="text-[#DCDCAA]">{value}</span>);
        } else if (tokenType === "decorator") {
          parts.push(<span key={match.index} className="text-[#DCDCAA]">{value}</span>);
        } else if (tokenType === "number") {
          parts.push(<span key={match.index} className="text-[#B5CEA8]">{value}</span>);
        } else if (tokenType === "variable") {
          parts.push(<span key={match.index} className="text-[#9CDCFE]">{value}</span>);
        } else {
          parts.push(value);
        }
        
        lastIndex = masterRegex.lastIndex;
      }
    } catch (err) {
      console.error("Syntax highlighting error:", err);
      return rawCode;
    }
    
    if (lastIndex < rawCode.length) {
      parts.push(rawCode.slice(lastIndex));
    }
    
    return parts;
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
          <code className="text-[#E4E4E7] bg-transparent p-0 border-0">{renderHighlighted(code, language)}</code>
        </pre>
      </div>
    </div>
  );
}
