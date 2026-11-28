import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Job Search",
  description: "Search and save job opportunities relevant to your interview preparation.",
  path: "/jobs",
  noIndex: true,
});

export default function JobsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
