"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SectionMeta } from "@/lib/model-sections";

interface ActiveSectionContextValue {
  /** id of the section currently in the reading zone, or null before first observation */
  activeId: string | null;
  /** 0..1 document read progress for the navigator's progress track */
  progress: number;
}

const ActiveSectionContext = createContext<ActiveSectionContextValue>({
  activeId: null,
  progress: 0,
});

interface ActiveSectionProviderProps {
  sections: SectionMeta[];
  children: React.ReactNode;
}

/**
 * Single IntersectionObserver owner for the model page. The desktop rail,
 * mobile chip bar, and quick-facts rail all consume the same active section
 * so they can never disagree. Server-rendered `children` pass through
 * untouched — scrolling re-renders only the tiny consumer islands.
 */
export function ActiveSectionProvider({ sections, children }: ActiveSectionProviderProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  // Latest observed state per section id; lets the bottom-of-page fallback
  // and the observer callback cooperate without stale closures.
  const visibleRef = useRef<Map<string, number>>(new Map());

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);

  // Scroll-spy: topmost intersecting section inside the reading zone wins.
  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    visibleRef.current.clear();

    const pickActive = () => {
      // Plain loop (not forEach) so TypeScript's flow analysis tracks the
      // assignment — closure writes narrow `best` to never at the read site.
      let best: { id: string; top: number } | null = null;
      for (const [id, top] of visibleRef.current) {
        if (!best || top < best.top) best = { id, top };
      }
      if (best) setActiveId(best.id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleRef.current.set(id, entry.boundingClientRect.top);
          } else {
            visibleRef.current.delete(id);
          }
        }
        pickActive();
      },
      // Reading zone: below the sticky navbar, upper half of the viewport.
      { rootMargin: "-96px 0px -55% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  // Read progress + bottom-of-page fallback (last section active when the
  // document can no longer scroll the final section into the reading zone).
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1);

      if (max > 0 && window.scrollY / max > 0.97 && sections.length > 0) {
        setActiveId(sections[sections.length - 1].id);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  // Deep links: initialize from location.hash, keep tracking hashchange,
  // open any ancestor <details> (Reference-tier disclosures), and re-scroll
  // after opening since the browser scrolled while the target was collapsed.
  useEffect(() => {
    const handleHash = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash || !ids.includes(hash)) return;
      setActiveId(hash);

      const target = document.getElementById(hash);
      if (!target) return;

      let details = target.closest("details");
      let reopened = false;
      while (details) {
        if (!details.open) {
          details.open = true;
          reopened = true;
        }
        details = details.parentElement?.closest("details") ?? null;
      }

      if (reopened) {
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView({ block: "start" });
        });
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [ids]);

  const value = useMemo(() => ({ activeId, progress }), [activeId, progress]);

  return (
    <ActiveSectionContext.Provider value={value}>
      {children}
    </ActiveSectionContext.Provider>
  );
}

export function useActiveSection(): ActiveSectionContextValue {
  return useContext(ActiveSectionContext);
}
