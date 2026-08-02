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
    <div className="prose max-w-none text-[var(--text)] prose-headings:font-extrabold prose-headings:text-[var(--text)] prose-a:text-[var(--accent)] hover:prose-a:underline font-sans">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (isTableBlock(trimmed)) {
          const { headers, rows } = parseTableBlock(trimmed);
          return (
            <CopyableTable key={bIdx} title="Specification Matrix">
              <table className="w-full min-w-full text-left border-collapse text-xs sm:text-sm font-sans">
                <thead className="bg-[var(--accent-soft)]/30 border-b border-[var(--muted)]/10 text-[var(--text)] font-extrabold uppercase tracking-wider text-[11px]">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="p-3.5 text-[var(--text)] font-extrabold text-left">
                        <ReactMarkdown components={{ p: "span" }}>{h}</ReactMarkdown>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--muted)]/10 bg-[var(--card-bg)]">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[var(--bg)] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-3.5 text-[var(--text)] font-normal leading-relaxed">
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
                      className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-mono text-xs font-bold border border-[var(--muted)]/10"
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
                  <blockquote className="my-8 p-5 rounded-[var(--radius-card)] bg-[var(--accent-soft)]/20 border-l-4 border-[var(--accent)] border-y border-r border-[var(--muted)]/10 text-[var(--text)] text-base sm:text-lg leading-relaxed not-italic font-medium shadow-[var(--shadow-card)]">
                    {children}
                  </blockquote>
                );
              },

              // Images
              img({ src, alt }) {
                return (
                  <figure className="my-8 text-center">
                    <div className="inline-block rounded-[var(--radius-card)] border border-[var(--muted)]/10 overflow-hidden shadow-[var(--shadow-card)] bg-[var(--card-bg)] p-1">
                      <img
                        src={src}
                        alt={alt || "Illustration"}
                        className="max-w-full h-auto rounded-[var(--radius-control)] object-cover max-h-[550px] mx-auto"
                      />
                    </div>
                    {alt && <figcaption className="text-xs text-[var(--muted)] mt-2 font-medium">{alt}</figcaption>}
                  </figure>
                );
              },

              // Headings
              h1({ children }) {
                return (
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] mt-10 mb-5 pb-3 border-b border-[var(--muted)]/10 flex items-center gap-2">
                    {children}
                  </h1>
                );
              },
              h2({ children }) {
                return (
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text)] mt-10 mb-4 pb-2 border-b border-[var(--muted)]/10 flex items-center gap-2">
                    {children}
                  </h2>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="text-xl font-bold text-[var(--text)] mt-8 mb-3">
                    {children}
                  </h3>
                );
              },

              // Paragraphs & Lists
              p({ children }) {
                return <p className="text-[var(--text)] text-base sm:text-lg leading-relaxed my-5 font-normal">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-outside ml-6 space-y-3 my-5 text-[var(--text)] text-base sm:text-lg leading-relaxed">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-outside ml-6 space-y-3 my-5 text-[var(--text)] text-base sm:text-lg leading-relaxed">{children}</ol>;
              },
              li({ children }) {
                return <li className="text-[var(--text)] text-base sm:text-lg leading-relaxed pl-1">{children}</li>;
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
