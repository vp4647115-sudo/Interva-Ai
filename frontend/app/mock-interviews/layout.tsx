import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Mock Interviews",
  description: "Prepare with role-specific AI mock interviews and structured feedback.",
  path: "/mock-interviews",
  noIndex: true,
});

export default function MockInterviewsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
