import React from "react";

interface StatusBadgeProps {
  status?: "active" | "deprecated" | "sunset";
  vendorApiStatus?: "active" | "deprecated" | "sunset";
}

export default function StatusBadge({ status, vendorApiStatus }: StatusBadgeProps) {
  if (vendorApiStatus === "sunset") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
        Vendor API Retired
      </span>
    );
  }

  if (vendorApiStatus === "deprecated") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Vendor API Deprecated
      </span>
    );
  }

  if (status === "sunset") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        Sunset / Retired
      </span>
    );
  }

  if (status === "deprecated") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
        Deprecated
      </span>
    );
  }

  return null;
}
