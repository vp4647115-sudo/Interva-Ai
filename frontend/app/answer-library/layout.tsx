import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Saved Answers",
  description: "Review and organize your saved interview answers and preparation notes.",
  path: "/answer-library",
  noIndex: true,
});

export default function AnswerLibraryLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
