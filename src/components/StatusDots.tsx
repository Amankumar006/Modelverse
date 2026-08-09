import React from 'react';
import clsx from 'clsx';

export type StatusValue = 'VERIFIED' | 'LIKELY' | 'DRAFT' | 'DISPUTED' | 'pending' | 'approved' | 'dismissed';

interface StatusDotsProps {
  status: StatusValue;
  className?: string;
}

export default function StatusDots({ status, className }: StatusDotsProps) {
  let dot1 = 'bg-daylight-muted opacity-20'; // largest
  let dot2 = 'bg-daylight-muted opacity-20'; // medium
  let dot3 = 'bg-daylight-muted opacity-20'; // smallest

  switch (status) {
    case 'VERIFIED':
    case 'approved':
      dot1 = 'bg-daylight-accent';        // coral
      dot2 = 'bg-[#A56B2C]';              // amber
      dot3 = 'bg-[#E0B47C]';              // pale
      break;
    case 'LIKELY':
      dot1 = 'bg-daylight-muted opacity-20';
      dot2 = 'bg-[#A56B2C]';
      dot3 = 'bg-[#E0B47C]';
      break;
    case 'DRAFT':
    case 'pending':
      dot1 = 'bg-daylight-muted opacity-20';
      dot2 = 'bg-daylight-muted opacity-20';
      dot3 = 'bg-[#E0B47C]';
      break;
    case 'DISPUTED':
    case 'dismissed':
      dot1 = 'bg-daylight-accent animate-pulse';
      dot2 = 'bg-daylight-muted opacity-20';
      dot3 = 'bg-daylight-muted opacity-20';
      break;
  }

  return (
    <div className={clsx("flex items-center space-x-1.5", className)} aria-label={`Status: ${status}`} title={`Status: ${status}`}>
      <div className={clsx("w-3 h-3 rounded-full transition-colors", dot1)} />
      <div className={clsx("w-2.5 h-2.5 rounded-full transition-colors", dot2)} />
      <div className={clsx("w-2 h-2 rounded-full transition-colors", dot3)} />
    </div>
  );
}
