import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Cookie, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Modelverse",
  description: "Comprehensive privacy policy, cookie disclosures, advertising policies, and data protection practices for Modelverse.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy — Modelverse",
    description: "Comprehensive privacy policy, cookie disclosures, advertising policies, and data protection practices for Modelverse.",
    url: "/privacy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — Modelverse",
    description: "Comprehensive privacy policy, cookie disclosures, advertising policies, and data protection practices for Modelverse.",
  },
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
          <span>Compliance &amp; Data Protection</span>
        </div>
        <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[var(--muted)] font-mono mt-1">Last revised &amp; effective: August 2026</p>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-8 text-sm text-[var(--muted)] leading-relaxed">
        {/* Section 1: Overview */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <Lock size={16} className="text-[var(--accent)]" />
            <h2>1. Information We Collect</h2>
          </div>
          <p>
            Modelverse (accessible at <strong>https://www.themodelverse.in</strong>) is an open research and benchmarking repository for artificial intelligence foundation models. We do not require user account registration, mandatory profiling, or credit card submission to search model archives, read intelligence digests, or access comparison matrices.
          </p>
          <p>
            We may automatically receive standard server log records, including your IP address, browser user-agent, operating system, referring URL, and page timestamps, solely for uptime diagnostics, DDoS prevention, and traffic caching optimization.
          </p>
        </section>

        {/* Section 2: Google AdSense & Advertising Cookies */}
        <section className="space-y-2.5 p-4 sm:p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/15">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <Cookie size={16} className="text-amber-500" />
            <h2>2. Google AdSense &amp; Third-Party Advertising Cookies</h2>
          </div>
          <p>
            We use <strong>Google AdSense</strong> and authorized third-party advertising technology vendors to serve relevant advertisements when you visit our website.
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Third-party vendors, including <strong>Google</strong>, use cookies (such as the DoubleClick cookie) to serve ads based on a user&apos;s prior visits to this website or other websites on the Internet.
            </li>
            <li>
              Google&apos;s use of advertising cookies enables it and its partners to serve targeted and contextual ads to users based on their navigation history across Modelverse and across the broader web.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting{" "}
              <a
                href="https://myadcenter.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline font-medium"
              >
                Google Ad Center
              </a>{" "}
              or by opting out through the Digital Advertising Alliance at{" "}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] underline font-medium"
              >
                www.aboutads.info/choices
              </a>.
            </li>
          </ul>
        </section>

        {/* Section 3: Web Beacons and Analytics */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <Eye size={16} className="text-blue-500" />
            <h2>3. Analytics &amp; Performance Telemetry</h2>
          </div>
          <p>
            We may use privacy-conscious analytics services (such as Google Analytics 4 or server-side telemetry) to analyze aggregate user trends, popular benchmark queries, and high-traffic model categories. These analytics do not store raw personally identifiable information (PII).
          </p>
        </section>

        {/* Section 4: GDPR and CCPA / CPRA Privacy Rights */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <Shield size={16} className="text-emerald-500" />
            <h2>4. GDPR (EEA/UK) &amp; CCPA/CPRA (California) Rights</h2>
          </div>
          <p>
            Under the European General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA/CPRA), users have rights including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Right to Know / Access:</strong> Request disclosure of what categories of information are collected.</li>
            <li><strong>Right to Erasure / Deletion:</strong> Request deletion of any cached personal information.</li>
            <li><strong>Right to Non-Discrimination:</strong> Equal service access regardless of privacy preference selections.</li>
            <li><strong>Opt-Out of Data Sale or Sharing:</strong> We do not sell personal data to third parties.</li>
          </ul>
        </section>

        {/* Section 5: External Links */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-[var(--text)]">5. Outbound Links to Research Repositories</h2>
          <p>
            Modelverse references primary source whitepapers on ArXiv, model cards on Hugging Face, GitHub source repositories, and vendor documentation. We are not responsible for the privacy practices, content policies, or tracking mechanisms of external third-party websites.
          </p>
        </section>

        {/* Section 6: Contact Information */}
        <section className="space-y-2.5 pt-4 border-t border-[var(--muted)]/10">
          <div className="flex items-center gap-2 text-base font-bold text-[var(--text)]">
            <HelpCircle size={16} className="text-[var(--accent)]" />
            <h2>6. Contact Us</h2>
          </div>
          <p>
            If you have questions regarding this Privacy Policy, cookie management, or advertising disclosures, contact our editorial and compliance team at:
          </p>
          <div className="p-3.5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 font-mono text-xs text-[var(--text)]">
            Email: <a href="mailto:privacy@themodelverse.in" className="text-[var(--accent)] underline">privacy@themodelverse.in</a> • Website: <a href="https://www.themodelverse.in" className="text-[var(--accent)] underline">https://www.themodelverse.in</a>
          </div>
        </section>
      </div>
    </main>
  );
}
