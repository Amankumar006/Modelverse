import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, FileText, Scale, EyeOff, AlertTriangle, Mail } from "lucide-react";
import { SITE_URL } from "@/lib/models";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service — Modelverse",
  description: "Terms of use, disclaimers, and guidelines for using the Modelverse AI model catalog.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
};

export default function TermsPage() {
  const lastUpdated = "July 28, 2026";

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-brand-pink/3 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-brand-violet/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Nav Back Link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/80 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 relative z-10">
        <div className="border-b border-white/[0.06] pb-8 mb-12">
          <div className="flex items-center gap-2 text-brand-orange text-xs font-semibold uppercase tracking-wider mb-3">
            <Scale size={14} />
            <span>Terms & Conditions</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Last Updated: {lastUpdated} &bull; Version 1.0
          </p>
        </div>

        {/* Intro */}
        <div className="prose prose-invert max-w-none mb-12 text-white/70 text-sm sm:text-base leading-relaxed">
          <p>
            Welcome to Modelverse. By accessing our website, catalog, and automated feeds, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Card 1: Catalog Accuracy & "As-Is" Disclaimer */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">1. Catalog Disclaimer (&quot;As-Is&quot;)</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Modelverse is a curated informational index tracking public AI models, release dates, context windows, licensing configurations, and benchmarks. 
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  All information is aggregated from publicly available statements, repositories, and documentation. While we strive for absolute accuracy, all data is provided <strong>&quot;as-is&quot;</strong> without any warranties, express or implied. We do not guarantee that model metrics or capabilities will meet specific operational needs.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Model Licenses */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-pink/10 text-brand-pink shrink-0">
                <FileText size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">2. Respect for Original Model Licenses</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Modelverse does not host model weights, files, or parameters. We only link to original developer listings. 
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  You are solely responsible for reviewing and adhering to the respective developer licenses (e.g., Apache 2.0, MIT, Llama 3 Community License, or commercial agreements) when downloading, running, or fine-tuning any models indexed on our site.
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Scraping & Use Limits */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-blue/10 text-brand-blue shrink-0">
                <EyeOff size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">3. Acceptable Use & Scraping Restrictions</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  You are permitted to access the database search index and API feeds for personal, academic, or research purposes.
                </p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Commercial data-scraping or systematic harvesting of our compiled data indexes to build competitive directories or train data-aggregation products without explicit permission is strictly prohibited.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Governing Law */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-violet/10 text-brand-violet shrink-0">
                <Scale size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">4. Governing Law & Jurisdiction</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  Modelverse is operated by an individual creator based in India. These Terms of Service shall be governed by, and construed in accordance with, the laws of <strong>India</strong>. Any legal disputes arising out of the use of this website shall be subject to the exclusive jurisdiction of the competent courts in India.
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Contact */}
          <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02] transition-all">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-orange/10 text-brand-orange shrink-0">
                <Mail size={20} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">5. Contact Information</h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  For questions regarding these Terms, or to request metadata corrections, please email us directly at:
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
