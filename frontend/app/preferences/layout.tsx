import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Application Preferences",
  description: "Manage your job search and application preferences.",
  path: "/preferences",
  noIndex: true,
});

export default function PreferencesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
