import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Communication Progress",
  description: "Review your communication practice sessions and progress.",
  path: "/communication/progress",
  noIndex: true,
});

export default function CommunicationProgressLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
