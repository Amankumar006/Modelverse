"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ClientBackButton({
  fallbackHref,
  fallbackLabel,
}: {
  fallbackHref: string;
  fallbackLabel: string;
}) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && document.referrer.includes(window.location.host)) {
      setCanGoBack(true);
    }
  }, []);

  if (canGoBack) {
    return (
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs text-[#6f6f6f] hover:text-[#0a0a0a] transition-colors group mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
      >
        <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        Back to previous
      </button>
    );
  }

  return (
    <Link
      href={fallbackHref}
      className="inline-flex items-center gap-1.5 text-xs text-[#6f6f6f] hover:text-[#0a0a0a] transition-colors group mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/50 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
    >
      <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
      Back to {fallbackLabel}
    </Link>
  );
}
