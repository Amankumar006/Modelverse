import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
  title: "Modelverse — The Open Foundation Model Catalog",
  description:
    "Explore every foundation model, parameters, context windows, benchmark figures, and real-time AI news.",
  icons: {
    icon: [
      { url: "/logos/favicon.ico", sizes: "16x16" },
      { url: "/logos/android-chrome-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logos/android-chrome-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logos/favicon.ico",
    apple: [
      { url: "/logos/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Modelverse — The Open Foundation Model Catalog",
    description: "Explore every foundation model, parameters, context windows, and verified benchmarks.",
    images: [{ url: "/logos/social-avatar-1024.png" }],
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
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)] transition-colors duration-200">
        <ThemeProvider>
          <Navbar />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
