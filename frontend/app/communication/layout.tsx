import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Communication Practice",
  description: "Practice professional communication and strengthen your interview responses.",
  path: "/communication",
  noIndex: true,
});

export default function CommunicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
