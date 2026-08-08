import type { Metadata } from "next";
import { SITE_URL } from "@/lib/models";

export const metadata: Metadata = {
  title: "About | Modelverse",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
