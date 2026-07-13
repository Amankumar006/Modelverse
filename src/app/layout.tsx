import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/models";

/* ------------------------------------------------------------------ */
/*  Fonts                                                              */
/* ------------------------------------------------------------------ */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Modelverse — Every AI Model, Every Release",
  description:
    "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships — a living, always-current archive.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Modelverse — Every AI Model, Every Release",
    description:
      "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships.",
    url: SITE_URL,
    siteName: "Modelverse",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modelverse — Every AI Model, Every Release",
    description:
      "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships.",
  },
};

/* ------------------------------------------------------------------ */
/*  Root Layout                                                        */
/* ------------------------------------------------------------------ */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sitewide Structured Data: WebSite & Organization
  const sitewideSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Modelverse",
        description: "Every AI model. Every release.",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Modelverse",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logos/logo-large.png`, // placeholder logo
        },
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-black tracking-[-0.02em] antialiased">
        <JsonLd data={sitewideSchema} />
        {children}
      </body>
    </html>
  );
}
