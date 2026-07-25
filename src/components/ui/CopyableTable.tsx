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
    <div className={`my-6 rounded-2xl overflow-hidden bg-[#0F1713] border border-[#243629] shadow-xl ${className}`}>
      {/* Table Control Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#16221B] border-b border-[#243629] select-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E2E8E4]">
          <TableIcon size={14} className="text-[#4ADE80]" />
          <span>{title}</span>
        </div>

        <button
          onClick={handleCopyTable}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0C120F] hover:bg-[#1A261D] active:scale-95 text-[#9CA3AF] hover:text-white transition-all text-xs font-mono border border-[#243629] cursor-pointer"
          title="Copy table data"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[#4ADE80]" />
              <span className="text-[#4ADE80] font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} className="text-[#9CA3AF]" />
              <span>Copy Table</span>
            </>
          )}
        </button>
      </div>

      {/* Table Content Container */}
      <div ref={containerRef} className="overflow-x-auto p-1 bg-[#0C120F]">
        {children}
      </div>
    </div>
  );
}
