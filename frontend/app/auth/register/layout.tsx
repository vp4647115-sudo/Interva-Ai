import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Create an Account",
  description: "Create an IntervAi account and start practicing for your next interview.",
  path: "/auth/register",
  noIndex: true,
});

export default function RegisterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
