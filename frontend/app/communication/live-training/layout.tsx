import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Live Communication Training",
  description: "Practice spoken communication with real-time guided feedback.",
  path: "/communication/live-training",
  noIndex: true,
});

export default function LiveTrainingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
