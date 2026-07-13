"use client";

import { useState } from "react";

function DeveloperTile({ developer }: { developer: string }) {
  const [imageError, setImageError] = useState(false);
  
  // Create initials fallback: take first letter of first two words
  const initials = developer
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const logoFilename = developer.toLowerCase().replace(/ /g, "-");
  const logoUrl = `/logos/${logoFilename}.svg`;

  return (
    <div
      className="liquid-glass h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center shrink-0 border border-white/[0.08] relative group/tile"
      title={developer}
    >
      {!imageError ? (
        <img
          src={logoUrl}
          alt={developer}
          onError={() => setImageError(true)}
          className="h-6 w-6 sm:h-7 sm:w-7 object-contain opacity-75 group-hover/tile:opacity-100 transition-opacity"
        />
      ) : (
        <span className="text-xs font-bold text-white/50 group-hover/tile:text-white/80 transition-colors font-mono select-none">
          {initials}
        </span>
      )}
    </div>
  );
}

export default function DeveloperMarquee({ developers }: { developers: string[] }) {
  // Duplicate list to ensure wide scrolling track is fully populated
  const duplicatedDevs = [...developers, ...developers, ...developers];

  return (
    <div className="space-y-3 overflow-hidden py-1 relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      {/* Row 1: Left */}
      <div className="flex gap-3 w-max animate-marquee-left">
        {duplicatedDevs.map((dev, idx) => (
          <DeveloperTile key={`left-${dev}-${idx}`} developer={dev} />
        ))}
      </div>
      {/* Row 2: Right */}
      <div className="flex gap-3 w-max animate-marquee-right">
        {duplicatedDevs.map((dev, idx) => (
          <DeveloperTile key={`right-${dev}-${idx}`} developer={dev} />
        ))}
      </div>
    </div>
  );
}
