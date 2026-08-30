"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Models", href: "/models" },
  { label: "Articles", href: "/articles" },
  { label: "Compare", href: "/compare" },
  { label: "Timeline", href: "/timeline" },
  { label: "About", href: "/about" },
];

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const getLinkClasses = (href: string) => {
    const isActive = href === "/" ? pathname === "/" : pathname?.startsWith(href);
    return isActive
      ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]";
  };

  return (
    <div className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`px-3 py-1.5 rounded-[var(--radius-pill)] text-xs transition-all font-medium ${getLinkClasses(item.href)}`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
