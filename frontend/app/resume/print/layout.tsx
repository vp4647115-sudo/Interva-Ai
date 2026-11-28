import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Resume Preview",
  description: "Preview and print your prepared resume.",
  path: "/resume/print",
  noIndex: true,
});

export default function ResumePrintLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
