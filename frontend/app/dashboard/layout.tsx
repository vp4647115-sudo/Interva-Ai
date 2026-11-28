import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description: "View your interview preparation activity, progress, and recommended next steps.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
