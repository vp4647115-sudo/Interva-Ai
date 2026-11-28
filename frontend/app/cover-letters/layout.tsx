import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Cover Letter Builder",
  description: "Draft a tailored cover letter for a role using your experience and application details.",
  path: "/cover-letters",
  noIndex: true,
});

export default function CoverLettersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
