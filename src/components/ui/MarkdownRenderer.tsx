import React from "react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

function isTableBlock(block: string): boolean {
  const lines = block.trim().split("\n");
  if (lines.length < 2) return false;
  const line0 = lines[0].trim();
  const line1 = lines[1].trim();
  return (
    line0.startsWith("|") &&
    line0.endsWith("|") &&
    line1.startsWith("|") &&
    line1.includes("---")
  );
}

function parseTableBlock(block: string): TableData {
  const lines = block.trim().split("\n");
  const headers = lines[0]
    .trim()
    .slice(1, -1)
    .split("|")
    .map((s) => s.trim());

  const rows: string[][] = [];
  // Skip line 0 (header) and line 1 (separator)
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("|")) {
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((s) => s.trim());
      rows.push(cells);
    }
  }

  return { headers, rows };
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Split markdown by double line breaks to isolate table blocks from paragraph text
  const blocks = content.split(/\n\s*\n/);

  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-[#4ADE80] hover:prose-a:text-[#38bdf8] prose-a:no-underline hover:prose-a:underline">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (isTableBlock(trimmed)) {
          const { headers, rows } = parseTableBlock(trimmed);
          return (
            <div
              key={bIdx}
              className="my-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-xl"
            >
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-white/10 border-b border-white/10 text-white font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3.5 text-white font-bold">
                        <ReactMarkdown components={{ p: "span" }}>{h}</ReactMarkdown>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-[#0C120F]">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/5 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3.5 text-gray-300 leading-normal">
                          <ReactMarkdown components={{ p: "span" }}>{cell}</ReactMarkdown>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <ReactMarkdown
            key={bIdx}
            components={{
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
                return <ol className="list-decimal list-inside space-y-2 my-4 text-gray-300">{children}</ol>;
              },
              li({ children }) {
                return <li className="text-gray-300 leading-relaxed">{children}</li>;
              },
            }}
          >
            {block}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
