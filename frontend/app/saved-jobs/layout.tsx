import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Saved Jobs",
  description: "Review the job opportunities you saved for later.",
  path: "/saved-jobs",
  noIndex: true,
});

export default function SavedJobsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
