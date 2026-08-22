import { PillLink } from "@/components/ui/PillButton";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="/" className="text-lg font-extrabold tracking-tight">
          Interview<span className="text-primary">AI</span>
        </a>
        <div className="hidden items-center gap-6 text-sm font-medium text-ink-secondary md:flex">
          <a href="#features" className="hover:text-ink-primary">Features</a>
          <a href="#faq" className="hover:text-ink-primary">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <PillLink href="/auth/login" variant="secondary" size="sm">Log in</PillLink>
          <PillLink href="/auth/register" size="sm">Sign up</PillLink>
        </div>
      </nav>
    </header>
  );
}
