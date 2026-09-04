import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Foundation Model & Benchmark Specifications",
  description:
    "Submit a new foundation AI model, open weights checkpoint, or research benchmark to TheModelverse Foundation Model Catalog.",
  alternates: {
    canonical: "/submit",
  },
  openGraph: {
    title: "Submit a Foundation Model & Benchmark Specifications | TheModelverse",
    description:
      "Submit a new foundation AI model, open weights checkpoint, or research benchmark to TheModelverse Foundation Model Catalog.",
    url: "/submit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit a Foundation Model & Benchmark Specifications | TheModelverse",
    description:
      "Submit a new foundation AI model, open weights checkpoint, or research benchmark to TheModelverse Foundation Model Catalog.",
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
