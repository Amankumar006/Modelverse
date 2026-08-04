import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/models";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

/* ------------------------------------------------------------------ */
/*  Metadata                                                           */
/* ------------------------------------------------------------------ */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Modelverse — Every AI Model, Every Release",
  description:
    "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships — a living, always-current archive.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logos/favicon.ico" },
      { url: "/logos/android-chrome-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logos/android-chrome-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/logos/favicon.ico",
    apple: [
      { url: "/logos/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/logos/apple-touch-icon-180.png",
      },
    ],
  },
  alternates: {
    canonical: "./",
    types: {
      "application/rss+xml": [
        { url: `${SITE_URL}/feed.xml`, title: "Modelverse Models RSS Feed" },
        { url: `${SITE_URL}/news/feed.xml`, title: "Modelverse News RSS Feed" },
      ],
    },
  },
  openGraph: {
    title: "Modelverse — Every AI Model, Every Release",
    description:
      "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships.",
    url: SITE_URL,
    siteName: "Modelverse",
    images: [
      {
        url: `${SITE_URL}/logos/social-avatar-1024.png`,
        width: 1024,
        height: 1024,
        alt: "Modelverse",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modelverse — Every AI Model, Every Release",
    description:
      "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships.",
    images: [`${SITE_URL}/logos/social-avatar-1024.png`],
  },
  verification: {
    google: "google0be0f65316fe589f",
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
          url: `${SITE_URL}/logos/social-avatar-1024.png`,
        },
      },
    ],
  };

  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] tracking-[-0.01em] antialiased flex flex-col justify-between">
        <ThemeProvider>
          <Script
            id="performance-polyfill"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
                  var originalMeasure = window.performance.measure;
                  window.performance.measure = function() {
                    try {
                      return originalMeasure.apply(this, arguments);
                    } catch (e) {
                      return null;
                    }
                  };
                }
              `,
            }}
          />
          {gaId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `}
              </Script>
            </>
          )}
          <div>
            <JsonLd data={sitewideSchema} />
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
