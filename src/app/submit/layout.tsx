import type { Metadata } from "next";
import { SITE_URL } from "@/lib/models";

export const metadata: Metadata = {
  title: "Submit a Model | Modelverse",
  alternates: {
    canonical: `${SITE_URL}/submit`,
  },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
