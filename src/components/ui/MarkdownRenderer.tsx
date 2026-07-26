import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import CopyableTable from "./CopyableTable";

interface MarkdownRendererProps {
  content: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

function splitMarkdownBlocks(content: string): string[] {
  const lines = content.split("\n");
  const blocks: string[] = [];
  let currentBlock: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      currentBlock.push(line);
      continue;
    }

    if (inCodeBlock) {
      currentBlock.push(line);
      continue;
    }

    if (trimmed === "" && currentBlock.length > 0) {
      blocks.push(currentBlock.join("\n"));
      currentBlock = [];
    } else if (trimmed !== "") {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join("\n"));
  }

  return blocks;
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
  const blocks = splitMarkdownBlocks(content);

  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-[#4ADE80] hover:prose-a:text-[#38bdf8] prose-a:no-underline hover:prose-a:underline">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (isTableBlock(trimmed)) {
          const { headers, rows } = parseTableBlock(trimmed);
          return (
            <CopyableTable key={bIdx} title="Specification Table">
              <table className="w-full min-w-full text-left border-collapse text-xs sm:text-sm">
                <thead className="bg-[#16221B] border-b border-[#243629] text-[#4ADE80] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3.5 text-[#4ADE80] font-bold text-left">
                        <ReactMarkdown components={{ p: "span" }}>{h}</ReactMarkdown>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#243629] bg-[#0C120F]">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#15211B] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3.5 text-gray-300 leading-normal">
                          <ReactMarkdown components={{ p: "span" }}>{cell}</ReactMarkdown>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CopyableTable>
          );
        }

        return (
          <ReactMarkdown
            key={bIdx}
            remarkPlugins={[remarkGfm]}
            components={{
              // Code blocks & inline code
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code
                      className="bg-[#1A261D] text-[#4ADE80] px-2 py-0.5 rounded-md font-mono text-sm border border-[#243629] font-medium"
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
                  <blockquote className="my-8 p-5 rounded-2xl bg-[#121A15] border-l-4 border-[#4ADE80] border-y border-r border-[#243629] text-[#E2E8E4] text-base sm:text-lg leading-relaxed not-italic font-normal shadow-sm">
                    {children}
                  </blockquote>
                );
              },

              // Images
              img({ src, alt }) {
                return (
                  <figure className="my-8 text-center">
                    <div className="inline-block rounded-2xl border border-[#243629] overflow-hidden shadow-2xl bg-[#0C120F] p-1">
                      <img
                        src={src}
                        alt={alt || "Illustration"}
                        className="max-w-full h-auto rounded-xl object-cover max-h-[550px] mx-auto"
                      />
                    </div>
                    {alt && <figcaption className="text-xs text-[#9CA3AF] mt-2 font-medium">{alt}</figcaption>}
                  </figure>
                );
              },

              // Headings
              h1({ children }) {
                return (
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F0FDF4] mt-10 mb-5 pb-3 border-b border-[#243629] flex items-center gap-2">
                    {children}
                  </h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-10 mb-4 pb-2 border-b border-[#243629]/60 flex items-center gap-2">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-xl font-semibold text-[#4ADE80] mt-8 mb-3">
                    {children}
                  </h3>
                );
              },

              // Paragraphs & Lists
              p({ children }) {
                return <p className="text-[#F3F4F6] text-lg sm:text-[19px] leading-[1.85] my-5 font-normal">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-outside ml-6 space-y-3 my-5 text-[#F3F4F6] text-base sm:text-lg leading-[1.8]">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-outside ml-6 space-y-3 my-5 text-[#F3F4F6] text-base sm:text-lg leading-[1.8]">{children}</ol>;
              },
              li({ children }) {
                return <li className="text-[#F3F4F6] text-base sm:text-lg leading-[1.8] pl-1">{children}</li>;
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
