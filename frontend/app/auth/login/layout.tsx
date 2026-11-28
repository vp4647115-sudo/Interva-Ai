import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Log In",
  description: "Log in securely to continue your personalized interview preparation.",
  path: "/auth/login",
  noIndex: true,
});

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
