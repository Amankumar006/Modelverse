import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CommandPaletteProvider } from "@/components/search/CommandPaletteContext";
import CommandPaletteModal from "@/components/search/CommandPaletteModal";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in"),
  title: {
    default: "Modelverse — The Open Foundation Model Catalog",
    template: "%s — Modelverse",
  },
  description:
    "Explore 376+ foundation models, verified parameters, context windows, benchmark figures, and real-time AI news.",
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
  authors: [{ name: "Modelverse Research", url: "https://www.themodelverse.in" }],
  creator: "Modelverse",
  publisher: "Modelverse",
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
    siteName: "Modelverse",
    title: "Modelverse — The Open Foundation Model Catalog",
    description: "Explore 376+ foundation models, parameters, context windows, and verified benchmarks.",
    images: [{ url: "/logos/social-avatar-1024.png", width: 1024, height: 1024, alt: "Modelverse Catalog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Modelverse — The Open Foundation Model Catalog",
    description: "Explore 376+ foundation models, parameters, context windows, and verified benchmarks.",
    creator: "@themodelverse",
    images: ["/logos/social-avatar-1024.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
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
        <WebSiteJsonLd />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
        <ThemeProvider>
          <CommandPaletteProvider>
            <Navbar />
            <div className="flex-1 flex flex-col">{children}</div>
            <Footer />
            <CommandPaletteModal />
          </CommandPaletteProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
