import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Your Profile",
  description: "Manage your profile, experience, skills, saved work, and interview history.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
