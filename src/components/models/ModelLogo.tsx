"use client";

import { useState } from "react";
import Image from "next/image";

export default function ModelLogo({
  logo,
  name,
  developer,
  size = 44,
  className = "",
}: {
  logo?: string | null;
  name: string;
  developer: string;
  size?: number;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const initial = (developer || name || "M").charAt(0).toUpperCase();

  if (!logo || error || (!logo.startsWith("/") && !logo.startsWith("http"))) {
    return (
      <div
        className={`rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 text-emerald-400 font-bold flex items-center justify-center border border-emerald-500/20 shadow-inner flex-shrink-0 select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <span className="text-sm font-semibold">{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <Image
        src={logo}
        alt={name}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
