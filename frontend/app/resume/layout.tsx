import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Resume Builder",
  description: "Build, review, and export a resume tailored to your experience and career goals.",
  path: "/resume",
  noIndex: true,
});

export default function ResumeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
