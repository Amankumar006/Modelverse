import React from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-lg prose-invert max-w-none prose-headings:font-display prose-headings:font-normal prose-h1:text-4xl prose-h2:text-3xl prose-a:text-brand-orange hover:prose-a:text-brand-orange/80 prose-a:no-underline hover:prose-a:underline prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-img:rounded-xl">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
