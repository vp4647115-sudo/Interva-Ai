import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Interview Buddy",
  description: "Use Interview Buddy to prepare responses and practice interview questions.",
  path: "/interview-buddy",
  noIndex: true,
});

export default function InterviewBuddyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
