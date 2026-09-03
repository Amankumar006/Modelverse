"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  children?: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "code";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-7 rounded-xl overflow-hidden border border-neutral-800 bg-[#0d1117] text-neutral-200 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800/80 bg-[#161b22] text-xs font-mono text-neutral-400">
        <span className="uppercase tracking-wider font-semibold text-amber-400/90">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[14px] sm:text-[15px] font-mono leading-relaxed">
        <pre>{children}</pre>
      </div>
    </div>
  );
}

export default function MediumArticleBody({ content }: { content: string }) {
  return (
    <article className="w-full max-w-[728px] mx-auto text-[var(--text)] font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight mt-12 mb-5 leading-tight">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl sm:text-[28px] font-bold text-[var(--text)] tracking-tight mt-12 mb-4 pt-6 border-t border-[var(--muted)]/15 leading-snug">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl sm:text-[22px] font-semibold text-[var(--text)] tracking-tight mt-8 mb-3 leading-snug">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-[18px] sm:text-[19px] leading-[1.8] text-[var(--text)]/95 mb-6 font-normal tracking-[-0.003em]">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="my-6 pl-6 space-y-3 list-disc text-[17px] sm:text-[18px] leading-[1.75] text-[var(--text)]/90 marker:text-[var(--accent)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-6 pl-6 space-y-3 list-decimal text-[17px] sm:text-[18px] leading-[1.75] text-[var(--text)]/90 marker:font-bold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-[3.5px] border-[var(--text)] pl-6 italic text-[20px] sm:text-[22px] text-[var(--text)]/90 my-8 leading-relaxed font-serif">
              {children}
            </blockquote>
          ),
          hr: () => (
            <div className="flex items-center justify-center my-10 text-2xl tracking-[0.5em] text-[var(--muted)]/40 select-none">
              ···
            </div>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text)]">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] transition-colors font-medium"
            >
              {children}
            </a>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded-md bg-[var(--card-bg)] border border-[var(--muted)]/20 font-mono text-[14px] text-[var(--accent)] font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto rounded-xl border border-[var(--muted)]/20 shadow-xs">
              <table className="w-full text-left text-sm font-sans border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--card-bg)] border-b border-[var(--muted)]/20 text-xs uppercase font-bold text-[var(--muted)] tracking-wider">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 font-semibold">{children}</th>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-[var(--muted)]/10 last:border-0 hover:bg-[var(--muted)]/5 transition-colors">
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-[var(--text)] leading-relaxed">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
