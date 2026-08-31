import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit a Model — Modelverse",
  description:
    "Submit a new foundation AI model, open weights checkpoint, or research benchmark to the Modelverse catalog.",
  alternates: {
    canonical: "/submit",
  },
  openGraph: {
    title: "Submit a Model — Modelverse",
    description:
      "Submit a new foundation AI model, open weights checkpoint, or research benchmark to the Modelverse catalog.",
    url: "/submit",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit a Model — Modelverse",
    description:
      "Submit a new foundation AI model, open weights checkpoint, or research benchmark to the Modelverse catalog.",
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
