import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Modelverse",
  description: "Modelverse privacy policy and user data protection standards.",
};

export default function PrivacyPage() {
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
          <Shield size={14} />
          <span>Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--muted)] font-mono mt-1">Last updated: January 2025</p>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6 text-sm text-[var(--muted)] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">1. Information We Collect</h2>
          <p>
            Modelverse is an open knowledge repository. We do not require account registration to view model specifications, search archives, or read intelligence articles.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">2. Anonymous Telemetry & Analytics</h2>
          <p>
            We may collect privacy-preserving server logs (such as request paths and user agents) solely to detect traffic anomalies, monitor server uptime, and optimize database caching.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">3. Third-Party Links</h2>
          <p>
            Our catalog contains links to primary research papers on ArXiv, model cards on Hugging Face, and official lab websites. We are not responsible for the privacy practices of external domains.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">4. Contact Information</h2>
          <p>
            For privacy inquiries or data requests, contact us via GitHub or email at privacy@modelverse.ai.
          </p>
        </section>
      </div>
    </main>
  );
}
