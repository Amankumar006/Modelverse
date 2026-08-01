"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Cpu } from "lucide-react";

interface ModelLogoProps {
  logo?: string | null;
  name: string;
  developer: string;
  size?: "sm" | "md" | "lg" | number;
  className?: string;
}

export default function ModelLogo({
  logo,
  name,
  developer,
  size = "md",
  className = "",
}: ModelLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses: Record<string, string> = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const iconSizes: Record<string, number> = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const isNumericSize = typeof size === "number";
  const inlineStyle = isNumericSize ? { width: `${size}px`, height: `${size}px` } : undefined;
  const sizeClass = isNumericSize ? "text-sm" : sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;
  const iconSize = isNumericSize ? Math.max(14, Math.floor(size * 0.45)) : iconSizes[size as keyof typeof iconSizes] || 18;

  const getInitials = (devStr: string, modelNameStr: string) => {
    if (devStr.toLowerCase().includes("nvidia")) return "NV";
    if (devStr.toLowerCase().includes("google") || devStr.toLowerCase().includes("deepmind")) return "G";
    if (devStr.toLowerCase().includes("openai")) return "AI";
    if (devStr.toLowerCase().includes("meta")) return "M";
    if (devStr.toLowerCase().includes("anthropic")) return "A";
    if (devStr.toLowerCase().includes("mistral")) return "M";
    if (devStr.toLowerCase().includes("alibaba") || devStr.toLowerCase().includes("qwen")) return "Q";
    if (devStr.toLowerCase().includes("cohere")) return "C";

    const cleanName = modelNameStr.replace(/[^a-zA-Z0-9]/g, "");
    return cleanName.slice(0, 2).toUpperCase() || "AI";
  };

  if (logo && !imgError && (logo.startsWith("/") || logo.startsWith("http"))) {
    return (
      <div
        style={inlineStyle}
        className={`relative rounded-full overflow-hidden shrink-0 border border-[var(--muted)]/20 bg-[var(--card-bg)] shadow-sm ${sizeClass} ${className}`}
      >
        <Image
          src={logo}
          alt={name}
          fill
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  const initials = getInitials(developer, name);

  return (
    <div
      style={inlineStyle}
      className={`rounded-full shrink-0 flex items-center justify-center font-extrabold tracking-tight bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 shadow-sm ${sizeClass} ${className}`}
      title={`${name} by ${developer}`}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <Cpu size={iconSize} className="text-[var(--accent)]" />
      )}
    </div>
  );
}
