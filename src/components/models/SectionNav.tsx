"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useActiveSection } from "./ActiveSectionProvider";
import type { SectionGroup, SectionMeta } from "@/lib/model-sections";

/* ------------------------------------------------------------------ */
/*  Desktop rail (≥lg): grouped section navigator with a hairline      */
/*  track, read-progress fill, and a sliding terracotta marker.        */
/* ------------------------------------------------------------------ */

const MARKER_SIZE = 7;

export function SectionNavRail({ groups }: { groups: SectionGroup[] }) {
  const { activeId, progress } = useActiveSection();
  const listRef = useRef<HTMLDivElement>(null);
  const [markerTop, setMarkerTop] = useState<number | null>(null);

  // Position the marker over the active link's vertical center.
  useLayoutEffect(() => {
    if (!activeId || !listRef.current) return;
    const link = listRef.current.querySelector<HTMLElement>(
      `a[data-section-id="${CSS.escape(activeId)}"]`
    );
    if (link) {
      setMarkerTop(link.offsetTop + link.offsetHeight / 2 - MARKER_SIZE / 2);
    }
  }, [activeId]);

  return (
    <nav aria-label="On this page">
      <div
        ref={listRef}
        className="relative pl-5"
      >
        {/* Hairline track + progress fill */}
        <div
          aria-hidden="true"
          className="absolute left-[3px] top-2 bottom-2 w-px rounded-full bg-[var(--muted)]/15 overflow-hidden"
        >
          <div
            className="w-full bg-[var(--accent)]/50"
            style={{ height: `${Math.round(progress * 100)}%` }}
          />
        </div>

        {/* Sliding active marker */}
        <span
          aria-hidden="true"
          className={`absolute left-0 rounded-full bg-[var(--accent)] shadow-[0_0_0_3px_var(--card-bg)] transition-all duration-200 ease-out motion-reduce:transition-none ${
            markerTop === null ? "opacity-0" : "opacity-100"
          }`}
          style={{
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            top: markerTop ?? 0,
          }}
        />

        {groups.map((group, groupIdx) => (
          <div key={group.title} className={groupIdx > 0 ? "mt-5" : undefined}>
            <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
              {group.title}
            </p>
            <ul>
              {group.items.map((section) => {
                const isActive = section.id === activeId;
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      data-section-id={section.id}
                      aria-current={isActive ? "location" : undefined}
                      className={`block px-2 py-1.5 rounded-[var(--radius-control)] text-xs leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                        isActive
                          ? "text-[var(--accent)] font-bold"
                          : "text-[var(--muted)] hover:text-[var(--text)] font-medium"
                      }`}
                    >
                      {section.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile chip bar (<lg): sticky, horizontally scrolling snap chips   */
/*  that auto-center the active section, plus a trailing share button. */
/* ------------------------------------------------------------------ */

// Auto-centering pauses briefly after the user drags/swipes the strip so it
// never fights their hand mid-gesture.
const DRAG_SUPPRESS_MS = 900;

export function SectionChipBar({ sections }: { sections: SectionMeta[] }) {
  const { activeId } = useActiveSection();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastDragAtRef = useRef(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const stamp = () => {
      lastDragAtRef.current = Date.now();
    };
    // touchmove/wheel only — pointerdown/click must NOT stamp, or tapping a
    // chip would suppress its own auto-centering.
    scroller.addEventListener("touchmove", stamp, { passive: true });
    scroller.addEventListener("wheel", stamp, { passive: true });
    return () => {
      scroller.removeEventListener("touchmove", stamp);
      scroller.removeEventListener("wheel", stamp);
    };
  }, []);

  useEffect(() => {
    if (!activeId || Date.now() - lastDragAtRef.current < DRAG_SUPPRESS_MS) return;
    const chip = scrollerRef.current?.querySelector<HTMLElement>(
      `[data-section-id="${CSS.escape(activeId)}"]`
    );
    if (!chip) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    chip.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeId]);

  if (sections.length === 0) return null;

  const onShare = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch (err) {
        // User dismissed the share sheet — nothing to fall back to.
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — fail silently.
    }
  };

  return (
    <div className="lg:hidden sticky top-[calc(var(--navbar-h)+0.5rem)] z-40 -mx-4 px-4 py-2 bg-[var(--bg)]/85 backdrop-blur-md border-b border-[var(--muted)]/10">
      <div className="flex items-center gap-2">
        <div
          ref={scrollerRef}
          role="navigation"
          aria-label="Page sections"
          className="flex flex-1 items-center gap-1.5 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                data-section-id={section.id}
                aria-current={isActive ? "location" : undefined}
                className={`shrink-0 snap-start whitespace-nowrap px-3 py-1.5 rounded-[var(--radius-pill)] border text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30 font-bold"
                    : "bg-[var(--card-bg)] text-[var(--muted)] border-[var(--muted)]/10 font-medium hover:text-[var(--text)]"
                }`}
              >
                {section.label}
              </a>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onShare}
          aria-label={shared ? "Link copied" : "Share this model"}
          className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--card-bg)] border border-[var(--muted)]/10 text-[var(--muted)] hover:text-[var(--text)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {shared ? <Check size={14} /> : <Share2 size={14} />}
        </button>
      </div>
    </div>
  );
}
