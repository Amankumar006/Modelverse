import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Modelverse",
  description: "Modelverse terms of service and acceptable usage guidelines.",
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
          <span>Legal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-[var(--muted)] font-mono mt-1">Last updated: January 2025</p>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6 text-sm text-[var(--muted)] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Modelverse, you agree to comply with these terms of service and all applicable laws and regulations governing open-source software and internet services.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">2. Content & Accuracy Disclaimer</h2>
          <p>
            Model specifications, pricing structures, and benchmark metrics are compiled from publicly available laboratory announcements and research documentation. While we strive for absolute accuracy, specifications may change as vendors update API endpoints.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">3. Intellectual Property</h2>
          <p>
            All brand names, trademarks, and model titles (e.g. Claude, GPT-4, Gemini, Llama) are the property of their respective creators and laboratories.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">4. API & Scraper Usage</h2>
          <p>
            Our public Next.js and Supabase endpoints are free to query. Please respect rate limits and refrain from high-frequency automated scraping that impacts service availability.
          </p>
        </section>
      </div>
    </main>
  );
}
