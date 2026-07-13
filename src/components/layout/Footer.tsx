import Link from "next/link";
import { Rss } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#050505] border-t border-white/[0.06] text-white/40 text-xs py-12 px-4 sm:px-6 md:px-8 relative z-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {/* Column 1: Browse */}
        <div className="space-y-3">
          <p className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
            Browse Catalog
          </p>
          <ul className="space-y-2 flex flex-col">
            <li>
              <Link href="/models" className="hover:text-white transition-colors">
                All Models
              </Link>
            </li>
            <li>
              <Link href="/timeline" className="hover:text-white transition-colors">
                Timeline & Changelog
              </Link>
            </li>
            <li>
              <Link href="/models?type=open-weights" className="hover:text-white transition-colors">
                Open Weights
              </Link>
            </li>
            <li>
              <Link href="/models?type=closed-source" className="hover:text-white transition-colors">
                Closed Source
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: About & RSS */}
        <div className="space-y-3">
          <p className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
            Information
          </p>
          <ul className="space-y-2 flex flex-col">
            <li>
              <span className="cursor-default">Methodology</span>
            </li>
            <li>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Rss size={12} className="text-brand-orange" />
                RSS Feed
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Source Note */}
        <div className="space-y-3">
          <p className="text-white/60 font-semibold uppercase tracking-wider text-[10px]">
            Sourcing & Curation
          </p>
          <p className="leading-relaxed max-w-sm">
            Model data is community-curated and sourced from official channels, developer blogs,
            or verified primary documentation. See our data integrity policy.
          </p>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="max-w-6xl mx-auto border-t border-white/[0.04] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {currentYear} Modelverse. All rights reserved.</p>
        <p className="text-[10px] text-white/20">
          Tracking the frontier of artificial intelligence.
        </p>
      </div>
    </footer>
  );
}
