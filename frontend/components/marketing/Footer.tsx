export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink-secondary md:flex-row">
        <p className="font-extrabold text-ink-primary">
          Interview<span className="text-primary">AI</span>
        </p>
        <nav className="flex gap-6" aria-label="Footer">
          <a href="#features" className="hover:text-ink-primary">Features</a>
          <a href="#faq" className="hover:text-ink-primary">FAQ</a>
          <a href="/auth/login" className="hover:text-ink-primary">Log in</a>
        </nav>
        <p>© {new Date().getFullYear()} InterviewAI. All rights reserved.</p>
      </div>
    </footer>
  );
}
