"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Cpu } from "lucide-react";

interface ModelLogoProps {
  logo?: string | null;
  name: string;
  developer: string;
  size?: "sm" | "md" | "lg";
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

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  // Get initial letters for fallback avatar
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

  if (logo && !imgError) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 border border-white/15 bg-white/5 ${sizeClasses[size]} ${className}`}
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

  // Fallback monogram badge
  const initials = getInitials(developer, name);

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-bold tracking-tight bg-gradient-to-br from-[#121A15] to-[#1e2e25] text-[#4ADE80] border border-[#4ADE80]/30 shadow-[0_0_12px_rgba(74,222,128,0.15)] ${sizeClasses[size]} ${className}`}
      title={`${name} by ${developer}`}
    >
      {initials ? (
        <span>{initials}</span>
      ) : (
        <Cpu size={iconSizes[size]} className="text-[#4ADE80]" />
      )}
    </div>
  );
}
