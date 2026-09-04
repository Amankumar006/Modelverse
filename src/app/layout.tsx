import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CommandPaletteProvider } from "@/components/search/CommandPaletteContext";
import CommandPaletteModal from "@/components/search/CommandPaletteModal";
import CookieConsent from "@/components/common/CookieConsent";
import { WebSiteJsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-5666739187500051";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in"),
  title: {
    default: "TheModelverse — The Foundation Model Catalog & LLM Benchmark Database",
    template: "%s | TheModelverse",
  },
  description:
    "Explore 386+ foundation models, verified parameters, context windows, benchmark figures, and real-time AI news on TheModelverse.",
  keywords: [
    "Foundation Models",
    "AI Models Catalog",
    "LLM Benchmarks",
    "DeepSeek R1",
    "Claude 3.7 Sonnet",
    "OpenAI GPT-4.5",
    "Context Window Comparison",
    "AI Pricing Matrix",
  ],
  authors: [{ name: "TheModelverse Research", url: "https://www.themodelverse.in" }],
  creator: "TheModelverse",
  publisher: "TheModelverse",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logos/favicon.ico", sizes: "16x16" },
      { url: "/logos/android-chrome-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logos/android-chrome-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logos/favicon.ico",
    apple: [{ url: "/logos/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.themodelverse.in",
    siteName: "TheModelverse",
    title: "TheModelverse — The Foundation Model Catalog & LLM Benchmark Database",
    description: "Explore 386+ foundation models, parameters, context windows, and verified benchmarks on TheModelverse.",
    images: [{ url: "/logos/social-avatar-1024.png", width: 1024, height: 1024, alt: "TheModelverse Catalog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TheModelverse — The Foundation Model Catalog & LLM Benchmark Database",
    description: "Explore 386+ foundation models, parameters, context windows, and verified benchmarks on TheModelverse.",
    creator: "@themodelverse",
    images: ["/logos/social-avatar-1024.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  other: {
    "google-adsense-account": adsenseClientId,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark")}else{document.documentElement.classList.remove("dark")}}catch(e){}})();`,
          }}
        />
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
        <WebSiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <ThemeProvider>
          <CommandPaletteProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
            <CommandPaletteModal />
            <CookieConsent />
          </CommandPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
