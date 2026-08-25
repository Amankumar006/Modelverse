import React from "react";
import { normalizeCustomSections } from "@/lib/model-normalization";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import CodeBlock from "@/components/ui/CodeBlock";
import { BookOpen } from "lucide-react";

interface CustomSectionsViewProps {
  customSections: unknown;
}

export default function CustomSectionsView({ customSections }: CustomSectionsViewProps) {
  const sections = normalizeCustomSections(customSections);

  if (sections.length === 0) return null;

  return (
    <section id="custom-sections" className="section-anchor space-y-8 pt-6 border-t border-[var(--muted)]/10">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
        <BookOpen size={14} />
        <span>Developer Capabilities &amp; Integration Guides</span>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <article
            key={section.id || idx}
            id={section.id}
            className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 border border-[var(--muted)]/10 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[var(--muted)]/10 pb-3">
              <h3 className="text-xl font-extrabold text-[var(--text)] tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-4 bg-[var(--accent)] rounded-full" />
                {section.title}
              </h3>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded-[var(--radius-control)] border border-[var(--muted)]/10">
                Guide
              </span>
            </div>

            {section.content && (
              <div className="text-sm text-[var(--text)] leading-relaxed font-normal prose prose-invert max-w-none">
                <MarkdownRenderer content={section.content} />
              </div>
            )}

            {section.code && (
              <div className="mt-4">
                <CodeBlock
                  language={section.language || "python"}
                  code={section.code}
                  filename={`${section.id}.${section.language === "javascript" ? "js" : section.language === "typescript" ? "ts" : section.language === "bash" || section.language === "curl" ? "sh" : "py"}`}
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
