import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Profile Setup",
  description: "Set your goals and preferences to personalize interview preparation.",
  path: "/onboarding",
  noIndex: true,
});

export default function OnboardingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
