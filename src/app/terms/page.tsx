import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, Copyright } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Modelverse",
  description: "Terms of service, acceptable usage guidelines, benchmark accuracy disclaimers, and advertising policies for Modelverse.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service — Modelverse",
    description: "Terms of service, acceptable usage guidelines, benchmark accuracy disclaimers, and advertising policies for Modelverse.",
    url: "/terms",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — Modelverse",
    description: "Terms of service, acceptable usage guidelines, benchmark accuracy disclaimers, and advertising policies for Modelverse.",
  },
};

export default function TermsPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-4"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <FileText size={14} />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-[var(--muted)] font-mono mt-1">Last revised: August 2026</p>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6 text-sm text-[var(--muted)] leading-relaxed">
        {/* Section 1 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <h2>1. Agreement to Terms</h2>
          </div>
          <p>
            By accessing or browsing <strong>Modelverse</strong> (https://www.themodelverse.in), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service, our Privacy Policy, and all applicable global laws and regulations.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2>2. Benchmark &amp; Pricing Data Disclaimer</h2>
          </div>
          <p>
            All foundation model specifications, parameter statistics, context window figures, pricing rates, and benchmark evaluations are aggregated from official research papers, public model cards, and verified vendor announcements. While we make every effort to maintain real-time accuracy, AI laboratory prices and API endpoints may change without prior notice.
          </p>
        </section>

        {/* Section 3: Advertising & Commercial Transparency */}
        <section className="space-y-2 p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10">
          <h2 className="text-base font-bold text-[var(--text)]">3. Advertising &amp; Sponsorship Policy</h2>
          <p>
            Modelverse may display third-party advertisements delivered by Google AdSense and programmatic networks. Advertisements are clearly distinguished from objective benchmark scores, editorial digests, and model metadata. Editorial coverage and model catalog inclusion remain 100% independent and unbiased.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <Copyright size={16} className="text-[var(--accent)]" />
            <h2>4. Intellectual Property &amp; Trademarks</h2>
          </div>
          <p>
            All registered trademarks, company names, model trademarks (e.g. OpenAI, Anthropic, Google DeepMind, Meta, Mistral, DeepSeek), and technical paper excerpts belong to their respective copyright holders. Modelverse does not claim ownership of third-party model weights or laboratory research papers.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">5. Acceptable Use &amp; Scraping Limits</h2>
          <p>
            You agree not to disrupt, overload, or execute abusive automated scraping attacks against our public APIs or static infrastructure. Please respect standard web crawler rate limits and cached RSS endpoints.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2 pt-4 border-t border-[var(--muted)]/10">
          <h2 className="text-base font-bold text-[var(--text)]">6. Contact &amp; Legal Inquiries</h2>
          <p>
            For legal inquiries, copyright notices, or licensing clarification, please email us at{" "}
            <a href="mailto:contact@themodelverse.in" className="text-[var(--accent)] underline font-medium">
              contact@themodelverse.in
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
