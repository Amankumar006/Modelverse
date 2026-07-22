import React from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-[#4ADE80] hover:prose-a:text-[#38bdf8] prose-a:no-underline hover:prose-a:underline">
      <ReactMarkdown
        components={{
          // Styled Table (if HTML/MD table elements rendered)
          table({ children }) {
            return (
              <div className="my-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-xl">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-white/10 border-b border-white/10 text-white font-semibold uppercase tracking-wider text-[11px]">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-white/10 bg-[#0C120F]">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-white/5 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="p-3.5 text-white font-bold">{children}</th>;
          },
          td({ children }) {
            return <td className="p-3.5 text-gray-300 leading-normal">{children}</td>;
          },

          // Code blocks & inline code
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="bg-white/10 text-[#4ADE80] px-1.5 py-0.5 rounded font-mono text-xs border border-white/10 font-medium"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : "bash"}
                code={String(children).replace(/\n$/, "")}
              />
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          // Callout / Blockquote
          blockquote({ children }) {
            return (
              <blockquote className="my-6 p-4 rounded-xl bg-[#4ADE80]/5 border-l-4 border-[#4ADE80] text-gray-300 text-sm leading-relaxed not-italic font-normal shadow-sm">
                {children}
              </blockquote>
            );
          },

          // Images
          img({ src, alt }) {
            return (
              <figure className="my-8 text-center">
                <div className="inline-block rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-black/40 p-1">
                  <img
                    src={src}
                    alt={alt || "Illustration"}
                    className="max-w-full h-auto rounded-xl object-cover max-h-[500px] mx-auto"
                  />
                </div>
                {alt && <figcaption className="text-xs text-gray-400 mt-2 font-medium">{alt}</figcaption>}
              </figure>
            );
          },

          // Headings
          h1({ children }) {
            return (
              <h1 className="text-3xl font-bold tracking-tight text-white mt-10 mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-2xl font-bold tracking-tight text-white mt-8 mb-4 flex items-center gap-2">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-lg font-semibold text-[#4ADE80] mt-6 mb-3">
                {children}
              </h3>
            );
          },

          // Paragraphs & Lists
          p({ children }) {
            return <p className="text-gray-300 text-base leading-relaxed my-4">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside space-y-2 my-4 text-gray-300">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside space-y-2 my-4 text-gray-300">{ol => children}</ol>;
          },
          li({ children }) {
            return <li className="text-gray-300 leading-relaxed">{children}</li>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
