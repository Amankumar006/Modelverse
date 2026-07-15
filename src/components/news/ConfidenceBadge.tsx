import React from "react";

export type ConfidenceType = "confirmed" | "reported" | "rumor" | "community-discussion";

interface ConfidenceBadgeProps {
  confidence?: ConfidenceType;
  className?: string;
}

export default function ConfidenceBadge({ confidence = "confirmed", className = "" }: ConfidenceBadgeProps) {
  if (confidence === "confirmed") {
    return null;
  }

  let label = "";
  let styles = "";

  switch (confidence) {
    case "reported":
      label = "Reported";
      styles = "bg-blue-50/70 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
      break;
    case "rumor":
      label = "Rumor";
      styles = "bg-amber-50/70 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      break;
    case "community-discussion":
      label = "Community";
      styles = "bg-purple-50/70 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30";
      break;
    default:
      return null;
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border select-none ${styles} ${className}`}
    >
      {label}
    </span>
  );
}
