"use client";

import React from "react";
import Image from "next/image";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { getProviderLogo } from "@/lib/logos";
import type { ModelRow, ArticleRow } from "@/types/database";

export interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
}

interface CommandPaletteItemProps {
  type: "model" | "article" | "action" | "provider";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CommandPaletteItem({
  type,
  item,
  isSelected,
  onSelect,
}: CommandPaletteItemProps) {
  const baseClasses = `flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
    isSelected
      ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm"
      : "hover:bg-[var(--card-bg)] text-[var(--text)]"
  }`;

  if (type === "model") {
    const model = item as ModelRow;
    const logo = getProviderLogo(model.provider);

    return (
      <div onClick={onSelect} className={baseClasses}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 border ${
            isSelected ? "bg-white/20 border-white/30" : "bg-[var(--bg)] border-[var(--muted)]/15"
          }`}>
            <Image src={logo} alt={model.provider} width={18} height={18} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold truncate">{model.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                isSelected ? "bg-white/20 text-white" : "bg-[var(--tag-bg)] text-[var(--tag-text)]"
              }`}>
                {model.category}
              </span>
            </div>
            <p className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
              {model.provider} • {model.parameters || "Weights"} • {model.context_window?.toLocaleString("en-US")} ctx
            </p>
          </div>
        </div>
        <ChevronRight size={14} className={isSelected ? "text-white" : "text-[var(--muted)]/50"} />
      </div>
    );
  }

  if (type === "article") {
    const article = item as ArticleRow;
    return (
      <div onClick={onSelect} className={baseClasses}>
        <div className="min-w-0 pr-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold truncate">{article.title}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
              isSelected ? "bg-white/20 text-white" : "bg-[var(--accent-soft)] text-[var(--accent)]"
            }`}>
              {article.category || "Analysis"}
            </span>
          </div>
          <p className={`text-[11px] truncate ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
            {article.source_name ? `${article.source_name} • ` : ""}{article.summary || article.title}
          </p>
        </div>
        <ArrowUpRight size={14} className={isSelected ? "text-white" : "text-[var(--muted)]/50"} />
      </div>
    );
  }

  // Quick Action Item
  const action = item as ActionItem;
  return (
    <div onClick={onSelect} className={baseClasses}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-white/20" : "bg-[var(--card-bg)] text-[var(--accent)]"}`}>
          {action.icon}
        </div>
        <div>
          <span className="text-xs font-bold block">{action.title}</span>
          <span className={`text-[11px] ${isSelected ? "text-white/80" : "text-[var(--muted)]"}`}>
            {action.subtitle}
          </span>
        </div>
      </div>
      <ChevronRight size={14} className={isSelected ? "text-white" : "text-[var(--muted)]/50"} />
    </div>
  );
}
