import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Shield, Lock, Eye, Mail, FileText } from "lucide-react";
import { SITE_URL } from "@/lib/models";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy — Modelverse",
  description: "How Modelverse handles data, curation integrity, and user privacy.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
};

export default function PrivacyPage() {
  const lastUpdated = "July 14, 2026";

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24 relative overflow-hidden">
      {/* ── Background Grid Accent ─────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-brand-pink/3 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-brand-violet/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Fixed Minimal Nav Back Link ─────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/80 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </div>

      {/* ── Content Container ───────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 relative z-10">
        <div className="border-b border-white/[0.06] pb-8 mb-12">
          <div className="flex items-center gap-2 text-brand-orange text-xs font-semibold uppercase tracking-wider mb-3">
            <Shield size={14} />
            <span>Legal & Privacy</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Last Updated: {lastUpdated} &bull; Version 1.0
          </p>
        </div>

        {/* Intro */}
        <div className="prose prose-invert max-w-none mb-12 text-white/70 text-sm sm:text-base leading-relaxed">
          <p>
            At Modelverse, we track public foundation AI models, their releases, specifications,
            and benchmarks. We believe in transparency, factual integrity, and user privacy.
            This policy outlines how we collect, store, and utilize data across our platform.
          </p>
        </div>

        {/* Policy Sections Grid */}
        <div className="space-y-6">
          {/* Card 1: Data Collection */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange shrink-0">
                <Eye size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">1. Data We Collect</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  As a purely catalog-focused application, Modelverse collects very little personal information.
                </p>
                <ul className="list-disc pl-5 text-sm text-white/60 space-y-1.5 pt-2">
                  <li>
                    <strong className="text-white/80">Analytical Logs:</strong> We track anonymous system-level data like page views, referrer links, and browser type for performance monitoring.
                  </li>
                  <li>
                    <strong className="text-white/80">Curation Submissions:</strong> If you submit model entries or email corrections, we preserve your email address and message contents to process your contribution.
                  </li>
                  <li>
                    <strong className="text-white/80">Preferences:</strong> We save active interface preferences (such as dark mode toggles or filter choices) locally on your device.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Curation Data Sourcing */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-pink/10 text-brand-pink shrink-0">
                <FileText size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">2. Open Dataset & Curation Policy</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  The model metadata listed in our repository is gathered exclusively from public assets (official research papers, GitHub repositories, and developer statements).
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  We do not ingest private user files, proprietary code, or unannounced weight assets. If a developer wishes to correct or redact any factual listing, we process submissions promptly via <Link href="mailto:corrections@modelverse.ai" className="text-brand-orange hover:underline font-medium">corrections@modelverse.ai</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Data Security */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue shrink-0">
                <Lock size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">3. Third-Party Integrations</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Our platform includes integrations with third-party social services, specifically:
                </p>
                <ul className="list-disc pl-5 text-sm text-white/60 space-y-1.5 pt-1">
                  <li>
                    <strong className="text-white/80">Reddit App:</strong> We use the official Reddit Developer Platform (Devvit) to publish automated news digests to our subreddit. This bot only reads public article metadata from our server and does not track, collect, or store any personal data from Reddit users.
                  </li>
                  <li>
                    <strong className="text-white/80">External Links:</strong> We link to external developer announcements (Hugging Face, GitHub, ArXiv, etc.). We do not share user data with these sources, nor are we responsible for their privacy actions.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 4: Contact & Inquiries */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-violet/10 text-brand-violet shrink-0">
                <Mail size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">4. Privacy Contact</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  For privacy questions, data deletion requests regarding curation emails, or reporting documentation discrepancies, please contact us at:
                </p>
                <div className="pt-2">
                  <span className="text-xs font-semibold tracking-wider text-white bg-white/5 border border-white/10 rounded-full px-3 py-1.5 inline-block">
                    privacy@modelverse.ai
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
