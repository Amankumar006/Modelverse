import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Security & Vulnerability Disclosure — Modelverse",
  description: "Modelverse security standards, database protection, and responsible disclosure policy.",
  alternates: {
    canonical: "/security",
  },
  openGraph: {
    title: "Security & Vulnerability Disclosure — Modelverse",
    description: "Modelverse security standards, database protection, and responsible disclosure policy.",
    url: "/security",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security & Vulnerability Disclosure — Modelverse",
    description: "Modelverse security standards, database protection, and responsible disclosure policy.",
  },
};

export default function SecurityPage() {
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
          <Lock size={14} />
          <span>Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Security & Responsible Disclosure
        </h1>
        <p className="text-xs text-[var(--muted)] font-mono mt-1">Infrastructure Hardening & Audits</p>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6 text-sm text-[var(--muted)] leading-relaxed">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-[var(--text)] font-bold">
            <ShieldCheck className="text-emerald-500" size={16} />
            <h2>Row Level Security (RLS)</h2>
          </div>
          <p>
            All production PostgreSQL database instances run strict Row Level Security (RLS). Public clients operate under read-only privileges on active models, while data mutations require cryptographically signed service tokens.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">Automated Secret & Key Scans</h2>
          <p>
            Every code commit is scanned via GitGuardian and automated GitHub CI workflows before merging to prevent credential leakage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-[var(--text)]">Responsible Disclosure Program</h2>
          <p>
            If you discover a security vulnerability or data exposure issue, please report it responsibly by emailing security@modelverse.ai or opening an advisory on GitHub. We aim to respond within 24 hours.
          </p>
        </section>
      </div>
    </main>
  );
}
