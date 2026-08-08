import type { Metadata } from "next";
import { SITE_URL } from "@/lib/models";

export const metadata: Metadata = {
  title: "Methodology | Modelverse",
  alternates: {
    canonical: `${SITE_URL}/methodology`,
  },
};

export default function MethodologyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
