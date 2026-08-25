"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

/** Small client island for copy-to-clipboard with transient "Copied" feedback. */
export default function CopyButton({
  value,
  label,
  copiedLabel = "Copied",
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : label || `Copy ${value}`}
      className={`text-[var(--muted)] hover:text-[var(--text)] p-0.5 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${className}`}
    >
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {label && <span>{copied ? copiedLabel : label}</span>}
    </button>
  );
}
