"use client";

import React, { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface ShareBarProps {
  title: string;
  url?: string;
  type?: "model" | "news" | "generic";
  variant?: "inline" | "header" | "card";
  className?: string;
}

export function RedditIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-4.566 3.875c-.12 0-.236.049-.318.135a.44.44 0 0 0 .004.623c.87.87 2.274.87 3.144 0a.44.44 0 0 0 .004-.623.447.447 0 0 0-.318-.135z" />
    </svg>
  );
}

export function XIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function ShareBar({
  title,
  url,
  type = "generic",
  variant = "header",
  className = "",
}: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const getShareTitle = () => {
    if (type === "model") {
      return `${title} — AI Model Specs, Benchmarks & Pricing | Modelverse`;
    }
    if (type === "news") {
      return `${title} | Modelverse AI News`;
    }
    return title;
  };

  const handleRedditShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentUrl = getShareUrl();
    const shareTitle = getShareTitle();
    const redditSubmitUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(
      currentUrl
    )}&title=${encodeURIComponent(shareTitle)}`;
    window.open(redditSubmitUrl, "_blank", "noopener,noreferrer");
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentUrl = getShareUrl();
    const shareTitle = getShareTitle();
    const twitterSubmitUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareTitle
    )}&url=${encodeURIComponent(currentUrl)}`;
    window.open(twitterSubmitUrl, "_blank", "noopener,noreferrer");
  };

  const handleCopy = () => {
    const currentUrl = getShareUrl();
    if (currentUrl && typeof window !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Header pill variant (used in ModelDocsLayout top actions and article top bar)
  if (variant === "header") {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        {/* Share on Reddit Button */}
        <button
          type="button"
          onClick={handleRedditShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-xs font-bold text-[var(--text)] hover:text-[#FF4500] hover:border-[#FF4500]/40 hover:bg-[#FF4500]/5 transition-all cursor-pointer group"
          title="Share on Reddit"
        >
          <RedditIcon className="w-3.5 h-3.5 text-[#FF4500] group-hover:scale-110 transition-transform" />
          <span>Reddit</span>
        </button>

        {/* Share on X Button */}
        <button
          type="button"
          onClick={handleTwitterShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-xs font-bold text-[var(--text)] hover:text-[var(--text)] hover:border-[var(--muted)]/40 hover:bg-[var(--accent-soft)]/20 transition-all cursor-pointer group"
          title="Share on X (Twitter)"
        >
          <XIcon className="w-3 h-3 text-[var(--muted)] group-hover:text-[var(--text)] group-hover:scale-110 transition-transform" />
          <span>Post</span>
        </button>

        {/* Copy URL Button */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-xs font-bold text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer"
          title="Copy Link"
        >
          {copied ? (
            <Check size={13} className="text-emerald-400" />
          ) : (
            <Copy size={13} className="text-[var(--muted)]" />
          )}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>
    );
  }

  // Card / Callout variant (used at bottom of articles and model overview)
  if (variant === "card") {
    return (
      <div
        className={`p-4 sm:p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
      >
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <Share2 size={15} className="text-[var(--accent)]" />
            <span>Share this {type === "model" ? "model" : type === "news" ? "article" : "page"}</span>
          </h4>
          <p className="text-xs text-[var(--muted)]">
            Found this insightful? Share it with your community on Reddit, X, or copy the link.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Share on Reddit Button */}
          <button
            type="button"
            onClick={handleRedditShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-pill)] bg-[#FF4500]/10 hover:bg-[#FF4500]/20 border border-[#FF4500]/30 text-xs font-bold text-[#FF4500] hover:border-[#FF4500] transition-all cursor-pointer group shadow-sm"
            title="Share on Reddit"
          >
            <RedditIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Share on Reddit</span>
          </button>

          {/* Share on X Button */}
          <button
            type="button"
            onClick={handleTwitterShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15 hover:border-[var(--muted)]/40 text-xs font-bold text-[var(--text)] transition-all cursor-pointer group"
            title="Share on X"
          >
            <XIcon className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--text)] group-hover:scale-110 transition-transform" />
            <span>Post on X</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)] text-xs font-bold text-[var(--text)] transition-all cursor-pointer"
            title="Copy Link"
          >
            {copied ? (
              <Check size={14} className="text-emerald-400" />
            ) : (
              <Copy size={14} className="text-[var(--muted)]" />
            )}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Inline minimal variant
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleRedditShare}
        className="p-1.5 rounded-[var(--radius-pill)] bg-[var(--card-bg)] hover:bg-[#FF4500]/10 border border-[var(--muted)]/10 hover:border-[#FF4500]/40 text-[var(--muted)] hover:text-[#FF4500] transition-all cursor-pointer"
        title="Share on Reddit"
      >
        <RedditIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleTwitterShare}
        className="p-1.5 rounded-[var(--radius-pill)] bg-[var(--card-bg)] hover:bg-[var(--accent-soft)]/20 border border-[var(--muted)]/10 hover:border-[var(--muted)]/40 text-[var(--muted)] hover:text-[var(--text)] transition-all cursor-pointer"
        title="Share on X"
      >
        <XIcon className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="p-1.5 rounded-[var(--radius-pill)] bg-[var(--card-bg)] hover:bg-[var(--accent-soft)]/20 border border-[var(--muted)]/10 hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--text)] transition-all cursor-pointer"
        title="Copy Link"
      >
        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
