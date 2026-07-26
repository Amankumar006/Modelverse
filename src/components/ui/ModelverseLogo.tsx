import React from "react";

interface ModelverseLogoProps {
  size?: number;
  className?: string;
}

export default function ModelverseLogo({ size = 28, className = "" }: ModelverseLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Primary Modelverse Terracotta-to-Gold Gradient */}
        <linearGradient id="mvGradPrimaryComponent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="35%" stopColor="#DA7756" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>

      {/* Constellation Network Connections (Background Mesh) */}
      <path
        d="M 22 75 L 36 30 L 50 58 L 64 30 L 78 75"
        stroke="url(#mvGradPrimaryComponent)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <path
        d="M 36 30 L 50 38 L 64 30"
        stroke="url(#mvGradPrimaryComponent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.75"
        strokeDasharray="2 3"
      />
      <path
        d="M 28 55 L 50 38 L 72 55"
        stroke="url(#mvGradPrimaryComponent)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M 22 75 L 50 58 L 78 75"
        stroke="url(#mvGradPrimaryComponent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 36 30 L 50 78 L 64 30"
        stroke="url(#mvGradPrimaryComponent)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Neural Network Node Points */}
      <circle cx="22" cy="75" r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="36" cy="30" r="5" fill="#DA7756" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="50" cy="58" r="5.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="64" cy="30" r="5" fill="#DA7756" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="78" cy="75" r="4.5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="50" cy="38" r="3.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1" />

      {/* Orbit / Sparkle Accents */}
      <path d="M 50 16 L 52 22 L 58 24 L 52 26 L 50 32 L 48 26 L 42 24 L 48 22 Z" fill="#F59E0B" />
      <path d="M 74 18 L 75 21 L 78 22 L 75 23 L 74 26 L 73 23 L 70 22 L 73 21 Z" fill="#DA7756" opacity="0.85" />
      <path d="M 26 22 L 27 24 L 29 25 L 27 26 L 26 28 L 25 26 L 23 25 L 25 24 Z" fill="#3B82F6" opacity="0.75" />
    </svg>
  );
}
