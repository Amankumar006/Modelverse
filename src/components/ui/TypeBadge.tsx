const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  "open-weights": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Open Weights",
  },
  "closed-source": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    label: "Closed Source",
  },
  "api-only": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    label: "API Only",
  },
  "research-preview": {
    bg: "bg-orange-50",
    text: "text-orange-700",
    label: "Research Preview",
  },
};

export default function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] ?? {
    bg: "bg-gray-50",
    text: "text-gray-700",
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
