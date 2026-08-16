"use client";

import React, { useState, useRef } from "react";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import {
  Bold,
  Italic,
  Heading3,
  List,
  ListOrdered,
  Code,
  Sparkles,
  Eye,
  Edit3,
  Link as LinkIcon,
} from "lucide-react";

interface MarkdownFieldEditorProps {
  label: string;
  sublabel?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  minChars?: number;
  highlightBorder?: boolean;
}

export function autoFormatBullets(rawText: string): string {
  if (!rawText || !rawText.trim()) return rawText;

  let text = rawText.trim();

  // 1. Separate common concatenated sections (e.g. "What It IsOpen-Weights" -> "### What It Is\n\n- Open-Weights")
  const sectionKeywords = [
    "What It Is",
    "Main Strengths",
    "Key Capabilities",
    "Quick Technical Specs",
    "Technical Specifications",
    "Architectural Highlights",
    "Core Capabilities",
    "Model Overview",
    "Deployment Notes",
    "Target Hardware",
    "Strengths & Limitations",
    "Benchmark Summary",
  ];

  for (const kw of sectionKeywords) {
    const regex = new RegExp(`(^|\\n|\\.)\\s*(${kw})([A-Z0-9\\-–—•])`, "gi");
    text = text.replace(regex, `$1\n\n### $2\n\n$3`);
  }

  // 2. Identify run-on sentences with capital labels like "Google DeepMind.Instruction-Tuned (IT):" -> "Google DeepMind.\n- **Instruction-Tuned (IT)**:"
  text = text.replace(/\.\s*([A-Z][A-Za-z0-9\s()/\-–—]{2,40}):\s*/g, ".\n- **$1**: ");

  // 3. Identify lines and format them
  const lines = text.split("\n");
  const formattedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("#") || trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
      return trimmed;
    }
    // Match "Label: Description" or "Label (Extra): Description"
    const kvMatch = trimmed.match(/^([A-Za-z0-9\s()/\-–—]+?):\s*(.+)$/);
    if (kvMatch && kvMatch[1].length < 40) {
      return `- **${kvMatch[1].trim()}**: ${kvMatch[2].trim()}`;
    }
    return trimmed;
  });

  return formattedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export default function MarkdownFieldEditor({
  label,
  sublabel,
  value,
  onChange,
  placeholder,
  rows = 5,
  minChars,
  highlightBorder,
}: MarkdownFieldEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (prefix: string, suffix: string = "", defaultText: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = value || "";
    const selected = currentVal.substring(start, end);

    let replacement = "";
    if (selected) {
      // If wrapping multi-line selection for lists
      if (prefix === "- " || prefix === "1. ") {
        const lines = selected.split("\n");
        replacement = lines
          .map((l, i) =>
            prefix === "1. "
              ? `${i + 1}. ${l.replace(/^(\d+\.\s*|-\s*|\*\s*)/, "")}`
              : `- ${l.replace(/^(\d+\.\s*|-\s*|\*\s*)/, "")}`
          )
          .join("\n");
      } else {
        replacement = `${prefix}${selected}${suffix}`;
      }
    } else {
      replacement = `${prefix}${defaultText}${suffix}`;
    }

    const newVal = currentVal.substring(0, start) + replacement + currentVal.substring(end);
    onChange(newVal);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + (selected.length || defaultText.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleAutoFormat = () => {
    const formatted = autoFormatBullets(value || "");
    onChange(formatted);
  };

  const charCount = (value || "").length;
  const isSatisfied = minChars ? charCount >= minChars : true;

  return (
    <div className="space-y-2">
      {/* Field Header */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            {label}
          </label>
          {sublabel && <p className="text-[11px] text-[var(--muted)]/80 mt-0.5">{sublabel}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* Char Counter */}
          <span
            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-[var(--radius-pill)] ${
              minChars && !isSatisfied
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-[var(--muted)] bg-[var(--bg)] border border-[var(--muted)]/10"
            }`}
          >
            {charCount} chars {minChars ? `(min ${minChars})` : ""}
          </span>

          {/* Write / Preview Tab Pill */}
          <div className="flex items-center p-0.5 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-bold transition-all cursor-pointer ${
                tab === "write"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <Edit3 size={11} /> Write
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[11px] font-bold transition-all cursor-pointer ${
                tab === "preview"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-xs"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              <Eye size={11} /> Preview
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      {tab === "write" ? (
        <div className="space-y-0">
          {/* Markdown Formatting Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-t-[var(--radius-control)] bg-[var(--bg)] border border-b-0 border-[var(--muted)]/20 text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyFormatting("**", "**", "bold text")}
                className="p-1.5 rounded hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Bold (**text**)"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("*", "*", "italic text")}
                className="p-1.5 rounded hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Italic (*text*)"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => applyFormatting("\n### ", "\n", "Heading Title")}
                className="p-1.5 rounded hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Section Heading (### Title)"
              >
                <Heading3 size={13} />
              </button>

              <div className="h-3.5 w-px bg-[var(--muted)]/20 mx-1" />

              <button
                type="button"
                onClick={() => applyFormatting("- ", "", "Bullet item")}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--muted)]/15 text-[var(--text)] hover:border-[var(--accent)] font-bold text-[11px] transition-colors cursor-pointer"
                title="Convert lines to bullet list (- item)"
              >
                <List size={13} className="text-[var(--accent)]" /> Bullet List
              </button>

              <button
                type="button"
                onClick={() => applyFormatting("1. ", "", "Numbered item")}
                className="flex items-center gap-1 px-2 py-1 rounded bg-[var(--card-bg)] border border-[var(--muted)]/15 text-[var(--text)] hover:border-[var(--accent)] font-bold text-[11px] transition-colors cursor-pointer"
                title="Convert lines to numbered list (1. item)"
              >
                <ListOrdered size={13} className="text-[var(--accent)]" /> Numbered List
              </button>

              <button
                type="button"
                onClick={() => applyFormatting("`", "`", "code")}
                className="p-1.5 rounded hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Inline Code (`code`)"
              >
                <Code size={13} />
              </button>

              <button
                type="button"
                onClick={() => applyFormatting("[", "](https://...)", "link text")}
                className="p-1.5 rounded hover:bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                title="Link ([text](url))"
              >
                <LinkIcon size={13} />
              </button>
            </div>

            {/* Smart Auto-Format Bullets Button */}
            <button
              type="button"
              onClick={handleAutoFormat}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent-soft)]/80 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
              title="Automatically convert run-on sentences or Key: Value lines into clean Markdown bullet points & headings"
            >
              <Sparkles size={12} /> Auto-Structure Bullets
            </button>
          </div>

          <textarea
            ref={textareaRef}
            rows={rows}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full rounded-b-[var(--radius-control)] bg-[var(--bg)] border border-t-0 border-[var(--muted)]/20 px-3.5 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all font-sans leading-relaxed ${
              highlightBorder ? "border-amber-500/30 focus:border-amber-500" : ""
            }`}
          />
        </div>
      ) : (
        /* Live Markdown Preview */
        <div
          className={`w-full rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 p-4 min-h-[140px] text-sm text-[var(--text)] overflow-y-auto ${
            highlightBorder ? "border-amber-500/30" : ""
          }`}
        >
          {value && value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-xs text-[var(--muted)] italic">Nothing to preview. Enter markdown content above.</p>
          )}
        </div>
      )}
    </div>
  );
}
