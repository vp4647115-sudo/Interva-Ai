import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Application Kits",
  description: "Create and manage the resume and cover-letter materials for your job applications.",
  path: "/application-kits",
  noIndex: true,
});

export default function ApplicationKitsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
