import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose max-w-none text-[var(--text)] prose-headings:font-extrabold prose-headings:text-[var(--text)] prose-a:text-[var(--accent)] hover:prose-a:underline font-sans">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks & inline code
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="!bg-[var(--tag-bg)] !text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-mono text-xs font-bold border border-[var(--muted)]/10"
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
          
          strong({ children }) {
            return <strong className="font-bold text-[var(--text)]">{children}</strong>;
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

          // Tables (Styled like "Comparable models")
          table({ children }) {
            return (
              <div className="my-8 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
                <table className="w-full text-left text-xs sm:text-sm font-sans text-[var(--muted)]">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10 text-[var(--text)] font-bold">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-[var(--muted)]/10">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return <tr className="hover:bg-[var(--bg)] transition-colors">{children}</tr>;
          },
          th({ children }) {
            return <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text)]">{children}</th>;
          },
          td({ children }) {
            return <td className="p-3.5 text-[var(--text)] font-normal leading-relaxed">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
