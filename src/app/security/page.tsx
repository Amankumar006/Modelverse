import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Lock, FileCheck, ShieldAlert, Cpu, Terminal } from "lucide-react";
import { SITE_URL } from "@/lib/models";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Security Protocols — Modelverse",
  description: "Learn about the security procedures, data integrity verification, and curation safety of Modelverse.",
  alternates: {
    canonical: `${SITE_URL}/security`,
  },
};

export default function SecurityPage() {
  const lastUpdated = "August 11, 2026";

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24 relative overflow-hidden">
      {/* ── Background Grid Accent ─────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-violet/10 via-brand-pink/3 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />

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
          <div className="flex items-center gap-2 text-brand-pink text-xs font-semibold uppercase tracking-wider mb-3">
            <Lock size={14} />
            <span>App & Curation Security</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Security Protocols
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Last Updated: {lastUpdated} &bull; Version 1.0
          </p>
        </div>

        {/* Intro */}
        <div className="prose prose-invert max-w-none mb-12 text-white/70 text-sm sm:text-base leading-relaxed">
          <p>
            Modelverse serves as a trusted and factual ledger of AI models. Because developers and researchers
            rely on our platform for accurate specifications, we implement strict automated validation
            and secure curation workflows to ensure database integrity.
          </p>
        </div>

        {/* Security Sections Grid */}
        <div className="space-y-6">
          {/* Card 1: Data Verification */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-pink/10 text-brand-pink shrink-0">
                <FileCheck size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">1. Curation Integrity Verification</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Every model entry database file (`data/models/*.json`) undergoes automated validation before merging:
                </p>
                <ul className="list-disc pl-5 text-sm text-white/60 space-y-1.5 pt-2">
                  <li>
                    <strong className="text-white/80">Zod Schema Enforcement:</strong> Strict type constraints verify parameters, context lengths, enums, dates, and modailties.
                  </li>
                  <li>
                    <strong className="text-white/80">Dual-Check Sourcing:</strong> Benchmarks and release details must reference at least one verified primary source (arXiv papers, official repositories, or official blogs).
                  </li>
                  <li>
                    <strong className="text-white/80">Verification Flagging:</strong> Any parameters or benchmarks that cannot be verified against primary sources are flagged with `verified: false` and accompanied by detailed Curator notes.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: Code Base and Dependency Safety */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange shrink-0">
                <Terminal size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">2. Infrastructure & Build Security</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  We secure our codebase and deployment architecture against standard web vectors:
                </p>
                <ul className="list-disc pl-5 text-sm text-white/60 space-y-1.5 pt-2">
                  <li>
                    <strong className="text-white/80">Static Site Generation (SSG):</strong> Modelverse builds pages statically, minimizing server-side attack vectors and removing database query vulnerability risks.
                  </li>
                  <li>
                    <strong className="text-white/80">Dependency Auditing:</strong> Automated tools continuously scan our npm modules for vulnerabilities, applying updates immediately when patches are available.
                  </li>
                  <li>
                    <strong className="text-white/80">No Execution Space:</strong> Modelverse does not run user-uploaded scripts or evaluate arbitrary user-provided code, protecting client sessions from cross-site scripting (XSS).
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 3: Weight and Download Sourcing */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue shrink-0">
                <Cpu size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">3. Open-Source Software and Weights Policy</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  For models marked `open-weights` or `open-source`, we link only to verified Hugging Face hubs, official GitHub repositories, or official developer portals.
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Modelverse does not host model weights on its own servers, preventing download spoofing. We always encourage users to check official weight SHA-256 hashes before loading binaries locally.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Vulnerability Reporting */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-violet/10 text-brand-violet shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">4. Vulnerability Disclosure Policy</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  If you discover a security vulnerability in Modelverse or find a spoofed resource entry in our catalog, please notify us immediately.
                </p>
                <div className="pt-2">
                  <span className="text-xs font-semibold tracking-wider text-white bg-white/5 border border-white/10 rounded-full px-3 py-1.5 inline-block">
                    004akaman@gmail.com
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
