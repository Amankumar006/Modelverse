"use client";

import React from "react";
import Image from "next/image";

interface ModelverseLogoProps {
  variant?: "horizontal" | "icon";
  height?: number;
  size?: number;
  className?: string;
  priority?: boolean;
}

export default function ModelverseLogo({
  variant = "horizontal",
  height = 34,
  size = 34,
  className = "",
  priority = false,
}: ModelverseLogoProps) {
  if (variant === "icon") {
    const iconSize = size;
    return (
      <div
        className={`relative overflow-hidden shrink-0 ${className}`}
        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
      >
        <Image
          src="/logos/android-chrome-192.png"
          alt="TheModelverse"
          width={iconSize}
          height={iconSize}
          priority={priority}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  const calcWidth = Math.round(height * 4);

  return (
    <div className={`relative shrink-0 flex items-center ${className}`}>
      {/* Dark Theme Logo */}
      <Image
        src="/logos/logo-horizontal-dark@2x.png"
        alt="TheModelverse"
        width={calcWidth}
        height={height}
        priority={priority}
        className="hidden dark:block w-auto h-auto max-h-[42px] object-contain"
        style={{ height: `${height}px`, width: "auto" }}
      />
      {/* Light Theme Logo */}
      <Image
        src="/logos/logo-horizontal-light@2x.png"
        alt="TheModelverse"
        width={calcWidth}
        height={height}
        priority={priority}
        className="block dark:hidden w-auto h-auto max-h-[42px] object-contain"
        style={{ height: `${height}px`, width: "auto" }}
      />
    </div>
  );
}
