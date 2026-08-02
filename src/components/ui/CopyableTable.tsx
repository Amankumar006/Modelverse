"use client";

import React, { useState, useRef } from "react";
import { Check, Copy, Table as TableIcon } from "lucide-react";

interface CopyableTableProps {
  title?: string;
  children: React.ReactNode;
  rawText?: string;
  className?: string;
}

export default function CopyableTable({ title = "Data Table", children, rawText, className = "" }: CopyableTableProps) {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCopyTable = async () => {
    try {
      let textToCopy = rawText || "";

      if (!textToCopy && containerRef.current) {
        const table = containerRef.current.querySelector("table");
        if (table) {
          const rows = Array.from(table.querySelectorAll("tr"));
          const rowTexts = rows.map((row) => {
            const cells = Array.from(row.querySelectorAll("th, td"));
            return cells.map((cell) => cell.textContent?.trim() || "").join("\t");
          });
          textToCopy = rowTexts.join("\n");
        } else {
          textToCopy = containerRef.current.textContent?.trim() || "";
        }
      }

      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy table content:", err);
    }
  };

  return (
    <div className={`my-6 rounded-[var(--radius-card)] overflow-hidden bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] ${className}`}>
      {/* Table Control Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg)] border-b border-[var(--muted)]/10 select-none">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
          <TableIcon size={14} className="text-[var(--accent)]" />
          <span>{title}</span>
        </div>

        <button
          onClick={handleCopyTable}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--card-bg)] hover:bg-[var(--accent-soft)] active:scale-95 text-[var(--muted)] hover:text-[var(--text)] transition-all text-xs font-bold border border-[var(--muted)]/10 cursor-pointer shadow-sm"
          title="Copy table data"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[var(--accent)]" />
              <span className="text-[var(--accent)] font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-[var(--muted)]" />
              <span>Copy Table</span>
            </>
          )}
        </button>
      </div>

      {/* Table Content Container */}
      <div ref={containerRef} className="overflow-x-auto p-1 bg-[var(--card-bg)]">
        {children}
      </div>
    </div>
  );
}
