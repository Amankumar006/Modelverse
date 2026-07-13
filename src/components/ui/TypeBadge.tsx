const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "open-weights": {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    label: "Open Weights",
  },
  "closed-source": {
    bg: "bg-violet-500/15",
    text: "text-violet-400",
    label: "Closed Source",
  },
  "api-only": {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    label: "API Only",
  },
  "research-preview": {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    label: "Research Preview",
  },
};

export default function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] ?? {
    bg: "bg-white/10",
    text: "text-white/70",
    label: type,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
